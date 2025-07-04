import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/shared/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

interface PrivateRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
}

export const PrivateRoute: React.FC<PrivateRouteProps> = ({ 
  children, 
  requireAuth = true 
}) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-gray-600" />
          <p className="text-gray-600 text-lg font-medium">Checking authentication...</p>
          <p className="text-gray-400 text-sm mt-2">Please wait a moment</p>
        </div>
      </div>
    );
  }

  // If authentication is required but user is not authenticated, redirect to login
  if (requireAuth && !isAuthenticated) {
    return (
      <Navigate 
        to="/auth" 
        state={{ from: location }} 
        replace 
      />
    );
  }

  // If authentication is not required but user is authenticated, 
  // redirect authenticated users away from auth pages
  if (!requireAuth && isAuthenticated) {
    // Get the intended destination from state, or default to dashboard
    const from = location.state?.from?.pathname || '/dashboard';
    return <Navigate to={from} replace />;
  }

  // Render the children if all conditions are met
  return <>{children}</>;
};

// Wrapper components for better readability
export const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <PrivateRoute requireAuth={false}>{children}</PrivateRoute>;
};

export const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <PrivateRoute requireAuth={true}>{children}</PrivateRoute>;
}; 