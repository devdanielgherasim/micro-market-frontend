"use client";

import React from 'react';
import {AuditLogsList} from '@/components/AuditLogsList';
import {AuditLogFilter} from '@/types/audit';
import {AdminRoute} from '@/components/auth/RoleBasedRoute';
import {redirect} from 'next/navigation';

const defaultFilter: AuditLogFilter = {
    page: 1,
    limit: 20,
    startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
};


const AuditPage = () => {
    return (
        <AdminRoute fallback={
            <div className="py-6 sm:py-8 lg:py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h1 className="text-2xl font-bold text-secondary-900 dark:text-white sm:text-3xl mb-4">Access
                        Denied</h1>
                    <p className="text-secondary-500 dark:text-secondary-400 mb-6">
                        You need administrator privileges to access the audit logs.
                    </p>
                    <button
                        onClick={() => redirect('/dashboard')}
                        className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:focus:ring-offset-secondary-900"
                    >
                        Go to Dashboard
                    </button>
                </div>
            </div>
        }>
            <div className="py-6 sm:py-8 lg:py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="sm:flex sm:items-center sm:justify-between mb-6">
                        <div>
                            <h1 className="text-2xl font-bold text-secondary-900 dark:text-white sm:text-3xl">Audit
                                Logs</h1>
                            <p className="mt-2 text-sm text-secondary-500 dark:text-secondary-400">
                                Track all system activities and user actions
                            </p>
                        </div>
                        <div className="mt-4 sm:mt-0">
                            <button
                                type="button"
                                onClick={() => window.location.href = `/api/audit/export`}
                                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:focus:ring-offset-secondary-900"
                            >
                                <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg"
                                     viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd"
                                          d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                                          clipRule="evenodd"/>
                                </svg>
                                Export Logs
                            </button>
                        </div>
                    </div>

                    <AuditLogsList initialFilter={defaultFilter}/>
                </div>
            </div>
        </AdminRoute>
    );
};

export default AuditPage;
