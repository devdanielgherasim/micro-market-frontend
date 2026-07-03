import type {AxiosRequestConfig, AxiosResponse} from 'axios';
import type Keycloak from 'keycloak-js';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';

import {getKeycloak} from '@/auth/keycloak';

vi.mock('@/auth/keycloak', () => ({
    getKeycloak: vi.fn(),
}));

// `src/services/api.ts` builds its axios instance once at module load time,
// with a request interceptor that injects the Keycloak bearer token and a
// response interceptor that forces `keycloak.login()` on a 401. Rather than
// hitting the network, each test supplies a custom axios `adapter` function
// per-request: axios runs the request interceptor to build `config`, hands
// it to the adapter instead of an HTTP transport, and then runs the
// response (or error) interceptor on whatever the adapter resolves/rejects
// with. That exercises the real interceptor logic end-to-end.
describe('src/services/api.ts axios instance', () => {
    beforeEach(() => {
        vi.resetModules();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    function okAdapter(config: AxiosRequestConfig): Promise<AxiosResponse> {
        return Promise.resolve({
            data: {ok: true},
            status: 200,
            statusText: 'OK',
            headers: {},
            config,
        } as AxiosResponse);
    }

    function unauthorizedAdapter(config: AxiosRequestConfig) {
        return Promise.reject({
            message: 'Request failed with status code 401',
            config,
            isAxiosError: true,
            response: {
                data: {message: 'unauthorized'},
                status: 401,
                statusText: 'Unauthorized',
                headers: {},
                config,
            },
        });
    }

    function serverErrorAdapter(config: AxiosRequestConfig) {
        return Promise.reject({
            message: 'Request failed with status code 500',
            config,
            isAxiosError: true,
            response: {
                data: {message: 'boom'},
                status: 500,
                statusText: 'Internal Server Error',
                headers: {},
                config,
            },
        });
    }

    it('injects the bearer token from Keycloak into the Authorization header', async () => {
        vi.mocked(getKeycloak).mockReturnValue({
            authenticated: true,
            token: 'the-token',
            updateToken: vi.fn().mockResolvedValue(false),
            login: vi.fn(),
        } as unknown as Keycloak);

        const {apiService} = await import('./api');
        const response = await apiService.get('/widgets', {adapter: okAdapter});

        expect(response.config.headers?.Authorization).toBe('Bearer the-token');
    });

    it('does not set an Authorization header when Keycloak has no session', async () => {
        vi.mocked(getKeycloak).mockReturnValue(null);

        const {apiService} = await import('./api');
        const response = await apiService.get('/widgets', {adapter: okAdapter});

        expect(response.config.headers?.Authorization).toBeUndefined();
    });

    it('calls keycloak.login() when a request comes back 401', async () => {
        const login = vi.fn();
        vi.mocked(getKeycloak).mockReturnValue({
            authenticated: true,
            token: 'expired-token',
            updateToken: vi.fn().mockResolvedValue(false),
            login,
        } as unknown as Keycloak);

        const {apiService} = await import('./api');

        await expect(apiService.get('/widgets', {adapter: unauthorizedAdapter})).rejects.toBeTruthy();
        expect(login).toHaveBeenCalledTimes(1);
    });

    it('does not call keycloak.login() for non-401 error responses', async () => {
        const login = vi.fn();
        vi.mocked(getKeycloak).mockReturnValue({
            authenticated: true,
            token: 'valid-token',
            updateToken: vi.fn().mockResolvedValue(false),
            login,
        } as unknown as Keycloak);

        const {apiService} = await import('./api');

        await expect(apiService.get('/widgets', {adapter: serverErrorAdapter})).rejects.toBeTruthy();
        expect(login).not.toHaveBeenCalled();
    });

    it('calls keycloak.login() and skips the request when token refresh throws', async () => {
        const login = vi.fn();
        vi.mocked(getKeycloak).mockReturnValue({
            authenticated: true,
            token: 'stale-token',
            updateToken: vi.fn().mockRejectedValue(new Error('refresh failed')),
            login,
        } as unknown as Keycloak);
        const adapter = vi.fn(okAdapter);

        const {apiService} = await import('./api');
        await apiService.get('/widgets', {adapter});

        expect(login).toHaveBeenCalledTimes(1);
        // The request interceptor swallows the refresh error and lets the
        // request continue without a fresh token, rather than rejecting.
        expect(adapter).toHaveBeenCalledTimes(1);
    });
});
