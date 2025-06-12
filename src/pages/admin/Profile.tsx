import React, { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from '@/contexts/AuthContext';
import Layout from '@/components/Layout';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui/avatar';
import { useToast } from '@/components/ui/use-toast';
import { User, Mail, Phone, Calendar, MapPin } from 'lucide-react';
import axios from 'axios';

const AdminProfile = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [adminProfile, setAdminProfile] = useState<any>(null);

  useEffect(() => {
    if (!user?.id) return;

    const fetchAdmin = async () => {
      try {
        const res = await axios.get(`/api/admins/user/${user.id}`);
        setAdminProfile(res.data);
      } catch (err) {
        console.error('Error fetching admin:', err);
        toast({
          title: "Failed to load profile",
          description: "Could not fetch admin details.",
          variant: "destructive",
        });
      }
    };

    fetchAdmin();
  }, [user?.id]);

  const handleUpdateProfile = () => {
    toast({
      title: "Profile Updated",
      description: "Your profile has been updated successfully.",
    });
  };

  const handleChangePassword = () => {
    toast({
      title: "Feature in development",
      description: "Password change functionality will be implemented soon.",
    });
  };

  const userInitials = adminProfile?.name
    ?.split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase() || 'AU';

  if (!adminProfile) {
    return (
      <Layout>
        <div className="p-6 text-center text-gray-500">Loading profile...</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* User Info Card */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Your personal details</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center space-y-4">
                <Avatar className="h-32 w-32">
                  <AvatarImage src={adminProfile.photo_url} alt={adminProfile.name} />
                  <AvatarFallback className="text-2xl">{userInitials}</AvatarFallback>
                </Avatar>
                <h2 className="text-xl font-bold">{adminProfile.name}</h2>
                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                  Admin
                </span>
              </div>

              <div className="mt-6 space-y-4">
                <div className="flex items-center">
                  <Mail className="h-4 w-4 mr-2 text-gray-500" />
                  <span>{adminProfile.email}</span>
                </div>
                <div className="flex items-center">
                  <Phone className="h-4 w-4 mr-2 text-gray-500" />
                  <span>{adminProfile.phone}</span>
                </div>
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                  <span>DOB: {adminProfile.dob}</span>
                </div>
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-2 text-gray-500" />
                  <span>{adminProfile.constituency}, {adminProfile.district}</span>
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
                    <Input id="name" defaultValue={adminProfile.name} />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-medium">Email</label>
                    <Input id="email" type="email" defaultValue={adminProfile.email} />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="phone" className="text-sm font-medium">Phone Number</label>
                    <Input id="phone" defaultValue={adminProfile.phone} />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="dob" className="text-sm font-medium">Date of Birth</label>
                    <Input id="dob" type="date" defaultValue={adminProfile.dob} />
                  </div>
                </div>

                
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Constituency & Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Constituency Info */}
          <Card>
            <CardHeader>
              <CardTitle>Constituency Information</CardTitle>
              <CardDescription>Details about your assigned constituency</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">State</p>
                    <p className="font-medium">{adminProfile.state}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">District</p>
                    <p className="font-medium">{adminProfile.district}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Constituency</p>
                    <p className="font-medium">{adminProfile.constituency}</p>
                  </div>
                  
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity Placeholder */}
          
        </div>
      </div>
    </Layout>
  );
};

export default AdminProfile;
