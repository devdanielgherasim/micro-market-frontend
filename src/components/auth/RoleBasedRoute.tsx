"use client";

import React, {ReactNode} from 'react';
import {useAuth} from '@/auth/KeycloakProvider';
import {hasRole, isGuest, UserRole} from '@/auth/roleUtils';


interface RoleBasedRouteProps {
    children: ReactNode;
    requiredRoles: UserRole[];
    fallback?: ReactNode;
}

export const RoleBasedRoute: React.FC<RoleBasedRouteProps> = ({
                                                                  children,
                                                                  requiredRoles,
                                                                  fallback
                                                              }) => {
    const {isAuthenticated, userProfile} = useAuth();

    if (requiredRoles.includes(UserRole.GUEST) && isGuest(isAuthenticated)) {
        return <>{children}</>;
    }

    const hasRequiredRole = requiredRoles.some(role =>
        hasRole(userProfile, role)
    );

    if (hasRequiredRole) {
        return <>{children}</>;
    }

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