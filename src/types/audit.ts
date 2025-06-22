export type AuditActionType =
    | 'CREATE'
    | 'UPDATE'
    | 'DELETE'
    | 'LOGIN'
    | 'LOGOUT'
    | 'VIEW'
    | 'EXPORT'
    | 'IMPORT'
    | 'PERMISSION_CHANGE';

export type AuditEntityType =
    | 'Product'
    | 'Order'
    | 'User'
    | 'Customer'
    | 'Session'
    | 'System'
    | 'Report';

export interface AuditLogEntry {
    id: number;
    timestamp: string;
    username: string;
    action: AuditActionType;
    entityType: AuditEntityType;
    entityId?: string;
    details?: string;
    ipAddress?: string;
    userAgent?: string;
    statusCode?: number;
}

export interface AuditLogFilter {
    startDate?: string;
    endDate?: string;
    username?: string;
    action?: AuditActionType;
    entityType?: AuditEntityType;
    entityId?: string;
    page?: number;
    size?: number;
}

export interface PaginationMetadata {
    size: number;
    last: boolean;
    totalPages: number;
    page: number;
    first: boolean;
    totalElements: number;
}

export interface Pagination {
    metadata: PaginationMetadata;
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
    first: boolean;
    last: boolean;
}

export interface PaginatedAuditResponse {
    items: AuditLogEntry[];
    content: AuditLogEntry[];
    pagination: Pagination;
}
