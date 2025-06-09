"use client";

import React, { ReactNode } from 'react';
import { useAuth } from '@/auth/KeycloakProvider';
import { UserRole, hasRole, isGuest } from '@/auth/roleUtils';

interface RoleBasedRouteProps {
  children: ReactNode;
  requiredRoles: UserRole[];
  fallback?: ReactNode;
}

/**
 * Component that renders children only if the user has one of the required roles
 * If the user doesn't have any of the required roles, it renders the fallback component
 * or nothing if no fallback is provided
 */
export const RoleBasedRoute: React.FC<RoleBasedRouteProps> = ({
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
export const AdminRoute: React.FC<{ children: ReactNode; fallback?: ReactNode }> = ({
  children,
  fallback
}) => {
  return (
    <RoleBasedRoute requiredRoles={[UserRole.ADMINISTRATOR]} fallback={fallback}>
      {children}
    </RoleBasedRoute>
  );
};

/**
 * Component that renders children only if the user is a client
 */
export const ClientRoute: React.FC<{ children: ReactNode; fallback?: ReactNode }> = ({
  children,
  fallback
}) => {
  return (
    <RoleBasedRoute requiredRoles={[UserRole.CLIENT]} fallback={fallback}>
      {children}
    </RoleBasedRoute>
  );
};

/**
 * Component that renders children only if the user is authenticated (client or admin)
 */
export const AuthenticatedRoute: React.FC<{ children: ReactNode; fallback?: ReactNode }> = ({
  children,
  fallback
}) => {
  return (
    <RoleBasedRoute 
      requiredRoles={[UserRole.CLIENT, UserRole.ADMINISTRATOR]} 
      fallback={fallback}
    >
      {children}
    </RoleBasedRoute>
  );
};

/**
 * Component that renders children only if the user is a guest (not authenticated)
 */
export const GuestRoute: React.FC<{ children: ReactNode; fallback?: ReactNode }> = ({
  children,
  fallback
}) => {
  return (
    <RoleBasedRoute requiredRoles={[UserRole.GUEST]} fallback={fallback}>
      {children}
    </RoleBasedRoute>
  );
};