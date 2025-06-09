import { AdminRoute } from '@/components/auth/RoleBasedRoute';

export default function AdminAuditPage() {
  return (
    <AdminRoute fallback={<div>Redirecting...</div>}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Audit Logs</h1>
        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow dark:shadow-gray-700 rounded-lg p-6">
          {/* Audit logs content will be loaded here */}
          <p className="text-gray-600 dark:text-gray-300">Loading audit logs...</p>
        </div>
      </div>
    </AdminRoute>
  );
}