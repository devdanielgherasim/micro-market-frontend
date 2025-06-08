// Type definitions for the application

// Product types
export interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    category: string;
    imageUrl?: string;
    inStock: boolean;
}

export interface OrderProduct {
    productId: string;
    quantity: number;
}


export interface ShippingAddress {
    street: string;
    city: string;
    zipCode: string;
}

export interface Order {
    id: string;
    customerId: string;
    products: OrderProduct[];
    status: 'pending' | 'processing' | 'shipped' | 'completed' | 'cancelled';
    totalAmount: number;
    orderDate: string;
    expirationDate?: string; // Date when the purchased products expire
    shippingAddress?: ShippingAddress;
}

export interface ApiResponse<T> {
    data: T;
    error?: string;
    loading: boolean;
}

// API error response format from the server
export interface ApiErrorResponse {
    message: string;
    status: number;
    code?: string;
}

export interface User {
    id: string;
    username: string;
    email: string;
    firstName?: string;
    lastName?: string;
    roles: string[];
}

export interface AuthState {
    isAuthenticated: boolean;
    user: User | null;
    token: string | null;
    loading: boolean;
    error: string | null;
}
