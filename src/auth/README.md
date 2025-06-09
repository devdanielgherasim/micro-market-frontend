# Role-Based Access Control with Keycloak

This document provides instructions for setting up and configuring the role-based access control system using Keycloak.

## Roles

The application supports three roles:

1. **Guest** - Can view products
   - This is the default role for unauthenticated users
   - No configuration needed in Keycloak

2. **Client** - Can view products, buy items, and see their purchase history
   - Users need to be assigned this role in Keycloak
   - Role name: `client`

3. **Administrator** - Can add/update products and view audit logs
   - Users need to be assigned this role in Keycloak
   - Role name: `administrator`

## Setting Up Roles in Keycloak

1. Log in to the Keycloak Admin Console
2. Select the realm you're using for the application (default: `micro-market`)
3. Go to "Roles" in the left sidebar
4. Click "Add Role"
5. Create the following roles:
   - `client`
   - `administrator`

## Assigning Roles to Users

1. Go to "Users" in the left sidebar
2. Select a user or create a new one
3. Go to the "Role Mappings" tab
4. Assign the appropriate role(s) to the user:
   - For clients: assign the `client` role
   - For administrators: assign the `administrator` role

## Role Mapping in the Application

The application maps Keycloak roles to internal roles as follows:

- Unauthenticated users are automatically assigned the `guest` role
- Users with the `client` role in Keycloak are assigned the `client` role in the application
- Users with the `administrator` role in Keycloak are assigned the `administrator` role in the application

## Manual Login

The application is configured to require manual login. Users will need to click the "Login" button to authenticate with Keycloak.

## Testing Roles

To test the role-based access control system:

1. Log out of the application (or use an incognito window)
2. As a guest (not logged in), you should only be able to view products
3. Log in as a user with the `client` role
   - You should be able to view products and see your orders
4. Log in as a user with the `administrator` role
   - You should be able to view products, manage products, and view audit logs