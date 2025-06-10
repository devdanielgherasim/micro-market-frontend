import {HomePage} from '@/components/features/home/HomePage';
import {AdminRoute} from '@/components/auth/RoleBasedRoute';

export default function AdminProductsPage() {
    return (
        <AdminRoute fallback={<div>Redirecting...</div>}>
            <HomePage/>
        </AdminRoute>
    );
}
