import {API_TIMEOUT} from '@/config/api';
import {getKeycloak} from '@/auth/keycloak';
import {ApiErrorResponse} from '@/types';

/**
 * Fetch with timeout and authentication
 * @param url - The URL to fetch
 * @param options - Fetch options
 * @param timeout - Timeout in milliseconds
 * @returns Promise with the parsed JSON response
 */
export async function fetchWithTimeout<T>(
    url: string,
    options: RequestInit = {},
    timeout: number = API_TIMEOUT
): Promise<T> {
    const keycloak = getKeycloak();
    const headers = new Headers(options.headers);

    // CORS headers should be set by the server, not the client
    // Removing client-side CORS headers as they cause preflight issues

    if (keycloak && keycloak.authenticated) {
        try {
            await keycloak.updateToken(30);
            headers.set('Authorization', `Bearer ${keycloak.token}`);
        } catch (error) {
            console.error('Failed to refresh token', error);
            // Redirect to login if token refresh fails
            keycloak.login();
            throw new Error('Authentication required');
        }
    }

    if (!headers.has('Content-Type') && options.method !== 'GET' && options.body) {
        headers.set('Content-Type', 'application/json');
    }

    const fetchPromise = fetch(url, {
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
            // Try to parse error response as JSON, but handle cases where it's not valid JSON
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

        // Handle no-content responses
        if (response.status === 204) {
            return {} as T;
        }

        // For non-JSON responses, handle gracefully
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
            return await response.json() as T;
        } else {
            // For non-JSON responses, return an empty object or appropriate value
            if (process.env.NODE_ENV === 'development') {
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

/**
 * Handle API errors with consistent formatting
 * @param error - The error object
 * @returns Formatted error message
 */
export function handleApiError(error: unknown): string {
    if (error instanceof ApiError) {
        return error.message;
    }

    // Handle API error response object
    if (typeof error === 'object' && error !== null) {
        if ('message' in error && typeof error.message === 'string') {
            return error.message;
        }

        // Try to parse as ApiErrorResponse
        const apiError = error as Partial<ApiErrorResponse>;
        if (apiError.message) {
            return String(apiError.message);
        }
    }

    // Handle standard Error objects
    if (error instanceof Error) {
        return error.message;
    }

    return 'An unknown error occurred';
}

/**
 * Custom error class for API requests
 * This class is used to throw standardized API errors throughout the application
 */
export class ApiError extends Error {
    status: number;
    code?: string;

    /**
     * Creates a new ApiError instance
     * @param message - Error message
     * @param status - HTTP status code
     * @param code - Optional error code for more specific error handling
     */
    constructor(message: string, status: number, code?: string) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
        this.code = code;

        Object.setPrototypeOf(this, ApiError.prototype);
    }
}
