import React, { useState, useEffect } from 'react';

import { deleteOrder, getOrders, updateOrder, updateOrderStatus } from '@/services/orderService';
import { Order, OrderStatus } from '@/types';

import { Button } from '../../ui/Button';

import { OrderForm } from './OrderForm';

interface AdminOrderListProps {
  className?: string;
}

export const AdminOrderList: React.FC<AdminOrderListProps> = ({ className = '' }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [statusUpdateLoading, setStatusUpdateLoading] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const fetchedOrders = await getOrders();
      setOrders(fetchedOrders);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId: number, newStatus: OrderStatus) => {
    setStatusUpdateLoading(String(orderId));
    setFormError(null);
    try {
      await updateOrderStatus(String(orderId), newStatus);
      await fetchOrders();
    } catch (err) {
      console.error(`Error updating order ${orderId} status:`, err);
      setFormError(err instanceof Error ? err.message : 'Failed to update order status');
    } finally {
      setStatusUpdateLoading(null);
    }
  };

  const handleEditOrder = (order: Order) => {
    setSelectedOrder(order);
  };

  const handleCancelEdit = () => {
    setSelectedOrder(null);
    setFormError(null);
  };

  const handleUpdateOrder = async (orderId: string, orderData: Partial<Order>) => {
    setFormLoading(true);
    setFormError(null);

    try {
      await updateOrder(orderId, orderData);
      setSelectedOrder(null);
      await fetchOrders();
    } catch (err) {
      console.error(`Error updating order ${orderId}:`, err);
      setFormError(err instanceof Error ? err.message : 'Failed to update order');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteOrder = async (orderId: number) => {
    if (!window.confirm('Are you sure you want to delete this order? This action cannot be undone.')) {
      return;
    }

    setDeleteLoading(String(orderId));
    setFormError(null);
    try {
      await deleteOrder(String(orderId));
      await fetchOrders();
    } catch (err) {
      console.error(`Error deleting order ${orderId}:`, err);
      setFormError(err instanceof Error ? err.message : 'Failed to delete order');
    } finally {
      setDeleteLoading(null);
    }
  };

  if (loading && orders.length === 0) {
    return (
      <div className={`flex justify-center items-center py-8 ${className}`}>
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg ${className}`} role="alert">
        <strong className="font-semibold">Error: </strong>
        <span>{error}</span>
        <div className="mt-2">
          <Button variant="outline" size="sm" onClick={fetchOrders}>Try Again</Button>
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className={`text-center py-8 text-gray-500 dark:text-gray-400 ${className}`}>
        <p>No orders found.</p>
        <Button variant="outline" size="sm" className="mt-2" onClick={fetchOrders}>Refresh</Button>
      </div>
    );
  }

  if (selectedOrder) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 sm:p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Edit Order #{selectedOrder.id}
          </h3>

          {formError && (
            <div className="mb-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-3 sm:px-4 py-2 sm:py-3 rounded-lg text-sm relative shadow-sm" role="alert">
              <strong className="font-semibold">Error: </strong>
              <span className="block sm:inline">{formError}</span>
            </div>
          )}

          <OrderForm
            order={selectedOrder}
            onSubmit={handleUpdateOrder}
            onCancel={handleCancelEdit}
            isLoading={formLoading}
          />
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Manage Orders</h2>
        <Button variant="outline" size="sm" onClick={fetchOrders} className="flex items-center gap-1">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh
        </Button>
      </div>

      {formError && (
        <div className="mb-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-3 sm:px-4 py-2 sm:py-3 rounded-lg text-sm relative shadow-sm" role="alert">
          <strong className="font-semibold">Error: </strong>
          <span className="block sm:inline">{formError}</span>
          <button 
            onClick={() => setFormError(null)} 
            className="absolute top-2 right-2 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
          >
            <span className="sr-only">Dismiss</span>
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Order ID</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Customer</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
            {orders.map((order) => (
              <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{order.id}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{order.customerId}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {new Date(order.orderDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  ${order.totalAmount.toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <select
                    value={order.status}
                    onChange={(e) => handleStatusChange(order.id, e.target.value as OrderStatus)}
                    disabled={statusUpdateLoading === String(order.id)}
                    className="block w-full pl-3 pr-10 py-1 text-sm border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-800 dark:text-white"
                  >
                    {Object.values(OrderStatus).map((status) => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    <Button
                      variant="primary"
                      size="xs"
                      onClick={() => handleEditOrder(order)}
                      className="inline-flex items-center"
                    >
                      Edit
                    </Button>
                    <Button
                      variant="danger"
                      size="xs"
                      isLoading={deleteLoading === String(order.id)}
                      onClick={() => handleDeleteOrder(order.id)}
                      className="inline-flex items-center"
                    >
                      Delete
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
