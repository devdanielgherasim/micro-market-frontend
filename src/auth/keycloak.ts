// @ts-ignore
import Keycloak from 'keycloak-js';
import {createLogger} from '@/utils/logger';

const logger = createLogger('Keycloak');

export const keycloakConfig = {
    url: process.env.NEXT_PUBLIC_KEYCLOAK_URL ?? 'http://localhost:8080',
    realm: process.env.NEXT_PUBLIC_KEYCLOAK_REALM ?? 'microservices',
    clientId: process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID ?? 'micro-market-frontend',
};

logger.debug('Configuration:', {
    url: keycloakConfig.url,
    realm: keycloakConfig.realm,
    clientId: keycloakConfig.clientId
});

let keycloak: Keycloak | null = null;

export const initKeycloak = () => {
    if (typeof window !== 'undefined' && !keycloak) {
        logger.debug('Initializing new Keycloak instance');
        keycloak = new Keycloak(keycloakConfig);
    } else {
        logger.debug('Using existing Keycloak instance or not in browser environment');
    }
    return keycloak;
};

export const getKeycloak = () => {
    if (!keycloak) {
        logger.debug('No existing instance, initializing Keycloak');
        return initKeycloak();
    }
    logger.debug('Returning existing Keycloak instance');
    return keycloak;
};
