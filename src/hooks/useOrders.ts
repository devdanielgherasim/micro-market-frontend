import {useCallback, useEffect, useState} from 'react';

import {API_ENDPOINTS} from '@/config/api';
import {Order, PaginationMetadata, PaginatedApiResponse} from '@/types';
import {ApiError, fetchWithTimeout} from '@/utils/api';

interface UseOrdersOptions {
    customerId?: string;
    page?: number;
    size?: number;
}

export function useOrders(options?: UseOrdersOptions): PaginatedApiResponse<Order> & { refetch: () => Promise<void> } {
    const { customerId, page = 0, size = 10 } = options || {};

    const [data, setData] = useState<Order[]>([]);
    const [pagination, setPagination] = useState<PaginationMetadata>({
        page,
        size,
        totalElements: 0,
        totalPages: 0,
        first: true,
        last: true
    });
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | undefined>(undefined);

    const fetchOrders = useCallback(async (): Promise<void> => {
        setLoading(true);
        setError(undefined);

        try {
            let url = `${API_ENDPOINTS.orders}?page=${page}&size=${size}`;
            if (customerId) {
                url = `${API_ENDPOINTS.orders}/customer/${customerId}?page=${page}&size=${size}`;
            }

            const response = await fetchWithTimeout<{
                content: Order[];
                pageable: {
                    pageNumber: number;
                    pageSize: number;
                };
                totalElements: number;
                totalPages: number;
                first: boolean;
                last: boolean;
            }>(url);

            setData(response.content || []);
            setPagination({
                page: response.pageable?.pageNumber || 0,
                size: response.pageable?.pageSize || size,
                totalElements: response.totalElements || 0,
                totalPages: response.totalPages || 0,
                first: response.first || true,
                last: response.last || true
            });
        } catch (err) {
            console.error('Failed to fetch orders:', err);

            if (err instanceof ApiError) {
                setError(`${err.message}${err.code ?? ''}`);
            } else if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('Failed to fetch orders');
            }
        } finally {
            setLoading(false);
        }
    }, [customerId, page, size]);

    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);

    return {
        data,
        pagination,
        loading,
        error,
        refetch: fetchOrders
    };
}
