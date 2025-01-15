import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';

interface ProtectedRouteProps {
    children: ReactNode;
    isAuthenticated: boolean;
    isAdmin?: boolean;
    redirectPath?: string;
}

function ProtectedRoute({
                            children,
                            isAuthenticated,
                            isAdmin = false,
                            redirectPath = '/login'
                        }: ProtectedRouteProps) {
    // Si no está autenticado, redirige al login
    if (!isAuthenticated) {
        return <Navigate to={redirectPath} replace />;
    }

    // Si la ruta requiere permisos de admin
    if (isAdmin) {
        const userIsAdmin = localStorage.getItem('isAdmin') === 'true';
        if (!userIsAdmin) {
            return <Navigate to="/" replace />;
        }
    }

    // Si pasa todas las validaciones, muestra el contenido
    return <>{children}</>;
}

export default ProtectedRoute;