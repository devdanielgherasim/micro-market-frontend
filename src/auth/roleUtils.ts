import {KeycloakProfile, KeycloakTokenParsed} from 'keycloak-js';

import {createLogger} from '@/utils/logger';

const logger = createLogger('Auth');

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
 * Extracts roles from the Keycloak token and user profile
 * @param tokenParsed - The parsed Keycloak token
 * @param userProfile - The Keycloak user profile
 * @returns Array of roles or empty array if no roles found
 */
export function extractRoles(tokenParsed: KeycloakTokenParsed | undefined, userProfile: KeycloakProfile | null): string[] {
    if (tokenParsed) {
        if (tokenParsed.realm_access?.roles) {
            logger.debug('Extracted roles from token realm_access:', tokenParsed.realm_access.roles);
            return tokenParsed.realm_access.roles;
        }

        if (tokenParsed.resource_access) {
            const clientId = process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID || 'micro-market-frontend';
            const clientRoles = tokenParsed.resource_access[clientId]?.roles || [];

            if (clientRoles.length > 0) {
                logger.debug(`Extracted roles from token resource_access.${clientId}:`, clientRoles);
                return clientRoles;
            }

            for (const client in tokenParsed.resource_access) {
                const roles = tokenParsed.resource_access[client]?.roles || [];
                if (roles.length > 0) {
                    logger.debug(`Extracted roles from token resource_access.${client}:`, roles);
                    return roles;
                }
            }
        }
    }

    if (!userProfile) {
        logger.debug('No user profile or token provided for role extraction');
        return [];
    }

    if (userProfile.realm_access?.roles) {
        logger.debug('Extracted roles from profile realm_access:', userProfile.realm_access.roles);
        return userProfile.realm_access.roles;
    }

    if (userProfile.attributes?.role) {
        const roles = Array.isArray(userProfile.attributes.role)
            ? userProfile.attributes.role
            : [userProfile.attributes.role];

        logger.debug('Extracted roles from profile attributes:', roles);
        return roles;
    }

    if (userProfile.resource_access) {
        const clientId = process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID ?? 'micro-market-frontend';
        const clientRoles = userProfile.resource_access[clientId]?.roles ?? [];

        if (clientRoles.length > 0) {
            logger.debug(`Extracted roles from profile resource_access.${clientId}:`, clientRoles);
            return clientRoles;
        }

        for (const client in userProfile.resource_access) {
            const roles = userProfile.resource_access[client]?.roles ?? [];
            if (roles.length > 0) {
                logger.debug(`Extracted roles from profile resource_access.${client}:`, roles);
                return roles;
            }
        }
    }

    logger.info('No roles found in token or profile for user:', userProfile.username);
    logger.info('Assigning default user role');
    return ['user'];
}

/**
 * Checks if the user has a specific role
 * @param tokenParsed - The parsed Keycloak token
 * @param userProfile - The Keycloak user profile
 * @param role - The role to check
 * @returns True if the user has the role, false otherwise
 */
export function hasRole(tokenParsed: KeycloakTokenParsed | undefined, userProfile: KeycloakProfile | null, role: UserRole): boolean {
    if (!userProfile) {
        const isGuest = role === UserRole.GUEST;
        logger.debug(`No user profile or token, checking for GUEST role: ${isGuest}`);
        return isGuest;
    }

    const roles = extractRoles(tokenParsed, userProfile);
    const hasRole = roles.includes(role);

    logger.debug(`Checking if user has role '${role}': ${hasRole}`);
    return hasRole;
}

/**
 * Checks if the user is an administrator
 * @param tokenParsed - The parsed Keycloak token
 * @param userProfile - The Keycloak user profile
 * @returns True if the user is an administrator, false otherwise
 */
export function isAdmin(tokenParsed: KeycloakTokenParsed | undefined, userProfile: KeycloakProfile | null): boolean {
    const result = hasRole(tokenParsed, userProfile, UserRole.ADMIN);
    logger.debug(`Checking if user is ADMIN: ${result}`);
    return result;
}

/**
 * Checks if the user is an editor
 * @param tokenParsed - The parsed Keycloak token
 * @param userProfile - The Keycloak user profile
 * @returns True if the user is an editor, false otherwise
 */
export function isEditor(tokenParsed: KeycloakTokenParsed | undefined, userProfile: KeycloakProfile | null): boolean {
    const result = hasRole(tokenParsed, userProfile, UserRole.EDITOR);
    logger.debug(`Checking if user is EDITOR: ${result}`);
    return result;
}

/**
 * Checks if the user is a regular user
 * @param tokenParsed - The parsed Keycloak token
 * @param userProfile - The Keycloak user profile
 * @returns True if the user is a regular user, false otherwise
 */
export function isUser(tokenParsed: KeycloakTokenParsed | undefined, userProfile: KeycloakProfile | null): boolean {
    const result = hasRole(tokenParsed, userProfile, UserRole.USER);
    logger.debug(`Checking if user is USER: ${result}`);
    return result;
}

/**
 * Checks if the user is a guest (not authenticated)
 * @param isAuthenticated - Whether the user is authenticated
 * @returns True if the user is a guest, false otherwise
 */
export function isGuest(isAuthenticated: boolean): boolean {
    const result = !isAuthenticated;
    logger.debug(`Checking if user is GUEST: ${result}`);
    return result;
}

/**
 * Gets the highest role of the user based on privilege hierarchy
 * @param tokenParsed - The parsed Keycloak token
 * @param userProfile - The Keycloak user profile
 * @param isAuthenticated - Whether the user is authenticated
 * @returns The highest role of the user
 */
export function getHighestRole(tokenParsed: KeycloakTokenParsed | undefined, userProfile: KeycloakProfile | null, isAuthenticated: boolean): UserRole {
    if (!isAuthenticated) {
        logger.debug('User not authenticated, highest role: GUEST');
        return UserRole.GUEST;
    }

    if (isAdmin(tokenParsed, userProfile)) {
        logger.debug('Highest role determined: ADMIN');
        return UserRole.ADMIN;
    }

    if (isEditor(tokenParsed, userProfile)) {
        logger.debug('Highest role determined: EDITOR');
        return UserRole.EDITOR;
    }

    if (isUser(tokenParsed, userProfile)) {
        logger.debug('Highest role determined: USER');
        return UserRole.USER;
    }

    logger.debug('No specific role found, defaulting to: GUEST');
    return UserRole.GUEST;
}
