export const API_ENDPOINTS = {
    login: '/auth/login',
    logout: '/auth/logout',
    refreshToken: '/auth/refresh',
    products: '/api/products',
    orders: '/api/orders',
    userProfile: '/users/profile',
    auditLogs: '/api/audit',
} as const;

// Maps path prefixes to local service ports — only active when NEXT_PUBLIC_API_URL is absent
const DEV_BASE_URLS: readonly [prefix: string, base: string][] = [
    ['/api/products', 'http://localhost:8088'],
    ['/api/orders',   'http://localhost:8090'],
    ['/api/audit',    'http://localhost:8089'],
];

export function resolveUrl(path: string): string {
    const configuredBase = process.env.NEXT_PUBLIC_API_URL;
    if (configuredBase) return `${configuredBase}${path}`;
    for (const [prefix, devBase] of DEV_BASE_URLS) {
        if (path === prefix || path.startsWith(`${prefix}/`) || path.startsWith(`${prefix}?`)) {
            return `${devBase}${path}`;
        }
    }
    return `http://localhost:8080${path}`;
}

export const API_TIMEOUT = 10000;
