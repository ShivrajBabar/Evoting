import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Layout from '@/components/Layout';
import { Search, Eye, Download } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";

type Candidate = {
  id: number;
  name: string;
  party: string;
  symbol: string;
  election_type: string;
  constituency_id: number;
  constituency_name: string;
  status: string;
  photo_url: string;
};

type Constituency = {
  id: number;
  name: string;
  type: string;
};

const AdminCandidates = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [viewCandidate, setViewCandidate] = useState<Candidate | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [constituencies, setConstituencies] = useState<Constituency[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [electionFilter, setElectionFilter] = useState('all');
  const [constituencyFilter, setConstituencyFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Fetch constituencies data
  useEffect(() => {
    const fetchConstituencies = async () => {
      try {
        // In a real app, you would use the actual state_id and district_id from user context

        const stateId = user && 'state_id' in user ? (user as any).state_id : 1;
        const response = await fetch(`/api/constituencies?type=loksabha&state_id=${stateId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch constituencies');
        }
        const data = await response.json();
        setConstituencies(data.map((c: any) => ({ ...c, type: 'loksabha' })));
      } catch (error) {
        console.error('Error fetching constituencies:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load constituencies data",
        });
      }
    };

    fetchConstituencies();
  }, [user, toast]);


  // Fetch candidates data
  useEffect(() => {
    const fetchCandidates = async () => {
      setLoading(true);
      try {
        const stateId = user && 'state_id' in user ? (user as any).state_id : 1;
        const adminVidhansabhaId = user && 'vidhansabha_id' in user ? (user as any).vidhansabha_id : null;

        const response = await fetch(`/api/candidates?state_id=${stateId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch candidates');
        }

        const dataFromApi = await response.json();

        // Filter candidates by admin's vidhansabha_id
        const filtered = dataFromApi.filter((c: any) => c.vidhansabha_id === adminVidhansabhaId);

        // Map filtered data to Candidate type
        const mappedCandidates: Candidate[] = filtered.map((c: any) => ({
          id: c.id,
          name: c.name,
          party: c.party,
          status: c.status ? c.status.charAt(0).toUpperCase() + c.status.slice(1) : 'Unknown',
          photo_url: c.photo_url || '', // ✅ Use correct field
          symbol: '', // Use c.party_logo_url if you want to display party symbol
          election_type: c.election_type?.toLowerCase().includes('lok') ? 'loksabha' : 'vidhansabha', // ✅ Updated field
          constituency_id: c.vidhansabha_id || 0,
          constituency_name: c.constituency_name || 'Unknown', // ✅ Use correct field
        }));


        setCandidates(mappedCandidates);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching candidates:', error);
        setLoading(false);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load candidates data",
        });
      }
    };

    fetchCandidates();
  }, [user, toast]);



  const handleViewCandidate = (candidate: Candidate) => {
    setViewCandidate(candidate);
    setDialogOpen(true);
  };
  // Filter candidates based on search and filters
  const filteredCandidates = candidates.filter(candidate => {
    const matchesSearch = candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      candidate.party.toLowerCase().includes(searchTerm.toLowerCase()) ||
      candidate.constituency_name.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesElection = electionFilter === 'all' ||
      (electionFilter === 'loksabha' && candidate.election_type === 'loksabha') ||
      (electionFilter === 'vidhansabha' && candidate.election_type === 'vidhansabha');

    const matchesConstituency = constituencyFilter === 'all' ||
      candidate.constituency_id.toString() === constituencyFilter;

    const matchesStatus = statusFilter === 'all' ||
      candidate.status.toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesElection && matchesConstituency && matchesStatus;
  });

  

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header with actions */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
          <div>
            <h1 className="text-2xl font-bold">Candidates</h1>
            <p className="text-gray-500">Candidates in {user?.constituency || 'your constituency'}</p>
          </div>
          
        </div>

        {/* Search and filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search candidates..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <Select value={electionFilter} onValueChange={setElectionFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Election Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Elections</SelectItem>
              <SelectItem value="loksabha">Lok Sabha</SelectItem>
              <SelectItem value="vidhansabha">Vidhan Sabha</SelectItem>
            </SelectContent>
          </Select>

         

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Candidates Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Candidates</CardTitle>
            <CardDescription>Candidates registered for elections in your constituency</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="px-4 py-3 text-left">Photo</th>
                      <th className="px-4 py-3 text-left">Name</th>
                      <th className="px-4 py-3 text-left">Party</th>
                      <th className="px-4 py-3 text-left">Constituency</th>
                      <th className="px-4 py-3 text-left">Election Type</th>
                      <th className="px-4 py-3 text-left">Status</th>
                      <th className="px-4 py-3 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCandidates.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="px-4 py-6 text-center text-gray-500">
                          No candidates found matching your criteria
                        </td>
                      </tr>
                    ) : (
                      filteredCandidates.map((candidate) => (
                        <tr key={candidate.id} className="border-b">
                          <td className="px-4 py-3">
                            <div className="h-10 w-10 rounded-full overflow-hidden">
                              <img
                                src={candidate.photo_url}
                                alt={candidate.name}
                                className="h-full w-full object-cover"
                              />
                            </div>
                          </td>
                          <td className="px-4 py-3 font-medium">{candidate.name}</td>
                          <td className="px-4 py-3">{candidate.party}</td>
                          <td className="px-4 py-3">{candidate.constituency_name}</td>
                          <td className="px-4 py-3">
                            {candidate.election_type === 'loksabha' ? 'Lok Sabha' : 'Vidhan Sabha'}
                          </td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium 
                              ${candidate.status === 'Approved' ? 'bg-green-100 text-green-800' :
                                candidate.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-red-100 text-red-800'}`}>
                              {candidate.status}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewCandidate(candidate)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Candidate Details Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Candidate Details</DialogTitle>
            <DialogDescription>
              Information about the selected candidate
            </DialogDescription>
          </DialogHeader>
          {viewCandidate && (
            <div className="space-y-4">
              <div className="flex justify-center mb-4">
                <div className="h-32 w-32 rounded-full overflow-hidden">
                  <img
                    src={viewCandidate.photo_url}
                    alt={viewCandidate.name}
                    className="h-full w-full object-cover"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Name</p>
                  <p className="text-sm">{viewCandidate.name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">ID</p>
                  <p className="text-sm">{viewCandidate.id}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Party</p>
                  <p className="text-sm">{viewCandidate.party}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Constituency</p>
                  <p className="text-sm">{viewCandidate.constituency_name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Election Type</p>
                  <p className="text-sm">
                    {viewCandidate.election_type === 'loksabha' ? 'Lok Sabha' : 'Vidhan Sabha'}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Status</p>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium 
                    ${viewCandidate.status === 'Approved' ? 'bg-green-100 text-green-800' :
                      viewCandidate.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'}`}>
                    {viewCandidate.status}
                  </span>
                </div>
              </div>
              <div className="pt-4">
                <Button
                  variant="secondary"
                  onClick={() => setDialogOpen(false)}
                  className="w-full"
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default AdminCandidates;