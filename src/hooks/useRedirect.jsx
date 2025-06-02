
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

export const useRedirect = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, loading } = useAuth();
  
  useEffect(() => {
    // If loading, wait
    if (loading) return;
    
    // If authenticated, redirect based on role
    if (isAuthenticated && user) {
      switch (user.role) {
        case 'superadmin':
          navigate('/superadmin/dashboard');
          break;
        case 'admin':
          navigate('/admin/dashboard');
          break;
        case 'voter':
          navigate('/voter/dashboard');
          break;
        default:
          navigate('/login');
      }
    } else {
      // If not authenticated, redirect to login
      navigate('/login');
    }
  }, [loading, isAuthenticated, user, navigate]);

  return { loading };
};

export default useRedirect;
