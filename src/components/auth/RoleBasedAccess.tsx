"use client";

import React, {ReactNode} from 'react';
import {useAuth} from '@/auth/KeycloakProvider';
import {hasRole, isAdmin, isClient, isGuest, UserRole} from '@/auth/roleUtils';

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

export function useHasRole(role: UserRole): boolean {
    const {isAuthenticated, userProfile} = useAuth();

    if (role === UserRole.GUEST) {
        return isGuest(isAuthenticated);
    }

    return hasRole(userProfile, role);
}

export function useIsAdmin(): boolean {
    const {userProfile} = useAuth();
    return isAdmin(userProfile);
}

export function useIsClient(): boolean {
    const {userProfile} = useAuth();
    return isClient(userProfile);
}

export function useIsGuest(): boolean {
    const {isAuthenticated} = useAuth();
    return isGuest(isAuthenticated);
}