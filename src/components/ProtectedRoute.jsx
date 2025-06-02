
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import LoadingSpinner from '@/components/common/LoadingSpinner';

const ProtectedRoute = ({ requiredRole, children }) => {
  const { user, isAuthenticated, loading } = useAuth();
  
  // If auth is still loading, show loading spinner
  if (loading) {
    return <LoadingSpinner />;
  }
  
  // If not authenticated, redirect to login
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }
  
  // If role doesn't match, redirect to appropriate dashboard
  if (requiredRole && user.role !== requiredRole) {
    switch (user.role) {
      case 'superadmin':
        return <Navigate to="/superadmin/dashboard" replace />;
      case 'admin':
        return <Navigate to="/admin/dashboard" replace />;
      case 'voter':
        return <Navigate to="/voter/dashboard" replace />;
      default:
        return <Navigate to="/login" replace />;
    }
  }
  
  // If authorized, render the children
  return children;
};

export default ProtectedRoute;
