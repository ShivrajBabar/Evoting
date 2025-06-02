
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Home, 
  LogOut, 
  Menu, 
  User, 
  Users, 
  Vote, 
  Settings 
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // If no user, return null
  if (!user) return null;

  const userInitials = user.name
    .split(' ')
    .map(name => name[0])
    .join('')
    .toUpperCase();

  // Define navigation links based on user role
  const getNavLinks = () => {
    switch (user.role) {
      case 'superadmin':
        return [
          { name: 'Dashboard', path: '/superadmin/dashboard', icon: <Home className="mr-2" size={18} /> },
          { name: 'Candidates', path: '/superadmin/candidates', icon: <Vote className="mr-2" size={18} /> },
          { name: 'Admins', path: '/superadmin/admins', icon: <Users className="mr-2" size={18} /> },
          { name: 'Elections', path: '/superadmin/elections', icon: <Settings className="mr-2" size={18} /> },
          { name: 'My Profile', path: '/superadmin/profile', icon: <User className="mr-2" size={18} /> },
        ];
      case 'admin':
        return [
          { name: 'Dashboard', path: '/admin/dashboard', icon: <Home className="mr-2" size={18} /> },
          { name: 'Voters', path: '/admin/voters', icon: <Users className="mr-2" size={18} /> },
          { name: 'Candidates', path: '/admin/candidates', icon: <Vote className="mr-2" size={18} /> },
          { name: 'My Profile', path: '/admin/profile', icon: <User className="mr-2" size={18} /> },
        ];
      case 'voter':
        return [
          { name: 'Dashboard', path: '/voter/dashboard', icon: <Home className="mr-2" size={18} /> },
          { name: 'My Profile', path: '/voter/profile', icon: <User className="mr-2" size={18} /> },
          { name: 'Elections', path: '/voter/elections', icon: <Vote className="mr-2" size={18} /> },
        ];
      default:
        return [];
    }
  };

  const navLinks = getNavLinks();

  // Role-based layout title
  const getLayoutTitle = () => {
    switch (user.role) {
      case 'superadmin':
        return 'Election Management System - Superadmin';
      case 'admin':
        return `Election Management - ${user.constituency || 'Admin'}`;
      case 'voter':
        return `Voting Portal - ${user.electionType || 'Elections'}`;
      default:
        return 'Digital Vote Verse';
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Get profile path based on user role
  const getProfilePath = () => {
    switch (user.role) {
      case 'superadmin':
        return '/superadmin/profile';
      case 'admin':
        return '/admin/profile';
      case 'voter':
        return '/voter/profile';
      default:
        return '/';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Sticky Header - Updated layout */}
      <header className="bg-primary text-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <Menu size={24} />
          </button>

          {/* Logo and Name - Moved to left side */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <Vote className="h-8 w-8 text-white mr-2" />
              <span className="font-bold text-xl">Digital Vote Verse</span>
            </Link>
          </div>

          {/* Empty div to push profile to the right */}
          <div className="flex-1"></div>

          {/* User dropdown - Moved to right side */}
          <div className="flex items-center">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar className="h-10 w-10 border-2 border-white">
                    <AvatarImage src={user.photoUrl} alt={user.name} />
                    <AvatarFallback className="bg-secondary">{userInitials}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="font-medium">{user.name}</p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                    <p className="text-xs text-gray-500 capitalize">{user.role}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to={getProfilePath()} className="cursor-pointer flex items-center">
                    <User className="mr-2" size={16} /> Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <button onClick={handleLogout} className="w-full cursor-pointer flex items-center text-red-600">
                    <LogOut className="mr-2" size={16} /> Log out
                  </button>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Sidebar for larger screens */}
        <aside
          className={`
            bg-sidebar text-sidebar-foreground w-64 md:flex flex-col md:sticky top-16 h-full
            ${sidebarOpen ? 'fixed inset-y-0 left-0 z-40 block' : 'hidden'} 
            md:block shadow-lg md:h-[calc(100vh-4rem)]
          `}
        >
          {/* Close button for mobile */}
          <div className="md:hidden p-4 flex justify-end">
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-white"
            >
              <span className="sr-only">Close sidebar</span>
              <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Navigation */}
          <nav className="mt-4 px-4 flex-1">
            <div className="space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className="group flex items-center px-4 py-3 text-base font-medium rounded-md hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
                  onClick={() => setSidebarOpen(false)}
                >
                  {link.icon}
                  {link.name}
                </Link>
              ))}
            </div>
          </nav>

          {/* User info at bottom of sidebar */}
          <div className="p-4 border-t border-sidebar-border">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user.photoUrl} alt={user.name} />
                  <AvatarFallback>{userInitials}</AvatarFallback>
                </Avatar>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium">{user.name}</p>
                <p className="text-xs text-sidebar-foreground/70 capitalize">{user.role}</p>
              </div>
            </div>
          </div>
        </aside>

        {/* Overlay */}
        {sidebarOpen && (
          <div 
            className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
            onClick={() => setSidebarOpen(false)}
          ></div>
        )}

        {/* Main content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900">{getLayoutTitle()}</h1>
            </div>
            {children}
          </div>
        </main>
      </div>

      {/* Footer */}
      <footer className="bg-gray-100 py-4 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-gray-500">
            &copy; {new Date().getFullYear()} Digital Vote Verse. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
