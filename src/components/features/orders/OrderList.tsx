import React from 'react';
import { OrderCard } from './OrderCard';
import { Button } from '../../ui/Button';
import { useOrders } from '@/hooks/useOrders';

interface OrderListProps {
  customerId?: string;
  className?: string;
}

/**
 * Component for displaying a list of orders with loading and error states
 */
export const OrderList: React.FC<OrderListProps> = ({ customerId, className = '' }) => {
  const { data: orders, loading, error, refetch } = useOrders(customerId);

  return (
    <div className={`space-y-3 sm:space-y-4 ${className}`}>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-0">
        <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
          {customerId ? `Orders for Customer ${customerId}` : 'Orders'}
        </h2>
        <Button 
          onClick={() => refetch()} 
          isLoading={loading}
          size="xs"
          rounded="md"
          variant="success"
          className="self-end sm:self-auto transition-all duration-300 hover:scale-105"
          icon={
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          }
        >
          Refresh
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-3 sm:px-4 py-2 sm:py-3 rounded-lg text-sm relative shadow-sm" role="alert">
          <strong className="font-semibold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      {loading && !orders.length ? (
        <div className="flex justify-center items-center py-6 sm:py-8 md:py-10">
          <div className="animate-spin rounded-full h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 border-2 border-green-500 dark:border-green-400 border-t-transparent shadow-md"></div>
        </div>
      ) : orders.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-5">
          {orders.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      ) : (
        <div className="text-center py-6 sm:py-8 md:py-10 text-sm sm:text-base text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50 rounded-lg shadow-sm p-4 sm:p-6">
          <svg className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
          </svg>
          No orders available. Click refresh to try again.
        </div>
      )}
    </div>
  );
};
