import {getKeycloak} from '@/auth/keycloak';
import {API_TIMEOUT} from '@/config/api';
import {ApiErrorResponse} from '@/types';

function assertAllowedOrigin(url: string): void {
    let parsed: URL;
    try {
        parsed = new URL(url);
    } catch {
        throw new Error(`Invalid request URL: ${url}`);
    }
    const baseUrl = process.env.NEXT_PUBLIC_API_URL;
    if (!baseUrl) return; // no base URL configured — dev mode with localhost fallbacks
    let allowedOrigin: string;
    try {
        allowedOrigin = new URL(baseUrl).origin;
    } catch {
        return; // misconfigured base URL — skip check rather than block all requests
    }
    if (parsed.origin !== allowedOrigin) {
        throw new Error(`Request to disallowed origin: ${parsed.origin}`);
    }
}

export async function fetchWithTimeout<T>(
    url: string,
    options: RequestInit = {},
    timeout: number = API_TIMEOUT
): Promise<T> {
    assertAllowedOrigin(url);
    const keycloak = getKeycloak();
    const headers = new Headers(options.headers);

    if (keycloak?.authenticated) {
        try {
            await keycloak.updateToken(30);
            headers.set('Authorization', `Bearer ${keycloak.token}`);
        } catch (error) {
            console.error('Failed to refresh token', error);
            keycloak.login();
            throw new Error('Authentication required');
        }
    }

    if (!headers.has('Content-Type') && options.method !== 'GET' && options.body) {
        headers.set('Content-Type', 'application/json');
    }

    const fetchPromise = fetch(url, { // nosemgrep: javascript.lang.security.audit.fetch-with-url.fetch-with-url
        ...options,
        headers,
    });

    const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => {
            reject(new Error(`Request timed out after ${timeout}ms`));
        }, timeout);
    });

    try {
        const response = await Promise.race([fetchPromise, timeoutPromise]);

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({
                message: `HTTP Error: ${response.status} ${response.statusText}`,
                status: response.status
            }));

            throw new ApiError(
                errorData.message || `HTTP Error: ${response.status} ${response.statusText}`,
                response.status,
                errorData.code
            );
        }

        if (response.status === 204) {
            return {} as T;
        }

        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
            return await response.json() as T;
        } else {
            if (process.env.NEXT_PUBLIC_API_URL) {
                console.warn(`Response is not JSON: ${contentType}`);
            }
            return {} as T;
        }
    } catch (error) {
        if (error instanceof Error) {
            throw error;
        }
        throw new Error('Unknown error occurred');
    }
}

export function handleApiError(error: unknown): string {
    if (error instanceof ApiError) {
        return error.message;
    }

    if (typeof error === 'object' && error !== null) {
        if ('message' in error && typeof error.message === 'string') {
            return error.message;
        }

        const apiError = error as Partial<ApiErrorResponse>;
        if (apiError.message) {
            return String(apiError.message);
        }
    }

    if (error instanceof Error) {
        return error.message;
    }

    return 'An unknown error occurred';
}

export class ApiError extends Error {
    status: number;
    code?: string;

    constructor(message: string, status: number, code?: string) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
        this.code = code;

        Object.setPrototypeOf(this, ApiError.prototype);
    }
}
