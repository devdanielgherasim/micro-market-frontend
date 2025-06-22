import {API_ENDPOINTS} from '@/config/api';
import {PageResponse} from '@/types';
import {AuditLogEntry, AuditLogFilter, PaginatedAuditResponse} from '@/types/audit';
import {ApiError, fetchWithTimeout} from '@/utils/api';

/**
 * Fetch audit logs with optional filtering
 * @param filter - Optional filter parameters
 * @returns Promise resolving to paginated audit logs
 * @throws ApiError if the request fails
 */
export async function getAuditLogs(filter?: AuditLogFilter): Promise<PaginatedAuditResponse> {
    try {
        const queryParams = new URLSearchParams();
        if (filter) {
            const backendFilter = {...filter};
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

        const response = await fetchWithTimeout<PageResponse<AuditLogEntry>>(url);

        return {
            items: response.content,
            total: response.pagination.totalElements,
            page: response.pagination.page + 1,
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
