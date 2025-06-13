// @ts-ignore
import Keycloak from 'keycloak-js';

export const keycloakConfig = {
    url: process.env.NEXT_PUBLIC_KEYCLOAK_URL ?? 'http://localhost:8080',
    realm: process.env.NEXT_PUBLIC_KEYCLOAK_REALM ?? 'microservices',
    clientId: process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID ?? 'micro-market-frontend',
};

// Log Keycloak configuration in development mode
if (process.env.NEXT_PUBLIC_API_URL) {
    console.log('[Keycloak] Configuration:', {
        url: keycloakConfig.url,
        realm: keycloakConfig.realm,
        clientId: keycloakConfig.clientId
    });
}

let keycloak: Keycloak | null = null;

export const initKeycloak = () => {
    if (typeof window !== 'undefined' && !keycloak) {
        if (process.env.NEXT_PUBLIC_API_URL) {
            console.log('[Keycloak] Initializing new Keycloak instance');
        }
        keycloak = new Keycloak(keycloakConfig);
    } else if (process.env.NEXT_PUBLIC_API_URL) {
        console.log('[Keycloak] Using existing Keycloak instance or not in browser environment');
    }
    return keycloak;
};

// Get the current Keycloak instance
export const getKeycloak = () => {
    if (!keycloak) {
        if (process.env.NEXT_PUBLIC_API_URL) {
            console.log('[Keycloak] No existing instance, initializing Keycloak');
        }
        return initKeycloak();
    }
    if (process.env.NEXT_PUBLIC_API_URL) {
        console.log('[Keycloak] Returning existing Keycloak instance');
    }
    return keycloak;
};
