import {API_ENDPOINTS} from '@/config/api';
import {Order, OrderItem, OrderProduct, OrderStatus, Product} from '@/types';
import {ApiError, fetchWithTimeout, handleApiError} from '@/utils/api';

/**
 * Fetches all orders from the API
 * @returns Promise resolving to an array of orders
 * @throws ApiError if the request fails
 */
export async function getOrders(): Promise<Order[]> {
    try {
        return await fetchWithTimeout<Order[]>(API_ENDPOINTS.orders);
    } catch (error) {
        console.error('Error fetching orders:', error);
        throw new ApiError(handleApiError(error), error instanceof ApiError ? error.status : 500);
    }
}

/**
 * Fetches orders for a specific customer
 * @param customerId - The customer ID
 * @returns Promise resolving to an array of orders
 * @throws ApiError if the request fails
 */
export async function getOrdersByCustomer(customerId: string): Promise<Order[]> {
    try {
        if (!customerId) throw new ApiError('Customer ID is required', 400);
        return await fetchWithTimeout<Order[]>(`${API_ENDPOINTS.orders}/customer/${customerId}`);
    } catch (error) {
        console.error(`Error fetching orders for customer ${customerId}:`, error);
        throw new ApiError(handleApiError(error), error instanceof ApiError ? error.status : 500);
    }
}

/**
 * Fetches a single order by ID
 * @param id - The order ID
 * @returns Promise resolving to an order
 * @throws ApiError if the request fails
 */
export async function getOrderById(id: string): Promise<Order> {
    try {
        if (!id) throw new ApiError('Order ID is required', 400);
        return await fetchWithTimeout<Order>(`${API_ENDPOINTS.orders}/${id}`);
    } catch (error) {
        console.error(`Error fetching order ${id}:`, error);
        throw new ApiError(handleApiError(error), error instanceof ApiError ? error.status : 500);
    }
}

export interface CreateOrderRequest {
    customerId: string;
    items?: OrderItem[];
    products?: OrderProduct[];
    expirationDate?: string;
}

export async function createOrder(order: CreateOrderRequest): Promise<Order> {
    try {
        if (!order.customerId) throw new ApiError('Customer ID is required', 400);
        if ((!order.products || order.products.length === 0) && (!order.items || order.items.length === 0)) {
            throw new ApiError('Order must contain at least one product', 400);
        }

        const orderCreateDTO = {
            customerId: order.customerId,
            items: order.items || (order.products ? order.products.map(product => {
                if (!product.productId) throw new ApiError('Product ID is required for each item', 400);
                if (!product.quantity || product.quantity <= 0) throw new ApiError('Quantity must be positive for each item', 400);

                return {
                    productId: product.productId,
                    productName: product.productName ?? 'Unknown Product',
                    price: product.price ?? 1.0,
                    quantity: product.quantity,
                    subtotal: (product.price ?? 1.0) * product.quantity
                };
            }) : [])
        };

        return await fetchWithTimeout<Order>(API_ENDPOINTS.orders, {
            method: 'POST',
            body: JSON.stringify(orderCreateDTO)
        });
    } catch (error) {
        console.error('Error creating order:', error);
        throw new ApiError(handleApiError(error), error instanceof ApiError ? error.status : 500);
    }
}

export async function updateOrderStatus(id: string, status: OrderStatus): Promise<Order> {
    try {
        if (!id) throw new ApiError('Order ID is required', 400);
        return await fetchWithTimeout<Order>(`${API_ENDPOINTS.orders}/${id}/status/${status}`, {
            method: 'PATCH'
        });
    } catch (error) {
        console.error(`Error updating order status ${id}:`, error);
        throw new ApiError(handleApiError(error), error instanceof ApiError ? error.status : 500);
    }
}

export async function updateOrder(id: string, order: Partial<Order>): Promise<Order> {
    try {
        if (!id) throw new ApiError('Order ID is required', 400);

        const orderUpdateDTO = {
            customerId: order.customerId,
            status: order.status,
            items: order.items?.map(item => ({
                productId: item.productId,
                productName: item.productName,
                price: item.price,
                quantity: item.quantity
            }))
        };

        return await fetchWithTimeout<Order>(`${API_ENDPOINTS.orders}/${id}`, {
            method: 'PUT',
            body: JSON.stringify(orderUpdateDTO)
        });
    } catch (error) {
        console.error(`Error updating order ${id}:`, error);
        throw new ApiError(handleApiError(error), error instanceof ApiError ? error.status : 500);
    }
}

export async function deleteOrder(id: string): Promise<void> {
    try {
        if (!id) throw new ApiError('Order ID is required', 400);
        await fetchWithTimeout<void>(`${API_ENDPOINTS.orders}/${id}`, {
            method: 'DELETE'
        });
    } catch (error) {
        console.error(`Error deleting order ${id}:`, error);
        throw new ApiError(handleApiError(error), error instanceof ApiError ? error.status : 500);
    }
}

export async function purchaseProduct(
    product: Product,
    customerId: string,
    quantity: number = 1
): Promise<Order> {
    try {
        if (!product) throw new ApiError('Product is required', 400);
        if (!customerId) throw new ApiError('Customer ID is required', 400);
        if (!product.isAvailable) throw new ApiError('Product is out of stock', 400);
        if (quantity <= 0) throw new ApiError('Quantity must be greater than 0', 400);

        const orderProduct: OrderProduct = {
            productId: product.id,
            quantity: quantity
        };

        const expirationDate = new Date();
        expirationDate.setDate(expirationDate.getDate() + 30);

        const order: CreateOrderRequest = {
            customerId,
            products: [orderProduct],
            expirationDate: expirationDate.toISOString(),
        };

        return await createOrder(order);
    } catch (error) {
        console.error('Error purchasing product:', error);
        throw new ApiError(handleApiError(error), error instanceof ApiError ? error.status : 500);
    }
}
