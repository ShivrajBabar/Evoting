
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Layout from '@/components/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { Calendar, Vote, AlertCircle, Check, Info } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const VoterElections = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  // Mock elections data for voter
  const elections = [
    { 
      id: 1, 
      name: 'Lok Sabha Elections 2025', 
      date: '2025-04-15', 
      status: 'Upcoming',
      description: 'General elections for the lower house of the Parliament of India',
      eligibleToVote: true,
      voteCast: false,
    },
    { 
      id: 2, 
      name: 'Maharashtra Vidhan Sabha Elections', 
      date: '2024-10-20',
      status: 'Upcoming',
      description: 'Elections for Maharashtra State Legislative Assembly',
      eligibleToVote: true,
      voteCast: false,
    },
    { 
      id: 3, 
      name: 'Mumbai Municipal Corporation Elections', 
      date: '2024-08-25', 
      status: 'Active',
      description: 'Elections for the Municipal Corporation of Mumbai',
      eligibleToVote: true,
      voteCast: false,
      endTime: '5:00 PM',
      candidates: [
        { id: 101, name: 'Rajesh Kumar', party: 'Democratic Party', symbol: '🌸 Flower' },
        { id: 102, name: 'Priya Sharma', party: 'Progressive Alliance', symbol: '🌿 Leaf' },
        { id: 103, name: 'Amit Singh', party: 'National Front', symbol: '🌞 Sun' },
        { id: 104, name: 'Kavita Patel', party: 'People\'s Party', symbol: '🏵️ Rosette' },
      ]
    },
    { 
      id: 4, 
      name: 'Delhi Municipal Corporation Elections', 
      date: '2023-12-15', 
      status: 'Completed',
      description: 'Elections for the Municipal Corporation of Delhi',
      eligibleToVote: false,
      voteCast: false,
    },
    { 
      id: 5, 
      name: 'Gujarat Panchayat Elections', 
      date: '2023-11-10', 
      status: 'Completed',
      description: 'Elections for Gujarat Panchayats',
      eligibleToVote: true,
      voteCast: true,
      receipt: 'GPE2023-5678',
    }
  ];

  const handleVote = (electionId: number) => {
    toast({
      title: "Vote Cast Successfully",
      description: `Your vote for election #${electionId} has been recorded. Receipt: MCE2024-1234`,
    });
  };

  const handleViewReceipt = (receipt: string) => {
    toast({
      title: "Vote Receipt",
      description: `Your voting receipt: ${receipt}`,
    });
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold">My Elections</h1>
          <p className="text-gray-500">Elections you are eligible to vote in</p>
        </div>

        {/* Active Elections Alert */}
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

        {/* Elections Sections */}
        {/* Active Elections */}
        {elections.filter(e => e.status === 'Active').length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Active Elections</h2>
            {elections
              .filter(election => election.status === 'Active')
              .map(election => (
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
                    <div className="flex items-center text-sm mb-6">
                      <Calendar className="mr-2 h-4 w-4 text-gray-500" />
                      <span>Date: {election.date}</span>
                    </div>
                    
                    {/* Candidates Section */}
                    {election.candidates && election.candidates.length > 0 && (
                      <div className="space-y-4">
                        <h3 className="font-medium">Select a candidate to vote:</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {election.candidates.map(candidate => (
                            <div key={candidate.id} className="border rounded-md p-3 hover:border-primary hover:bg-gray-50">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="font-medium">{candidate.name}</p>
                                  <p className="text-sm text-gray-500">{candidate.party}</p>
                                </div>
                                <div className="text-xl">{candidate.symbol.split(' ')[0]}</div>
                              </div>
                              <Button 
                                className="w-full mt-2" 
                                onClick={() => handleVote(election.id)}
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
                .filter(election => election.status === 'Upcoming')
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
                .filter(election => election.status === 'Completed')
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
                          {election.eligibleToVote ? 
                            "You did not vote in this election." : 
                            "You were not eligible to vote in this election."
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
