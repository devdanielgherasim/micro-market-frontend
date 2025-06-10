import 'keycloak-js';

declare module 'keycloak-js' {
  interface KeycloakProfile {
    realm_access?: {
      roles: string[];
    };
  }
}