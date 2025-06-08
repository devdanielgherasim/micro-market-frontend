import {useCallback, useEffect, useState} from 'react';
import {ApiResponse, Order} from '../types';
import {API_ENDPOINTS} from '../config/api';
import {fetchWithTimeout, ApiError, handleApiError} from '../utils/api';

/**
 * Custom hook for fetching orders
 * @param customerId - Optional customer ID to filter orders
 * @returns Object containing orders data, loading state, error, and refetch function
 */
export function useOrders(customerId?: string): ApiResponse<Order[]> & { refetch: () => Promise<void> } {
    const [data, setData] = useState<Order[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | undefined>(undefined);

    const fetchOrders = useCallback(async (): Promise<void> => {
        setLoading(true);
        setError(undefined);

        try {
            let url = API_ENDPOINTS.orders;
            if (customerId) {
                url = `${API_ENDPOINTS.orders}/customer/${customerId}`;
            }

            const orders = await fetchWithTimeout<Order[]>(url);
            setData(orders);
        } catch (err) {
            console.error('Failed to fetch orders:', err);

            if (err instanceof ApiError) {
                setError(`${err.message}${err.code ? ` (${err.code})` : ''}`);
            } else if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('Failed to fetch orders');
            }
        } finally {
            setLoading(false);
        }
    }, [customerId]);

    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);

    return {
        data,
        loading,
        error,
        refetch: fetchOrders
    };
}
