"use client"

import React, {useState, useEffect} from 'react';
import {DashboardLayout} from '../../layout/DashboardLayout';
import {Dashboard} from '../dashboard/Dashboard';
import {ProductList} from '../products/ProductList';
import {OrderList} from '../orders/OrderList';
import {useAuth} from '@/auth/KeycloakProvider';
import {AuthenticatedOnly} from '@/components/auth/RoleBasedAccess';

/**
 * Main home page component
 */
export const HomePage: React.FC = () => {
    const [activeSection, setActiveSection] = useState('products');
    const { isAuthenticated, login } = useAuth();

    // Redirect from dashboard to products if not authenticated
    useEffect(() => {
        if (activeSection === 'dashboard' && !isAuthenticated) {
            setActiveSection('products');
        }
    }, [activeSection, isAuthenticated]);

    // Render the appropriate section based on the active section
    const renderSection = () => {
        switch (activeSection) {
            case 'dashboard':
                return (
                    <AuthenticatedOnly fallback={
                        <div className="text-center py-10">
                            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">Authentication Required</h2>
                            <p className="text-gray-600 dark:text-gray-300 mb-4">Please login to access the dashboard.</p>
                        </div>
                    }>
                        <Dashboard/>
                    </AuthenticatedOnly>
                );
            case 'products':
                return (
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Products</h1>
                        <div
                            className="bg-white dark:bg-gray-800 overflow-hidden shadow dark:shadow-gray-700 rounded-lg p-6">
                            <ProductList/>
                        </div>
                    </div>
                );
            case 'orders':
                return (
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Orders</h1>
                        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow dark:shadow-gray-700 rounded-lg p-6">
                            <AuthenticatedOnly fallback={
                                <div className="text-center py-10">
                                    <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">Authentication Required</h2>
                                    <p className="text-gray-600 dark:text-gray-300 mb-4">Please login to view your orders and expiration dates.</p>
                                    <button 
                                        onClick={login}
                                        className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
                                    >
                                        Login to View Orders
                                    </button>
                                </div>
                            }>
                                <OrderList/>
                            </AuthenticatedOnly>
                        </div>
                    </div>
                );
            case 'customers':
                return (
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Customers</h1>
                        <p className="text-gray-600 dark:text-gray-300">Customer management coming soon.</p>
                    </div>
                );
            case 'analytics':
                return (
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Analytics</h1>
                        <p className="text-gray-600 dark:text-gray-300">Analytics dashboard coming soon.</p>
                    </div>
                );
            case 'settings':
                return (
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Settings</h1>
                        <p className="text-gray-600 dark:text-gray-300">Settings panel coming soon.</p>
                    </div>
                );
            default:
                return <Dashboard/>;
        }
    };

    return (
        <DashboardLayout
            activeSection={activeSection}
            onNavigate={setActiveSection}
        >
            {renderSection()}
        </DashboardLayout>
    );
};
