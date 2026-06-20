import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface Props {
    allowedRole?: 'Admin' | 'User';
}

export const ProtectedRoute = ({ allowedRole }: Props) => {
    const { isAuthenticated, role, isLoading } = useAuth();

    if (isLoading) {
        return <div className="p-8 text-zinc-500">Загрузка...</div>;
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (allowedRole && role !== allowedRole) {
        return <Navigate to={role === 'Admin' ? '/admin' : '/hotels'} replace />;
    }

    return <Outlet />;
};