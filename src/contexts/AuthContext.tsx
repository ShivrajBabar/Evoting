
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from "@/components/ui/use-toast";

// User roles
export type UserRole = 'superadmin' | 'admin' | 'voter';

// User data interface
export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  photo?: string | null;            // backend uses 'photo'
  state_id?: number;
  district_id?: number;
  local_body_id?: number;
  vidhansabha_id?: number;
  loksabha_id?: number;
  electionType?: string;

  // Optional frontend-only fields (if needed)
  photoUrl?: string;
  constituency?: string;
  state?: string;
  district?: string;
}


interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string, role: UserRole, electionType?: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

// Create the context with a default value
const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => {},
  logout: () => {},
  isAuthenticated: false,
});

// Mock user data for development
const mockUsers: User[] = [
  {
    id: '1',
    name: 'Super Admin',
    email: 'superadmin@example.com',
    role: 'superadmin',
    photoUrl: '/placeholder.svg',
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
  },
];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

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

  // Mock login function
  const login = async (email: string, password: string, role: UserRole, electionType?: string) => {
    setLoading(true);
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Find user in mock data (in production, this would be an API call)
      const foundUser = mockUsers.find(u => 
        u.email.toLowerCase() === email.toLowerCase() && u.role === role
      );
      
      if (!foundUser) {
        throw new Error('Invalid credentials');
      }

      // For voter role, check if election type is provided
      if (role === 'voter' && !electionType) {
        throw new Error('Election type is required for voters');
      }

      // Update user data with election type if voter
      const userData = role === 'voter' 
        ? { ...foundUser, electionType } 
        : foundUser;
      
      // Store user in localStorage and state
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      
      // Navigate based on role
      switch (role) {
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
      
      toast({
        title: "Login successful",
        description: `Welcome back, ${userData.name}`,
      });
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: "Login failed",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
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
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use auth context
export const useAuth = () => useContext(AuthContext);
