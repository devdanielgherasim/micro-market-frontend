import {useRouter} from 'next/navigation';
import {useEffect} from 'react';
import {useAuth} from '@/auth/KeycloakProvider';

interface ProtectedRouteProps {
    children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({children}) => {
    const {isAuthenticated, loading, login} = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && !isAuthenticated) {
            // Redirect to login if not authenticated
            login();
        }
    }, [isAuthenticated, loading, login, router]);

    // Show loading while checking authentication
    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-secondary-50 dark:bg-secondary-950">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
            </div>
        );
    }

    // Only render children if authenticated
    return isAuthenticated ? <>{children}</> : null;
};
