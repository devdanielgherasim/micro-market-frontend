"use client";

import React, {ReactNode} from 'react';

import {useAuth} from '@/auth/KeycloakProvider';
import {hasRole, isGuest, UserRole} from '@/auth/roleUtils';
import {createLogger} from '@/utils/logger';

const logger = createLogger('RoleBasedRoute');

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
    const {isAuthenticated, userProfile, tokenParsed} = useAuth();

    logger.debug(`Checking route access for roles: ${requiredRoles.join(', ')}`);
    logger.debug(`User authenticated: ${isAuthenticated}`);

    if (requiredRoles.includes(UserRole.GUEST) && isGuest(isAuthenticated)) {
        logger.debug('Route access granted: User is a guest and GUEST role is allowed');
        return <>{children}</>;
    }

    const hasRequiredRole = requiredRoles.some(role =>
        hasRole(tokenParsed, userProfile, role)
    );

    if (hasRequiredRole) {
        logger.debug('Route access granted: User has at least one of the required roles');
        return <>{children}</>;
    }

    logger.debug('Route access denied: User does not have any of the required roles');
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
        <RoleBasedRoute requiredRoles={[UserRole.ADMIN]} fallback={fallback}>
            {children}
        </RoleBasedRoute>
    );
};

/**
 * Component that renders children only if the user is an editor
 */
export const EditorRoute: React.FC<{ children: ReactNode; fallback?: ReactNode }> = ({
                                                                                         children,
                                                                                         fallback
                                                                                     }) => {
    return (
        <RoleBasedRoute requiredRoles={[UserRole.EDITOR]} fallback={fallback}>
            {children}
        </RoleBasedRoute>
    );
};

/**
 * Component that renders children only if the user is a regular user
 */
export const UserRoute: React.FC<{ children: ReactNode; fallback?: ReactNode }> = ({
                                                                                       children,
                                                                                       fallback
                                                                                   }) => {
    return (
        <RoleBasedRoute requiredRoles={[UserRole.USER]} fallback={fallback}>
            {children}
        </RoleBasedRoute>
    );
};

/**
 * Component that renders children if the user is authenticated with any role
 */
export const AuthenticatedRoute: React.FC<{ children: ReactNode; fallback?: ReactNode }> = ({
                                                                                                children,
                                                                                                fallback
                                                                                            }) => {
    return (
        <RoleBasedRoute
            requiredRoles={[UserRole.USER, UserRole.ADMIN, UserRole.EDITOR]}
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
