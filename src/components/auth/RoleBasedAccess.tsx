"use client";

import React, {ReactNode} from 'react';

import {useAuth} from '@/auth/KeycloakProvider';
import {hasRole, isGuest, UserRole} from '@/auth/roleUtils';
import {createLogger} from '@/utils/logger';

const logger = createLogger('RoleBasedAccess');

interface RoleBasedAccessProps {
    children: ReactNode;
    requiredRoles: UserRole[];
    fallback?: ReactNode;
}

export const RoleBasedAccess: React.FC<RoleBasedAccessProps> = ({
                                                                    children,
                                                                    requiredRoles,
                                                                    fallback
                                                                }) => {
    const {isAuthenticated, userProfile, tokenParsed} = useAuth();

    logger.debug(`Checking access for roles: ${requiredRoles.join(', ')}`);
    logger.debug(`User authenticated: ${isAuthenticated}`);

    if (requiredRoles.includes(UserRole.GUEST) && isGuest(isAuthenticated)) {
        logger.debug('Access granted: User is a guest and GUEST role is allowed');
        return <>{children}</>;
    }

    const hasRequiredRole = requiredRoles.some(role =>
        hasRole(tokenParsed, userProfile, role)
    );

    if (hasRequiredRole) {
        logger.debug('Access granted: User has at least one of the required roles');
        return <>{children}</>;
    }

    logger.debug('Access denied: User does not have any of the required roles');
    return fallback ? <>{fallback}</> : null;
};

export const AdminOnly: React.FC<{ children: ReactNode; fallback?: ReactNode }> = ({
                                                                                       children,
                                                                                       fallback
                                                                                   }) => {
    return (
        <RoleBasedAccess requiredRoles={[UserRole.ADMIN]} fallback={fallback}>
            {children}
        </RoleBasedAccess>
    );
};

export const UserOnly: React.FC<{ children: ReactNode; fallback?: ReactNode }> = ({
                                                                                      children,
                                                                                      fallback
                                                                                  }) => {
    return (
        <RoleBasedAccess requiredRoles={[UserRole.USER]} fallback={fallback}>
            {children}
        </RoleBasedAccess>
    );
};

export const AuthenticatedOnly: React.FC<{ children: ReactNode; fallback?: ReactNode }> = ({
                                                                                               children,
                                                                                               fallback
                                                                                           }) => {
    return (
        <RoleBasedAccess
            requiredRoles={[UserRole.USER, UserRole.ADMIN, UserRole.EDITOR]}
            fallback={fallback}
        >
            {children}
        </RoleBasedAccess>
    );
};

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
