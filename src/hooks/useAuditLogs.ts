import {useCallback, useState} from 'react';

import {getAuditLogs} from '@/services/auditService';
import {AuditLogEntry, AuditLogFilter} from '@/types/audit';
import {ApiError} from '@/utils/api';

export function useAuditLogs(initialFilter?: AuditLogFilter) {
    const [data, setData] = useState<AuditLogEntry[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | undefined>(undefined);
    const [filter, setFilter] = useState<AuditLogFilter>(initialFilter || {page: 0, size: 20});
    const [pagination, setPagination] = useState<{ total: number; hasMore: boolean }>({total: 0, hasMore: false});

    const fetchAuditLogs = useCallback(async (): Promise<void> => {
        setLoading(true);
        setError(undefined);

        try {
            const response = await getAuditLogs(filter);
            // Use items array from the response
            setData(response.items);
            setPagination({
                total: response.pagination.totalElements,
                hasMore: !response.pagination.last
            });
        } catch (err) {
            console.error('Failed to fetch audit logs:', err);
            if (err instanceof ApiError) {
                setError(`${err.message}${err.code ?? ''}`);
            } else if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('Failed to fetch audit logs');
            }
        } finally {
            setLoading(false);
        }
    }, [filter]);

    const updateFilter = useCallback((newFilter: Partial<AuditLogFilter>) => {
        setFilter(currentFilter => ({
            ...currentFilter,
            ...newFilter,
            page: ('page' in newFilter) ? newFilter.page : 0
        }));
    }, []);

    const nextPage = useCallback(() => {
        if (pagination.hasMore) {
            setFilter(currentFilter => ({
                ...currentFilter,
                page: (currentFilter.page ?? 0) + 1
            }));
        }
    }, [pagination.hasMore]);

    const prevPage = useCallback(() => {
        setFilter(currentFilter => ({
            ...currentFilter,
            page: Math.max((currentFilter.page ?? 0) - 1, 0)
        }));
    }, []);

    const resetFilters = useCallback(() => {
        setFilter(initialFilter ?? {page: 0, size: 20});
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
