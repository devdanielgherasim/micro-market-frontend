import {useCallback, useEffect, useState} from 'react';
import {ApiResponse, Product} from '../types';
import {getProducts} from '../services/productService';
import {ApiError} from '../utils/api';


export function useProducts(): ApiResponse<Product[]> & { refetch: () => Promise<void> } {
    const [data, setData] = useState<Product[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | undefined>(undefined);

    const fetchProducts = useCallback(async (): Promise<void> => {
        setLoading(true);
        setError(undefined);

        try {
            const products = await getProducts();
            setData(products);
        } catch (err) {
            console.error('Failed to fetch products:', err);

            if (err instanceof ApiError) {
                setError(`${err.message}${err.code ? ` (${err.code})` : ''}`);
            } else if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('Failed to fetch products');
            }
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    return {
        data,
        loading,
        error,
        refetch: fetchProducts
    };
}