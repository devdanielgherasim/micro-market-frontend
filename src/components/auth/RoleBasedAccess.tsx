"use client";

import React, {ReactNode} from 'react';
import {useAuth} from '@/auth/KeycloakProvider';
import {hasRole, isAdmin, isEditor, isGuest, isUser, UserRole} from '@/auth/roleUtils';

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

    if (process.env.NEXT_PUBLIC_API_URL) {
        console.log(`[RoleBasedAccess] Checking access for roles: ${requiredRoles.join(', ')}`);
        console.log(`[RoleBasedAccess] User authenticated: ${isAuthenticated}`);
    }

    if (requiredRoles.includes(UserRole.GUEST) && isGuest(isAuthenticated)) {
        if (process.env.NEXT_PUBLIC_API_URL) {
            console.log('[RoleBasedAccess] Access granted: User is a guest and GUEST role is allowed');
        }
        return <>{children}</>;
    }

    const hasRequiredRole = requiredRoles.some(role =>
        hasRole(userProfile, role)
    );

    if (hasRequiredRole) {
        if (process.env.NEXT_PUBLIC_API_URL) {
            console.log('[RoleBasedAccess] Access granted: User has at least one of the required roles');
        }
        return <>{children}</>;
    }

    if (process.env.NEXT_PUBLIC_API_URL) {
        console.log('[RoleBasedAccess] Access denied: User does not have any of the required roles');
    }
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

export const EditorOnly: React.FC<{ children: ReactNode; fallback?: ReactNode }> = ({
                                                                                        children,
                                                                                        fallback
                                                                                    }) => {
    return (
        <RoleBasedAccess requiredRoles={[UserRole.EDITOR]} fallback={fallback}>
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

export function useHasRole(role: UserRole): boolean {
    const {isAuthenticated, userProfile} = useAuth();

    if (process.env.NEXT_PUBLIC_API_URL) {
        console.log(`[useHasRole] Checking if user has role: ${role}`);
    }

    if (role === UserRole.GUEST) {
        const result = isGuest(isAuthenticated);
        if (process.env.NEXT_PUBLIC_API_URL) {
            console.log(`[useHasRole] Result for GUEST role: ${result}`);
        }
        return result;
    }

    const result = hasRole(userProfile, role);
    if (process.env.NEXT_PUBLIC_API_URL) {
        console.log(`[useHasRole] Result for ${role} role: ${result}`);
    }
    return result;
}

/**
 * Hook to check if the current user is an administrator
 * @returns True if the user is an administrator, false otherwise
 */
export function useIsAdmin(): boolean {
    const {userProfile} = useAuth();
    if (process.env.NEXT_PUBLIC_API_URL) {
        console.log('[useIsAdmin] Checking if user is an administrator');
    }
    const result = isAdmin(userProfile);
    if (process.env.NEXT_PUBLIC_API_URL) {
        console.log(`[useIsAdmin] Result: ${result}`);
    }
    return result;
}

/**
 * Hook to check if the current user is an editor
 * @returns True if the user is an editor, false otherwise
 */
export function useIsEditor(): boolean {
    const {userProfile} = useAuth();
    if (process.env.NEXT_PUBLIC_API_URL) {
        console.log('[useIsEditor] Checking if user is an editor');
    }
    const result = isEditor(userProfile);
    if (process.env.NEXT_PUBLIC_API_URL) {
        console.log(`[useIsEditor] Result: ${result}`);
    }
    return result;
}

/**
 * Hook to check if the current user is a regular user
 * @returns True if the user is a regular user, false otherwise
 */
export function useIsUser(): boolean {
    const {userProfile} = useAuth();
    if (process.env.NEXT_PUBLIC_API_URL) {
        console.log('[useIsUser] Checking if user is a regular user');
    }
    const result = isUser(userProfile);
    if (process.env.NEXT_PUBLIC_API_URL) {
        console.log(`[useIsUser] Result: ${result}`);
    }
    return result;
}

/**
 * Hook to check if the current user is a guest (not authenticated)
 * @returns True if the user is a guest, false otherwise
 */
export function useIsGuest(): boolean {
    const {isAuthenticated} = useAuth();
    if (process.env.NEXT_PUBLIC_API_URL) {
        console.log('[useIsGuest] Checking if user is a guest');
    }
    const result = isGuest(isAuthenticated);
    if (process.env.NEXT_PUBLIC_API_URL) {
        console.log(`[useIsGuest] Result: ${result}`);
    }
    return result;
}
