/**
 * API Configuration
 * 
 * This file contains the configuration for API endpoints.
 * For Kubernetes/Ingress compatibility, we use path-based routing instead of port-based routing.
 */

// API base URL from environment variable
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';

// Service paths - these should match the Ingress path configurations
const SERVICES = {
  AUTH: '/auth',
  PRODUCTS: '/api/products',
  ORDERS: '/api/orders',
  USERS: '/users',
  AUDIT: '/api/audit',
};

// API endpoints
export const API_ENDPOINTS = {
  // Authentication
  login: `${API_BASE_URL}${SERVICES.AUTH}/login`,
  logout: `${API_BASE_URL}${SERVICES.AUTH}/logout`,
  refreshToken: `${API_BASE_URL}${SERVICES.AUTH}/refresh`,

  // Products
  products: `${API_BASE_URL}${SERVICES.PRODUCTS}`,

  // Orders
  orders: `${API_BASE_URL}${SERVICES.ORDERS}`,

  // User
  userProfile: `${API_BASE_URL}${SERVICES.USERS}/profile`,

  // Audit
  auditLogs: `${API_BASE_URL}${SERVICES.AUDIT}`,
};

// Development fallbacks - only used when API_BASE_URL is empty (local development)
if (!API_BASE_URL) {
  console.warn('API_BASE_URL is not set. Using development fallbacks.');
  API_ENDPOINTS.products = 'http://localhost:8088/api/products';
  API_ENDPOINTS.auditLogs = 'http://localhost:8089/api/audit';
}

// API timeout in milliseconds
export const API_TIMEOUT = 10000;

// Export services for use in other files if needed
export { SERVICES };
