import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Layout from '@/components/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { Calendar, Vote, AlertCircle, Check, Info } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const VoterElections = () => {
  const { toast } = useToast();
  const [elections, setElections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Get user data from localStorage
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const voterEmail = user?.email; // Get email from user object

  useEffect(() => {
    const fetchElectionsAndCandidates = async () => {
      try {
        const res = await fetch('http://localhost:3000/api/elections');
        const data = await res.json();

        // Match voter eligibility
        const filtered = data.filter((election: any) => {
          const loksabhaMatch = Number(election.loksabha) === Number(user.loksabha_id);
          const vidhansabhaMatch = Number(election.vidhansabha) === Number(user.vidhansabha_id);
          const localBodyMatch = Number(election.localBody) === Number(user.local_body_id);
          return loksabhaMatch || vidhansabhaMatch || localBodyMatch;
        });

        const normalized = filtered.map((e: any) => {
          if (e.status === "Scheduled") return { ...e, status: "Upcoming" };
          return e;
        });

        const electionsWithCandidates = await Promise.all(
          normalized.map(async (election: any) => {
            if (election.status === 'Active') {
              const candidatesRes = await fetch(`http://localhost:3000/api/candidates?election_id=${election.id}`);
              const candidatesData = await candidatesRes.json();
              return { ...election, candidates: candidatesData };
            }
            return election;
          })
        );

        setElections(electionsWithCandidates);
      } catch (error) {
        console.error("Error loading elections:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchElectionsAndCandidates();
  }, []);



  const handleVote = async (candidateId: number, electionId: number) => {
    if (!user?.id || !voterEmail) {
      toast({
        title: "Unauthorized",
        description: "Please login as a voter to cast your vote."
      });
      return;
    }

    try {
      const response = await fetch('http://localhost:3000/api/votes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: voterEmail,        // From localStorage
          candidate_id: candidateId, // From the vote button click
          election_id: electionId    // From the election card
        })
      });

      const result = await response.json();

      if (response.ok) {
        toast({
          title: "Vote Cast Successfully",
          description: `Your vote for election #${electionId} has been recorded.`,
        });

        // Update UI to show vote was cast
        setElections(prev =>
          prev.map(e =>
            e.id === electionId ? { ...e, voteCast: true } : e
          )
        );
      } else {
        toast({
          title: "Vote Failed",
          description: result.error || "You may have already voted.",
        });
      }
    } catch (error) {
      console.error("Voting error:", error);
      toast({
        title: "Server Error",
        description: "Failed to cast vote. Please try again later.",
      });
    }
  };



  const handleViewReceipt = (receipt: string) => {
    toast({
      title: "Vote Receipt",
      description: `Your voting receipt: ${receipt}`,
    });
  };

  if (loading) {
    return (
      <Layout>
        <div className="text-center py-10 text-gray-500">Loading elections...</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">My Elections</h1>
          <p className="text-gray-500">Elections you are eligible to vote in</p>
        </div>

        {/* Active Election Alert */}
        {elections.some(election => election.status === 'Active') && (
          <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-md">
            <div className="flex">
              <AlertCircle className="h-6 w-6 text-green-500 mr-3" />
              <div>
                <p className="font-medium text-green-800">Active Election</p>
                <p className="text-green-700">You have an active election where you can cast your vote now.</p>
              </div>
            </div>
          </div>
        )}

        {/* Active Elections */}
        {elections.filter(e => e.status === 'Active').length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Active Elections</h2>
            {elections.filter(e => e.status === 'Active').map(election => (
              <Card key={election.id} className="border-l-4 border-green-500">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle>{election.name}</CardTitle>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {election.status}
                    </span>
                  </div>
                  <CardDescription>Ends today at {election.endTime || '5:00 PM'}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-500 mb-4">{election.description}</p>
                  <div className="flex items-center text-sm mb-6">
                    <Calendar className="mr-2 h-4 w-4 text-gray-500" />
                    <span>Date: {election.date}</span>
                  </div>

                  {/* Candidates */}
                  {election.candidates?.filter((c: any) => c.election_id === election.id).length > 0 && (
                    <div className="space-y-4">
                      <h3 className="font-medium">Select a candidate to vote:</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {election.candidates
                          .filter((c: any) => c.election_id === election.id)
                          .map((candidate: any) => (
                            <div key={candidate.id} className="border rounded-md p-3 hover:border-primary hover:bg-gray-50">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="font-medium">{candidate.name}</p>
                                  <p className="text-sm text-gray-500">{candidate.party}</p>
                                </div>
                                <div className="text-xl">{candidate.symbol?.split?.(' ')[0] || '🗳️'}</div>
                              </div>
                              <Button
                                className="w-full mt-2"
                                onClick={() => handleVote(candidate.id, election.id)}
                                size="sm"
                              >
                                <Vote className="mr-2 h-4 w-4" /> Vote
                              </Button>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}

                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Upcoming Elections */}
        {elections.filter(e => e.status === 'Upcoming').length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Upcoming Elections</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {elections
                .filter(e => e.status === 'Upcoming')
                .map(election => (
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
                        <div className="flex items-center text-sm text-blue-600">
                          <Info className="mr-2 h-4 w-4" />
                          You will be able to vote when the election begins.
                        </div>
                      ) : (
                        <div className="flex items-center text-sm text-gray-500">
                          <AlertCircle className="mr-2 h-4 w-4" />
                          You are not eligible to vote in this election.
                        </div>
                      )}
                    </CardFooter>
                  </Card>
                ))}
            </div>
          </div>
        )}

        {/* Completed Elections */}
        {elections.filter(e => e.status === 'Completed').length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Past Elections</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {elections
                .filter(e => e.status === 'Completed')
                .map(election => (
                  <Card key={election.id} className={election.voteCast ? "border-l-4 border-green-500" : ""}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <CardTitle>{election.name}</CardTitle>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
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
                      {election.voteCast ? (
                        <div className="flex justify-between items-center w-full">
                          <div className="flex items-center text-sm text-green-600">
                            <Check className="mr-2 h-4 w-4" />
                            You voted in this election
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleViewReceipt(election.receipt || '')}
                          >
                            View Receipt
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center text-sm text-gray-500">
                          {election.eligibleToVote
                            ? "You did not vote in this election."
                            : "You were not eligible to vote in this election."
                          }
                        </div>
                      )}
                    </CardFooter>
                  </Card>
                ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default VoterElections;
