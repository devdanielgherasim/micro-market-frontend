import {AdminRoute} from '@/components/auth/RoleBasedRoute';
import {HomePage} from '@/components/features/home/HomePage';

export default function AdminProductsPage() {
    return (
        <AdminRoute fallback={<div>Redirecting...</div>}>
            <HomePage initialSection="admin-products"/>
        </AdminRoute>
    );
}
