"use client"

import React, {useEffect, useState} from 'react';

import {useAuth} from '@/auth/KeycloakProvider';
import {AuditLogsList} from '@/components/AuditLogsList';
import {AdminOnly, AuthenticatedOnly} from '@/components/auth/RoleBasedAccess';

import {DashboardLayout} from '../../layout/DashboardLayout';
import {AdminOrderList} from '../admin/AdminOrderList';
import {AdminProductList} from '../admin/AdminProductList';
import {OrderList} from '../orders/OrderList';
import {ProductList} from '../products/ProductList';


interface HomePageProps {
    initialSection?: string;
}

/**
 * Main home page component
 */
export const HomePage: React.FC<HomePageProps> = ({initialSection = 'products'}) => {
    const [activeSection, setActiveSection] = useState(initialSection);
    const {isAuthenticated, login} = useAuth();

    useEffect(() => {
        if (activeSection === 'dashboard' && !isAuthenticated) {
            setActiveSection('products');
        }
    }, [activeSection, isAuthenticated]);

    const renderSection = () => {
        switch (activeSection) {
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
                        <div
                            className="bg-white dark:bg-gray-800 overflow-hidden shadow dark:shadow-gray-700 rounded-lg p-6">
                            <AuthenticatedOnly fallback={
                                <div className="text-center py-10">
                                    <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">Authentication
                                        Required</h2>
                                    <p className="text-gray-600 dark:text-gray-300 mb-4">Please login to view your
                                        orders and expiration dates.</p>
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
            case 'audit':
                return (
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Audit Logs</h1>
                        <div
                            className="bg-white dark:bg-gray-800 overflow-hidden shadow dark:shadow-gray-700 rounded-lg p-6">
                            <AdminOnly fallback={
                                <div className="text-center py-10">
                                    <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">Access
                                        Denied</h2>
                                    <p className="text-gray-600 dark:text-gray-300 mb-4">You need administrator
                                        privileges to access the audit logs.</p>
                                </div>
                            }>
                                <AuditLogsList/>
                            </AdminOnly>
                        </div>
                    </div>
                );
            case 'admin-products':
                return (
                    <div>
                        <div
                            className="bg-white dark:bg-gray-800 overflow-hidden shadow dark:shadow-gray-700 rounded-lg p-6">
                            <AdminOnly fallback={
                                <div className="text-center py-10">
                                    <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">Access
                                        Denied</h2>
                                    <p className="text-gray-600 dark:text-gray-300 mb-4">You need administrator
                                        privileges to access product management.</p>
                                </div>
                            }>
                                <AdminProductList/>
                            </AdminOnly>
                        </div>
                    </div>
                );
            case 'admin-orders':
                return (
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Order Management</h1>
                        <div
                            className="bg-white dark:bg-gray-800 overflow-hidden shadow dark:shadow-gray-700 rounded-lg p-6">
                            <AdminOnly fallback={
                                <div className="text-center py-10">
                                    <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">Access
                                        Denied</h2>
                                    <p className="text-gray-600 dark:text-gray-300 mb-4">You need administrator
                                        privileges to access order management.</p>
                                </div>
                            }>
                                <AdminOrderList/>
                            </AdminOnly>
                        </div>
                    </div>
                );
            default:
                return <ProductList/>;
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
