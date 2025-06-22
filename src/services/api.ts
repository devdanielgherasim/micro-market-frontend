import axios, {AxiosInstance, AxiosRequestConfig} from 'axios';

import {getKeycloak} from '@/auth/keycloak';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8081/api';

const createAPI = (): AxiosInstance => {
    const api = axios.create({
        baseURL: API_URL,
        headers: {
            'Content-Type': 'application/json',
        },
    });

    api.interceptors.request.use(
        async (config) => {

            const keycloak = getKeycloak();

            if (keycloak && keycloak.authenticated) {
                const updateTokenPromise = keycloak.updateToken(30);

                try {
                    const refreshed = await updateTokenPromise;
                    if (refreshed) {
                        console.log('Token was refreshed');
                    }

                    config.headers['Authorization'] = `Bearer ${keycloak.token}`;
                } catch (error) {
                    console.error('Failed to refresh token', error);
                    keycloak.login();
                }
            }

            return config;
        },
        (error) => {
            return Promise.reject(error);
        }
    );

    api.interceptors.response.use(
        (response) => response,
        (error) => {
            const keycloak = getKeycloak();

            if (error.response && error.response.status === 401 && keycloak) {
                keycloak.login();
            }

            return Promise.reject(error);
        }
    );

    return api;
};

export const api = createAPI();

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
