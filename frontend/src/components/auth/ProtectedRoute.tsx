import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

type Role = 'admin' | 'sales_agent' | 'onboarding_agent' | 'sales_manager' | 'business_head' | 'developer';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: Role[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { isAuthenticated, checkAuth, isLoading } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) {
      checkAuth();
    }
  }, []);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && allowedRoles.length > 0) {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const userRole = user?.role as Role;
    
    if (!userRole || !allowedRoles.includes(userRole)) {
      return <Navigate to="/dashboard" replace />;
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;
