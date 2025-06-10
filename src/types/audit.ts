export type AuditActionType =
    | 'login'
    | 'logout'
    | 'create'
    | 'update'
    | 'delete'
    | 'view'
    | 'export'
    | 'import'
    | 'permission_change';

export type AuditResourceType =
    | 'product'
    | 'order'
    | 'user'
    | 'customer'
    | 'session'
    | 'system'
    | 'report';

export interface AuditLogEntry {
    id: string;
    timestamp: string;
    userId: string;
    username: string;
    ipAddress: string;
    action: AuditActionType;
    resourceType: AuditResourceType;
    resourceId?: string;
    details?: string;
    status: 'success' | 'failure';
    statusCode?: number;
    userAgent?: string;
}

export interface AuditLogFilter {
    startDate?: string;
    endDate?: string;
    userId?: string;
    action?: AuditActionType;
    resourceType?: AuditResourceType;
    resourceId?: string;
    status?: 'success' | 'failure';
    page?: number;
    limit?: number;
}

export interface PaginatedAuditResponse {
    items: AuditLogEntry[];
    total: number;
    page: number;
    limit: number;
    hasMore: boolean;
}
