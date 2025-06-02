
import React, { useState } from 'react';
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Lock, UserIcon, Mail } from "lucide-react"
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from "@/components/ui/use-toast";
import { Link } from "react-router-dom";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('voter');
  const [electionType, setElectionType] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetRole, setResetRole] = useState('voter');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [showCredentials, setShowCredentials] = useState(false);
  
  const { login, resetPassword } = useAuth();
  const { toast } = useToast();
  
  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      await login(email, password, role, role === 'voter' ? electionType : undefined);
      // Redirect will be handled in the AuthContext
    } catch (error) {
      // Error toast will be shown by AuthContext
      setIsLoading(false);
    }
  };
  
  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!resetEmail) {
      toast({
        title: "Email required",
        description: "Please enter your email address",
        variant: "destructive",
      });
      return;
    }
    
    try {
      await resetPassword(resetEmail, resetRole);
      setIsDialogOpen(false);
      setResetEmail('');
      
      toast({
        title: "Password reset requested",
        description: "If your email is registered, you will receive reset instructions",
      });
    } catch (error) {
      console.error("Password reset error:", error);
      toast({
        title: "Reset failed",
        description: error?.message || "Failed to reset password",
        variant: "destructive"
      });
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Ballet Secure</h1>
          <p className="mt-2 text-gray-600">Secure, transparent, and reliable voting</p>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Login</CardTitle>
            <CardDescription>Enter your credentials to access your account</CardDescription>
          </CardHeader>
          <form onSubmit={handleLogin}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="role">Login As</Label>
                <RadioGroup 
                  id="role" 
                  defaultValue="voter" 
                  className="flex space-x-2" 
                  value={role}
                  onValueChange={setRole}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="voter" id="voter" />
                    <Label htmlFor="voter">Voter</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="admin" id="admin" />
                    <Label htmlFor="admin">Admin</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="superadmin" id="superadmin" />
                    <Label htmlFor="superadmin">Super Admin</Label>
                  </div>
                </RadioGroup>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="name@example.com" 
                    className="pl-10"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input 
                    id="password" 
                    type="password" 
                    placeholder="••••••••" 
                    className="pl-10"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>
              
              {role === 'voter' && (
                <div className="space-y-2">
                  <Label htmlFor="electionType">Election Type</Label>
                  <Select value={electionType} onValueChange={setElectionType} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select election type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Lok Sabha">Lok Sabha</SelectItem>
                      <SelectItem value="Vidhan Sabha">Vidhan Sabha</SelectItem>
                      <SelectItem value="Municipal">Municipal</SelectItem>
                      <SelectItem value="Panchayat">Panchayat</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading || (role === 'voter' && !electionType)}
              >
                {isLoading ? (
                  <><span className="animate-spin mr-2">⏳</span> Logging in...</>
                ) : (
                  <>Sign in</>
                )}
              </Button>
              
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="link" className="text-sm text-primary hover:underline">
                    Forgot your password?
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Reset Password</DialogTitle>
                    <DialogDescription>
                      Enter your email address and we'll send you a link to reset your password.
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleResetPassword} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="resetRole">Account Type</Label>
                      <RadioGroup 
                        id="resetRole" 
                        defaultValue="voter" 
                        className="flex flex-wrap gap-4" 
                        value={resetRole}
                        onValueChange={setResetRole}
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="voter" id="reset-voter" />
                          <Label htmlFor="reset-voter">Voter</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="admin" id="reset-admin" />
                          <Label htmlFor="reset-admin">Admin</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="superadmin" id="reset-superadmin" />
                          <Label htmlFor="reset-superadmin">Super Admin</Label>
                        </div>
                      </RadioGroup>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="reset-email">Email</Label>
                      <Input 
                        id="reset-email" 
                        placeholder="name@example.com" 
                        value={resetEmail}
                        onChange={(e) => setResetEmail(e.target.value)}
                        required
                      />
                    </div>
                    <DialogFooter>
                      <Button type="submit">Reset Password</Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
              
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" className="w-full">
                    Need demo credentials?
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Demo Credentials</AlertDialogTitle>
                    <AlertDialogDescription>
                      Use these credentials to test the application:
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <div className="space-y-4 my-4">
                    <div className="border p-3 rounded-md bg-gray-50">
                      <p className="font-semibold">Superadmin</p>
                      <p><strong>Email:</strong> superadmin@example.com</p>
                      <p><strong>Password:</strong> password123</p>
                    </div>
                    <div className="border p-3 rounded-md bg-gray-50">
                      <p className="font-semibold">Admin</p>
                      <p><strong>Email:</strong> admin@example.com</p>
                      <p><strong>Password:</strong> password123</p>
                    </div>
                    <div className="border p-3 rounded-md bg-gray-50">
                      <p className="font-semibold">Voter</p>
                      <p><strong>Email:</strong> voter@example.com</p>
                      <p><strong>Password:</strong> password123</p>
                      <p><strong>Election Type:</strong> Lok Sabha</p>
                    </div>
                  </div>
                  <AlertDialogFooter>
                    <AlertDialogAction>Close</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default Login;
