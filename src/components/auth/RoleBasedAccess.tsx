"use client";

import React, { ReactNode } from 'react';
import { useAuth } from '@/auth/KeycloakProvider';
import { UserRole, hasRole, isGuest, isAdmin, isClient } from '@/auth/roleUtils';

interface RoleBasedAccessProps {
  children: ReactNode;
  requiredRoles: UserRole[];
  fallback?: ReactNode;
}

/**
 * Component that renders children only if the user has one of the required roles
 * If the user doesn't have any of the required roles, it renders the fallback component
 * or nothing if no fallback is provided
 */
export const RoleBasedAccess: React.FC<RoleBasedAccessProps> = ({
  children,
  requiredRoles,
  fallback
}) => {
  const { isAuthenticated, userProfile } = useAuth();

  // Special case for guest role
  if (requiredRoles.includes(UserRole.GUEST) && isGuest(isAuthenticated)) {
    return <>{children}</>;
  }

  // Check if user has any of the required roles
  const hasRequiredRole = requiredRoles.some(role => 
    hasRole(userProfile, role)
  );

  if (hasRequiredRole) {
    return <>{children}</>;
  }

  // If user doesn't have required role, render fallback or nothing
  return fallback ? <>{fallback}</> : null;
};

/**
 * Component that renders children only if the user is an administrator
 */
export const AdminOnly: React.FC<{ children: ReactNode; fallback?: ReactNode }> = ({
  children,
  fallback
}) => {
  return (
    <RoleBasedAccess requiredRoles={[UserRole.ADMINISTRATOR]} fallback={fallback}>
      {children}
    </RoleBasedAccess>
  );
};

/**
 * Component that renders children only if the user is a client
 */
export const ClientOnly: React.FC<{ children: ReactNode; fallback?: ReactNode }> = ({
  children,
  fallback
}) => {
  return (
    <RoleBasedAccess requiredRoles={[UserRole.CLIENT]} fallback={fallback}>
      {children}
    </RoleBasedAccess>
  );
};

/**
 * Component that renders children only if the user is authenticated (client or admin)
 */
export const AuthenticatedOnly: React.FC<{ children: ReactNode; fallback?: ReactNode }> = ({
  children,
  fallback
}) => {
  return (
    <RoleBasedAccess 
      requiredRoles={[UserRole.CLIENT, UserRole.ADMINISTRATOR]} 
      fallback={fallback}
    >
      {children}
    </RoleBasedAccess>
  );
};

/**
 * Component that renders children only if the user is a guest (not authenticated)
 */
export const GuestOnly: React.FC<{ children: ReactNode; fallback?: ReactNode }> = ({
  children,
  fallback
}) => {
  return (
    <RoleBasedAccess requiredRoles={[UserRole.GUEST]} fallback={fallback}>
      {children}
    </RoleBasedAccess>
  );
};

/**
 * Custom hook for checking if the user has a specific role
 * @param role - The role to check
 * @returns True if the user has the role, false otherwise
 */
export function useHasRole(role: UserRole): boolean {
  const { isAuthenticated, userProfile } = useAuth();
  
  if (role === UserRole.GUEST) {
    return isGuest(isAuthenticated);
  }
  
  return hasRole(userProfile, role);
}

/**
 * Custom hook for checking if the user is an administrator
 * @returns True if the user is an administrator, false otherwise
 */
export function useIsAdmin(): boolean {
  const { userProfile } = useAuth();
  return isAdmin(userProfile);
}

/**
 * Custom hook for checking if the user is a client
 * @returns True if the user is a client, false otherwise
 */
export function useIsClient(): boolean {
  const { userProfile } = useAuth();
  return isClient(userProfile);
}

/**
 * Custom hook for checking if the user is a guest (not authenticated)
 * @returns True if the user is a guest, false otherwise
 */
export function useIsGuest(): boolean {
  const { isAuthenticated } = useAuth();
  return isGuest(isAuthenticated);
}