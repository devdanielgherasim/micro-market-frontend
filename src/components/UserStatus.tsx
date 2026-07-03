import React from 'react';

import {useAuth} from '@/auth/KeycloakProvider';

export const UserStatus: React.FC = () => {
    const {isAuthenticated, userProfile, loading} = useAuth();

    if (loading) {
        return (
            <div className="flex items-center">
                <div className="h-2.5 bg-gray-300 dark:bg-gray-600 rounded-full w-24 animate-pulse"></div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return (
            <div className="text-sm text-gray-500 dark:text-gray-400">
                Not signed in
            </div>
        );
    }

    return (
        <div className="flex items-center space-x-1">
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
            <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {userProfile?.firstName || userProfile?.username || 'Authenticated'}
            </div>
        </div>
    );
};
