"use client";

import React from 'react';
import {ClientDashboard} from '@/components/ClientDashboard';
import {useAuth} from '@/auth/KeycloakProvider';
import {isUser} from '@/auth/roleUtils';

export default function DashboardPage() {
    const {userProfile, isAuthenticated, loading} = useAuth();

    // Show loading state
    if (loading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="flex justify-center items-center py-12">
                    <div
                        className="animate-spin rounded-full h-12 w-12 border-2 border-primary-500 dark:border-primary-400 border-t-transparent shadow-md"></div>
                </div>
            </div>
        );
    }

    // Check if user is authenticated and has user role
    if (!isAuthenticated || !isUser(userProfile)) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div
                    className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 text-yellow-700 dark:text-yellow-400 px-4 py-3 rounded-lg">
                    <h2 className="text-lg font-medium mb-2">Access Restricted</h2>
                    <p>You need to be logged in as a client to access this page.</p>
                    {!isAuthenticated && (
                        <button
                            onClick={() => window.location.href = '/'}
                            className="mt-4 px-4 py-2 bg-primary-100 hover:bg-primary-200 text-primary-700 dark:bg-primary-900/30 dark:hover:bg-primary-800/40 dark:text-primary-300 rounded-md transition-colors"
                        >
                            Go to Home Page
                        </button>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold text-secondary-900 dark:text-white mb-6">Client Dashboard</h1>
            <ClientDashboard/>
        </div>
    );
}
