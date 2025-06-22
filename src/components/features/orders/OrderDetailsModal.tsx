import React from 'react';

import {Order, OrderStatus} from '@/types';

interface OrderDetailsModalProps {
    order: Order;
    isOpen: boolean;
    onClose: () => void;
}

export const OrderDetailsModal: React.FC<OrderDetailsModalProps> = ({order, isOpen, onClose}) => {
    if (!isOpen) return null;

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
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
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog"
             aria-modal="true">
            <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true"
                     onClick={onClose}></div>

                <div
                    className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                    <div className="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                        <div className="sm:flex sm:items-start">
                            <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                                <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white"
                                    id="modal-title">
                                    Order Details
                                </h3>
                                <div className="mt-4">
                                    <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg mb-4">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Order ID:</span>
                                            <span
                                                className="text-sm font-bold text-gray-900 dark:text-white">#{order.id}</span>
                                        </div>
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Customer ID:</span>
                                            <span
                                                className="text-sm font-bold text-gray-900 dark:text-white">#{order.customerId}</span>
                                        </div>
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Order Date:</span>
                                            <span
                                                className="text-sm text-gray-900 dark:text-white">{formatDate(order.orderDate)}</span>
                                        </div>
                                        <div className="flex justify-between items-center mb-2">
                                            <span
                                                className="text-sm font-medium text-gray-500 dark:text-gray-400">Status:</span>
                                            <span
                                                className={`text-sm px-2 py-1 rounded-full ${getStatusClass(order.status)}`}>
                        {order.status.replace('_', ' ')}
                      </span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Amount:</span>
                                            <span
                                                className="text-sm font-bold text-gray-900 dark:text-white">${order.totalAmount.toFixed(2)}</span>
                                        </div>
                                    </div>

                                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">Order Items</h4>
                                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg overflow-hidden">
                                        <table
                                            className="min-w-full divide-y divide-gray-200 dark:divide-gray-600 hidden sm:table">
                                            <thead className="bg-gray-100 dark:bg-gray-600">
                                            <tr>
                                                <th scope="col"
                                                    className="px-2 sm:px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                    Product
                                                </th>
                                                <th scope="col"
                                                    className="px-2 sm:px-4 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                    Price
                                                </th>
                                                <th scope="col"
                                                    className="px-2 sm:px-4 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                    Quantity
                                                </th>
                                                <th scope="col"
                                                    className="px-2 sm:px-4 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                    Subtotal
                                                </th>
                                            </tr>
                                            </thead>
                                            <tbody
                                                className="bg-white dark:bg-gray-700 divide-y divide-gray-200 dark:divide-gray-600">
                                            {order.items && order.items.map((item) => (
                                                <tr key={item.id}>
                                                    <td className="px-2 sm:px-4 py-2 text-xs sm:text-sm text-gray-900 dark:text-white">
                                                        {item.productName || `Product #${item.productId}`}
                                                    </td>
                                                    <td className="px-2 sm:px-4 py-2 text-xs sm:text-sm text-right text-gray-900 dark:text-white">
                                                        ${item.price.toFixed(2)}
                                                    </td>
                                                    <td className="px-2 sm:px-4 py-2 text-xs sm:text-sm text-right text-gray-900 dark:text-white">
                                                        {item.quantity}
                                                    </td>
                                                    <td className="px-2 sm:px-4 py-2 text-xs sm:text-sm text-right text-gray-900 dark:text-white">
                                                        ${item.subtotal.toFixed(2)}
                                                    </td>
                                                </tr>
                                            ))}
                                            </tbody>
                                        </table>

                                        <div className="sm:hidden divide-y divide-gray-200 dark:divide-gray-600">
                                            {order.items && order.items.map((item) => (
                                                <div key={item.id} className="p-3">
                                                    <div className="flex justify-between items-start mb-2">
                                                        <span
                                                            className="text-xs font-medium text-gray-900 dark:text-white">
                                                            {item.productName || `Product #${item.productId}`}
                                                        </span>
                                                        <span
                                                            className="text-xs font-medium text-gray-900 dark:text-white">
                                                            ${item.subtotal.toFixed(2)}
                                                        </span>
                                                    </div>
                                                    <div
                                                        className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                                                        <span>${item.price.toFixed(2)} × {item.quantity}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700 px-3 sm:px-6 py-3 sm:flex sm:flex-row-reverse">
                        <button
                            type="button"
                            className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2.5 sm:py-2 bg-primary-600 text-sm font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:ml-3 sm:w-auto min-h-[40px] sm:min-h-0"
                            onClick={onClose}
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
