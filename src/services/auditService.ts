import {AuditLogEntry, AuditLogFilter, PaginatedAuditResponse} from '../types/audit';
import {API_ENDPOINTS} from '../config/api';
import {ApiError, fetchWithTimeout} from '../utils/api';
import {PageResponse} from '../types';

/**
 * Fetch audit logs with optional filtering
 * @param filter - Optional filter parameters
 * @returns Promise resolving to paginated audit logs
 * @throws ApiError if the request fails
 */
export async function getAuditLogs(filter?: AuditLogFilter): Promise<PaginatedAuditResponse> {
    try {
        // Build query string from filter params
        const queryParams = new URLSearchParams();
        if (filter) {
            // Convert 1-based page to 0-based page for backend
            const backendFilter = { ...filter };
            if (backendFilter.page !== undefined) {
                backendFilter.page = Math.max(0, backendFilter.page - 1);
            }

            Object.entries(backendFilter).forEach(([key, value]) => {
                if (value !== undefined && value !== null) {
                    queryParams.append(key, String(value));
                }
            });
        }

        const queryString = queryParams.toString();
        const url = queryString ? `${API_ENDPOINTS.auditLogs}?${queryString}` : API_ENDPOINTS.auditLogs;

        // The backend now returns a PageResponse structure
        const response = await fetchWithTimeout<PageResponse<AuditLogEntry>>(url);

        // Convert PageResponse to PaginatedAuditResponse for backward compatibility
        return {
            items: response.content,
            total: response.pagination.totalElements,
            page: response.pagination.page + 1, // Convert 0-based page to 1-based page for frontend
            limit: response.pagination.size,
            hasMore: !response.pagination.last
        };
    } catch (error) {
        console.error('Error fetching audit logs:', error);
        if (error instanceof ApiError) {
            throw error;
        } else if (error instanceof Error) {
            throw new ApiError(error.message, 500);
        } else {
            throw new ApiError('Failed to fetch audit logs', 500);
        }
    }
}

/**
 * Fetch a single audit log entry by ID
 * @param id - Audit log entry ID
 * @returns Promise resolving to a single audit log entry
 * @throws ApiError if the request fails
 */
export async function getAuditLogById(id: string): Promise<AuditLogEntry> {
    try {
        if (!id) throw new ApiError('Audit log ID is required', 400);
        return await fetchWithTimeout<AuditLogEntry>(`${API_ENDPOINTS.auditLogs}/${id}`);
    } catch (error) {
        console.error(`Error fetching audit log ${id}:`, error);
        if (error instanceof ApiError) {
            throw error;
        } else if (error instanceof Error) {
            throw new ApiError(error.message, 500);
        } else {
            throw new ApiError(`Failed to fetch audit log with ID: ${id}`, 500);
        }
    }
}

/**
 * Export audit logs to CSV
 * @param filter - Optional filter parameters for the logs to export
 * @returns Promise resolving to a blob containing the CSV file
 * @throws ApiError if the request fails
 */
export async function exportAuditLogs(filter?: AuditLogFilter): Promise<Blob> {
    try {
        // Build query string from filter params
        const queryParams = new URLSearchParams();
        if (filter) {
            Object.entries(filter).forEach(([key, value]) => {
                if (value !== undefined && value !== null) {
                    queryParams.append(key, String(value));
                }
            });
        }

        const queryString = queryParams.toString();
        const url = queryString ? `${API_ENDPOINTS.auditLogs}/export?${queryString}` : `${API_ENDPOINTS.auditLogs}/export`;

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Accept': 'text/csv'
            }
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new ApiError(
                errorData.message || `Failed to export audit logs: ${response.status} ${response.statusText}`,
                response.status,
                errorData.code
            );
        }

        return await response.blob();
    } catch (error) {
        console.error('Error exporting audit logs:', error);
        if (error instanceof ApiError) {
            throw error;
        } else if (error instanceof Error) {
            throw new ApiError(error.message, 500);
        } else {
            throw new ApiError('Failed to export audit logs', 500);
        }
    }
}
