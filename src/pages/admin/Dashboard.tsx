import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from '@/contexts/AuthContext';
import Layout from '@/components/Layout';
import { Users, Vote, Landmark, FileText } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Link } from 'react-router-dom';

interface Voter {
  voter_id: number;
  name: string;
  voter_card_number: string;
  photo_name: string;
}

interface Candidate {
  id: number;
  name: string;
  party: string;
  status: string;
  photo: string;
  election: string;
  constituency: string;
}

interface Election {
  id: number;
  name: string;
  date: string;
  status: string;
}

const AdminDashboard = () => {
  const { user } = useAuth();

  const [voters, setVoters] = useState<Voter[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [elections, setElections] = useState<Election[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [votersRes, candidatesRes, electionsRes] = await Promise.all([
          fetch('/api/voters'),
          fetch('/api/candidates'),
          fetch('/api/elections')
        ]);

        const votersData = await votersRes.json();
        const candidatesData = await candidatesRes.json();
        const electionsData = await electionsRes.json();

        setVoters(votersData.slice(0, 4)); // limit to recent 4
        setCandidates(candidatesData);
        setElections(electionsData.filter((e: any) => e.status === 'Scheduled' || e.status === 'Active').slice(0, 4));
      } catch (err) {
        console.error('Error loading dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Stats
  const stats = [
    { name: 'Registered Voters', value: voters.length.toString(), icon: <Users className="h-8 w-8 text-blue-500" /> },
    { name: 'Candidates', value: candidates.length.toString(), icon: <Vote className="h-8 w-8 text-green-500" /> },
    { name: 'Active Elections', value: elections.length.toString(), icon: <Landmark className="h-8 w-8 text-purple-500" /> },
    { name: 'Voter Turnout', value: '68%', icon: <FileText className="h-8 w-8 text-orange-500" /> }, // Static for now
  ];

  return (
    <Layout>
      <div className="space-y-6">
        {/* Welcome */}
        <Card className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
          <CardContent className="p-6">
            <h2 className="text-2xl font-bold">Welcome, {user?.name}</h2>
            <p className="mt-2">You are managing {user?.constituency || 'Unknown'} constituency</p>
          </CardContent>
        </Card>

        {/* Stats */}
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
              {loading ? (
                <p>Loading elections...</p>
              ) : (
                <div className="space-y-4">
                  {elections.map((election) => (
                    <div key={election.id} className="flex justify-between items-center border-b pb-4 last:border-0 last:pb-0">
                      <div>
                        <p className="font-medium">{election.name}</p>
                        <p className="text-sm text-gray-500">Date: {new Date(election.date).toLocaleDateString()}</p>
                      </div>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {election.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Voters */}
          <Card>
            <CardHeader>
              <CardTitle>Recently Registered Voters</CardTitle>
              <CardDescription>Voters registered in the last 7 days</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p>Loading voters...</p>
              ) : (
                <div className="space-y-4">
                  {voters.map((voter) => (
                    <div key={voter.voter_id} className="border-b pb-4 last:border-0 last:pb-0">
                      <div className="flex justify-between">
                        <p className="font-medium">{voter.name}</p>
                        <span className="text-xs text-gray-500">Just now</span>
                      </div>
                      <p className="text-sm text-gray-500">Voter ID: {voter.voter_card_number}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
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
