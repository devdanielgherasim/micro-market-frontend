// @ts-ignore
import Keycloak from 'keycloak-js';

export const keycloakConfig = {
    url: process.env.NEXT_PUBLIC_KEYCLOAK_URL ?? 'http://localhost:8080',
    realm: process.env.NEXT_PUBLIC_KEYCLOAK_REALM ?? 'microservices',
    clientId: process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID ?? 'micro-market-frontend',
};

let keycloak: Keycloak | null = null;

export const initKeycloak = () => {
    if (typeof window !== 'undefined' && !keycloak) {
        keycloak = new Keycloak(keycloakConfig);
    }
    return keycloak;
};

// Get the current Keycloak instance
export const getKeycloak = () => {
    if (!keycloak) {
        return initKeycloak();
    }
    return keycloak;
};
