
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from '@/contexts/AuthContext';
import Layout from '@/components/Layout';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const VoterProfile = () => {
  const { user } = useAuth();

  // Mock voter details
  const voterDetails = {
    name: user?.name || 'Voter Name',
    email: user?.email || 'voter@example.com',
    voterId: 'MH0123456789',
    phone: '+91 98765 43210',
    dob: '1985-06-15',
    state: user?.state || 'Maharashtra',
    district: user?.district || 'Mumbai',
    loksabhaWard: 'Mumbai North',
    vidhansabhaWard: 'Andheri East',
    municipalCorporation: 'Mumbai Municipal Corporation',
    municipalCorporationWard: 'K-East Ward',
    booth: 'Booth #123, Municipal School'
  };

  return (
    <Layout>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Voter Profile</CardTitle>
            <CardDescription>Your personal details and voter information</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-6">
              {/* Profile Picture */}
              <div className="flex flex-col items-center space-y-4">
                <Avatar className="h-32 w-32">
                  <AvatarImage src={user?.photoUrl} alt={user?.name} />
                  <AvatarFallback className="text-lg">
                    {user?.name?.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div className="text-center">
                  <h3 className="font-medium text-lg">{voterDetails.name}</h3>
                  <p className="text-sm text-gray-500">{voterDetails.voterId}</p>
                </div>
              </div>

              {/* Details */}
              <div className="flex-1 space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-4">Personal Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-sm text-gray-500">Email</p>
                      <p>{voterDetails.email}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-gray-500">Phone</p>
                      <p>{voterDetails.phone}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-gray-500">Date of Birth</p>
                      <p>{voterDetails.dob}</p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-4">Location Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-sm text-gray-500">State</p>
                      <p>{voterDetails.state}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-gray-500">District</p>
                      <p>{voterDetails.district}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-gray-500">Lok Sabha Constituency</p>
                      <p>{voterDetails.loksabhaWard}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-gray-500">Vidhan Sabha Constituency</p>
                      <p>{voterDetails.vidhansabhaWard}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-gray-500">Municipal Corporation</p>
                      <p>{voterDetails.municipalCorporation}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-gray-500">Ward</p>
                      <p>{voterDetails.municipalCorporationWard}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-gray-500">Booth</p>
                      <p>{voterDetails.booth}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default VoterProfile;
