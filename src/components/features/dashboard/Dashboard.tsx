import React, {useEffect, useState} from 'react';

import {useAuth} from '@/auth/KeycloakProvider';
import {useOrders} from '@/hooks/useOrders';

import {Button} from '../../ui/Button';
import {OrderList} from '../orders/OrderList';
import {ProductList} from '../products/ProductList';

export const Dashboard: React.FC = () => {
    const [isRefreshing, setIsRefreshing] = useState(false);
    const {userProfile} = useAuth();

    const {data: orders, loading: ordersLoading, refetch: refetchOrders} = useOrders(
        {customerId: userProfile?.id}
    );

    const [stats, setStats] = useState({
        totalProducts: 0,
        totalOrders: 0,
        totalSpent: 0,
        nearestExpiration: null as string | null
    });

    useEffect(() => {
        if (orders && orders.length > 0) {
            const totalProducts = orders.reduce((sum, order) => {
                if (!order.items) return sum;
                return sum + order.items.reduce((pSum, item) => pSum + item.quantity, 0);
            }, 0);

            const totalSpent = orders.reduce((sum, order) => sum + order.totalAmount, 0);

            let nearestExpiration: string | null = null;
            const now = new Date();

            orders.forEach(order => {
                if (order.expirationDate) {
                    const expirationDate = new Date(order.expirationDate);
                    if (expirationDate > now) {
                        if (!nearestExpiration || expirationDate < new Date(nearestExpiration)) {
                            nearestExpiration = order.expirationDate;
                        }
                    }
                }
            });

            setStats({
                totalProducts,
                totalOrders: orders.length,
                totalSpent,
                nearestExpiration
            });
        } else {
            setStats({
                totalProducts: 0,
                totalOrders: 0,
                totalSpent: 0,
                nearestExpiration: null
            });
        }
    }, [orders]);

    const handleRefresh = () => {
        setIsRefreshing(true);
        refetchOrders().finally(() => {
            setIsRefreshing(false);
        });
    };

    return (
        <div>
            <div className="mb-4 sm:mb-6 md:mb-8">
                <div
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 sm:mb-4 gap-3 sm:gap-4">
                    <div>
                        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                            Dashboard
                        </h1>
                        <p className="mt-1 text-xs sm:text-sm md:text-base text-gray-600 dark:text-gray-300 max-w-3xl">
                            Welcome to the Micro Market dashboard. Here you can view key metrics, products, and orders.
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-2 sm:gap-3 mt-2 sm:mt-0">
                        <Button
                            variant="glass"
                            size="xs"
                            rounded="lg"
                            icon={
                                <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor"
                                     viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                          d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12"/>
                                </svg>
                            }
                        >
                            Filter
                        </Button>
                        <Button
                            variant="primary"
                            size="xs"
                            rounded="lg"
                            isLoading={isRefreshing}
                            onClick={handleRefresh}
                            icon={
                                <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor"
                                     viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                                </svg>
                            }
                        >
                            Refresh
                        </Button>
                    </div>
                </div>
            </div>

            <div
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-5 mb-4 sm:mb-6 md:mb-8">
                <div
                    className="bg-white dark:bg-gray-800 overflow-hidden shadow-md hover:shadow-lg dark:shadow-gray-700/50 rounded-xl border border-gray-100 dark:border-gray-700 transition-all duration-300 hover:translate-y-[-1px]">
                    <div className="p-3 sm:p-4 md:p-5">
                        <div className="flex items-center">
                            <div
                                className="flex-shrink-0 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-2 sm:p-3 shadow-md">
                                <svg className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-white" fill="none"
                                     stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                          d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
                                </svg>
                            </div>
                            <div className="ml-3 sm:ml-4 md:ml-5 flex-1">
                                <dl>
                                    <dt className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Total
                                        Products Owned
                                    </dt>
                                    <dd className="flex items-baseline">
                                        <div
                                            className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
                                            {ordersLoading ? (
                                                <span className="animate-pulse">...</span>
                                            ) : (
                                                stats.totalProducts
                                            )}
                                        </div>
                                        {!ordersLoading && stats.totalProducts > 0 && (
                                            <div
                                                className="ml-2 flex items-baseline text-xs font-semibold text-green-600 dark:text-green-400">
                                                <svg
                                                    className="self-center flex-shrink-0 h-3 w-3 sm:h-4 sm:w-4 text-green-500 dark:text-green-400"
                                                    fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                                          d="M5 13l4 4L19 7"/>
                                                </svg>
                                                <span className="ml-0.5 sm:ml-1">Active</span>
                                            </div>
                                        )}
                                    </dd>
                                    <dd className="mt-0.5 sm:mt-1 text-xs text-gray-500 dark:text-gray-400">
                                        {stats.nearestExpiration ? (
                                            <>Next
                                                expiration: {new Date(stats.nearestExpiration).toLocaleDateString()}</>
                                        ) : (
                                            <>No active products</>
                                        )}
                                    </dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700/50 px-3 sm:px-4 md:px-5 py-1.5 sm:py-2 md:py-3">
                        <div className="text-xs">
                            <a href="#products"
                               className="font-medium text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 flex items-center">
                                View all products
                                <svg className="ml-1 w-3 h-3 sm:w-3.5 sm:h-3.5" fill="none" stroke="currentColor"
                                     viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                          d="M9 5l7 7-7 7"/>
                                </svg>
                            </a>
                        </div>
                    </div>
                </div>

                <div
                    className="bg-white dark:bg-gray-800 overflow-hidden shadow-md hover:shadow-lg dark:shadow-gray-700/50 rounded-xl border border-gray-100 dark:border-gray-700 transition-all duration-300 hover:translate-y-[-1px]">
                    <div className="p-3 sm:p-4 md:p-5">
                        <div className="flex items-center">
                            <div
                                className="flex-shrink-0 bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-2 sm:p-3 shadow-md">
                                <svg className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-white" fill="none"
                                     stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"/>
                                </svg>
                            </div>
                            <div className="ml-3 sm:ml-4 md:ml-5 flex-1">
                                <dl>
                                    <dt className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Total
                                        Orders
                                    </dt>
                                    <dd className="flex items-baseline">
                                        <div
                                            className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
                                            {ordersLoading ? (
                                                <span className="animate-pulse">...</span>
                                            ) : (
                                                stats.totalOrders
                                            )}
                                        </div>
                                        {!ordersLoading && stats.totalOrders > 0 && (
                                            <div
                                                className="ml-2 flex items-baseline text-xs font-semibold text-green-600 dark:text-green-400">
                                                <svg
                                                    className="self-center flex-shrink-0 h-3 w-3 sm:h-4 sm:w-4 text-green-500 dark:text-green-400"
                                                    fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                                          d="M5 13l4 4L19 7"/>
                                                </svg>
                                                <span className="ml-0.5 sm:ml-1">Completed</span>
                                            </div>
                                        )}
                                    </dd>
                                    <dd className="mt-0.5 sm:mt-1 text-xs text-gray-500 dark:text-gray-400">
                                        {stats.totalOrders > 0 ? (
                                            <>Last order: {new Date(orders[0].orderDate).toLocaleDateString()}</>
                                        ) : (
                                            <>No orders yet</>
                                        )}
                                    </dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700/50 px-3 sm:px-4 md:px-5 py-1.5 sm:py-2 md:py-3">
                        <div className="text-xs">
                            <a href="#orders"
                               className="font-medium text-green-600 dark:text-green-400 hover:text-green-500 dark:hover:text-green-300 flex items-center">
                                View all orders
                                <svg className="ml-1 w-3 h-3 sm:w-3.5 sm:h-3.5" fill="none" stroke="currentColor"
                                     viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                          d="M9 5l7 7-7 7"/>
                                </svg>
                            </a>
                        </div>
                    </div>
                </div>

                <div
                    className="bg-white dark:bg-gray-800 overflow-hidden shadow-md hover:shadow-lg dark:shadow-gray-700/50 rounded-xl border border-gray-100 dark:border-gray-700 transition-all duration-300 hover:translate-y-[-1px]">
                    <div className="p-3 sm:p-4 md:p-5">
                        <div className="flex items-center">
                            <div
                                className="flex-shrink-0 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg p-2 sm:p-3 shadow-md">
                                <svg className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-white" fill="none"
                                     stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                          d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                </svg>
                            </div>
                            <div className="ml-3 sm:ml-4 md:ml-5 flex-1">
                                <dl>
                                    <dt className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Total
                                        Spent
                                    </dt>
                                    <dd className="flex items-baseline">
                                        <div
                                            className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
                                            {ordersLoading ? (
                                                <span className="animate-pulse">...</span>
                                            ) : (
                                                `$${stats.totalSpent.toFixed(2)}`
                                            )}
                                        </div>
                                        {!ordersLoading && stats.totalSpent > 0 && (
                                            <div
                                                className="ml-2 flex items-baseline text-xs font-semibold text-green-600 dark:text-green-400">
                                                <svg
                                                    className="self-center flex-shrink-0 h-3 w-3 sm:h-4 sm:w-4 text-green-500 dark:text-green-400"
                                                    fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                                          d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                                </svg>
                                                <span className="ml-0.5 sm:ml-1">Invested</span>
                                            </div>
                                        )}
                                    </dd>
                                    <dd className="mt-0.5 sm:mt-1 text-xs text-gray-500 dark:text-gray-400">
                                        {stats.totalOrders > 0 ? (
                                            <>Average per order: ${(stats.totalSpent / stats.totalOrders).toFixed(2)}</>
                                        ) : (
                                            <>No purchases yet</>
                                        )}
                                    </dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700/50 px-3 sm:px-4 md:px-5 py-1.5 sm:py-2 md:py-3">
                        <div className="text-xs">
                            <a href="#analytics"
                               className="font-medium text-purple-600 dark:text-purple-400 hover:text-purple-500 dark:hover:text-purple-300 flex items-center">
                                View analytics
                                <svg className="ml-1 w-3 h-3 sm:w-3.5 sm:h-3.5" fill="none" stroke="currentColor"
                                     viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                          d="M9 5l7 7-7 7"/>
                                </svg>
                            </a>
                        </div>
                    </div>
                </div>

                <div
                    className="bg-white dark:bg-gray-800 overflow-hidden shadow-md hover:shadow-lg dark:shadow-gray-700/50 rounded-xl border border-gray-100 dark:border-gray-700 transition-all duration-300 hover:translate-y-[-1px]">
                    <div className="p-3 sm:p-4 md:p-5">
                        <div className="flex items-center">
                            <div
                                className="flex-shrink-0 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg p-2 sm:p-3 shadow-md">
                                <svg className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-white" fill="none"
                                     stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                          d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/>
                                </svg>
                            </div>
                            <div className="ml-3 sm:ml-4 md:ml-5 flex-1">
                                <dl>
                                    <dt className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Customers</dt>
                                    <dd className="flex items-baseline">
                                        <div
                                            className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 dark:text-white">2
                                        </div>
                                        <div
                                            className="ml-2 flex items-baseline text-xs font-semibold text-red-600 dark:text-red-400">
                                            <svg
                                                className="self-center flex-shrink-0 h-3 w-3 sm:h-4 sm:w-4 text-red-500 dark:text-red-400"
                                                fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                                      d="M19 14l-7 7m0 0l-7-7m7 7V3"/>
                                            </svg>
                                            <span className="ml-0.5 sm:ml-1">4%</span>
                                        </div>
                                    </dd>
                                    <dd className="mt-0.5 sm:mt-1 text-xs text-gray-500 dark:text-gray-400">from last
                                        month
                                    </dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700/50 px-3 sm:px-4 md:px-5 py-1.5 sm:py-2 md:py-3">
                        <div className="text-xs">
                            <a href="#customers"
                               className="font-medium text-yellow-600 dark:text-yellow-400 hover:text-yellow-500 dark:hover:text-yellow-300 flex items-center">
                                View all customers
                                <svg className="ml-1 w-3 h-3 sm:w-3.5 sm:h-3.5" fill="none" stroke="currentColor"
                                     viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                          d="M9 5l7 7-7 7"/>
                                </svg>
                            </a>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5 md:gap-6">
                <div
                    className="bg-white dark:bg-gray-800 overflow-hidden shadow-md hover:shadow-lg dark:shadow-gray-700/50 rounded-xl border border-gray-100 dark:border-gray-700 p-3 sm:p-4 md:p-5 transition-all duration-300">
                    <ProductList/>
                </div>

                <div
                    className="bg-white dark:bg-gray-800 overflow-hidden shadow-md hover:shadow-lg dark:shadow-gray-700/50 rounded-xl border border-gray-100 dark:border-gray-700 p-3 sm:p-4 md:p-5 transition-all duration-300">
                    <OrderList/>
                </div>
            </div>
        </div>
    );
};
