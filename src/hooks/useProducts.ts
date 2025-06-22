import {useCallback, useEffect, useState} from 'react';

import {getProducts} from '@/services/productService';
import {PaginatedApiResponse, PaginationMetadata, Product} from '@/types';
import {ApiError} from '@/utils/api';

interface UseProductsOptions {
    initialPage?: number;
    initialPageSize?: number;
}

export function useProducts(options: UseProductsOptions = {}): PaginatedApiResponse<Product> & {
    refetch: () => Promise<void>;
    goToPage: (page: number) => Promise<void>;
    nextPage: () => Promise<void>;
    prevPage: () => Promise<void>;
} {
    const initialPage = options.initialPage ?? 0;
    const initialPageSize = options.initialPageSize ?? 20;

    const [data, setData] = useState<Product[]>([]);
    const [pagination, setPagination] = useState<PaginationMetadata | undefined>(undefined);
    const [currentPage, setCurrentPage] = useState<number>(initialPage);
    const [pageSize, setPageSize] = useState<number>(initialPageSize);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | undefined>(undefined);

    const fetchProducts = useCallback(async (page: number = currentPage, size: number = pageSize): Promise<void> => {
        setLoading(true);
        setError(undefined);

        try {
            const response = await getProducts(page, size);
            setData(response.content);
            setPagination(response.pagination);
            setCurrentPage(response.pagination.page);
            setPageSize(response.pagination.size);
        } catch (err) {
            console.error('Failed to fetch products:', err);

            if (err instanceof ApiError) {
                setError(`${err.message}${err.code ?? ''}`);
            } else if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('Failed to fetch products');
            }
        } finally {
            setLoading(false);
        }
    }, [currentPage, pageSize]);

    const goToPage = useCallback(async (page: number): Promise<void> => {
        if (page < 0) {
            page = 0;
        }
        if (pagination && page >= pagination.totalPages) {
            page = pagination.totalPages - 1;
        }
        await fetchProducts(page);
    }, [pagination, fetchProducts]);

    const nextPage = useCallback(async (): Promise<void> => {
        if (pagination && !pagination.last) {
            await goToPage(currentPage + 1);
        }
    }, [pagination, currentPage, goToPage]);

    const prevPage = useCallback(async (): Promise<void> => {
        if (pagination && !pagination.first) {
            await goToPage(currentPage - 1);
        }
    }, [pagination, currentPage, goToPage]);

    useEffect(() => {
        fetchProducts(initialPage, initialPageSize);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return {
        data,
        pagination,
        loading,
        error,
        refetch: fetchProducts,
        goToPage,
        nextPage,
        prevPage
    };
}
