
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from '@/contexts/AuthContext';
import Layout from '@/components/Layout';
import { Users, Vote, Landmark, FileText } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Link } from 'react-router-dom';

const AdminDashboard = () => {
  const { user } = useAuth();

  // Mock statistics for dashboard
  const stats = [
    { name: 'Registered Voters', value: '12,435', icon: <Users className="h-8 w-8 text-blue-500" /> },
    { name: 'Candidates', value: '18', icon: <Vote className="h-8 w-8 text-green-500" /> },
    { name: 'Active Elections', value: '2', icon: <Landmark className="h-8 w-8 text-purple-500" /> },
    { name: 'Voter Turnout', value: '68%', icon: <FileText className="h-8 w-8 text-orange-500" /> },
  ];

  // Mock upcoming elections
  const upcomingElections = [
    { id: 1, name: 'Lok Sabha Elections', date: '2025-04-15', status: 'Scheduled' },
    { id: 2, name: 'Municipal Corporation', date: '2024-12-12', status: 'Registration Open' },
  ];

  // Mock recently registered voters
  const recentVoters = [
    { id: 1, name: 'Amit Sharma', voterID: 'MH0123456789', time: '1 hour ago' },
    { id: 2, name: 'Priya Patel', voterID: 'MH0987654321', time: '3 hours ago' },
    { id: 3, name: 'Rahul Gupta', voterID: 'MH0192837465', time: '5 hours ago' },
    { id: 4, name: 'Sneha Desai', voterID: 'MH0246813579', time: '1 day ago' },
  ];

  return (
    <Layout>
      <div className="space-y-6">
        {/* Welcome message showing constituency */}
        <Card className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
          <CardContent className="p-6">
            <h2 className="text-2xl font-bold">Welcome, {user?.name}</h2>
            <p className="mt-2">You are managing {user?.constituency || 'Unknown'} constituency</p>
          </CardContent>
        </Card>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat) => (
            <Card key={stat.name} className="stats-card border-l-4">
              <CardContent className="p-6 flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-gray-500">{stat.name}</p>
                  <p className="text-3xl font-bold">{stat.value}</p>
                </div>
                <div>{stat.icon}</div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Upcoming Elections */}
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Elections</CardTitle>
              <CardDescription>Elections scheduled for your constituency</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {upcomingElections.map((election) => (
                  <div key={election.id} className="flex justify-between items-center border-b pb-4 last:border-0 last:pb-0">
                    <div>
                      <p className="font-medium">{election.name}</p>
                      <p className="text-sm text-gray-500">Date: {election.date}</p>
                    </div>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {election.status}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recently Registered Voters */}
          <Card>
            <CardHeader>
              <CardTitle>Recently Registered Voters</CardTitle>
              <CardDescription>Voters registered in the last 7 days</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentVoters.map((voter) => (
                  <div key={voter.id} className="border-b pb-4 last:border-0 last:pb-0">
                    <div className="flex justify-between">
                      <p className="font-medium">{voter.name}</p>
                      <span className="text-xs text-gray-500">{voter.time}</span>
                    </div>
                    <p className="text-sm text-gray-500">Voter ID: {voter.voterID}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Quick Access Section */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks for your constituency</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button variant="outline" className="h-auto py-4 flex flex-col items-center justify-center" asChild>
                <Link to="/admin/voters/register">
                  <Users className="h-6 w-6 mb-2" />
                  <span>Register New Voter</span>
                </Link>
              </Button>
              <Button variant="outline" className="h-auto py-4 flex flex-col items-center justify-center" asChild>
                <Link to="/admin/voters">
                  <FileText className="h-6 w-6 mb-2" />
                  <span>View Voter List</span>
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default AdminDashboard;
