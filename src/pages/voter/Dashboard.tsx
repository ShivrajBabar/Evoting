
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { useAuth } from '@/contexts/AuthContext';
import Layout from '@/components/Layout';
import { Vote, Calendar, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const VoterDashboard = () => {
  const { user } = useAuth();
  
  // Mock upcoming elections
  const upcomingElections = [
    { 
      id: 1, 
      name: 'Lok Sabha Elections 2025', 
      date: '2025-04-15', 
      status: 'Upcoming',
      description: 'General elections for the lower house of the Parliament of India',
      eligibleToVote: true
    }
  ];

  // Mock ongoing elections
  const ongoingElections = [
    { 
      id: 2, 
      name: 'Mumbai Municipal Corporation Elections', 
      date: '2024-08-25', 
      status: 'Active',
      description: 'Elections for the Municipal Corporation of Mumbai',
      eligibleToVote: true,
      endTime: '5:00 PM'
    }
  ];

  // Mock user's voting history
  const votingHistory = [
    { id: 1, election: 'Maharashtra Vidhan Sabha Elections', date: '2023-11-20', receipt: 'MHVS2023001234' },
    { id: 2, election: 'Lok Sabha Elections', date: '2022-05-15', receipt: 'LSGE2022005678' },
  ];

  return (
    <Layout>
      <div className="space-y-6">
        {/* Welcome message */}
        <Card className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
          <CardContent className="p-6">
            <h2 className="text-2xl font-bold">Welcome, {user?.name}</h2>
            <p className="mt-2">You are viewing {user?.electionType || 'All'} elections</p>
          </CardContent>
        </Card>

        {/* Important Notice Card */}
        <Card className="border-l-4 border-amber-500">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center">
              <AlertCircle className="h-5 w-5 mr-2 text-amber-500" />
              Important Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p>Please keep your Voter ID and government-issued photo ID ready when casting your vote. For any assistance, contact your local election office.</p>
          </CardContent>
        </Card>

        {/* Ongoing Elections */}
        {ongoingElections.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-800">Ongoing Elections</h2>
            <div className="grid grid-cols-1 gap-4">
              {ongoingElections.map((election) => (
                <Card key={election.id} className="border-l-4 border-green-500">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle>{election.name}</CardTitle>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {election.status}
                      </span>
                    </div>
                    <CardDescription>Ends today at {election.endTime}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-500 mb-4">{election.description}</p>
                    <div className="flex items-center text-sm">
                      <Calendar className="mr-2 h-4 w-4 text-gray-500" />
                      <span>Date: {election.date}</span>
                    </div>
                  </CardContent>
                  <CardFooter>
                    {election.eligibleToVote ? (
                      <Button className="w-full" asChild>
                        <Link to="/voter/elections">
                          <Vote className="mr-2 h-4 w-4" />
                          Cast Your Vote
                        </Link>
                      </Button>
                    ) : (
                      <p className="text-sm text-gray-500">You are not eligible to vote in this election.</p>
                    )}
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Upcoming Elections */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-gray-800">Upcoming Elections</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {upcomingElections.map((election) => (
              <Card key={election.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle>{election.name}</CardTitle>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {election.status}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-500 mb-4">{election.description}</p>
                  <div className="flex items-center text-sm">
                    <Calendar className="mr-2 h-4 w-4 text-gray-500" />
                    <span>Date: {election.date}</span>
                  </div>
                </CardContent>
                <CardFooter>
                  {election.eligibleToVote ? (
                    <p className="text-sm text-gray-500">You will be able to vote when the election begins.</p>
                  ) : (
                    <p className="text-sm text-gray-500">You are not eligible to vote in this election.</p>
                  )}
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>

        {/* Voting History */}
        <Card>
          <CardHeader>
            <CardTitle>Your Voting History</CardTitle>
            <CardDescription>Records of your previous votes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {votingHistory.map((vote) => (
                <div key={vote.id} className="flex justify-between items-center border-b pb-4 last:border-0 last:pb-0">
                  <div>
                    <p className="font-medium">{vote.election}</p>
                    <p className="text-sm text-gray-500">Date: {vote.date}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">Receipt ID:</p>
                    <p className="text-xs text-gray-500">{vote.receipt}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default VoterDashboard;
