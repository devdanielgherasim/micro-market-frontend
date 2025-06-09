import { KeycloakProfile } from 'keycloak-js';

// Define the roles in the system
export enum UserRole {
  GUEST = 'guest',
  CLIENT = 'client',
  ADMINISTRATOR = 'administrator'
}

/**
 * Extracts roles from the user profile
 * @param userProfile - The Keycloak user profile
 * @returns Array of roles or empty array if no roles found
 */
export function extractRoles(userProfile: KeycloakProfile | null): string[] {
  if (!userProfile) return [];
  
  // Check if roles are in the attributes
  if (userProfile.attributes?.role) {
    return Array.isArray(userProfile.attributes.role)
      ? userProfile.attributes.role
      : [userProfile.attributes.role];
  }
  
  // Check if roles are in the realm_access property
  // @ts-ignore - realm_access is not in the type definition but might be present
  if (userProfile.realm_access?.roles) {
    // @ts-ignore
    return userProfile.realm_access.roles;
  }
  
  return [];
}

/**
 * Checks if the user has a specific role
 * @param userProfile - The Keycloak user profile
 * @param role - The role to check
 * @returns True if the user has the role, false otherwise
 */
export function hasRole(userProfile: KeycloakProfile | null, role: UserRole): boolean {
  if (!userProfile) return role === UserRole.GUEST;
  
  const roles = extractRoles(userProfile);
  return roles.includes(role);
}

/**
 * Checks if the user is an administrator
 * @param userProfile - The Keycloak user profile
 * @returns True if the user is an administrator, false otherwise
 */
export function isAdmin(userProfile: KeycloakProfile | null): boolean {
  return hasRole(userProfile, UserRole.ADMINISTRATOR);
}

/**
 * Checks if the user is a client
 * @param userProfile - The Keycloak user profile
 * @returns True if the user is a client, false otherwise
 */
export function isClient(userProfile: KeycloakProfile | null): boolean {
  return hasRole(userProfile, UserRole.CLIENT);
}

/**
 * Checks if the user is a guest (not authenticated)
 * @param isAuthenticated - Whether the user is authenticated
 * @returns True if the user is a guest, false otherwise
 */
export function isGuest(isAuthenticated: boolean): boolean {
  return !isAuthenticated;
}

/**
 * Gets the highest role of the user
 * @param userProfile - The Keycloak user profile
 * @param isAuthenticated - Whether the user is authenticated
 * @returns The highest role of the user
 */
export function getHighestRole(userProfile: KeycloakProfile | null, isAuthenticated: boolean): UserRole {
  if (!isAuthenticated) return UserRole.GUEST;
  if (isAdmin(userProfile)) return UserRole.ADMINISTRATOR;
  if (isClient(userProfile)) return UserRole.CLIENT;
  return UserRole.GUEST;
}