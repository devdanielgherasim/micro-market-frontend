import React from 'react';
import {useAuth} from '@/auth/KeycloakProvider';
import {useOrders} from '@/hooks/useOrders';
import {Order} from '@/types';

export const ClientDashboard: React.FC = () => {
    const {userProfile, isAuthenticated} = useAuth();
    const {data: orders, loading, error, refetch} = useOrders(userProfile?.id);

    const formatDate = (dateString: string | undefined) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    const getDaysUntilExpiration = (expirationDate: string | undefined) => {
        if (!expirationDate) return 'N/A';

        const expDate = new Date(expirationDate);
        const today = new Date();

        expDate.setHours(0, 0, 0, 0);
        today.setHours(0, 0, 0, 0);

        const diffTime = expDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays < 0) return 'Expired';
        if (diffDays === 0) return 'Expires today';
        if (diffDays === 1) return 'Expires tomorrow';
        return `${diffDays} days left`;
    };

    const getExpirationStatusClass = (expirationDate: string | undefined) => {
        if (!expirationDate) return 'text-secondary-500';

        const expDate = new Date(expirationDate);
        const today = new Date();

        expDate.setHours(0, 0, 0, 0);
        today.setHours(0, 0, 0, 0);

        const diffTime = expDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays < 0) return 'text-red-600 dark:text-red-400';
        if (diffDays <= 7) return 'text-yellow-600 dark:text-yellow-400';
        return 'text-green-600 dark:text-green-400';
    };

    const getProductSummary = (orders: Order[]) => {
        const productMap = new Map<string, {
            productId: string;
            totalQuantity: number;
            totalSpent: number;
            latestExpiration: string | undefined;
        }>();

        orders.forEach(order => {
            order.products.forEach(product => {
                const existing = productMap.get(product.productId);

                if (existing) {
                    existing.totalQuantity += product.quantity;
                    existing.totalSpent += (order.totalAmount / order.products.length) * product.quantity;

                    // Update expiration date if this one is later
                    if (order.expirationDate && (!existing.latestExpiration || new Date(order.expirationDate) > new Date(existing.latestExpiration))) {
                        existing.latestExpiration = order.expirationDate;
                    }
                } else {
                    productMap.set(product.productId, {
                        productId: product.productId,
                        totalQuantity: product.quantity,
                        totalSpent: (order.totalAmount / order.products.length) * product.quantity,
                        latestExpiration: order.expirationDate
                    });
                }
            });
        });

        return Array.from(productMap.values());
    };

    if (!isAuthenticated) {
        return (
            <div
                className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 text-yellow-700 dark:text-yellow-400 px-4 py-3 rounded-lg text-sm">
                Please log in to view your dashboard.
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-secondary-900 dark:text-white">My Products</h2>
                <button
                    onClick={() => refetch()}
                    className="px-3 py-1.5 text-sm bg-primary-100 hover:bg-primary-200 text-primary-700 dark:bg-primary-900/30 dark:hover:bg-primary-800/40 dark:text-primary-300 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-secondary-900"
                >
                    Refresh
                </button>
            </div>

            {error && (
                <div
                    className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg text-sm">
                    <strong className="font-semibold">Error: </strong>
                    <span>{error}</span>
                </div>
            )}

            {loading ? (
                <div className="flex justify-center items-center py-8">
                    <div
                        className="animate-spin rounded-full h-10 w-10 border-2 border-primary-500 dark:border-primary-400 border-t-transparent shadow-md"></div>
                </div>
            ) : orders.length > 0 ? (
                <div
                    className="bg-white dark:bg-secondary-800 rounded-lg shadow-sm overflow-hidden border border-secondary-200 dark:border-secondary-700">
                    <div className="px-4 py-5 sm:px-6 border-b border-secondary-200 dark:border-secondary-700">
                        <h3 className="text-lg font-medium text-secondary-900 dark:text-white">Your Purchased
                            Products</h3>
                        <p className="mt-1 max-w-2xl text-sm text-secondary-500 dark:text-secondary-400">
                            Summary of all your active products
                        </p>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-secondary-200 dark:divide-secondary-700">
                            <thead className="bg-secondary-50 dark:bg-secondary-800">
                            <tr>
                                <th scope="col"
                                    className="px-6 py-3 text-left text-xs font-medium text-secondary-500 dark:text-secondary-400 uppercase tracking-wider">
                                    Product ID
                                </th>
                                <th scope="col"
                                    className="px-6 py-3 text-left text-xs font-medium text-secondary-500 dark:text-secondary-400 uppercase tracking-wider">
                                    Quantity
                                </th>
                                <th scope="col"
                                    className="px-6 py-3 text-left text-xs font-medium text-secondary-500 dark:text-secondary-400 uppercase tracking-wider">
                                    Total Cost
                                </th>
                                <th scope="col"
                                    className="px-6 py-3 text-left text-xs font-medium text-secondary-500 dark:text-secondary-400 uppercase tracking-wider">
                                    Expiration
                                </th>
                                <th scope="col"
                                    className="px-6 py-3 text-left text-xs font-medium text-secondary-500 dark:text-secondary-400 uppercase tracking-wider">
                                    Status
                                </th>
                            </tr>
                            </thead>
                            <tbody
                                className="bg-white dark:bg-secondary-800 divide-y divide-secondary-200 dark:divide-secondary-700">
                            {getProductSummary(orders).map((product) => (
                                <tr key={product.productId}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-secondary-900 dark:text-white">
                                        {product.productId}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-500 dark:text-secondary-400">
                                        {product.totalQuantity}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-500 dark:text-secondary-400">
                                        ${product.totalSpent.toFixed(2)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-500 dark:text-secondary-400">
                                        {formatDate(product.latestExpiration)}
                                    </td>
                                    <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${getExpirationStatusClass(product.latestExpiration)}`}>
                                        {getDaysUntilExpiration(product.latestExpiration)}
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                <div
                    className="text-center py-8 text-sm text-secondary-500 dark:text-secondary-400 bg-secondary-50 dark:bg-secondary-800/50 rounded-lg shadow-sm p-6">
                    <svg className="w-12 h-12 mx-auto mb-4 text-secondary-400 dark:text-secondary-500"
                         fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                              d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/>
                    </svg>
                    <p>You haven't purchased any products yet.</p>
                    <p className="mt-2">Browse our products and make your first purchase!</p>
                </div>
            )}
        </div>
    );
};