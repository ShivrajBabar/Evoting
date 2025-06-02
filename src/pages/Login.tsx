import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserRole, useAuth } from '@/contexts/AuthContext.jsx';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Vote } from 'lucide-react';
import { electionTypes } from '@/utils/locationData';

const Login = () => {
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('voter');
  const [electionType, setElectionType] = useState('');
  const [showElectionTypeField, setShowElectionTypeField] = useState(true);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await login(email, password, role, electionType);
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  // Handle role change to show/hide election type field
  const handleRoleChange = (value: string) => {
    const newRole = value as UserRole;
    setRole(newRole);
    setShowElectionTypeField(newRole === 'voter');
    
    // Reset election type if not voter
    if (newRole !== 'voter') {
      setElectionType('');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="flex justify-center">
            <Vote className="h-12 w-12 text-primary" />
          </div>
          <h1 className="mt-4 text-3xl font-bold text-gray-900">Digital Vote Verse</h1>
          <p className="mt-2 text-sm text-gray-600">Your secure online voting platform</p>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-center">Sign in to your account</CardTitle>
            <CardDescription className="text-center">
              Enter your credentials to access the platform
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="role">Login as</Label>
                <Select
                  value={role}
                  onValueChange={handleRoleChange}
                >
                  <SelectTrigger id="role">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="superadmin">Superadmin</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="voter">Voter</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {/* Show election type dropdown only for voter */}
              {showElectionTypeField && (
                <div className="space-y-2">
                  <Label htmlFor="electionType">Election Type</Label>
                  <Select
                    value={electionType}
                    onValueChange={setElectionType}
                  >
                    <SelectTrigger id="electionType">
                      <SelectValue placeholder="Select election type" />
                    </SelectTrigger>
                    <SelectContent>
                      {electionTypes.map((type) => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              
              <Button
                type="submit"
                className="w-full"
                disabled={loading || (role === 'voter' && !electionType)}
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Loading...
                  </span>
                ) : (
                  'Sign in'
                )}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex justify-center text-sm text-gray-500">
            <div>
              <p>For demo purposes:</p>
              <p>Superadmin: superadmin@example.com</p>
              <p>Admin: admin@example.com</p>
              <p>Voter: voter@example.com</p>
              <p>(Use any password)</p>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Login;
