import {PageResponse, Product} from '../types';
import {API_ENDPOINTS} from '../config/api';
import {ApiError, fetchWithTimeout, handleApiError} from '../utils/api';

/**
 * Fetches products from the API with pagination
 * @param page - The page number (0-based, default: 0)
 * @param size - The page size (default: 20)
 * @returns Promise resolving to a PageResponse containing products and pagination metadata
 * @throws Error if the request fails
 */
export async function getProducts(page: number = 0, size: number = 20): Promise<PageResponse<Product>> {
    try {
        const url = `${API_ENDPOINTS.products}?page=${page}&size=${size}`;
        return await fetchWithTimeout<PageResponse<Product>>(url);
    } catch (error) {
        if (process.env.NEXT_PUBLIC_API_URL) {
            console.error('Error fetching products:', error);
        }
        if (error instanceof ApiError) {
            throw error;
        } else {
            throw new ApiError(handleApiError(error), 500);
        }
    }
}

/**
 * Fetches a single product by ID
 * @param id - The product ID
 * @returns Promise resolving to a product
 * @throws Error if the request fails
 */
export async function getProductById(id: string): Promise<Product> {
    try {
        if (!id) throw new ApiError('Product ID is required', 400);
        return await fetchWithTimeout<Product>(`${API_ENDPOINTS.products}/${id}`);
    } catch (error) {
        if (process.env.NEXT_PUBLIC_API_URL) {
            console.error(`Error fetching product ${id}:`, error);
        }
        if (error instanceof ApiError) {
            throw error;
        } else {
            throw new ApiError(handleApiError(error), 500);
        }
    }
}

/**
 * Creates a new product
 * @param product - The product data without ID
 * @returns Promise resolving to the created product
 * @throws Error if the request fails
 */
export async function createProduct(product: Omit<Product, 'id'>): Promise<Product> {
    try {
        return await fetchWithTimeout<Product>(API_ENDPOINTS.products, {
            method: 'POST',
            body: JSON.stringify(product)
        });
    } catch (error) {
        if (process.env.NEXT_PUBLIC_API_URL) {
            console.error('Error creating product:', error);
        }
        if (error instanceof ApiError) {
            throw error;
        } else {
            throw new ApiError(handleApiError(error), 500);
        }
    }
}

/**
 * Updates an existing product
 * @param id - The product ID
 * @param product - The product data to update
 * @returns Promise resolving to the updated product
 * @throws Error if the request fails
 */
export async function updateProduct(id: string, product: Partial<Product>): Promise<Product> {
    try {
        if (!id) throw new ApiError('Product ID is required', 400);
        return await fetchWithTimeout<Product>(`${API_ENDPOINTS.products}/${id}`, {
            method: 'PUT',
            body: JSON.stringify(product)
        });
    } catch (error) {
        if (process.env.NEXT_PUBLIC_API_URL) {
            console.error(`Error updating product ${id}:`, error);
        }
        if (error instanceof ApiError) {
            throw error;
        } else {
            throw new ApiError(handleApiError(error), 500);
        }
    }
}

/**
 * Deletes a product
 * @param id - The product ID
 * @returns Promise resolving to void
 * @throws Error if the request fails
 */
export async function deleteProduct(id: string): Promise<void> {
    try {
        if (!id) throw new ApiError('Product ID is required', 400);
        await fetchWithTimeout<void>(`${API_ENDPOINTS.products}/${id}`, {
            method: 'DELETE'
        });
    } catch (error) {
        if (process.env.NEXT_PUBLIC_API_URL) {
            console.error(`Error deleting product ${id}:`, error);
        }
        if (error instanceof ApiError) {
            throw error;
        } else {
            throw new ApiError(handleApiError(error), 500);
        }
    }
}
