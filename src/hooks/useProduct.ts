import {useCallback, useEffect, useState} from 'react';

import {getProductById} from '@/services/productService';
import {Product} from '@/types';
import {ApiError} from '@/utils/api';

interface UseProductOptions {
    initialLoad?: boolean;
}

export function useProduct(productId: string, options: UseProductOptions = {}) {
    const {initialLoad = true} = options;

    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState<boolean>(initialLoad);
    const [error, setError] = useState<string | undefined>(undefined);

    const fetchProduct = useCallback(async (): Promise<void> => {
        if (!productId) {
            setError('Product ID is required');
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(undefined);

        try {
            const data = await getProductById(productId);
            setProduct(data);
        } catch (err) {
            console.error(`Failed to fetch product ${productId}:`, err);

            if (err instanceof ApiError) {
                setError(`${err.message}${err.code ? ` (${err.code})` : ''}`);
            } else if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('Failed to fetch product');
            }

            setProduct(null);
        } finally {
            setLoading(false);
        }
    }, [productId]);

    useEffect(() => {
        if (initialLoad) {
            fetchProduct();
        }
    }, [fetchProduct, initialLoad]);

    return {
        product,
        loading,
        error,
        refetch: fetchProduct
    };
}