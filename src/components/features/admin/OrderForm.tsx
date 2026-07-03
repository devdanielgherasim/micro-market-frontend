import React, { useState, useEffect } from 'react';

import { Order, OrderStatus, OrderItem } from '@/types';

import { Button } from '../../ui/Button';

interface OrderFormProps {
  order: Order;
  onSubmit: (orderId: string, orderData: Partial<Order>) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export const OrderForm: React.FC<OrderFormProps> = ({
  order,
  onSubmit,
  onCancel,
  isLoading = false
}) => {
  const [customerId, setCustomerId] = useState('');
  const [status, setStatus] = useState<OrderStatus>(OrderStatus.CREATED);
  const [items, setItems] = useState<OrderItem[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (order) {
      setCustomerId(order.customerId || '');
      setStatus(order.status || OrderStatus.CREATED);
      setItems(order.items || []);
    }
  }, [order]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!customerId.trim()) {
      newErrors.customerId = 'Customer ID is required';
    }


    if (!items.length) {
      newErrors.items = 'Order must have at least one item';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    const orderData: Partial<Order> = {
      customerId,
      status,
      items
    };

    await onSubmit(order.id.toString(), orderData);
  };

  const handleItemQuantityChange = (index: number, quantity: number) => {
    const newItems = [...items];
    newItems[index] = {
      ...newItems[index],
      quantity,
      subtotal: newItems[index].price * quantity
    };
    setItems(newItems);
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="customerId" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Customer ID *
        </label>
        <input
          type="text"
          id="customerId"
          value={customerId}
          onChange={(e) => setCustomerId(e.target.value)}
          className={`w-full px-3 py-2 border ${errors.customerId ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white`}
          disabled={isLoading}
        />
        {errors.customerId && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.customerId}</p>}
      </div>

      <div>
        <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Status *
        </label>
        <select
          id="status"
          value={status}
          onChange={(e) => setStatus(e.target.value as OrderStatus)}
          className={`w-full px-3 py-2 border ${errors.status ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white`}
          disabled={isLoading}
        >
          {Object.values(OrderStatus).map((statusOption) => (
            <option key={statusOption} value={statusOption}>
              {statusOption}
            </option>
          ))}
        </select>
        {errors.status && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.status}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Order Items *
        </label>
        {errors.items && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.items}</p>}

        {items.length > 0 ? (
          <div className="space-y-3 mt-2">
            {items.map((item, index) => (
              <div key={item.id || `item-${item.productId}-${index}`} className="flex items-center space-x-3 p-3 border border-gray-200 dark:border-gray-700 rounded-md">
                <div className="flex-grow">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{item.productName}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Price: ${item.price.toFixed(2)}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <label htmlFor={`quantity-${index}`} className="sr-only">Quantity</label>
                  <input
                    type="number"
                    id={`quantity-${index}`}
                    value={item.quantity}
                    onChange={(e) => handleItemQuantityChange(index, parseInt(e.target.value, 10))}
                    min="1"
                    className="w-16 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                    disabled={isLoading}
                  />
                  <Button
                    type="button"
                    variant="danger"
                    size="xs"
                    onClick={() => handleRemoveItem(index)}
                    disabled={isLoading}
                  >
                    Remove
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500 dark:text-gray-400 italic">No items in this order</p>
        )}
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="primary"
          isLoading={isLoading}
        >
          Update Order
        </Button>
      </div>
    </form>
  );
};
