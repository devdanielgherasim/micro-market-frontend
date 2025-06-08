import React from 'react';
import { useAuth } from '@/auth/KeycloakProvider';

interface LoginButtonProps {
  className?: string;
}

export const LoginButton: React.FC<LoginButtonProps> = ({ className = '' }) => {
  const { isAuthenticated, login, logout } = useAuth();

  return (
    <button
      onClick={isAuthenticated ? logout : login}
      className={`inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-offset-2 ${isAuthenticated ? 'text-white bg-red-600 hover:bg-red-700 focus:ring-red-500' : 'text-white bg-primary-600 hover:bg-primary-700 focus:ring-primary-500'} ${className}`}
      aria-label={isAuthenticated ? 'Sign out' : 'Sign in'}
    >
      {isAuthenticated ? (
        <>
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Sign Out
        </>
      ) : (
        <>
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
          </svg>
          Sign In
        </>
      )}
    </button>
  );
};
