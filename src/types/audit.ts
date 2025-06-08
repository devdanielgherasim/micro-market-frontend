// Audit log types and interfaces

/**
 * Possible action types for audit events
 */
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

/**
 * Resource types that can be audited
 */
export type AuditResourceType = 
  | 'product' 
  | 'order' 
  | 'user' 
  | 'customer' 
  | 'session' 
  | 'system' 
  | 'report';

/**
 * Represents a single audit log entry
 */
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

/**
 * Filter options for audit log searches
 */
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

/**
 * Paginated response format for audit logs
 */
export interface PaginatedAuditResponse {
  items: AuditLogEntry[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}
