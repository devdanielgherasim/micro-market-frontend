import 'keycloak-js';

declare module 'keycloak-js' {
  interface KeycloakProfile {
    realm_access?: {
      roles: string[];
    };
    resource_access?: {
      [clientId: string]: {
        roles: string[];
      };
    };
  }
}