import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/auth/KeycloakProvider';
import { UserRole, getHighestRole } from '@/auth/roleUtils';

export const UserProfileSection: React.FC = () => {
  const { isAuthenticated, userProfile, login, logout, loading } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Handle login action
  const handleLogin = () => {
    login();
  };

  // Handle logout action
  const handleLogout = () => {
    setIsOpen(false);
    setTimeout(() => {
      logout();
    }, 100);
  };

  // Get first letter of name for avatar
  const getInitial = (): string => {
    if (userProfile?.firstName) return userProfile.firstName.charAt(0);
    if (userProfile?.username) return userProfile.username.charAt(0);
    return 'G';
  };

  // Get display name
  const getDisplayName = (): string => {
    if (userProfile?.firstName && userProfile?.lastName) {
      return `${userProfile.firstName} ${userProfile.lastName}`;
    }
    if (userProfile?.name) return userProfile.name;
    return userProfile?.username || 'Guest';
  };

  // Get role or default
  const getRole = (): string => {
    const highestRole = getHighestRole(userProfile, isAuthenticated);
    return highestRole.charAt(0).toUpperCase() + highestRole.slice(1);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-2">
        <div className="h-8 w-8 rounded-full animate-pulse bg-gray-300 dark:bg-gray-600"></div>
        <div className="ml-3 flex-1">
          <div className="h-2.5 bg-gray-300 dark:bg-gray-600 rounded-full w-24 mb-2 animate-pulse"></div>
          <div className="h-2 bg-gray-300 dark:bg-gray-600 rounded-full w-12 animate-pulse"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <div className="flex items-center">
        {isAuthenticated ? (
          // Authenticated user view
          <>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="flex items-center w-full hover:bg-gray-100 dark:hover:bg-gray-700/60 rounded-lg p-1 transition-colors duration-150"
            >
              <div className="flex-shrink-0">
                <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-full bg-gradient-to-r from-primary-500 to-primary-600 flex items-center justify-center text-white font-medium shadow-md">
                  {getInitial()}
                </div>
              </div>
              <div className="ml-2 sm:ml-3 flex-1 min-w-0 text-left">
                <p className="text-xs sm:text-sm font-medium text-gray-800 dark:text-gray-200 truncate">
                  {getDisplayName()}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{getRole()}</p>
              </div>
              <svg 
                className={`w-4 h-4 text-gray-500 dark:text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
              </svg>
            </button>

            {isOpen && (
              <div className="absolute bottom-full left-0 right-0 mb-1 bg-white dark:bg-secondary-800 rounded-lg shadow-lg overflow-hidden z-10 border border-gray-200 dark:border-gray-700 animate-fade-in-up">
                <div className="p-2 border-b border-gray-200 dark:border-gray-700">
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {userProfile?.email && (
                      <p className="truncate">{userProfile.email}</p>
                    )}
                  </div>
                </div>
                <div className="p-1">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors duration-150"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
                    </svg>
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          // Not authenticated - login button
          <button
            onClick={handleLogin}
            className="flex w-full items-center hover:bg-gray-100 dark:hover:bg-gray-700/60 rounded-lg p-1 transition-colors duration-150"
          >
            <div className="flex-shrink-0">
              <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-full bg-gradient-to-r from-gray-500 to-gray-600 flex items-center justify-center text-white font-medium shadow-md">
                G
              </div>
            </div>
            <div className="ml-2 sm:ml-3 flex-1 min-w-0 text-left">
              <p className="text-xs sm:text-sm font-medium text-gray-800 dark:text-gray-200">
                Sign In
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Authentication required</p>
            </div>
            <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"></path>
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};
