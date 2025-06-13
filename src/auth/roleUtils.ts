// @ts-ignore
import {KeycloakProfile} from 'keycloak-js';

/**
 * User roles available in the application
 * These should match the roles defined in Keycloak
 */
export enum UserRole {
    GUEST = 'guest',
    USER = 'user',
    ADMIN = 'admin',
    EDITOR = 'editor'
}

/**
 * Extracts roles from the user profile
 * @param userProfile - The Keycloak user profile
 * @returns Array of roles or empty array if no roles found
 */
export function extractRoles(userProfile: KeycloakProfile | null): string[] {
    if (!userProfile) {
        if (process.env.NEXT_PUBLIC_API_URL) {
            console.log('[Auth] No user profile provided for role extraction');
        }
        return [];
    }

    // Primary source of roles is realm_access.roles from Keycloak
    if (userProfile.realm_access?.roles) {
        if (process.env.NEXT_PUBLIC_API_URL) {
            console.log('[Auth] Extracted roles from realm_access:', userProfile.realm_access.roles);
        }
        return userProfile.realm_access.roles;
    }

    // Fallback to attributes.role if available
    if (userProfile.attributes?.role) {
        const roles = Array.isArray(userProfile.attributes.role)
            ? userProfile.attributes.role
            : [userProfile.attributes.role];

        if (process.env.NEXT_PUBLIC_API_URL) {
            console.log('[Auth] Extracted roles from attributes:', roles);
        }
        return roles;
    }

    // Check for resource_access which might contain client-specific roles
    if (userProfile.resource_access) {
        // Try to get roles from the client-specific section
        const clientId = process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID || 'micro-market-frontend';
        const clientRoles = userProfile.resource_access[clientId]?.roles || [];

        if (clientRoles.length > 0) {
            if (process.env.NEXT_PUBLIC_API_URL) {
                console.log(`[Auth] Extracted roles from resource_access.${clientId}:`, clientRoles);
            }
            return clientRoles;
        }

        // If no client-specific roles, try to get roles from any client
        for (const client in userProfile.resource_access) {
            const roles = userProfile.resource_access[client]?.roles || [];
            if (roles.length > 0) {
                if (process.env.NEXT_PUBLIC_API_URL) {
                    console.log(`[Auth] Extracted roles from resource_access.${client}:`, roles);
                }
                return roles;
            }
        }
    }

    // Fallback to assigning roles based on username
    if (userProfile.username) {
        if (userProfile.username.toLowerCase().includes('admin')) {
            if (process.env.NEXT_PUBLIC_API_URL) {
                console.log('[Auth] Assigned admin role based on username');
            }
            return ['admin'];
        }

        if (userProfile.username.toLowerCase() === 'client') {
            if (process.env.NEXT_PUBLIC_API_URL) {
                console.log('[Auth] Assigned user role based on username');
            }
            return ['user'];
        }

        if (userProfile.username.toLowerCase().includes('editor')) {
            if (process.env.NEXT_PUBLIC_API_URL) {
                console.log('[Auth] Assigned editor role based on username');
            }
            return ['editor'];
        }
    }

    // Fallback to assigning a default role if the user is authenticated
    if (process.env.NEXT_PUBLIC_API_URL) {
        console.log('[Auth] No roles found in user profile, assigning default user role');
    }
    return ['user'];
}

/**
 * Checks if the user has a specific role
 * @param userProfile - The Keycloak user profile
 * @param role - The role to check
 * @returns True if the user has the role, false otherwise
 */
export function hasRole(userProfile: KeycloakProfile | null, role: UserRole): boolean {
    if (!userProfile) {
        const isGuest = role === UserRole.GUEST;
        if (process.env.NEXT_PUBLIC_API_URL) {
            console.log(`[Auth] No user profile, checking for GUEST role: ${isGuest}`);
        }
        return isGuest;
    }

    const roles = extractRoles(userProfile);
    const hasRole = roles.includes(role);

    if (process.env.NEXT_PUBLIC_API_URL) {
        console.log(`[Auth] Checking if user has role '${role}': ${hasRole}`);
    }

    return hasRole;
}

/**
 * Checks if the user is an administrator
 * @param userProfile - The Keycloak user profile
 * @returns True if the user is an administrator, false otherwise
 */
export function isAdmin(userProfile: KeycloakProfile | null): boolean {
    const result = hasRole(userProfile, UserRole.ADMIN);
    if (process.env.NEXT_PUBLIC_API_URL) {
        console.log(`[Auth] Checking if user is ADMIN: ${result}`);
    }
    return result;
}

/**
 * Checks if the user is an editor
 * @param userProfile - The Keycloak user profile
 * @returns True if the user is an editor, false otherwise
 */
export function isEditor(userProfile: KeycloakProfile | null): boolean {
    const result = hasRole(userProfile, UserRole.EDITOR);
    if (process.env.NEXT_PUBLIC_API_URL) {
        console.log(`[Auth] Checking if user is EDITOR: ${result}`);
    }
    return result;
}

/**
 * Checks if the user is a regular user
 * @param userProfile - The Keycloak user profile
 * @returns True if the user is a regular user, false otherwise
 */
export function isUser(userProfile: KeycloakProfile | null): boolean {
    const result = hasRole(userProfile, UserRole.USER);
    if (process.env.NEXT_PUBLIC_API_URL) {
        console.log(`[Auth] Checking if user is USER: ${result}`);
    }
    return result;
}

/**
 * Checks if the user is a guest (not authenticated)
 * @param isAuthenticated - Whether the user is authenticated
 * @returns True if the user is a guest, false otherwise
 */
export function isGuest(isAuthenticated: boolean): boolean {
    const result = !isAuthenticated;
    if (process.env.NEXT_PUBLIC_API_URL) {
        console.log(`[Auth] Checking if user is GUEST: ${result}`);
    }
    return result;
}

/**
 * Gets the highest role of the user based on privilege hierarchy
 * @param userProfile - The Keycloak user profile
 * @param isAuthenticated - Whether the user is authenticated
 * @returns The highest role of the user
 */
export function getHighestRole(userProfile: KeycloakProfile | null, isAuthenticated: boolean): UserRole {
    if (!isAuthenticated) {
        if (process.env.NEXT_PUBLIC_API_URL) {
            console.log('[Auth] User not authenticated, highest role: GUEST');
        }
        return UserRole.GUEST;
    }

    if (isAdmin(userProfile)) {
        if (process.env.NEXT_PUBLIC_API_URL) {
            console.log('[Auth] Highest role determined: ADMIN');
        }
        return UserRole.ADMIN;
    }

    if (isEditor(userProfile)) {
        if (process.env.NEXT_PUBLIC_API_URL) {
            console.log('[Auth] Highest role determined: EDITOR');
        }
        return UserRole.EDITOR;
    }

    if (isUser(userProfile)) {
        if (process.env.NEXT_PUBLIC_API_URL) {
            console.log('[Auth] Highest role determined: USER');
        }
        return UserRole.USER;
    }

    if (process.env.NEXT_PUBLIC_API_URL) {
        console.log('[Auth] No specific role found, defaulting to: GUEST');
    }
    return UserRole.GUEST;
}
