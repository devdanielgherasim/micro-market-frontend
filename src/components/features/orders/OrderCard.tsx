import React from 'react';
import { Order } from '../../../types';
import { Button } from '../../ui/Button';

interface OrderCardProps {
  order: Order;
  className?: string;
}

/**
 * Component for displaying a single order
 */
export const OrderCard: React.FC<OrderCardProps> = ({ order, className = '' }) => {
  // Format date
  const formattedDate = new Date(order.orderDate).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  // Get status color and icon
  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'completed':
        return {
          color: 'bg-gradient-to-r from-green-100 to-green-50 text-green-800 dark:from-green-900/30 dark:to-green-800/30 dark:text-green-400 border border-green-200 dark:border-green-800',
          bgColor: 'bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900/30 dark:to-green-800/30',
          icon: (
            <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-0.5 sm:mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          )
        };
      case 'processing':
        return {
          color: 'bg-gradient-to-r from-blue-100 to-blue-50 text-blue-800 dark:from-blue-900/30 dark:to-blue-800/30 dark:text-blue-400 border border-blue-200 dark:border-blue-800',
          bgColor: 'bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/30 dark:to-blue-800/30',
          icon: (
            <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-0.5 sm:mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
            </svg>
          )
        };
      case 'shipped':
        return {
          color: 'bg-gradient-to-r from-purple-100 to-purple-50 text-purple-800 dark:from-purple-900/30 dark:to-purple-800/30 dark:text-purple-400 border border-purple-200 dark:border-purple-800',
          bgColor: 'bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-900/30 dark:to-purple-800/30',
          icon: (
            <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-0.5 sm:mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
              <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1v-5h2.038A2.968 2.968 0 0115 12.995V13a1 1 0 001-1v-2a1 1 0 00-1-1h-3.034A2.968 2.968 0 0110 6.995V7H8.883A1.5 1.5 0 107 8.5V11h.5a1 1 0 001-1v-1a1 1 0 00-1-1H4a1 1 0 00-1 1v1a1 1 0 001 1h2.512A1.5 1.5 0 005 11.5v.5H4a1 1 0 00-1 1v3z" />
            </svg>
          )
        };
      default:
        return {
          color: 'bg-gradient-to-r from-gray-100 to-gray-50 text-gray-800 dark:from-gray-700 dark:to-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-600',
          bgColor: 'bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600',
          icon: (
            <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-0.5 sm:mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
            </svg>
          )
        };
    }
  };

  const statusInfo = getStatusInfo(order.status);

  return (
    <div className={`border border-gray-200 dark:border-gray-700 rounded-xl p-3 sm:p-4 md:p-5 shadow-md hover:shadow-lg transition-all duration-300 dark:bg-gray-800 hover:translate-y-[-2px] ${className}`}>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 sm:mb-4">
        <div className="flex items-start w-full">
          <div className={`flex-shrink-0 mr-3 ${statusInfo.bgColor} rounded-lg p-1.5 sm:p-2 w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 flex items-center justify-center shadow-sm`}>
            <div className="w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 flex items-center justify-center">
              {statusInfo.icon}
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white truncate">Order #{order.id}</h3>
              <div className="flex flex-col sm:flex-row gap-1 sm:gap-2">
                <span className={`inline-flex items-center px-2 py-0.5 mt-1 sm:mt-0 rounded-full text-xs font-medium ${statusInfo.color} whitespace-nowrap shadow-sm`}>
                  {statusInfo.icon}
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </span>
                {order.expirationDate && (
                  <span className={`inline-flex items-center px-2 py-0.5 mt-1 sm:mt-0 rounded-full text-xs font-medium whitespace-nowrap shadow-sm ${
                    new Date(order.expirationDate) < new Date() 
                      ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border border-red-200 dark:border-red-800' 
                      : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border border-green-200 dark:border-green-800'
                  }`}>
                    {new Date(order.expirationDate) < new Date() ? (
                      <>
                        <svg className="w-3 h-3 mr-0.5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                        Expired
                      </>
                    ) : (
                      <>
                        <svg className="w-3 h-3 mr-0.5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        Active
                      </>
                    )}
                  </span>
                )}
              </div>
            </div>
            <p className="mt-1 text-xs sm:text-sm text-gray-600 dark:text-gray-300">Placed on {formattedDate}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-3 sm:mb-4">
        <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-2 sm:p-3 shadow-sm">
          <h4 className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 sm:mb-2">Order Summary</h4>
          <div className="space-y-1">
            <div className="flex justify-between text-xs sm:text-sm">
              <span className="text-gray-500 dark:text-gray-400">Customer:</span>
              <span className="text-gray-900 dark:text-white font-medium">#{order.customerId}</span>
            </div>
            <div className="flex justify-between text-xs sm:text-sm">
              <span className="text-gray-500 dark:text-gray-400">Items:</span>
              <span className="text-gray-900 dark:text-white font-medium">{order.products.reduce((sum, item) => sum + item.quantity, 0)}</span>
            </div>
            {order.expirationDate && (
              <div className="flex justify-between text-xs sm:text-sm">
                <span className="text-gray-500 dark:text-gray-400">Expires:</span>
                <span className={`font-medium ${
                  new Date(order.expirationDate) < new Date() 
                    ? 'text-red-600 dark:text-red-400' 
                    : 'text-green-600 dark:text-green-400'
                }`}>
                  {new Date(order.expirationDate).toLocaleDateString()}
                </span>
              </div>
            )}
            <div className="flex justify-between text-xs sm:text-sm font-medium pt-1 border-t border-gray-200 dark:border-gray-600 mt-1">
              <span className="text-gray-700 dark:text-gray-300">Total:</span>
              <span className="text-gray-900 dark:text-white">${order.totalAmount.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-2 sm:p-3 shadow-sm">
          <h4 className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 sm:mb-2">Shipping Address</h4>
          <address className="not-italic text-xs sm:text-sm text-gray-600 dark:text-gray-300">
            {order.shippingAddress.street}<br />
            {order.shippingAddress.city}, {order.shippingAddress.zipCode}
          </address>
        </div>
      </div>

      <div className="border-t border-gray-200 dark:border-gray-700 pt-3 sm:pt-4">
        <h4 className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white mb-1 sm:mb-2">Order Items</h4>
        <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg overflow-hidden shadow-sm">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-100 dark:bg-gray-700">
              <tr>
                <th scope="col" className="px-2 sm:px-3 py-1.5 sm:py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Product</th>
                <th scope="col" className="px-2 sm:px-3 py-1.5 sm:py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Quantity</th>
              </tr>
            </thead>
            <tbody className="bg-gray-50 dark:bg-gray-700/30 divide-y divide-gray-200 dark:divide-gray-700">
              {order.products.map((item) => (
                <tr key={item.productId} className="hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                  <td className="px-2 sm:px-3 py-1.5 sm:py-2 whitespace-nowrap text-xs sm:text-sm text-gray-700 dark:text-gray-300">
                    Product #{item.productId}
                  </td>
                  <td className="px-2 sm:px-3 py-1.5 sm:py-2 whitespace-nowrap text-xs sm:text-sm text-right text-gray-700 dark:text-gray-300">
                    {item.quantity}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex justify-end mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex space-x-2 sm:space-x-3">
          <Button 
            variant="outline" 
            size="xs"
            rounded="md"
            className="transition-all duration-300 hover:scale-105"
            icon={
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            }
          >
            View Details
          </Button>
          <Button 
            variant={
              order.status === 'completed' ? 'success' :
              order.status === 'processing' ? 'primary' :
              order.status === 'shipped' ? 'secondary' : 'outline'
            }
            size="xs"
            rounded="md"
            className="transition-all duration-300 hover:scale-105"
            icon={
              order.status === 'completed' ? (
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              ) : order.status === 'shipped' ? (
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                </svg>
              ) : (
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )
            }
          >
            {order.status === 'completed' ? 'Completed' : 
             order.status === 'processing' ? 'Track Order' : 
             order.status === 'shipped' ? 'Track Shipment' : 'View Status'}
          </Button>
        </div>
      </div>
    </div>
  );
};
