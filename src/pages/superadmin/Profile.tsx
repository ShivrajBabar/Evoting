
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from '@/contexts/AuthContext';
import Layout from '@/components/Layout';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/components/ui/use-toast';
import { User, Mail, Phone, Calendar, Shield } from 'lucide-react';

const SuperadminProfile = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  // Mock superadmin profile data
  const superadminProfile = {
    id: user?.id || '1',
    name: user?.name || 'Super Admin',
    email: user?.email || 'superadmin@example.com',
    phone: '+91 98765 43210',
    dob: '1982-06-15',
    joiningDate: '2022-01-10',
    permissions: [
      'Manage Admins',
      'Manage Elections',
      'Manage Candidates',
      'View Reports',
      'Configure System Settings'
    ],
    recentActivity: [
      { action: 'Added new admin', time: '2 hours ago' },
      { action: 'Updated election schedule', time: '1 day ago' },
      { action: 'Approved 5 candidates', time: '2 days ago' }
    ]
  };

  const handleUpdateProfile = () => {
    toast({
      title: "Profile Updated",
      description: "Your profile has been updated successfully.",
    });
  };

  

  const userInitials = user?.name
    ?.split(' ')
    .map(name => name[0])
    .join('')
    .toUpperCase() || 'SA';

  return (
    <Layout>
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* User Info Card */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Manage your personal details</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center space-y-4">
                <Avatar className="h-32 w-32">
                  <AvatarImage src={user?.photoUrl} alt={user?.name} />
                  <AvatarFallback className="text-2xl">{userInitials}</AvatarFallback>
                </Avatar>
                <h2 className="text-xl font-bold">{superadminProfile.name}</h2>
                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                  Superadmin
                </span>
              </div>
              
              <div className="mt-6 space-y-4">
                <div className="flex items-center">
                  <Mail className="h-4 w-4 mr-2 text-gray-500" />
                  <span>{superadminProfile.email}</span>
                </div>
                <div className="flex items-center">
                  <Phone className="h-4 w-4 mr-2 text-gray-500" />
                  <span>{superadminProfile.phone}</span>
                </div>
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                  <span>DOB: {superadminProfile.dob}</span>
                </div>
                <div className="flex items-center">
                  <Shield className="h-4 w-4 mr-2 text-gray-500" />
                  <span>Joined on {superadminProfile.joiningDate}</span>
                </div>
              </div>
              
              
            </CardContent>
          </Card>

          {/* Edit Profile Form */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Edit Profile</CardTitle>
              <CardDescription>Update your personal information</CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="name" className="text-sm font-medium">Full Name</label>
                    <Input id="name" defaultValue={superadminProfile.name} disabled/>
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-medium">Email</label>
                    <Input id="email" type="email" defaultValue={superadminProfile.email} disabled/>
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="phone" className="text-sm font-medium">Phone Number</label>
                    <Input id="phone" defaultValue={superadminProfile.phone} disabled/>
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="dob" className="text-sm font-medium">Date of Birth</label>
                    <Input id="dob" type="date" defaultValue={superadminProfile.dob} disabled/>
                  </div>
                </div>
                
                
                
                
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Permissions & Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Permissions */}
          <Card>
            <CardHeader>
              <CardTitle>System Permissions</CardTitle>
              <CardDescription>Your access rights as a Superadmin</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {superadminProfile.permissions.map((permission, index) => (
                  <li key={index} className="flex items-center">
                    <div className="h-2 w-2 bg-green-500 rounded-full mr-2"></div>
                    <span>{permission}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Your latest actions in the system</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {superadminProfile.recentActivity.map((activity, index) => (
                  <div key={index} className="border-b pb-3 last:border-0 last:pb-0">
                    <div className="flex justify-between">
                      <span>{activity.action}</span>
                      <span className="text-sm text-gray-500">{activity.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default SuperadminProfile;
