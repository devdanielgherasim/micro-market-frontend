export interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    category: string;
    imageUrl?: string;
    isAvailable: boolean;
}

export interface OrderItem {
    id: number;
    productId: number;
    productName: string;
    price: number;
    quantity: number;
    subtotal: number;
}

export interface OrderProduct {
    productId: string;
    productName?: string;
    price?: number;
    quantity: number;
}

export enum OrderStatus {
    CREATED = 'CREATED',
    PAYMENT_PENDING = 'PAYMENT_PENDING',
    PAID = 'PAID',
    SHIPPED = 'SHIPPED',
    DELIVERED = 'DELIVERED',
    CANCELLED = 'CANCELLED',
    RETURNED = 'RETURNED',
    REFUNDED = 'REFUNDED'
}

export interface Order {
    id: number;
    customerId: string;
    orderDate: string;
    totalAmount: number;
    status: OrderStatus;
    items: OrderItem[];
    expirationDate?: string; // Date when the purchased products expire
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

export interface AuditLog {
    id: number;
    timestamp: string;
    action: string;
    entityType: string;
    entityId: string;
    username: string;
    details?: string;
    ipAddress?: string;
    userAgent?: string;
    statusCode?: number;
}
