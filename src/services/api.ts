import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { getKeycloak } from '../auth/keycloak';

// Base API URL from environment variables
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8081/api';

// Create a base axios instance
const createAPI = (): AxiosInstance => {
  const api = axios.create({
    baseURL: API_URL,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Request interceptor to add the auth token
  api.interceptors.request.use(
    async (config) => {
      if (!config.headers) {
        config.headers = {};
      }

      // Get the keycloak instance
      const keycloak = getKeycloak();

      if (keycloak && keycloak.authenticated) {
        // Check if token needs refresh (if less than 30 seconds remaining)
        const updateTokenPromise = keycloak.updateToken(30);

        try {
          const refreshed = await updateTokenPromise;
          if (refreshed) {
            console.log('Token was refreshed');
          }

          // Add the Authorization header with the current token
          config.headers['Authorization'] = `Bearer ${keycloak.token}`;
        } catch (error) {
          console.error('Failed to refresh token', error);
          // Token refresh failed, redirect to login
          keycloak.login();
        }
      }

      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Response interceptor to handle common errors
  api.interceptors.response.use(
    (response) => response,
    (error) => {
      const keycloak = getKeycloak();

      // If we get a 401 Unauthorized response, refresh the token or redirect to login
      if (error.response && error.response.status === 401 && keycloak) {
        keycloak.login();
      }

      return Promise.reject(error);
    }
  );

  return api;
};

// Create and export the API instance
export const api = createAPI();

// Generic API methods
export const apiService = {
  get: <T>(url: string, config?: AxiosRequestConfig) => {
    return api.get<T>(url, config);
  },
  post: <T>(url: string, data?: any, config?: AxiosRequestConfig) => {
    return api.post<T>(url, data, config);
  },
  put: <T>(url: string, data?: any, config?: AxiosRequestConfig) => {
    return api.put<T>(url, data, config);
  },
  patch: <T>(url: string, data?: any, config?: AxiosRequestConfig) => {
    return api.patch<T>(url, data, config);
  },
  delete: <T>(url: string, config?: AxiosRequestConfig) => {
    return api.delete<T>(url, config);
  }
};
