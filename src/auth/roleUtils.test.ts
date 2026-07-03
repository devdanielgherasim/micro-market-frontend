import type {KeycloakProfile, KeycloakTokenParsed} from 'keycloak-js';
import {describe, expect, it} from 'vitest';

import {
    extractRoles,
    getHighestRole,
    hasRole,
    isAdmin,
    isEditor,
    isGuest,
    isUser,
    UserRole,
} from './roleUtils';

function profile(overrides: Partial<KeycloakProfile> = {}): KeycloakProfile {
    return {username: 'jdoe', ...overrides} as KeycloakProfile;
}

describe('extractRoles', () => {
    it('prefers realm_access roles from the parsed token', () => {
        const token = {realm_access: {roles: ['admin', 'user']}} as KeycloakTokenParsed;
        expect(extractRoles(token, null)).toEqual(['admin', 'user']);
    });

    it('falls back to resource_access roles for the configured client id when realm_access is absent', () => {
        const token = {
            resource_access: {
                'micro-market-frontend': {roles: ['editor']},
            },
        } as unknown as KeycloakTokenParsed;
        expect(extractRoles(token, null)).toEqual(['editor']);
    });

    it('falls back to any client under resource_access if the configured client id has no roles', () => {
        const token = {
            resource_access: {
                'other-client': {roles: ['user']},
            },
        } as unknown as KeycloakTokenParsed;
        expect(extractRoles(token, null)).toEqual(['user']);
    });

    it('returns an empty array when there is no token and no profile', () => {
        expect(extractRoles(undefined, null)).toEqual([]);
    });

    it('falls back to the profile realm_access roles when no token is provided', () => {
        const userProfile = profile({realm_access: {roles: ['user']}});
        expect(extractRoles(undefined, userProfile)).toEqual(['user']);
    });

    it('falls back to profile attributes.role (single string) when present', () => {
        const userProfile = profile({attributes: {role: 'editor'}});
        expect(extractRoles(undefined, userProfile)).toEqual(['editor']);
    });

    it('falls back to profile attributes.role (array) when present', () => {
        const userProfile = profile({attributes: {role: ['editor', 'user']}});
        expect(extractRoles(undefined, userProfile)).toEqual(['editor', 'user']);
    });

    it('falls back to profile resource_access for the configured client id', () => {
        const userProfile = profile({
            resource_access: {'micro-market-frontend': {roles: ['admin']}},
        });
        expect(extractRoles(undefined, userProfile)).toEqual(['admin']);
    });

    it('defaults to ["user"] when a profile exists but no roles can be found anywhere', () => {
        const userProfile = profile();
        expect(extractRoles(undefined, userProfile)).toEqual(['user']);
    });
});

describe('hasRole', () => {
    it('returns true only for GUEST when there is no user profile', () => {
        expect(hasRole(undefined, null, UserRole.GUEST)).toBe(true);
        expect(hasRole(undefined, null, UserRole.USER)).toBe(false);
    });

    it('returns true when the extracted roles include the requested role', () => {
        const token = {realm_access: {roles: ['admin']}} as KeycloakTokenParsed;
        expect(hasRole(token, profile(), UserRole.ADMIN)).toBe(true);
    });

    it('returns false when the extracted roles do not include the requested role', () => {
        const token = {realm_access: {roles: ['user']}} as KeycloakTokenParsed;
        expect(hasRole(token, profile(), UserRole.ADMIN)).toBe(false);
    });
});

describe('isAdmin / isEditor / isUser', () => {
    it('isAdmin is true only when the admin role is present', () => {
        const adminToken = {realm_access: {roles: ['admin']}} as KeycloakTokenParsed;
        const userToken = {realm_access: {roles: ['user']}} as KeycloakTokenParsed;
        expect(isAdmin(adminToken, profile())).toBe(true);
        expect(isAdmin(userToken, profile())).toBe(false);
    });

    it('isEditor is true only when the editor role is present', () => {
        const editorToken = {realm_access: {roles: ['editor']}} as KeycloakTokenParsed;
        expect(isEditor(editorToken, profile())).toBe(true);
        expect(isEditor(undefined, profile())).toBe(false);
    });

    it('isUser is true only when the user role is present', () => {
        const userToken = {realm_access: {roles: ['user']}} as KeycloakTokenParsed;
        const adminToken = {realm_access: {roles: ['admin']}} as KeycloakTokenParsed;
        expect(isUser(userToken, profile())).toBe(true);
        expect(isUser(adminToken, profile())).toBe(false);
    });
});

describe('isGuest', () => {
    it('is the negation of isAuthenticated', () => {
        expect(isGuest(false)).toBe(true);
        expect(isGuest(true)).toBe(false);
    });
});

describe('getHighestRole', () => {
    it('returns GUEST when not authenticated, regardless of token contents', () => {
        const token = {realm_access: {roles: ['admin']}} as KeycloakTokenParsed;
        expect(getHighestRole(token, profile(), false)).toBe(UserRole.GUEST);
    });

    it('prioritizes ADMIN over EDITOR and USER', () => {
        const token = {realm_access: {roles: ['user', 'editor', 'admin']}} as KeycloakTokenParsed;
        expect(getHighestRole(token, profile(), true)).toBe(UserRole.ADMIN);
    });

    it('prioritizes EDITOR over USER when not an admin', () => {
        const token = {realm_access: {roles: ['user', 'editor']}} as KeycloakTokenParsed;
        expect(getHighestRole(token, profile(), true)).toBe(UserRole.EDITOR);
    });

    it('returns USER when only the user role is present', () => {
        const token = {realm_access: {roles: ['user']}} as KeycloakTokenParsed;
        expect(getHighestRole(token, profile(), true)).toBe(UserRole.USER);
    });

    it('returns GUEST when authenticated but no recognized role is found and no profile is given', () => {
        expect(getHighestRole(undefined, null, true)).toBe(UserRole.GUEST);
    });
});
