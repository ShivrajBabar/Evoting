import React, { useEffect, useState } from 'react';
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter
} from "@/components/ui/card";
import { useAuth } from '@/contexts/AuthContext';
import Layout from '@/components/Layout';
import { Vote, Calendar, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

interface ExtendedUser {
  id: number;
  name: string;
  email: string;
  phone?: string;
  role: string;
  photo?: string | null;
  local_body_id?: number;
  vidhansabha_id?: number;
  loksabha_id?: number;
}

interface Election {
  id: number;
  name: string;
  date: string;
  status: string;
  description: string;
  loksabha?: number;
  vidhansabha?: number;
  localBody?: number;
}

const VoterDashboard = () => {
  const { user } = useAuth();

  const typedUser: ExtendedUser = {
    id: Number(user?.id),
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone,
    role: user?.role || '',
    photo: user?.photo || null,
    local_body_id: user?.local_body_id ? Number(user.local_body_id) : undefined,
    vidhansabha_id: user?.vidhansabha_id ? Number(user.vidhansabha_id) : undefined,
    loksabha_id: user?.loksabha_id ? Number(user.loksabha_id) : undefined,
  };

  const [ongoingElections, setOngoingElections] = useState<Election[]>([]);
  const [upcomingElections, setUpcomingElections] = useState<Election[]>([]);
  const [loading, setLoading] = useState(true);

  const today = new Date();

  useEffect(() => {
  const fetchElections = async () => {
    try {
      const res = await fetch('/api/elections');
      const data: Election[] = await res.json();

      console.log("User IDs:", typedUser);
      console.log("Fetched elections:", data);

      const filtered = data.filter(election => {
        const loksabhaMatch = Number(election.loksabha) === typedUser.loksabha_id;
        const vidhansabhaMatch = Number(election.vidhansabha) === typedUser.vidhansabha_id;
        const localBodyMatch = Number(election.localBody) === typedUser.local_body_id;

        if (loksabhaMatch || vidhansabhaMatch || localBodyMatch) {
          console.log("MATCHED election:", election.name);
        }

        return loksabhaMatch || vidhansabhaMatch || localBodyMatch;
      });

      const upcoming: Election[] = [];
      const ongoing: Election[] = [];

      for (const election of filtered) {
        const electionDate = new Date(election.date);
        if (election.status.toLowerCase() === 'active') {
          ongoing.push(election);
        } else if (electionDate > new Date()) {
          upcoming.push(election);
        }
      }

      setOngoingElections(ongoing);
      setUpcomingElections(upcoming);
    } catch (err) {
      console.error("Error fetching elections:", err);
    } finally {
      setLoading(false);
    }
  };

  fetchElections();
}, [typedUser]);


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
            <h2 className="text-2xl font-bold">Welcome, {typedUser.name}</h2>
            <p className="mt-2">You are viewing elections relevant to your constituency.</p>
          </CardContent>
        </Card>

        {/* Important Notice */}
        <Card className="border-l-4 border-amber-500">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center">
              <AlertCircle className="h-5 w-5 mr-2 text-amber-500" />
              Important Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p>Please keep your Voter ID and government-issued photo ID ready when casting your vote.</p>
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
                    <CardDescription>Ends today at 5:00 PM</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-500 mb-4">{election.description}</p>
                    <div className="flex items-center text-sm">
                      <Calendar className="mr-2 h-4 w-4 text-gray-500" />
                      <span>Date: {new Date(election.date).toLocaleDateString()}</span>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button className="w-full" asChild>
                      <Link to="/voter/elections">
                        <Vote className="mr-2 h-4 w-4" />
                        Cast Your Vote
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Upcoming Elections */}
        {upcomingElections.length > 0 && (
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
                      <span>Date: {new Date(election.date).toLocaleDateString()}</span>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <p className="text-sm text-gray-500">You will be able to vote when the election begins.</p>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        )}

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
