import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../auth/KeycloakProvider';

interface UserProfileButtonProps {
  className?: string;
}

export const UserProfileButton: React.FC<UserProfileButtonProps> = ({ className }) => {
  const { isAuthenticated, userProfile, logout } = useAuth();
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

  if (!isAuthenticated || !userProfile) {
    return null;
  }

  // Get first letter of name for avatar
  const getInitial = (): string => {
    if (userProfile?.firstName) return userProfile.firstName.charAt(0);
    if (userProfile?.username) return userProfile.username.charAt(0);
    return 'U';
  };

  // Get display name
  const getDisplayName = (): string => {
    if (userProfile?.firstName && userProfile?.lastName) {
      return `${userProfile.firstName} ${userProfile.lastName}`;
    }
    if (userProfile?.name) return userProfile.name;
    return userProfile?.username || 'User';
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center rounded-full bg-gradient-to-r from-primary-500 to-primary-600 p-0.5 sm:p-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-2 transition-all duration-300 hover:scale-105 shadow-glow"
        aria-label="User profile"
      >
        <div className="h-7 w-7 sm:h-8 sm:w-8 md:h-9 md:w-9 rounded-full flex items-center justify-center text-white font-medium bg-gradient-to-br from-primary-400/50 to-primary-600/50 shadow-inner overflow-hidden">
          <span className="text-lg sm:text-xl font-bold">{getInitial()}</span>
        </div>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-secondary-800 rounded-lg shadow-lg py-1 z-50 ring-1 ring-black ring-opacity-5 animate-fade-in">
          <div className="px-4 py-2 border-b border-secondary-200 dark:border-secondary-700">
            <p className="text-sm font-medium text-secondary-900 dark:text-white truncate">{getDisplayName()}</p>
            <p className="text-xs text-secondary-500 dark:text-secondary-400 truncate">{userProfile?.email || ''}</p>
          </div>
          <div className="py-1">
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsOpen(false);
                // Small delay to ensure UI closes before redirect
                setTimeout(() => {
                  logout();
                }, 100);
              }}
              className="w-full px-4 py-2 text-sm text-left text-red-600 hover:bg-secondary-100 dark:hover:bg-secondary-700"
            >
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
