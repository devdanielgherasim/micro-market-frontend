"use client";
// @ts-ignore
import type Keycloak, {KeycloakLoginOptions, KeycloakLogoutOptions, KeycloakProfile, KeycloakTokenParsed} from 'keycloak-js';
import React, {createContext, ReactNode, useContext, useEffect, useState} from 'react';

import {initKeycloak} from './keycloak';
import {createLogger} from '@/utils/logger';

const logger = createLogger('KeycloakAuth');

interface AuthContextType {
    keycloak: Keycloak | null;
    initialized: boolean;
    isAuthenticated: boolean;
    login: () => void;
    logout: () => void;
    token: string | undefined;
    tokenParsed: KeycloakTokenParsed | undefined;
    userProfile: KeycloakProfile | null;
    loading: boolean;
    error: Error | null;
}

const AuthContext = createContext<AuthContextType>({
    keycloak: null,
    initialized: false,
    isAuthenticated: false,
    login: () => {
    },
    logout: () => {
    },
    token: undefined,
    tokenParsed: undefined,
    userProfile: null,
    loading: true,
    error: null,
});

export const useAuth = () => useContext(AuthContext);

interface KeycloakProviderProps {
    children: ReactNode;
    initOptions?: {
        onLoad?: 'login-required' | 'check-sso';
        checkLoginIframe?: boolean;
        silentCheckSsoRedirectUri?: string;
    };
}

