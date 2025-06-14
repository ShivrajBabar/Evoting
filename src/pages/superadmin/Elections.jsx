import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Layout from '@/components/Layout';
import { Plus, Search, Edit, Trash2, Calendar, Eye } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import axios from 'axios';

const SuperadminElections = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [voters, setVoters] = useState([]);

  // Fetch voters data
  useEffect(() => {
    const fetchVoters = async () => {
      try {
        const res = await axios.get('/api/voters');
        setVoters(res.data);
      } catch (error) {
        console.error('Error fetching voters:', error);
        toast({
          title: "Error",
          description: "Failed to fetch voters",
          variant: "destructive",
        });
      }
    };
    fetchVoters();
  }, [toast]);

  // Fetch elections data
  const { data: elections = [], isLoading } = useQuery({
    queryKey: ['elections'],
    queryFn: async () => {
      try {
        const response = await axios.get('/api/elections');
        return Array.isArray(response.data) ? response.data : [];
      } catch (error) {
        console.error('Error fetching elections:', error);
        toast({
          title: "Error",
          description: "Failed to fetch elections",
          variant: "destructive"
        });
        return [];
      }
    }
  });

  // Map eligible voters by election type
  const electionsWithVoterCount = elections.map(election => {
    let eligibleVotersCount = 0;

    if (election.type === 'Lok Sabha') {
      eligibleVotersCount = voters.filter(voter =>
        Number(voter.loksabha_ward_id) === Number(election.loksabha)
      ).length;
    } else if (election.type === 'Vidhan Sabha') {
      eligibleVotersCount = voters.filter(voter =>
        Number(voter.vidhansabha_ward_id) === Number(election.vidhansabha)
      ).length;
    }

    return {
      ...election,
      eligibleVoters: eligibleVotersCount
    };
  });

  // 🔥 Delete election directly using axios
  const deleteElectionMutation = useMutation({
    mutationFn: async (id) => {
      return await axios.delete(`/api/elections/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['elections']);
      toast({
        title: "Success",
        description: "Election deleted successfully",
      });
      setIsDialogOpen(false);
      setConfirmDeleteId(null);
    },
    onError: (error) => {
      console.error('Error deleting election:', error);
      toast({
        title: "Error",
        description: "Failed to delete election",
        variant: "destructive"
      });
    }
  });

  const handleEditElection = (id) => {
    navigate(`/superadmin/elections/edit/${id}`);
  };

  const handleDeleteElection = (id) => {
    setConfirmDeleteId(id);
    setIsDialogOpen(true);
  };

  const confirmDelete = () => {
    if (confirmDeleteId) {
      deleteElectionMutation.mutate(confirmDeleteId);
    }
  };

  const handleViewResults = (id) => {
    navigate(`/superadmin/results?election=${id}`);
    toast({
      title: "View Results",
      description: `Viewing results for election ID: ${id}`,
    });
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
          <h1 className="text-2xl font-bold">Election Management</h1>
          <Button asChild>
            <Link to="/superadmin/elections/create">
              <Plus className="h-4 w-4 mr-2" /> Create Election
            </Link>
          </Button>
        </div>

        <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search elections..."
              className="pl-10 pr-4 py-2 border rounded-md w-full"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {electionsWithVoterCount.length > 0 ? (
            electionsWithVoterCount.map((election) => (
              <Card key={election.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle>{election.name}</CardTitle>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium 
                      ${election.status === 'Active' ? 'bg-green-100 text-green-800' :
                        election.status === 'Scheduled' ? 'bg-blue-100 text-blue-800' :
                          election.status === 'Preparation' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'}`}>
                      {election.status}
                    </span>
                  </div>
                  <CardDescription>{election.type} Election</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                      <span className="text-sm">{election.date}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <p className="text-gray-500">Candidates</p>
                        <p className="font-medium">{election.candidates}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Eligible Voters</p>
                        <p className="font-medium">{(election.eligibleVoters || 0).toLocaleString()}</p>
                      </div>
                      {election.turnout && (
                        <div>
                          <p className="text-gray-500">Turnout</p>
                          <p className="font-medium">{election.turnout}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditElection(election.id)}
                    >
                      <Edit className="h-4 w-4 mr-1" /> Edit
                    </Button>
                    {election.status === 'Completed' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewResults(election.id)}
                      >
                        <Eye className="h-4 w-4 mr-1" /> Results
                      </Button>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteElection(election.id)}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </CardFooter>
              </Card>
            ))
          ) : (
            <div className="col-span-3 text-center py-8">
              <p className="text-gray-500">No elections found</p>
            </div>
          )}
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this election? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={deleteElectionMutation.isPending}
            >
              {deleteElectionMutation.isPending ? "Deleting..." : "Delete Election"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default SuperadminElections;
