
import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from "@/components/ui/use-toast";

// Create the context
const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Mock user data for development
  const mockUsers = [
    {
      id: '1',
      name: 'Super Admin',
      email: 'superadmin@example.com',
      role: 'superadmin',
      photoUrl: '/placeholder.svg',
      password: 'password123',
    },
    {
      id: '2',
      name: 'Admin User',
      email: 'admin@example.com',
      role: 'admin',
      photoUrl: '/placeholder.svg',
      constituency: 'Mumbai North',
      state: 'Maharashtra',
      district: 'Mumbai',
      password: 'password123',
    },
    {
      id: '3',
      name: 'Voter User',
      email: 'voter@example.com',
      role: 'voter',
      photoUrl: '/placeholder.svg',
      constituency: 'Mumbai North',
      state: 'Maharashtra',
      district: 'Mumbai',
      electionType: 'Lok Sabha',
      password: 'password123',
    },
  ];

  // Check if user is already logged in (from local storage)
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Failed to parse stored user:', error);
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);


  const login = async (email, password, role, electionType) => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3000/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, role }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      // For voter role, ensure electionType is included
      const userData = role === 'voter'
        ? { ...data.user, electionType }
        : data.user;

      // Save to localStorage and context
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);

      toast({
        title: "Login successful",
        description: `Welcome back, ${userData.name}`,
      });

      // Redirect based on role
      switch (role?.toLowerCase()) {
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
          navigate('/');
      }

      return userData;

    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: "Login failed",
        description: error.message || 'An unknown error occurred',
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };


  // Reset password function
  const resetPassword = async (email, role) => {
    setLoading(true);
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Find user in mock data
      const foundUser = mockUsers.find(u =>
        u.email.toLowerCase() === email.toLowerCase() && u.role === role
      );

      if (!foundUser) {
        // For security, don't tell the user that the email doesn't exist
        console.log(`User not found: ${email} with role ${role}, but returning success for security`);
        return true;
      }

      // Simulate password reset email
      console.log(`Password reset requested for ${email} with role ${role}`);

      toast({
        title: "Password reset initiated",
        description: `A password reset link has been sent to ${email}`,
      });

      return true;
    } catch (error) {
      console.error('Password reset error:', error);
      toast({
        title: "Password reset failed",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('user');
    setUser(null);
    navigate('/login');
    toast({
      title: "Logged out",
      description: "You have been logged out successfully",
    });
  };

  const value = {
    user,
    loading,
    login,
    logout,
    resetPassword,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use auth context
export const useAuth = () => useContext(AuthContext);

export default AuthContext;
