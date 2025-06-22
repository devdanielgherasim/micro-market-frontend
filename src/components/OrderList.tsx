import React from 'react';

import {useOrders} from '@/hooks/useOrders';
import {Order, OrderStatus} from '@/types';


interface OrderItemProps {
    order: Order;
}

const OrderItem: React.FC<OrderItemProps> = ({order}) => {
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    const getStatusClass = (status: OrderStatus) => {
        switch (status) {
            case OrderStatus.DELIVERED:
                return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
            case OrderStatus.PAID:
                return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
            case OrderStatus.SHIPPED:
                return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400';
            case OrderStatus.PAYMENT_PENDING:
            case OrderStatus.CREATED:
                return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
            case OrderStatus.CANCELLED:
            case OrderStatus.RETURNED:
            case OrderStatus.REFUNDED:
                return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400';
        }
    };

    return (
        <div
            className="bg-white dark:bg-secondary-800 rounded-lg shadow-sm overflow-hidden border border-secondary-200 dark:border-secondary-700">
            <div
                className="px-4 py-5 sm:px-6 flex justify-between items-center border-b border-secondary-200 dark:border-secondary-700">
                <div>
                    <h3 className="text-lg font-medium text-secondary-900 dark:text-white">Order #{order.id}</h3>
                    <p className="mt-1 max-w-2xl text-sm text-secondary-500 dark:text-secondary-400">
                        Placed on {formatDate(order.orderDate)}
                    </p>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusClass(order.status)}`}>
          {order.status.replace('_', ' ')}
        </span>
            </div>
            <div className="border-b border-secondary-200 dark:border-secondary-700 px-4 py-5 sm:px-6">
                <div className="text-sm text-secondary-500 dark:text-secondary-400 space-y-3">
                    <p className="font-medium text-secondary-900 dark:text-white">Items</p>
                    <ul className="list-disc pl-5 space-y-2">
                        {order.items && order.items.map((item) => (
                            <li key={item.id}>
                                {item.productName || `Product ID: ${item.productId}`} - Quantity: {item.quantity}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
            <div className="px-4 py-4 sm:px-6 flex justify-between items-center">
                <div className="text-sm">
                    <p className="font-medium text-secondary-900 dark:text-white">Total Amount</p>
                    <p className="text-secondary-500 dark:text-secondary-400">${order.totalAmount.toFixed(2)}</p>
                </div>
                <button
                    className="px-4 py-2 bg-primary-50 hover:bg-primary-100 text-primary-700 dark:bg-primary-900/10 dark:hover:bg-primary-900/20 dark:text-primary-400 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-secondary-900 text-sm font-medium">
                    View Details
                </button>
            </div>
        </div>
    );
};

interface OrderListProps {
    customerId?: string;
}

export const OrderList: React.FC<OrderListProps> = ({customerId}) => {
    const {data: orders, loading, error, refetch} = useOrders(customerId);

    return (
        <div className="space-y-4">
            {error && (
                <div
                    className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-3 sm:px-4 py-2 sm:py-3 rounded-lg text-sm relative shadow-sm"
                    role="alert">
                    <strong className="font-semibold">Error: </strong>
                    <span className="block sm:inline">{error}</span>
                </div>
            )}

            {loading ? (
                <div className="flex justify-center items-center py-6 sm:py-8 md:py-10">
                    <div
                        className="animate-spin rounded-full h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 border-2 border-primary-500 dark:border-primary-400 border-t-transparent shadow-md"></div>
                </div>
            ) : orders.length > 0 ? (
                <div className="space-y-4">
                    {orders.map((order) => (
                        <OrderItem key={order.id} order={order}/>
                    ))}
                </div>
            ) : (
                <div
                    className="text-center py-6 sm:py-8 md:py-10 text-sm sm:text-base text-secondary-500 dark:text-secondary-400 bg-secondary-50 dark:bg-secondary-800/50 rounded-lg shadow-sm p-4 sm:p-6">
                    <svg className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 text-secondary-400 dark:text-secondary-500"
                         fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                    </svg>
                    <p>No orders found.</p>
                    <button
                        onClick={() => refetch()}
                        className="mt-4 px-4 py-2 bg-primary-100 hover:bg-primary-200 text-primary-700 dark:bg-primary-900/30 dark:hover:bg-primary-800/40 dark:text-primary-300 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-secondary-900"
                    >
                        Refresh
                    </button>
                </div>
            )}
        </div>
    );
};
