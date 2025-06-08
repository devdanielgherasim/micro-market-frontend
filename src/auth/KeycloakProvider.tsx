"use client";

import React, {createContext, ReactNode, useContext, useEffect, useState} from 'react';
import {initKeycloak} from './keycloak';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
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
                                                                      children,
                                                                      initOptions = {
                                                                          // No onLoad option to prevent automatic login
                                                                          checkLoginIframe: false,
                                                                          silentCheckSsoRedirectUri: typeof window !== 'undefined' ? `${window.location.origin}/silent-check-sso.html` : '',
                                                                      }
                                                                  }) => {
    const [initialized, setInitialized] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [userProfile, setUserProfile] = useState<KeycloakProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);
    const [keycloak, setKeycloak] = useState<Keycloak | null>(null);
    const [token, setToken] = useState<string | undefined>(undefined);

    useEffect(() => {
        // Prevent multiple initialization attempts
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

                // Configure refresh interval - minimum 10 seconds
                const MIN_VALIDITY = 30; // Minimum token validity in seconds

                // Initialize Keycloak with minimal options to prevent automatic login
                const initialized = await keycloakInstance.init({
                    enableLogging: process.env.NODE_ENV === 'development',
                    pkceMethod: 'S256', // More secure PKCE method
                    checkLoginIframe: false, // Disable iframe checking for better security
                    silentCheckSsoRedirectUri: typeof window !== 'undefined' ? `${window.location.origin}/silent-check-sso.html` : '',
                });

                if (!initialized) {
                    console.warn('Keycloak failed to initialize');
                }

                setKeycloak(keycloakInstance);
                setInitialized(initialized);
                setIsAuthenticated(initialized ? keycloakInstance.authenticated || false : false);
                setToken(keycloakInstance.token);

                if (initialized && keycloakInstance.authenticated) {
                    try {
                        // Load user profile information
                        const profile = await keycloakInstance.loadUserProfile();
                        setUserProfile(profile);
                        if (process.env.NODE_ENV === 'development') {
                            console.log('User authenticated successfully');
                        }

                        // Setup token refresh mechanism
                        const updateTokenInterval = setInterval(() => {
                            keycloakInstance.updateToken(MIN_VALIDITY)
                                .then((refreshed) => {
                                    if (refreshed) {
                                        if (process.env.NODE_ENV === 'development') {
                                            console.log('Token was successfully refreshed');
                                        }
                                        setToken(keycloakInstance.token);
                                    }
                                })
                                .catch((error) => {
                                    console.error('Failed to refresh the token, or the session has expired', error);
                                    clearInterval(updateTokenInterval);
                                    keycloakInstance.logout();
                                });
                        }, 60000); // Check for refresh every minute

                        // Clear interval on component unmount
                        return () => {
                            clearInterval(updateTokenInterval);
                        };
                    } catch (profileError) {
                        console.error('Failed to load user profile:', profileError);
                    }

                    // Handle token expiration
                    keycloakInstance.onTokenExpired = () => {
                        if (process.env.NODE_ENV === 'development') {
                            console.log('Token expired, attempting refresh...');
                        }
                        keycloakInstance.updateToken(MIN_VALIDITY).then((refreshed) => {
                            if (refreshed) {
                                if (process.env.NODE_ENV === 'development') {
                                    console.log('Token refreshed successfully after expiration');
                                }
                                setToken(keycloakInstance.token);
                            } else {
                                const expiryTime = keycloakInstance.tokenParsed?.exp || 0;
                                const currentTime = Math.floor(new Date().getTime() / 1000);
                                const timeRemaining = expiryTime - currentTime;

                                if (process.env.NODE_ENV === 'development') {
                                    console.log(`Token not refreshed, valid for ${timeRemaining} seconds`);
                                }
                            }
                        }).catch((error) => {
                            console.error('Failed to refresh expired token', error);
                            // Handle session timeout - redirect to login
                            keycloakInstance.logout();
                        });
                    };

                    // Handle authentication errors
                    keycloakInstance.onAuthError = (errorData) => {
                        console.error('Authentication error:', errorData);
                        setError(new Error('Authentication error occurred'));
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
            // Cleanup
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
                // Prepare for logout - clear local state first
                setIsAuthenticated(false);
                setUserProfile(null);
                setToken(undefined);

                // Prepare logout options
                const logoutOptions: KeycloakLogoutOptions = {
                    redirectUri: options?.redirectUri || window.location.origin
                };

                // Perform actual logout with Keycloak
                keycloak.logout(logoutOptions);
            } catch (error) {
                console.error('Error during logout:', error);
                // Fallback - force reload to the homepage if Keycloak logout fails
                try {
                    window.localStorage.removeItem('kc-callback');
                    window.localStorage.removeItem('kc-login-redirect');
                    // Force reload to clear any session data
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
