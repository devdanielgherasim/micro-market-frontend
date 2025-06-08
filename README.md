# Micro Market Frontend

Modern Next.js frontend for the Micro Market platform with Keycloak authentication.

## Features

- Next.js 15 with App Router
- TypeScript for type safety
- Keycloak authentication integration
- TailwindCSS for styling
- Responsive dashboard layout
- Dark/light mode support
- Enhanced ESLint configuration for best practices
- Proper favicon and web app manifest
- Accessibility improvements

## Getting Started

### Prerequisites

- Node.js 18.x or higher
- npm or yarn
- Keycloak server running (for authentication)

### Environment Setup

Create a `.env.local` file in the root directory with the following variables:

```
# Keycloak Configuration
NEXT_PUBLIC_KEYCLOAK_URL=http://localhost:8080
NEXT_PUBLIC_KEYCLOAK_REALM=micro-market
NEXT_PUBLIC_KEYCLOAK_CLIENT_ID=micro-market-frontend

# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:8081/api
```

### Installation

```bash
# Install dependencies
npm install

# Run the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Keycloak Setup

1. Download and install Keycloak from [keycloak.org](https://www.keycloak.org/downloads)
2. Start Keycloak: `bin/kc.sh start-dev` (or `bin\kc.bat start-dev` on Windows)
3. Access the admin console at http://localhost:8080
4. Create a new realm named `micro-market`
5. Create a new client:
   - Client ID: `micro-market-frontend`
   - Client Protocol: `openid-connect`
   - Access Type: `public`
   - Valid Redirect URIs: `http://localhost:3000/*`
   - Web Origins: `+` (or specify `http://localhost:3000`)
6. Create some test users in the realm

## Authentication Flow

The application uses Keycloak for authentication:

1. Users are redirected to Keycloak login when accessing protected routes
2. After successful authentication, they are redirected back to the application
3. API requests automatically include the authentication token
4. Tokens are refreshed automatically when they expire

## Protected Routes

To protect a route or component, use the `ProtectedRoute` component:

```tsx
import { ProtectedRoute } from '../components/auth/ProtectedRoute';

const ProtectedPage = () => {
  return (
    <ProtectedRoute>
      <div>This content is only visible to authenticated users</div>
    </ProtectedRoute>
  );
};

export default ProtectedPage;
```

## API Authentication

The application includes a pre-configured API client that automatically handles authentication:

```tsx
import { apiService } from '../services/api';

// This request will automatically include the authentication token
const fetchData = async () => {
  try {
    const response = await apiService.get('/some-endpoint');
    console.log(response.data);
  } catch (error) {
    console.error('Error fetching data:', error);
  }
};
```

## Project Structure

The project follows a professional React architecture with the following structure:

```
src/
  ├── app/              # Next.js App Router pages
  ├── auth/             # Authentication related files
  ├── components/       # UI components
  │   ├── ui/           # Reusable UI components
  │   └── features/     # Feature-specific components
  │       ├── products/ # Product-related components
  │       ├── orders/   # Order-related components
  │       └── home/     # Home page components
  ├── hooks/            # Custom React hooks
  ├── services/         # API services
  ├── types/            # TypeScript type definitions
  ├── utils/            # Utility functions
  ├── styles/           # Global styles
  └── config/           # Configuration files
```

## Best Practices Implemented

### Enhanced ESLint Configuration

The project uses an enhanced ESLint configuration with rules for:
- Accessibility (jsx-a11y)
- React Hooks usage
- Import organization
- Code quality and consistency

### TypeScript Strict Mode

TypeScript is configured to enforce strict type checking, even in production builds, to ensure type safety throughout the application lifecycle.

### Favicon and Web App Manifest

The project includes a complete set of favicon files and a web app manifest for better browser and mobile experience:
- favicon.ico for browser tabs
- Various sized PNG icons for different devices
- Apple Touch Icon for iOS devices
- Web App Manifest for PWA support

See `public/README_FAVICON.md` for instructions on creating and adding the favicon files.

### Accessibility Improvements

The application follows accessibility best practices:
- Proper semantic HTML
- ARIA attributes where needed
- Color contrast compliance
- Keyboard navigation support

## Technologies Used

- Next.js 15
- React 19
- TypeScript
- Tailwind CSS
- Keycloak Authentication

## Troubleshooting

### Missing @tailwindcss/forms Module

If you encounter the following error:

```
Error: Cannot find module '@tailwindcss/forms'
Require stack:
- tailwind.config.ts
```

This means the Tailwind CSS forms plugin is not properly installed. To fix this:

1. Run the provided batch file:
   ```
   .\install-dependencies.bat
   ```

   Or manually reinstall all dependencies:
   ```
   npm install
   ```

2. This will reinstall all dependencies, including `@tailwindcss/forms`, ensuring that the Tailwind CSS configuration can find and use the plugin.
