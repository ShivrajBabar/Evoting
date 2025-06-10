import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import LoadingSpinner from '@/components/common/LoadingSpinner';

const ProtectedRoute = ({ requiredRole, children }) => {
  const { user, isAuthenticated, loading } = useAuth();

  // Wait until AuthContext has loaded
  if (loading) {
    return <LoadingSpinner />;
  }

  // Not logged in
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  // Logged in but wrong role (case-insensitive)
  if (
    requiredRole &&
    user.role?.toLowerCase() !== requiredRole.toLowerCase()
  ) {
    switch (user.role.toLowerCase()) {
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

  // All good
  return children;
};

export default ProtectedRoute;
