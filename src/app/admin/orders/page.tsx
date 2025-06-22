import { AdminRoute } from '@/components/auth/RoleBasedRoute';
import { HomePage } from '@/components/features/home/HomePage';

export default function AdminOrdersPage() {
  return (
    <AdminRoute fallback={<div>Redirecting...</div>}>
      <HomePage />
    </AdminRoute>
  );
}