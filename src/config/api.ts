/**
 * API Configuration
 *
 * This file contains the configuration for API endpoints.
 * For Kubernetes/Ingress compatibility, we use path-based routing instead of port-based routing.
 */

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? '';

const SERVICES = {
    AUTH: '/auth',
    PRODUCTS: '/api/products',
    ORDERS: '/api/orders',
    USERS: '/users',
    AUDIT: '/api/audit',
};

export const API_ENDPOINTS = {
    login: `${API_BASE_URL}${SERVICES.AUTH}/login`,
    logout: `${API_BASE_URL}${SERVICES.AUTH}/logout`,
    refreshToken: `${API_BASE_URL}${SERVICES.AUTH}/refresh`,

    products: `${API_BASE_URL}${SERVICES.PRODUCTS}`,
    orders: `${API_BASE_URL}${SERVICES.ORDERS}`,
    userProfile: `${API_BASE_URL}${SERVICES.USERS}/profile`,
    auditLogs: `${API_BASE_URL}${SERVICES.AUDIT}`,
};

if (!API_BASE_URL) {
    console.warn('API_BASE_URL is not set. Using development fallbacks.');
    API_ENDPOINTS.products = 'http://localhost:8088/api/products';
    API_ENDPOINTS.auditLogs = 'http://localhost:8089/api/audit';
}

export const API_TIMEOUT = 10000;

export {SERVICES};
