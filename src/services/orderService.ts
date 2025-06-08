import {Order, OrderProduct, Product} from '../types';
import {API_ENDPOINTS} from '../config/api';
import {ApiError, fetchWithTimeout, handleApiError} from '../utils/api';

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

/**
 * Creates a new order
 * @param order - The order data without ID
 * @returns Promise resolving to the created order
 * @throws ApiError if the request fails
 */
export async function createOrder(order: Omit<Order, 'id' | 'orderDate'>): Promise<Order> {
    try {
        // Convert the frontend order format to the backend OrderCreateDTO format
        const orderCreateDTO = {
            customerId: order.customerId,
            shippingAddress: order.shippingAddress ? 
                `${order.shippingAddress.street}, ${order.shippingAddress.city}, ${order.shippingAddress.zipCode}` : 
                '',
            billingAddress: '',  // Default to empty if not provided
            paymentMethod: 'credit_card',  // Default payment method
            paymentId: '',  // Default to empty if not provided
            items: order.products.map(product => ({
                productId: parseInt(product.productId),  // Convert string ID to number
                productName: '',  // Will be filled by backend
                price: 0,  // Will be calculated by backend
                quantity: product.quantity
            }))
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

/**
 * Updates an order's status
 * @param id - The order ID
 * @param status - The new status
 * @returns Promise resolving to the updated order
 * @throws ApiError if the request fails
 */
export async function updateOrderStatus(id: string, status: Order['status']): Promise<Order> {
    try {
        if (!id) throw new ApiError('Order ID is required', 400);
        return await fetchWithTimeout<Order>(`${API_ENDPOINTS.orders}/${id}/status/${status}`, {
            method: 'PATCH'
        });
    } catch (error) {
        console.error(`Error updating order ${id}:`, error);
        throw new ApiError(handleApiError(error), error instanceof ApiError ? error.status : 500);
    }
}

/**
 * Purchases a product for a customer
 * @param product - The product to purchase
 * @param customerId - The customer ID
 * @param quantity - The quantity to purchase (default: 1)
 * @returns Promise resolving to the created order
 * @throws ApiError if the request fails
 */
export async function purchaseProduct(
    product: Product, 
    customerId: string, 
    quantity: number = 1
): Promise<Order> {
    try {
        if (!product) throw new ApiError('Product is required', 400);
        if (!customerId) throw new ApiError('Customer ID is required', 400);
        if (!product.inStock) throw new ApiError('Product is out of stock', 400);
        if (quantity <= 0) throw new ApiError('Quantity must be greater than 0', 400);

        const orderProduct: OrderProduct = {
            productId: product.id,
            quantity: quantity
        };

        // Calculate expiration date (30 days from now)
        const expirationDate = new Date();
        expirationDate.setDate(expirationDate.getDate() + 30);

        // Create order with required fields for the backend
        const order: Omit<Order, 'id' | 'orderDate'> = {
            customerId,
            products: [orderProduct],
            status: 'pending',  // Use 'pending' instead of 'completed' as initial status
            totalAmount: product.price * quantity,
            expirationDate: expirationDate.toISOString(),
            // Add empty shippingAddress to satisfy the backend requirements
            shippingAddress: {
                street: '',
                city: '',
                zipCode: ''
            }
        };

        return await createOrder(order);
    } catch (error) {
        console.error('Error purchasing product:', error);
        throw new ApiError(handleApiError(error), error instanceof ApiError ? error.status : 500);
    }
}
