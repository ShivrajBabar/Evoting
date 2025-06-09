import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from '@/contexts/AuthContext';
import Layout from '@/components/Layout';
import { Users, Vote, Landmark, BarChart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const SuperadminDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState([
    { name: 'Total Candidates', value: '0', icon: <Vote className="h-8 w-8 text-blue-500" /> },
    { name: 'Total Admins', value: '0', icon: <Users className="h-8 w-8 text-green-500" /> },
    { name: 'Active Elections', value: '0', icon: <Landmark className="h-8 w-8 text-purple-500" /> },
    { name: 'Total Votes Cast', value: '0', icon: <BarChart className="h-8 w-8 text-orange-500" /> },
  ]);
  const [upcomingElections, setUpcomingElections] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        // Fetch all data in parallel
        const [candidatesRes, adminsRes, electionsRes] = await Promise.all([
          fetch('http://localhost:3000/api/candidates'),
          fetch('http://localhost:3000/api/admins'),
          fetch('http://localhost:3000/api/elections')
        ]);

        const [candidatesData, adminsData, electionsData] = await Promise.all([
          candidatesRes.json(),
          adminsRes.json(),
          electionsRes.json()
        ]);

        // Update stats
        setStats([
          { name: 'Total Candidates', value: candidatesData.length.toString(), icon: <Vote className="h-8 w-8 text-blue-500" /> },
          { name: 'Total Admins', value: adminsData.length.toString(), icon: <Users className="h-8 w-8 text-green-500" /> },
          {
            name: 'Active Elections',
            value: electionsData.filter(e => e.status?.toLowerCase() === 'active').length.toString(),
            icon: <Landmark className="h-8 w-8 text-purple-500" />
          },
          { name: 'Total Votes Cast', value: '0', icon: <BarChart className="h-8 w-8 text-orange-500" /> }, // Placeholder
        ]);


        // Get upcoming elections (next 4 elections by date)
        const now = new Date();
        const upcoming = electionsData
          .filter(e => new Date(e.date) > now)
          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
          .slice(0, 4)
          .map(election => ({
            id: election.id,
            name: election.name,
            date: election.date.split('T')[0], // Format date to YYYY-MM-DD
            status: election.status
          }));

        setUpcomingElections(upcoming);

        // Generate recent activities (mock for now - you can replace with actual activity log)
        const activities = [
          { id: 1, action: 'Dashboard Visited', user: 'You', time: 'Just now', details: 'Accessed the superadmin dashboard' },
          ...adminsData.slice(0, 3).map((admin, index) => ({
            id: index + 2,
            action: 'Admin Added',
            user: admin.name,
            time: `${index + 1} hour${index > 0 ? 's' : ''} ago`,
            details: `Added admin for ${admin.district_name} district`
          }))
        ];
        setRecentActivities(activities);

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <p>Loading dashboard data...</p>
        </div>
      </Layout>
    );
  }

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
                {upcomingElections.length > 0 ? (
                  upcomingElections.map((election) => (
                    <div key={election.id} className="flex justify-between items-center border-b pb-4 last:border-0 last:pb-0">
                      <div>
                        <p className="font-medium">{election.name}</p>
                        <p className="text-sm text-gray-500">Date: {election.date}</p>
                      </div>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {election.status}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">No upcoming elections found</p>
                )}
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