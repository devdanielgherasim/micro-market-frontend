import type Keycloak from 'keycloak-js';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';

import {getKeycloak} from '@/auth/keycloak';

import {ApiError, fetchWithTimeout, handleApiError} from './api';

vi.mock('@/auth/keycloak', () => ({
    getKeycloak: vi.fn(),
}));

function jsonResponse(body: unknown, init: Partial<{ status: number; ok: boolean }> = {}) {
    const status = init.status ?? 200;
    return {
        ok: init.ok ?? (status >= 200 && status < 300),
        status,
        statusText: 'OK',
        headers: {
            get: (name: string) => (name.toLowerCase() === 'content-type' ? 'application/json' : null),
        },
        json: async () => body,
    } as unknown as Response;
}

describe('fetchWithTimeout', () => {
    beforeEach(() => {
        vi.mocked(getKeycloak).mockReturnValue(null);
        vi.stubGlobal('fetch', vi.fn());
        vi.spyOn(console, 'log').mockImplementation(() => {});
        vi.spyOn(console, 'warn').mockImplementation(() => {});
        vi.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        vi.unstubAllGlobals();
        vi.restoreAllMocks();
        delete process.env.NEXT_PUBLIC_API_URL;
    });

    it('returns the parsed JSON body for a successful response', async () => {
        vi.mocked(fetch).mockResolvedValue(jsonResponse({id: '1', name: 'Widget'}));

        const result = await fetchWithTimeout<{ id: string; name: string }>('/api/products/1');

        expect(result).toEqual({id: '1', name: 'Widget'});
    });

    it('returns an empty object for a 204 No Content response', async () => {
        vi.mocked(fetch).mockResolvedValue(jsonResponse(null, {status: 204}));

        const result = await fetchWithTimeout('/api/products/1', {method: 'DELETE'});

        expect(result).toEqual({});
    });

    it('returns an empty object when the response is not JSON', async () => {
        const response = {
            ok: true,
            status: 200,
            statusText: 'OK',
            headers: {get: () => 'text/plain'},
            json: async () => {
                throw new Error('should not be called');
            },
        } as unknown as Response;
        vi.mocked(fetch).mockResolvedValue(response);

        const result = await fetchWithTimeout('/api/products/1');

        expect(result).toEqual({});
    });

    it('injects the Authorization header when Keycloak is authenticated', async () => {
        const updateToken = vi.fn().mockResolvedValue(false);
        vi.mocked(getKeycloak).mockReturnValue({
            authenticated: true,
            token: 'abc123',
            updateToken,
        } as unknown as Keycloak);
        vi.mocked(fetch).mockResolvedValue(jsonResponse({ok: true}));

        await fetchWithTimeout('/api/products');

        expect(updateToken).toHaveBeenCalledWith(30);
        const [, requestInit] = vi.mocked(fetch).mock.calls[0];
        const headers = requestInit!.headers as Headers;
        expect(headers.get('Authorization')).toBe('Bearer abc123');
    });

    it('does not add an Authorization header when Keycloak is not authenticated', async () => {
        vi.mocked(getKeycloak).mockReturnValue({authenticated: false} as unknown as Keycloak);
        vi.mocked(fetch).mockResolvedValue(jsonResponse({ok: true}));

        await fetchWithTimeout('/api/products');

        const [, requestInit] = vi.mocked(fetch).mock.calls[0];
        const headers = requestInit!.headers as Headers;
        expect(headers.has('Authorization')).toBe(false);
    });

    it('forces a login and throws when token refresh fails', async () => {
        const login = vi.fn();
        vi.mocked(getKeycloak).mockReturnValue({
            authenticated: true,
            token: 'stale',
            updateToken: vi.fn().mockRejectedValue(new Error('refresh failed')),
            login,
        } as unknown as Keycloak);

        await expect(fetchWithTimeout('/api/products')).rejects.toThrow('Authentication required');
        expect(login).toHaveBeenCalledTimes(1);
        expect(fetch).not.toHaveBeenCalled();
    });

    it('sets Content-Type to application/json for a non-GET request with a body', async () => {
        vi.mocked(fetch).mockResolvedValue(jsonResponse({ok: true}));

        await fetchWithTimeout('/api/products', {
            method: 'POST',
            body: JSON.stringify({name: 'Widget'}),
        });

        const [, requestInit] = vi.mocked(fetch).mock.calls[0];
        const headers = requestInit!.headers as Headers;
        expect(headers.get('Content-Type')).toBe('application/json');
    });

    it('throws an ApiError built from the JSON error body on a non-ok response', async () => {
        vi.mocked(fetch).mockResolvedValue(
            jsonResponse({message: 'Widget not found', code: 'WIDGET_404'}, {status: 404, ok: false})
        );

        await expect(fetchWithTimeout('/api/products/999')).rejects.toMatchObject({
            name: 'ApiError',
            message: 'Widget not found',
            status: 404,
            code: 'WIDGET_404',
        });
    });

    it('falls back to a status-based message when the error body is not valid JSON', async () => {
        const response = {
            ok: false,
            status: 500,
            statusText: 'Internal Server Error',
            headers: {get: () => 'application/json'},
            json: async () => {
                throw new Error('invalid json');
            },
        } as unknown as Response;
        vi.mocked(fetch).mockResolvedValue(response);

        await expect(fetchWithTimeout('/api/products')).rejects.toMatchObject({
            status: 500,
            message: 'HTTP Error: 500 Internal Server Error',
        });
    });

    it('rejects with a timeout error when the request exceeds the timeout', async () => {
        vi.mocked(fetch).mockImplementation(() => new Promise(() => {
            // never resolves
        }));

        await expect(fetchWithTimeout('/api/products/slow', {}, 20)).rejects.toThrow(/timed out after 20ms/);
    });

    it('resolves the path against NEXT_PUBLIC_API_URL when configured', async () => {
        process.env.NEXT_PUBLIC_API_URL = 'https://api.example.com';
        vi.mocked(fetch).mockResolvedValue(jsonResponse({id: '1'}));

        await fetchWithTimeout('/api/products/1');

        const [calledUrl] = vi.mocked(fetch).mock.calls[0];
        expect(calledUrl).toBe('https://api.example.com/api/products/1');
    });
});

describe('handleApiError', () => {
    it('returns the message from an ApiError', () => {
        expect(handleApiError(new ApiError('boom', 400, 'BAD'))).toBe('boom');
    });

    it('returns the message property from a plain error-like object', () => {
        expect(handleApiError({message: 'plain object error'})).toBe('plain object error');
    });

    it('returns the message from a generic Error instance', () => {
        expect(handleApiError(new Error('generic failure'))).toBe('generic failure');
    });

    it('returns a fallback message for unrecognized error shapes', () => {
        expect(handleApiError('a plain string')).toBe('An unknown error occurred');
        expect(handleApiError(null)).toBe('An unknown error occurred');
        expect(handleApiError(undefined)).toBe('An unknown error occurred');
    });
});

describe('ApiError', () => {
    it('carries status and optional code, and is instanceof Error', () => {
        const error = new ApiError('failed', 422, 'VALIDATION');

        expect(error).toBeInstanceOf(Error);
        expect(error).toBeInstanceOf(ApiError);
        expect(error.name).toBe('ApiError');
        expect(error.status).toBe(422);
        expect(error.code).toBe('VALIDATION');
    });
});
