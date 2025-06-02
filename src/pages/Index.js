import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext.jsx';

const Index = () => {
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

  // Show loading state while redirecting
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <h1 className="text-2xl font-bold mb-4">Digital Vote Verse</h1>
        <p className="text-gray-600">Loading your secure voting platform...</p>
      </div>
    </div>
  );
};

export default Index;
