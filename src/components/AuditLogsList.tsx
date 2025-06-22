import React, {useEffect} from 'react';

import {useAuditLogs} from '@/hooks/useAuditLogs';
import {AuditActionType, AuditEntityType, AuditLogFilter} from '@/types/audit';

interface AuditLogsListProps {
    initialFilter?: AuditLogFilter;
}

export const AuditLogsList: React.FC<AuditLogsListProps> = ({initialFilter}) => {
    const {
        data: auditLogs,
        loading,
        error,
        filter,
        pagination,
        updateFilter,
        nextPage,
        prevPage,
        resetFilters,
        refetch
    } = useAuditLogs(initialFilter);

    // Initial data load when component mounts
    useEffect(() => {
        refetch();
    }, []);

    const formatTimestamp = (timestamp: string): string => {
        const date = new Date(timestamp);
        return date.toLocaleString();
    };

    const getActionBadgeClass = (action: AuditActionType): string => {
        switch (action) {
            case 'CREATE':
                return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
            case 'UPDATE':
                return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
            case 'DELETE':
                return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
            case 'LOGIN':
            case 'LOGOUT':
                return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400';
            case 'VIEW':
                return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
            case 'EXPORT':
            case 'IMPORT':
                return 'bg-teal-100 text-teal-800 dark:bg-teal-900/20 dark:text-teal-400';
            case 'PERMISSION_CHANGE':
                return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400';
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
        }
    };

    const actionTypes: AuditActionType[] = [
        'CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'VIEW', 'EXPORT', 'IMPORT', 'PERMISSION_CHANGE'
    ];

    const entityTypes: AuditEntityType[] = [
        'Product', 'Order', 'User', 'Customer', 'Session', 'System', 'Report'
    ];

    return (
        <div className="space-y-6">
            <div
                className="bg-white dark:bg-secondary-800 shadow-sm rounded-lg border border-secondary-200 dark:border-secondary-700 overflow-hidden">
                <div className="p-4 border-b border-secondary-200 dark:border-secondary-700">
                    <h3 className="text-lg font-medium text-secondary-900 dark:text-white">Filters</h3>
                </div>
                <div className="p-3 sm:p-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                        <div>
                            <label htmlFor="action"
                                   className="block text-xs sm:text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">Action
                                Type</label>
                            <select
                                id="action"
                                value={filter.action ?? ''}
                                onChange={(e) => updateFilter({action: (e.target.value || undefined) as AuditActionType | undefined})}
                                className="w-full rounded-md border-secondary-300 dark:border-secondary-700 shadow-sm focus:border-primary-500 focus:ring-primary-500 text-xs sm:text-sm dark:bg-secondary-900 dark:text-white h-9 sm:h-10"
                            >
                                <option value="">All Actions</option>
                                {actionTypes.map(action => (
                                    <option key={action} value={action}>
                                        {action}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="entityType"
                                   className="block text-xs sm:text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">Entity
                                Type</label>
                            <select
                                id="entityType"
                                value={filter.entityType ?? ''}
                                onChange={(e) => updateFilter({entityType: (e.target.value || undefined) as AuditEntityType | undefined})}
                                className="w-full rounded-md border-secondary-300 dark:border-secondary-700 shadow-sm focus:border-primary-500 focus:ring-primary-500 text-xs sm:text-sm dark:bg-secondary-900 dark:text-white h-9 sm:h-10"
                            >
                                <option value="">All Entities</option>
                                {entityTypes.map(type => (
                                    <option key={type} value={type}>
                                        {type}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="username"
                                   className="block text-xs sm:text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">
                                Username
                            </label>
                            <input
                                type="text"
                                id="username"
                                value={filter.username ?? ''}
                                onChange={(e) => updateFilter({username: e.target.value || undefined})}
                                className="w-full rounded-md border-secondary-300 dark:border-secondary-700 shadow-sm focus:border-primary-500 focus:ring-primary-500 text-xs sm:text-sm dark:bg-secondary-900 dark:text-white h-9 sm:h-10"
                                placeholder="Filter by username"
                            />
                        </div>
                        <div>
                            <label htmlFor="entityId"
                                   className="block text-xs sm:text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">
                                Entity ID
                            </label>
                            <input
                                type="text"
                                id="entityId"
                                value={filter.entityId ?? ''}
                                onChange={(e) => updateFilter({entityId: e.target.value || undefined})}
                                className="w-full rounded-md border-secondary-300 dark:border-secondary-700 shadow-sm focus:border-primary-500 focus:ring-primary-500 text-xs sm:text-sm dark:bg-secondary-900 dark:text-white h-9 sm:h-10"
                                placeholder="Filter by entity ID"
                            />
                        </div>
                        <div>
                            <label htmlFor="startDate"
                                   className="block text-xs sm:text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">
                                Start Date
                            </label>
                            <input
                                type="datetime-local"
                                id="startDate"
                                value={filter.startDate ?? ''}
                                onChange={(e) => updateFilter({startDate: e.target.value || undefined})}
                                className="w-full rounded-md border-secondary-300 dark:border-secondary-700 shadow-sm focus:border-primary-500 focus:ring-primary-500 text-xs sm:text-sm dark:bg-secondary-900 dark:text-white h-9 sm:h-10"
                            />
                        </div>
                        <div>
                            <label htmlFor="endDate"
                                   className="block text-xs sm:text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">
                                End Date
                            </label>
                            <input
                                type="datetime-local"
                                id="endDate"
                                value={filter.endDate ?? ''}
                                onChange={(e) => updateFilter({endDate: e.target.value || undefined})}
                                className="w-full rounded-md border-secondary-300 dark:border-secondary-700 shadow-sm focus:border-primary-500 focus:ring-primary-500 text-xs sm:text-sm dark:bg-secondary-900 dark:text-white h-9 sm:h-10"
                            />
                        </div>
                    </div>
                </div>
                <div
                    className="px-3 sm:px-4 py-3 bg-secondary-50 dark:bg-secondary-900 flex flex-col sm:flex-row sm:justify-end space-y-2 sm:space-y-0 sm:space-x-3 border-t border-secondary-200 dark:border-secondary-700">
                    <button
                        onClick={() => {
                            resetFilters();
                            // After resetting filters, we need to fetch data again
                            setTimeout(() => refetch(), 0);
                        }}
                        className="w-full sm:w-auto px-3 py-2 sm:py-1.5 border border-secondary-300 dark:border-secondary-600 text-secondary-700 dark:text-secondary-300 bg-white dark:bg-secondary-800 hover:bg-secondary-50 dark:hover:bg-secondary-700 rounded-md text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-1 dark:focus:ring-offset-secondary-900 min-h-[36px] sm:min-h-0"
                    >
                        Reset Filters
                    </button>
                    <button
                        onClick={() => refetch()}
                        className="w-full sm:w-auto px-3 py-2 sm:py-1.5 bg-primary-600 text-white hover:bg-primary-700 rounded-md text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-1 dark:focus:ring-offset-secondary-900 min-h-[36px] sm:min-h-0"
                    >
                        Apply Filters
                    </button>
                </div>
            </div>

            {error && (
                <div
                    className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-3 sm:px-4 py-2 sm:py-3 rounded-lg text-sm relative shadow-sm"
                    role="alert">
                    <strong className="font-semibold">Error: </strong>
                    <span className="block sm:inline">{error}</span>
                </div>
            )}

            {loading && !auditLogs.length && (
                <div className="flex justify-center items-center py-6 sm:py-8 md:py-10">
                    <div
                        className="animate-spin rounded-full h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 border-2 border-primary-500 dark:border-primary-400 border-t-transparent shadow-md"></div>
                </div>
            )}

            {!loading && auditLogs.length === 0 ? (
                <div
                    className="text-center py-6 sm:py-8 md:py-10 text-sm sm:text-base text-secondary-500 dark:text-secondary-400 bg-secondary-50 dark:bg-secondary-800/50 rounded-lg shadow-sm p-4 sm:p-6">
                    <svg className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 text-secondary-400 dark:text-secondary-500"
                         fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                    </svg>
                    <p>No audit logs found for the selected filters.</p>
                    <button
                        onClick={resetFilters}
                        className="mt-4 px-4 py-2 bg-primary-100 hover:bg-primary-200 text-primary-700 dark:bg-primary-900/30 dark:hover:bg-primary-800/40 dark:text-primary-300 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-secondary-900"
                    >
                        Reset Filters
                    </button>
                </div>
            ) : (
                <div
                    className="bg-white dark:bg-secondary-800 shadow-sm rounded-lg border border-secondary-200 dark:border-secondary-700 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table
                            className="min-w-full divide-y divide-secondary-200 dark:divide-secondary-700 hidden md:table">
                            <thead className="bg-secondary-50 dark:bg-secondary-900/50">
                            <tr>
                                <th scope="col"
                                    className="px-3 sm:px-4 md:px-6 py-2 md:py-3 text-left text-xs font-medium text-secondary-500 dark:text-secondary-400 uppercase tracking-wider">Time
                                </th>
                                <th scope="col"
                                    className="px-3 sm:px-4 md:px-6 py-2 md:py-3 text-left text-xs font-medium text-secondary-500 dark:text-secondary-400 uppercase tracking-wider">User
                                </th>
                                <th scope="col"
                                    className="px-3 sm:px-4 md:px-6 py-2 md:py-3 text-left text-xs font-medium text-secondary-500 dark:text-secondary-400 uppercase tracking-wider">Action
                                </th>
                                <th scope="col"
                                    className="px-3 sm:px-4 md:px-6 py-2 md:py-3 text-left text-xs font-medium text-secondary-500 dark:text-secondary-400 uppercase tracking-wider">Entity
                                </th>
                                <th scope="col"
                                    className="px-3 sm:px-4 md:px-6 py-2 md:py-3 text-left text-xs font-medium text-secondary-500 dark:text-secondary-400 uppercase tracking-wider">Details
                                </th>
                            </tr>
                            </thead>
                            <tbody
                                className="bg-white dark:bg-secondary-800 divide-y divide-secondary-200 dark:divide-secondary-700">
                            {auditLogs.map((log) => (
                                <tr key={log.id}>
                                    <td className="px-3 sm:px-4 md:px-6 py-2 md:py-4 whitespace-nowrap text-xs sm:text-sm text-secondary-500 dark:text-secondary-400">
                                        {formatTimestamp(log.timestamp)}
                                    </td>
                                    <td className="px-3 sm:px-4 md:px-6 py-2 md:py-4 whitespace-nowrap text-xs sm:text-sm text-secondary-900 dark:text-white">
                                        {log.username}
                                    </td>
                                    <td className="px-3 sm:px-4 md:px-6 py-2 md:py-4 whitespace-nowrap text-xs sm:text-sm">
                                      <span
                                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getActionBadgeClass(log.action)}`}>
                                        {log.action}
                                      </span>
                                    </td>
                                    <td className="px-3 sm:px-4 md:px-6 py-2 md:py-4 whitespace-nowrap text-xs sm:text-sm text-secondary-500 dark:text-secondary-400">
                                        {`${log.entityType}${log.entityId ? ': ' + log.entityId : ''}`}
                                    </td>
                                    <td className="px-3 sm:px-4 md:px-6 py-2 md:py-4 whitespace-nowrap text-xs sm:text-sm text-secondary-500 dark:text-secondary-400 max-w-xs truncate">
                                        {log.details ?? '-'}
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>

                        <div className="md:hidden space-y-3">
                            {auditLogs.map((log) => (
                                <div key={log.id}
                                     className="bg-white dark:bg-secondary-800 rounded-lg shadow-sm p-3 border border-secondary-200 dark:border-secondary-700">
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="text-xs text-secondary-500 dark:text-secondary-400">
                                            {formatTimestamp(log.timestamp)}
                                        </span>
                                        <span
                                            className={`px-2 py-0.5 text-xs leading-5 font-semibold rounded-full ${getActionBadgeClass(log.action)}`}>
                                            {log.action}
                                        </span>
                                    </div>
                                    <div className="space-y-1">
                                        <div className="flex justify-between">
                                            <span
                                                className="text-xs font-medium text-secondary-500 dark:text-secondary-400">User:</span>
                                            <span
                                                className="text-xs text-secondary-900 dark:text-white">{log.username}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span
                                                className="text-xs font-medium text-secondary-500 dark:text-secondary-400">Entity:</span>
                                            <span className="text-xs text-secondary-500 dark:text-secondary-400">
                                                {`${log.entityType}${log.entityId ? ': ' + log.entityId : ''}`}
                                            </span>
                                        </div>
                                        {log.details && (
                                            <div
                                                className="mt-2 pt-2 border-t border-secondary-200 dark:border-secondary-700">
                                                <span
                                                    className="text-xs font-medium text-secondary-500 dark:text-secondary-400 block mb-1">Details:</span>
                                                <p className="text-xs text-secondary-500 dark:text-secondary-400 break-words">
                                                    {log.details}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div
                        className="px-4 py-3 flex flex-col sm:flex-row items-center justify-between border-t border-secondary-200 dark:border-secondary-700 sm:px-6 space-y-3 sm:space-y-0">
                        <div className="text-center sm:text-left">
                            <p className="text-xs sm:text-sm text-secondary-700 dark:text-secondary-300">
                                Showing <span className="font-medium">{auditLogs.length}</span> results of <span
                                className="font-medium">{pagination.total}</span> total
                            </p>
                        </div>
                        <div>
                            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                                 aria-label="Pagination">
                                <button
                                    onClick={prevPage}
                                    disabled={(filter.page ?? 0) <= 0}
                                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-secondary-300 dark:border-secondary-700 bg-white dark:bg-secondary-800 text-sm font-medium text-secondary-500 dark:text-secondary-400 hover:bg-secondary-50 dark:hover:bg-secondary-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <span className="sr-only">Previous</span>
                                    <svg className="h-4 w-4 sm:h-5 sm:w-5" xmlns="http://www.w3.org/2000/svg"
                                         viewBox="0 0 20 20"
                                         fill="currentColor" aria-hidden="true">
                                        <path fillRule="evenodd"
                                              d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                                              clipRule="evenodd"/>
                                    </svg>
                                </button>
                                <div
                                    className="relative inline-flex items-center px-2 sm:px-4 py-2 border border-secondary-300 dark:border-secondary-700 bg-white dark:bg-secondary-800 text-xs sm:text-sm font-medium text-secondary-700 dark:text-secondary-300">
                                    Page {(filter.page ?? 0) + 1}
                                </div>
                                <button
                                    onClick={nextPage}
                                    disabled={!pagination.hasMore}
                                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-secondary-300 dark:border-secondary-700 bg-white dark:bg-secondary-800 text-sm font-medium text-secondary-500 dark:text-secondary-400 hover:bg-secondary-50 dark:hover:bg-secondary-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <span className="sr-only">Next</span>
                                    <svg className="h-4 w-4 sm:h-5 sm:w-5" xmlns="http://www.w3.org/2000/svg"
                                         viewBox="0 0 20 20"
                                         fill="currentColor" aria-hidden="true">
                                        <path fillRule="evenodd"
                                              d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                                              clipRule="evenodd"/>
                                    </svg>
                                </button>
                            </nav>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
