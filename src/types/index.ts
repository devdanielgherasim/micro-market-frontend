export interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    category: string;
    version: string;
    releaseDate: string;
    publisher: string;
    features: string;
    requirements: string;
    imageUrl?: string;
    available: boolean;
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

export interface PaginationMetadata {
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
    first: boolean;
    last: boolean;
}

export interface PageResponse<T> {
    content: T[];
    pagination: PaginationMetadata;
}

export interface PaginatedApiResponse<T> extends ApiResponse<T[]> {
    pagination?: PaginationMetadata;
}

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
