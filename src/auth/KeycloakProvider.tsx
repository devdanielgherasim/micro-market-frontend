"use client";

import React, {createContext, ReactNode, useContext, useEffect, useState} from 'react';
import {initKeycloak} from './keycloak';
// @ts-ignore
// @ts-ignore
import type Keycloak, {KeycloakLoginOptions, KeycloakLogoutOptions, KeycloakProfile} from 'keycloak-js';


interface AuthContextType {
    keycloak: Keycloak | null;
    initialized: boolean;
    isAuthenticated: boolean;
    login: () => void;
    logout: () => void;
    token: string | undefined;
    userProfile: KeycloakProfile | null;
    loading: boolean;
    error: Error | null;
}

// Create context with default values
const AuthContext = createContext<AuthContextType>({
    keycloak: null,
    initialized: false,
    isAuthenticated: false,
    login: () => {
    },
    logout: () => {
    },
    token: undefined,
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

                const initialized = await keycloakInstance.init({
                    enableLogging: process.env.NODE_ENV === 'development',
                    pkceMethod: 'S256',
                    checkLoginIframe: false,
                    silentCheckSsoRedirectUri: typeof window !== 'undefined' ? `${window.location.origin}/silent-check-sso.html` : '',
                });

                if (!initialized) {
                    console.warn('Keycloak failed to initialize');
                }

                setKeycloak(keycloakInstance);
                setInitialized(initialized);
                setIsAuthenticated(initialized ? keycloakInstance.authenticated ?? false : false);
                setToken(keycloakInstance.token);

                keycloakInstance.onAuthSuccess = async () => {
                    if (process.env.NODE_ENV === 'development') {
                        console.log('Authentication success event');
                    }
                    setIsAuthenticated(true);
                    setToken(keycloakInstance.token);

                    try {
                        const profile = await keycloakInstance.loadUserProfile();
                        setUserProfile(profile);
                        if (process.env.NODE_ENV === 'development') {
                            console.log('User profile loaded after auth success');
                        }
                    } catch (profileError) {
                        console.error('Failed to load user profile after auth success:', profileError);
                    }
                };

                keycloakInstance.onAuthRefreshSuccess = () => {
                    if (process.env.NODE_ENV === 'development') {
                        console.log('Token refresh success event');
                    }
                    setIsAuthenticated(true);
                    setToken(keycloakInstance.token);
                };

                keycloakInstance.onAuthLogout = () => {
                    if (process.env.NODE_ENV === 'development') {
                        console.log('Logout event');
                    }
                    setIsAuthenticated(false);
                    setUserProfile(null);
                    setToken(undefined);
                };

                if (initialized && keycloakInstance.authenticated) {
                    try {
                        const profile = await keycloakInstance.loadUserProfile();
                        setUserProfile(profile);
                        if (process.env.NODE_ENV === 'development') {
                            console.log('User authenticated successfully');
                        }

                        const updateTokenInterval = setInterval(() => {
                            keycloakInstance.updateToken(MIN_VALIDITY)
                                .then((refreshed: any) => {
                                    if (refreshed) {
                                        if (process.env.NODE_ENV === 'development') {
                                            console.log('Token was successfully refreshed');
                                        }
                                        setToken(keycloakInstance.token);
                                        setIsAuthenticated(true);
                                    }
                                })
                                .catch((error: any) => {
                                    console.error('Failed to refresh the token, or the session has expired', error);
                                    clearInterval(updateTokenInterval);
                                    keycloakInstance.logout();
                                });
                        }, 60000);

                        return () => {
                            clearInterval(updateTokenInterval);
                        };
                    } catch (profileError) {
                        console.error('Failed to load user profile:', profileError);
                    }

                    keycloakInstance.onTokenExpired = () => {
                        if (process.env.NODE_ENV === 'development') {
                            console.log('Token expired, attempting refresh...');
                        }
                        keycloakInstance.updateToken(MIN_VALIDITY).then((refreshed: any) => {
                            if (refreshed) {
                                if (process.env.NODE_ENV === 'development') {
                                    console.log('Token refreshed successfully after expiration');
                                }
                                setToken(keycloakInstance.token);
                                setIsAuthenticated(true);
                            } else {
                                const expiryTime = keycloakInstance.tokenParsed?.exp || 0;
                                const currentTime = Math.floor(new Date().getTime() / 1000);
                                const timeRemaining = expiryTime - currentTime;

                                if (process.env.NODE_ENV === 'development') {
                                    console.log(`Token not refreshed, valid for ${timeRemaining} seconds`);
                                }
                            }
                        }).catch((error: any) => {
                            console.error('Failed to refresh expired token', error);
                            keycloakInstance.logout();
                        });
                    };

                    keycloakInstance.onAuthError = (errorData: any) => {
                        console.error('Authentication error:', errorData);
                        setError(new Error('Authentication error occurred'));
                        setIsAuthenticated(false);
                    };
                }
            } catch (err) {
                setError(err instanceof Error ? err : new Error('Unknown error during authentication initialization'));
                console.error('Failed to initialize Keycloak:', err);
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

                if (process.env.NODE_ENV === 'development') {
                    console.log('Redirecting to login...');
                }
                keycloak.login(loginOptions);
            } catch (error) {
                console.error('Error during login redirect:', error);
                setError(error instanceof Error ? error : new Error('Failed to redirect to login page'));
            }
        } else {
            console.error('Cannot login: Keycloak not initialized');
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
                if (process.env.NODE_ENV === 'development') {
                    console.log('Logging out user...');
                }
                setIsAuthenticated(false);
                setUserProfile(null);
                setToken(undefined);

                const logoutOptions: KeycloakLogoutOptions = {
                    redirectUri: options?.redirectUri ?? window.location.origin
                };

                keycloak.logout(logoutOptions);
            } catch (error) {
                console.error('Error during logout:', error);
                try {
                    window.localStorage.removeItem('kc-callback');
                    window.localStorage.removeItem('kc-login-redirect');
                    window.location.href = window.location.origin;
                } catch (fallbackError) {
                    console.error('Fallback logout also failed:', fallbackError);
                }
            }
        } else {
            console.error('Cannot logout: Keycloak not initialized');
        }
    };

    const value = {
        keycloak,
        initialized,
        isAuthenticated,
        login,
        logout,
        token,
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
