import {useCallback, useEffect, useState} from 'react';
import {AuditLogEntry, AuditLogFilter} from '../types/audit';
import {ApiError} from '../utils/api';
import {getAuditLogs} from '../services/auditService';

/**
 * Hook for fetching and filtering audit logs
 * @param initialFilter - Initial filter settings
 * @returns Object containing audit data, loading state, error, and functions to manage filtering and pagination
 */
export function useAuditLogs(initialFilter?: AuditLogFilter) {
    const [data, setData] = useState<AuditLogEntry[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | undefined>(undefined);
    const [filter, setFilter] = useState<AuditLogFilter>(initialFilter || {page: 1, limit: 20});
    const [pagination, setPagination] = useState<{ total: number; hasMore: boolean }>({total: 0, hasMore: false});

    const fetchAuditLogs = useCallback(async (): Promise<void> => {
        setLoading(true);
        setError(undefined);

        try {
            const response = await getAuditLogs(filter);
            setData(response.items);
            setPagination({
                total: response.total,
                hasMore: response.hasMore
            });
        } catch (err) {
            console.error('Failed to fetch audit logs:', err);
            if (err instanceof ApiError) {
                setError(`${err.message}${err.code ? ` (${err.code})` : ''}`);
            } else if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('Failed to fetch audit logs');
            }
        } finally {
            setLoading(false);
        }
    }, [filter]);

    useEffect(() => {
        fetchAuditLogs();
    }, [fetchAuditLogs]);

    // Update filter and trigger re-fetch
    const updateFilter = useCallback((newFilter: Partial<AuditLogFilter>) => {
        setFilter(currentFilter => ({
            ...currentFilter,
            ...newFilter,
            // Reset to page 1 if anything other than page changes
            page: ('page' in newFilter) ? newFilter.page : 1
        }));
    }, []);

    // Go to next page
    const nextPage = useCallback(() => {
        if (pagination.hasMore) {
            setFilter(currentFilter => ({
                ...currentFilter,
                page: (currentFilter.page || 1) + 1
            }));
        }
    }, [pagination.hasMore]);

    // Go to previous page
    const prevPage = useCallback(() => {
        setFilter(currentFilter => ({
            ...currentFilter,
            page: Math.max((currentFilter.page || 1) - 1, 1)
        }));
    }, []);

    // Reset filters to initial state
    const resetFilters = useCallback(() => {
        setFilter(initialFilter || {page: 1, limit: 20});
    }, [initialFilter]);

    return {
        data,
        loading,
        error,
        filter,
        pagination,
        updateFilter,
        nextPage,
        prevPage,
        resetFilters,
        refetch: fetchAuditLogs
    };
}
