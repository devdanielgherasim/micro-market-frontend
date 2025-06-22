import React from 'react';

import {Order, OrderStatus} from '@/types';

interface OrderStatusModalProps {
    order: Order;
    isOpen: boolean;
    onClose: () => void;
}

export const OrderStatusModal: React.FC<OrderStatusModalProps> = ({order, isOpen, onClose}) => {
    if (!isOpen) return null;

    const getStatusInfo = (status: OrderStatus) => {
        switch (status) {
            case OrderStatus.DELIVERED:
                return {
                    title: 'Order Delivered',
                    description: 'Your order has been successfully delivered.',
                    color: 'text-green-600 dark:text-green-400',
                    bgColor: 'bg-green-100 dark:bg-green-900/20',
                    icon: (
                        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/>
                        </svg>
                    )
                };
            case OrderStatus.PAID:
                return {
                    title: 'Payment Confirmed',
                    description: 'Your payment has been confirmed and your order is being processed.',
                    color: 'text-blue-600 dark:text-blue-400',
                    bgColor: 'bg-blue-100 dark:bg-blue-900/20',
                    icon: (
                        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                        </svg>
                    )
                };
            case OrderStatus.SHIPPED:
                return {
                    title: 'Order Shipped',
                    description: 'Your order has been shipped and is on its way to you.',
                    color: 'text-purple-600 dark:text-purple-400',
                    bgColor: 'bg-purple-100 dark:bg-purple-900/20',
                    icon: (
                        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                  d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"/>
                        </svg>
                    )
                };
            case OrderStatus.PAYMENT_PENDING:
                return {
                    title: 'Payment Pending',
                    description: 'We are waiting for your payment to be confirmed.',
                    color: 'text-yellow-600 dark:text-yellow-400',
                    bgColor: 'bg-yellow-100 dark:bg-yellow-900/20',
                    icon: (
                        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                        </svg>
                    )
                };
            case OrderStatus.CREATED:
                return {
                    title: 'Order Created',
                    description: 'Your order has been created and is awaiting payment.',
                    color: 'text-yellow-600 dark:text-yellow-400',
                    bgColor: 'bg-yellow-100 dark:bg-yellow-900/20',
                    icon: (
                        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                        </svg>
                    )
                };
            case OrderStatus.CANCELLED:
                return {
                    title: 'Order Cancelled',
                    description: 'Your order has been cancelled.',
                    color: 'text-red-600 dark:text-red-400',
                    bgColor: 'bg-red-100 dark:bg-red-900/20',
                    icon: (
                        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                  d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                        </svg>
                    )
                };
            case OrderStatus.RETURNED:
                return {
                    title: 'Order Returned',
                    description: 'Your order has been returned.',
                    color: 'text-red-600 dark:text-red-400',
                    bgColor: 'bg-red-100 dark:bg-red-900/20',
                    icon: (
                        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                  d="M16 15v-1a4 4 0 00-4-4H8m0 0l3 3m-3-3l3-3m9 14V5a2 2 0 00-2-2H6a2 2 0 00-2 2v16l4-2 4 2 4-2 4 2z"/>
                        </svg>
                    )
                };
            case OrderStatus.REFUNDED:
                return {
                    title: 'Order Refunded',
                    description: 'Your order has been refunded.',
                    color: 'text-red-600 dark:text-red-400',
                    bgColor: 'bg-red-100 dark:bg-red-900/20',
                    icon: (
                        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                  d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/>
                        </svg>
                    )
                };
            default:
                return {
                    title: 'Order Status',
                    description: 'Current status of your order.',
                    color: 'text-gray-600 dark:text-gray-400',
                    bgColor: 'bg-gray-100 dark:bg-gray-700',
                    icon: (
                        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                        </svg>
                    )
                };
        }
    };

    const statusInfo = getStatusInfo(order.status);
    const orderDate = new Date(order.orderDate).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog"
             aria-modal="true">
            <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true"
                     onClick={onClose}></div>

                <div
                    className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-md sm:w-full">
                    <div className="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                        <div className="sm:flex sm:items-start">
                            <div
                                className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full sm:mx-0 sm:h-12 sm:w-12 sm:mr-4">
                                <div className={`p-1.5 sm:p-2 rounded-full ${statusInfo.bgColor} ${statusInfo.color}`}>
                                    <svg className="w-8 h-8 sm:w-10 sm:h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={
                                            order.status === OrderStatus.DELIVERED ? "M5 13l4 4L19 7" :
                                            order.status === OrderStatus.PAID ? "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" :
                                            order.status === OrderStatus.SHIPPED ? "M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" :
                                            order.status === OrderStatus.PAYMENT_PENDING ? "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" :
                                            order.status === OrderStatus.CREATED ? "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" :
                                            order.status === OrderStatus.CANCELLED ? "M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" :
                                            order.status === OrderStatus.RETURNED ? "M16 15v-1a4 4 0 00-4-4H8m0 0l3 3m-3-3l3-3m9 14V5a2 2 0 00-2-2H6a2 2 0 00-2 2v16l4-2 4 2 4-2 4 2z" :
                                            order.status === OrderStatus.REFUNDED ? "M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" :
                                            "M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                        } />
                                    </svg>
                                </div>
                            </div>
                            <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                                <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white"
                                    id="modal-title">
                                    {statusInfo.title}
                                </h3>
                                <div className="mt-2">
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        {statusInfo.description}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-5 border-t border-gray-200 dark:border-gray-700 pt-4">
                            <div className="space-y-3">
                                <div className="flex justify-between">
                                    <span
                                        className="text-sm font-medium text-gray-500 dark:text-gray-400">Order ID:</span>
                                    <span className="text-sm text-gray-900 dark:text-white">#{order.id}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span
                                        className="text-sm font-medium text-gray-500 dark:text-gray-400">Order Date:</span>
                                    <span className="text-sm text-gray-900 dark:text-white">{orderDate}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span
                                        className="text-sm font-medium text-gray-500 dark:text-gray-400">Status:</span>
                                    <span className={`text-sm px-2 py-0.5 rounded-full ${
                                        order.status === OrderStatus.DELIVERED ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' :
                                            order.status === OrderStatus.PAID ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400' :
                                                order.status === OrderStatus.SHIPPED ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400' :
                                                    order.status === OrderStatus.CANCELLED || order.status === OrderStatus.RETURNED || order.status === OrderStatus.REFUNDED ?
                                                        'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400' :
                                                        'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                                    }`}>
                    {order.status.replace('_', ' ')}
                  </span>
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
