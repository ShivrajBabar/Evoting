
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from '@/contexts/AuthContext';
import Layout from '@/components/Layout';
import { Users, Vote, Landmark, BarChart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const SuperadminDashboard = () => {
  const { user } = useAuth();

  // Mock statistics for dashboard
  const stats = [
    { name: 'Total Candidates', value: '243', icon: <Vote className="h-8 w-8 text-blue-500" /> },
    { name: 'Total Admins', value: '56', icon: <Users className="h-8 w-8 text-green-500" /> },
    { name: 'Active Elections', value: '5', icon: <Landmark className="h-8 w-8 text-purple-500" /> },
    { name: 'Total Votes Cast', value: '18,245', icon: <BarChart className="h-8 w-8 text-orange-500" /> },
  ];

  // Mock upcoming elections
  const upcomingElections = [
    { id: 1, name: 'Lok Sabha Elections 2025', date: '2025-04-15', status: 'Scheduled' },
    { id: 2, name: 'Maharashtra Vidhan Sabha', date: '2024-10-20', status: 'Preparation' },
    { id: 3, name: 'Mumbai Municipal Corporation', date: '2024-12-12', status: 'Registration Open' },
  ];

  // Mock recent activities
  const recentActivities = [
    { id: 1, action: 'New Admin Added', user: 'You', time: '2 hours ago', details: 'Added admin for Mumbai South constituency' },
    { id: 2, action: 'Candidate Updated', user: 'You', time: '5 hours ago', details: 'Updated Rajesh Kumar\'s profile' },
    { id: 3, action: 'Election Created', user: 'You', time: '1 day ago', details: 'Created new Lok Sabha election' },
    { id: 4, action: 'Admin Updated', user: 'You', time: '2 days ago', details: 'Modified permissions for Delhi admins' },
  ];

  return (
    <Layout>
      <div className="space-y-6">
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
              <CardDescription>Elections scheduled in the coming months</CardDescription>
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

          {/* Recent Activities */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activities</CardTitle>
              <CardDescription>Your recent actions in the system</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivities.map((activity) => (
                  <div key={activity.id} className="border-b pb-4 last:border-0 last:pb-0">
                    <div className="flex justify-between">
                      <p className="font-medium">{activity.action}</p>
                      <span className="text-xs text-gray-500">{activity.time}</span>
                    </div>
                    <p className="text-sm text-gray-500">{activity.details}</p>
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
            <CardDescription>Common tasks and operations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button variant="outline" className="h-auto py-4 flex flex-col items-center justify-center" asChild>
                <Link to="/superadmin/candidates">
                  <Vote className="h-6 w-6 mb-2" />
                  <span>Register New Candidate</span>
                </Link>
              </Button>
              <Button variant="outline" className="h-auto py-4 flex flex-col items-center justify-center" asChild>
                <Link to="/superadmin/admins">
                  <Users className="h-6 w-6 mb-2" />
                  <span>Add New Admin</span>
                </Link>
              </Button>
              <Button variant="outline" className="h-auto py-4 flex flex-col items-center justify-center" asChild>
                <Link to="/superadmin/elections">
                  <Landmark className="h-6 w-6 mb-2" />
                  <span>Create Election</span>
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default SuperadminDashboard;