export const KeycloakProvider: React.FC<KeycloakProviderProps> = ({
                                                                      children
                                                                  }) => {
    const [initialized, setInitialized] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [userProfile, setUserProfile] = useState<KeycloakProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);
    const [keycloak, setKeycloak] = useState<Keycloak | null>(null);
    const [token, setToken] = useState<string | undefined>(undefined);
    const [tokenParsed, setTokenParsed] = useState<KeycloakTokenParsed | undefined>(undefined);

    useEffect(() => {
        if (initialized) {
            return;
        }
        const initAuth = async () => {
            try {
                setLoading(true);
                const keycloakInstance = initKeycloak();

                if (!keycloakInstance) {
                    throw new Error('Failed to initialize Keycloak instance');
                }

                const MIN_VALIDITY = 30;

                const storedToken = typeof window !== 'undefined' ? localStorage.getItem('kc-token') : null;
                const storedRefreshToken = typeof window !== 'undefined' ? localStorage.getItem('kc-refresh-token') : null;

                if (storedToken && storedRefreshToken) {
                    keycloakInstance.token = storedToken;
                    keycloakInstance.refreshToken = storedRefreshToken;
                    logger.debug('Found stored tokens, attempting to restore session');
                }

                const initialized = await keycloakInstance.init({
                    enableLogging: process.env.NEXT_PUBLIC_API_URL,
                    pkceMethod: 'S256',
                    onLoad: 'check-sso',
                    checkLoginIframe: false,
                    silentCheckSsoRedirectUri: typeof window !== 'undefined' ? `${window.location.origin}/silent-check-sso.html` : '',
                    token: storedToken || undefined,
                    refreshToken: storedRefreshToken || undefined
                });

                if (!initialized) {
                    logger.warn('Keycloak failed to initialize');
                }

                setKeycloak(keycloakInstance);
                setInitialized(initialized);

                const isAuth = initialized ? keycloakInstance.authenticated ?? false : false;
                setIsAuthenticated(isAuth);

                if (typeof window !== 'undefined') {
                    localStorage.setItem('isAuthenticated', isAuth.toString());
                }

                setToken(keycloakInstance.token);
                setTokenParsed(keycloakInstance.tokenParsed);

                if (keycloakInstance.token && typeof window !== 'undefined') {
                    localStorage.setItem('kc-token', keycloakInstance.token);
                    localStorage.setItem('kc-refresh-token', keycloakInstance.refreshToken ?? '');
                }

                keycloakInstance.onAuthSuccess = async () => {
                    logger.info('Authentication success event');
                    setIsAuthenticated(true);
                    if (typeof window !== 'undefined') {
                        localStorage.setItem('isAuthenticated', 'true');
                        if (keycloakInstance.token) {
                            localStorage.setItem('kc-token', keycloakInstance.token);
                            localStorage.setItem('kc-refresh-token', keycloakInstance.refreshToken ?? '');
                        }
                    }
                    setToken(keycloakInstance.token);
                    setTokenParsed(keycloakInstance.tokenParsed);

                    try {
                        const profile = await keycloakInstance.loadUserProfile();
                        setUserProfile(profile);
                        logger.debug('User profile loaded after auth success');
                        logger.debug('User profile:', profile);

                        if (keycloakInstance.tokenParsed) {
                            logger.debug('Token parsed:', keycloakInstance.tokenParsed);
                        }

                        logger.debug('Realm roles:', profile.realm_access?.roles || 'none');
                        logger.debug('Resource access:', profile.resource_access || 'none');
                        logger.debug('Attributes:', profile.attributes || 'none');
                    } catch (profileError) {
                        logger.error('Failed to load user profile after auth success:', profileError);
                    }
                };

                keycloakInstance.onAuthRefreshSuccess = () => {
                    logger.info('Token refresh success event');
                    setIsAuthenticated(true);
                    if (typeof window !== 'undefined') {
                        localStorage.setItem('isAuthenticated', 'true');
                        if (keycloakInstance.token) {
                            localStorage.setItem('kc-token', keycloakInstance.token);
                            localStorage.setItem('kc-refresh-token', keycloakInstance.refreshToken || '');
                        }
                    }
                    setToken(keycloakInstance.token);
                    setTokenParsed(keycloakInstance.tokenParsed);
                };

                keycloakInstance.onAuthLogout = () => {
                    logger.info('Logout event');
                    setIsAuthenticated(false);
                    setUserProfile(null);
                    setToken(undefined);
                    setTokenParsed(undefined);
                    // Remove authentication state and tokens from localStorage
                    if (typeof window !== 'undefined') {
                        localStorage.removeItem('isAuthenticated');
                        localStorage.removeItem('kc-token');
                        localStorage.removeItem('kc-refresh-token');
                    }
                };

                if (initialized && keycloakInstance.authenticated) {
                    try {
                        const profile = await keycloakInstance.loadUserProfile();
                        setUserProfile(profile);
                        logger.info('User authenticated successfully');
                        logger.debug('User profile:', profile);

                        if (keycloakInstance.tokenParsed) {
                            logger.debug('Token parsed:', keycloakInstance.tokenParsed);
                        }

                        logger.debug('Realm roles:', profile.realm_access?.roles || 'none');
                        logger.debug('Resource access:', profile.resource_access || 'none');
                        logger.debug('Attributes:', profile.attributes || 'none');

                        const updateTokenInterval = setInterval(() => {
                            keycloakInstance.updateToken(MIN_VALIDITY)
                                .then((refreshed: any) => {
                                    if (refreshed) {
                                        logger.debug('Token was successfully refreshed');
                                        setToken(keycloakInstance.token);
                                        setTokenParsed(keycloakInstance.tokenParsed);
                                        setIsAuthenticated(true);
                                    }
                                })
                                .catch((error: any) => {
                                    logger.error('Failed to refresh the token, or the session has expired', error);
                                    clearInterval(updateTokenInterval);
                                    keycloakInstance.logout();
                                });
                        }, 60000);

                        return () => {
                            clearInterval(updateTokenInterval);
                        };
                    } catch (profileError) {
                        logger.error('Failed to load user profile:', profileError);
                    }

                    keycloakInstance.onTokenExpired = () => {
                        logger.info('Token expired, attempting refresh...');
                        keycloakInstance.updateToken(MIN_VALIDITY).then((refreshed: any) => {
                            if (refreshed) {
                                logger.debug('Token refreshed successfully after expiration');
                                setToken(keycloakInstance.token);
                                setTokenParsed(keycloakInstance.tokenParsed);
                                setIsAuthenticated(true);
                            } else {
                                const expiryTime = keycloakInstance.tokenParsed?.exp || 0;
                                const currentTime = Math.floor(new Date().getTime() / 1000);
                                const timeRemaining = expiryTime - currentTime;

                                logger.debug(`Token not refreshed, valid for ${timeRemaining} seconds`);
                            }
                        }).catch((error: any) => {
                            logger.error('Failed to refresh expired token', error);
                            keycloakInstance.logout();
                        });
                    };

                    keycloakInstance.onAuthError = (errorData: any) => {
                        logger.error('Authentication error:', errorData);
                        setError(new Error('Authentication error occurred'));
                        setIsAuthenticated(false);
                    };
                }
            } catch (err) {
                setError(err instanceof Error ? err : new Error('Unknown error during authentication initialization'));
                logger.error('Failed to initialize Keycloak:', err);
            } finally {
                setLoading(false);
            }
        };

        initAuth();

        return () => {
            if (keycloak) {
                keycloak.onTokenExpired = undefined;
                keycloak.onAuthError = undefined;
                keycloak.onAuthSuccess = undefined;
                keycloak.onAuthRefreshError = undefined;
                keycloak.onAuthRefreshSuccess = undefined;
                keycloak.onAuthLogout = undefined;
            }
        };
    }, [initialized]);

    /**
     * Redirects to Keycloak login page
     * @param options - Optional login options
     */
    const login = (options?: { redirectUri?: string, prompt?: 'none' | 'login' }) => {
        if (keycloak) {
            try {
                const loginOptions: KeycloakLoginOptions = {
                    redirectUri: options?.redirectUri || window.location.href
                };

                if (options?.prompt) {
                    loginOptions.prompt = options.prompt;
                }

                logger.info('Redirecting to login...');
                keycloak.login(loginOptions);
            } catch (error) {
                logger.error('Error during login redirect:', error);
                setError(error instanceof Error ? error : new Error('Failed to redirect to login page'));
            }
        } else {
            logger.error('Cannot login: Keycloak not initialized');
            setError(new Error('Authentication service not initialized'));
        }
    };

    /**
     * Logs out the current user
     * @param options - Optional logout options
     */
    const logout = (options?: { redirectUri?: string }) => {
        if (keycloak) {
            try {
                logger.info('Logging out user...');
                setIsAuthenticated(false);
                setUserProfile(null);
                setToken(undefined);
                setTokenParsed(undefined);
                if (typeof window !== 'undefined') {
                    localStorage.removeItem('isAuthenticated');
                    localStorage.removeItem('kc-token');
                    localStorage.removeItem('kc-refresh-token');
                }

                const logoutOptions: KeycloakLogoutOptions = {
                    redirectUri: options?.redirectUri ?? window.location.origin
                };

                keycloak.logout(logoutOptions);
            } catch (error) {
                logger.error('Error during logout:', error);
                try {
                    window.localStorage.removeItem('kc-callback');
                    window.localStorage.removeItem('kc-login-redirect');
                    window.location.href = window.location.origin;
                } catch (fallbackError) {
                    logger.error('Fallback logout also failed:', fallbackError);
                }
            }
        } else {
            logger.error('Cannot logout: Keycloak not initialized');
        }
    };

    const value = {
        keycloak,
        initialized,
        isAuthenticated,
        login,
        logout,
        token,
        tokenParsed,
        userProfile,
        loading,
        error,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
