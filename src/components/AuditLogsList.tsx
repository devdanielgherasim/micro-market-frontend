import React from 'react';
import {useAuditLogs} from '@/hooks/useAuditLogs';
import {AuditActionType, AuditLogFilter, AuditResourceType} from '@/types/audit';

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

    // Format timestamp to locale date and time
    const formatTimestamp = (timestamp: string): string => {
        const date = new Date(timestamp);
        return date.toLocaleString();
    };

    // Get appropriate status badge class
    const getStatusBadgeClass = (status: 'success' | 'failure'): string => {
        return status === 'success'
            ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
            : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
    };

    // Get appropriate action badge class
    const getActionBadgeClass = (action: AuditActionType): string => {
        switch (action) {
            case 'create':
                return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
            case 'update':
                return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
            case 'delete':
                return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
            case 'login':
            case 'logout':
                return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400';
            case 'view':
                return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
            case 'export':
            case 'import':
                return 'bg-teal-100 text-teal-800 dark:bg-teal-900/20 dark:text-teal-400';
            case 'permission_change':
                return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400';
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
        }
    };

    // Available action types for the filter
    const actionTypes: AuditActionType[] = [
        'login', 'logout', 'create', 'update', 'delete', 'view', 'export', 'import', 'permission_change'
    ];

    // Available resource types for the filter
    const resourceTypes: AuditResourceType[] = [
        'product', 'order', 'user', 'customer', 'session', 'system', 'report'
    ];

    return (
        <div className="space-y-6">
            <div
                className="bg-white dark:bg-secondary-800 shadow-sm rounded-lg border border-secondary-200 dark:border-secondary-700 overflow-hidden">
                <div className="p-4 border-b border-secondary-200 dark:border-secondary-700">
                    <h3 className="text-lg font-medium text-secondary-900 dark:text-white">Filters</h3>
                </div>
                <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label htmlFor="startDate"
                               className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">Start
                            Date</label>
                        <input
                            type="date"
                            id="startDate"
                            value={filter.startDate ?? ''}
                            onChange={(e) => updateFilter({startDate: e.target.value || undefined})}
                            className="w-full rounded-md border-secondary-300 dark:border-secondary-700 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm dark:bg-secondary-900 dark:text-white"
                        />
                    </div>
                    <div>
                        <label htmlFor="endDate"
                               className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">End
                            Date</label>
                        <input
                            type="date"
                            id="endDate"
                            value={filter.endDate ?? ''}
                            onChange={(e) => updateFilter({endDate: e.target.value || undefined})}
                            className="w-full rounded-md border-secondary-300 dark:border-secondary-700 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm dark:bg-secondary-900 dark:text-white"
                        />
                    </div>
                    {/* Action Type */}
                    <div>
                        <label htmlFor="action"
                               className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">Action
                            Type</label>
                        <select
                            id="action"
                            value={filter.action ?? ''}
                            onChange={(e) => updateFilter({action: (e.target.value || undefined) as AuditActionType | undefined})}
                            className="w-full rounded-md border-secondary-300 dark:border-secondary-700 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm dark:bg-secondary-900 dark:text-white"
                        >
                            <option value="">All Actions</option>
                            {actionTypes.map(action => (
                                <option key={action} value={action}>
                                    {action.charAt(0).toUpperCase() + action.slice(1).replace('_', ' ')}
                                </option>
                            ))}
                        </select>
                    </div>
                    {/* Resource Type */}
                    <div>
                        <label htmlFor="resourceType"
                               className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">Resource
                            Type</label>
                        <select
                            id="resourceType"
                            value={filter.resourceType ?? ''}
                            onChange={(e) => updateFilter({resourceType: (e.target.value || undefined) as AuditResourceType | undefined})}
                            className="w-full rounded-md border-secondary-300 dark:border-secondary-700 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm dark:bg-secondary-900 dark:text-white"
                        >
                            <option value="">All Resources</option>
                            {resourceTypes.map(type => (
                                <option key={type} value={type}>
                                    {type.charAt(0).toUpperCase() + type.slice(1)}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="resourceId"
                               className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">Resource
                            ID</label>
                        <input
                            type="text"
                            id="resourceId"
                            placeholder="Enter resource ID"
                            value={filter.resourceId ?? ''}
                            onChange={(e) => updateFilter({resourceId: e.target.value || undefined})}
                            className="w-full rounded-md border-secondary-300 dark:border-secondary-700 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm dark:bg-secondary-900 dark:text-white"
                        />
                    </div>
                    <div>
                        <label htmlFor="userId"
                               className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">User
                            ID</label>
                        <input
                            type="text"
                            id="userId"
                            placeholder="Enter user ID"
                            value={filter.userId ?? ''}
                            onChange={(e) => updateFilter({userId: e.target.value || undefined})}
                            className="w-full rounded-md border-secondary-300 dark:border-secondary-700 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm dark:bg-secondary-900 dark:text-white"
                        />
                    </div>
                </div>
                <div
                    className="px-4 py-3 bg-secondary-50 dark:bg-secondary-900 text-right flex justify-end space-x-3 border-t border-secondary-200 dark:border-secondary-700">
                    <button
                        onClick={resetFilters}
                        className="px-3 py-1.5 border border-secondary-300 dark:border-secondary-600 text-secondary-700 dark:text-secondary-300 bg-white dark:bg-secondary-800 hover:bg-secondary-50 dark:hover:bg-secondary-700 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-1 dark:focus:ring-offset-secondary-900"
                    >
                        Reset
                    </button>
                    <button
                        onClick={() => refetch()}
                        className="px-3 py-1.5 bg-primary-600 text-white hover:bg-primary-700 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-1 dark:focus:ring-offset-secondary-900"
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
                        <table className="min-w-full divide-y divide-secondary-200 dark:divide-secondary-700">
                            <thead className="bg-secondary-50 dark:bg-secondary-900/50">
                            <tr>
                                <th scope="col"
                                    className="px-6 py-3 text-left text-xs font-medium text-secondary-500 dark:text-secondary-400 uppercase tracking-wider">Time
                                </th>
                                <th scope="col"
                                    className="px-6 py-3 text-left text-xs font-medium text-secondary-500 dark:text-secondary-400 uppercase tracking-wider">User
                                </th>
                                <th scope="col"
                                    className="px-6 py-3 text-left text-xs font-medium text-secondary-500 dark:text-secondary-400 uppercase tracking-wider">Action
                                </th>
                                <th scope="col"
                                    className="px-6 py-3 text-left text-xs font-medium text-secondary-500 dark:text-secondary-400 uppercase tracking-wider">Resource
                                </th>
                                <th scope="col"
                                    className="px-6 py-3 text-left text-xs font-medium text-secondary-500 dark:text-secondary-400 uppercase tracking-wider">Status
                                </th>
                                <th scope="col"
                                    className="px-6 py-3 text-left text-xs font-medium text-secondary-500 dark:text-secondary-400 uppercase tracking-wider">Details
                                </th>
                            </tr>
                            </thead>
                            <tbody
                                className="bg-white dark:bg-secondary-800 divide-y divide-secondary-200 dark:divide-secondary-700">
                            {auditLogs.map((log) => (
                                <tr key={log.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-500 dark:text-secondary-400">
                                        {formatTimestamp(log.timestamp)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-900 dark:text-white">
                                        {log.username}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getActionBadgeClass(log.action)}`}>
                        {log.action.replace('_', ' ')}
                      </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-500 dark:text-secondary-400">
                                        {`${log.resourceType}${log.resourceId ?? ''}`}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(log.status)}`}>
                        {log.status}
                      </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-500 dark:text-secondary-400 max-w-xs truncate">
                                        {log.details ?? '-'}
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>

                    <div
                        className="px-4 py-3 flex items-center justify-between border-t border-secondary-200 dark:border-secondary-700 sm:px-6">
                        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                            <div>
                                <p className="text-sm text-secondary-700 dark:text-secondary-300">
                                    Showing <span className="font-medium">{auditLogs.length}</span> results of <span
                                    className="font-medium">{pagination.total}</span> total
                                </p>
                            </div>
                            <div>
                                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                                     aria-label="Pagination">
                                    <button
                                        onClick={prevPage}
                                        disabled={(filter.page ?? 1) <= 1}
                                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-secondary-300 dark:border-secondary-700 bg-white dark:bg-secondary-800 text-sm font-medium text-secondary-500 dark:text-secondary-400 hover:bg-secondary-50 dark:hover:bg-secondary-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <span className="sr-only">Previous</span>
                                        <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"
                                             fill="currentColor" aria-hidden="true">
                                            <path fillRule="evenodd"
                                                  d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                                                  clipRule="evenodd"/>
                                        </svg>
                                    </button>
                                    <div
                                        className="relative inline-flex items-center px-4 py-2 border border-secondary-300 dark:border-secondary-700 bg-white dark:bg-secondary-800 text-sm font-medium text-secondary-700 dark:text-secondary-300">
                                        Page {filter.page ?? 1}
                                    </div>
                                    <button
                                        onClick={nextPage}
                                        disabled={!pagination.hasMore}
                                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-secondary-300 dark:border-secondary-700 bg-white dark:bg-secondary-800 text-sm font-medium text-secondary-500 dark:text-secondary-400 hover:bg-secondary-50 dark:hover:bg-secondary-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <span className="sr-only">Next</span>
                                        <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"
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
                </div>
            )}
        </div>
    );
};
