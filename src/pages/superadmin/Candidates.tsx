import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Layout from '@/components/Layout';
import { UserPlus, Search, Edit, Trash2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Link, useNavigate } from 'react-router-dom';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

const SuperadminCandidates = () => {
  const { toast } = useToast();
  const navigate = useNavigate();

  const [electionFilter, setElectionFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [candidates, setCandidates] = useState([]);

  // Utility to calculate age
  const calculateAge = (dob) => {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  useEffect(() => {
    const fetchCandidates = async () => {
      try {
        const response = await fetch('/api/candidates');
        if (!response.ok) {
          throw new Error('Failed to fetch candidates');
        }
        const data = await response.json();

        const mappedCandidates = data.map(candidate => ({
          ...candidate,
          age: calculateAge(candidate.dob),
        }));

        setCandidates(mappedCandidates);
      } catch (error) {
        toast({
          title: 'Error',
          description: error.message,
          variant: 'destructive',
        });
      }
    };

    fetchCandidates();
  }, []);

  const filteredCandidates = candidates.filter(candidate => {
    const matchesSearch = searchQuery === '' ||
      candidate.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      candidate.party.toLowerCase().includes(searchQuery.toLowerCase()) ||
      candidate.constituency_name.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesElection = electionFilter === 'all' || candidate.election_type === electionFilter;
    const matchesStatus = statusFilter === 'all' || candidate.status === statusFilter;

    return matchesSearch && matchesElection && matchesStatus;
  });

  const elections = [...new Set(candidates.map(candidate => candidate.election_type))];

  const handleEditCandidate = (id) => {
    navigate(`/superadmin/candidates/edit/${id}`);
  };

  const handleDeleteCandidate = async (id) => {
    if (!window.confirm('Are you sure you want to delete this candidate?')) return;

    try {
      const res = await fetch(`/api/candidates/${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        throw new Error('Failed to delete candidate');
      }

      // Remove candidate from local state
      setCandidates(prev => prev.filter(candidate => candidate.id !== id));

      toast({
        title: "Candidate Deleted",
        description: `Candidate with ID ${id} has been removed.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: 'destructive',
      });
    }
  };




  const updateCandidateStatus = async (id, newStatus) => {
    try {
      const res = await fetch(`/api/candidates/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (!res.ok) {
        throw new Error('Failed to update status');
      }

      setCandidates(prev =>
        prev.map(candidate =>
          candidate.id === id ? { ...candidate, status: newStatus } : candidate
        )
      );

      toast({
        title: "Status Updated",
        description: `Candidate status changed to ${newStatus}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: 'destructive',
      });
    }
  };


  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
          <h1 className="text-2xl font-bold">Candidate Management</h1>
          <Button asChild>
            <Link to="/superadmin/candidates/register">
              <UserPlus className="h-4 w-4 mr-2" /> Register Candidate
            </Link>
          </Button>
        </div>

        <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search candidates..."
              className="pl-10 pr-4 py-2 border rounded-md w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="w-full sm:w-64">
            <Select value={electionFilter} onValueChange={setElectionFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Elections" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Elections</SelectItem>
                {elections.map((election) => (
                  <SelectItem key={election} value={election}>{election}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="w-full sm:w-48">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Approved">Approved</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Election Candidates</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3">Name</th>
                    <th className="px-6 py-3">Party</th>
                    <th className="px-6 py-3">Age</th>
                    <th className="px-6 py-3">Constituency</th>
                    <th className="px-6 py-3">Election</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCandidates.map((candidate) => (
                    <tr key={candidate.id} className="border-b hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium">{candidate.name}</td>
                      <td className="px-6 py-4">{candidate.party}</td>
                      <td className="px-6 py-4">{candidate.age}</td>
                      <td className="px-6 py-4">{candidate.constituency_name}</td>
                      <td className="px-6 py-4">{candidate.election_type}</td>
                      <td className="px-6 py-4">
                        <Popover>
                          <PopoverTrigger asChild>
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium cursor-pointer
                                ${candidate.status === 'Approved' ? 'bg-green-100 text-green-800' :
                                  candidate.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                                    'bg-yellow-100 text-yellow-800'}`}
                            >
                              {candidate.status}
                            </span>
                          </PopoverTrigger>
                          <PopoverContent className="w-56">
                            <div className="space-y-4">
                              <h4 className="font-medium">Update Status</h4>
                              <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <Label htmlFor={`approved-${candidate.id}`}>Approved</Label>
                                  <Switch
                                    id={`approved-${candidate.id}`}
                                    checked={candidate.status === 'Approved'}
                                    onCheckedChange={() => updateCandidateStatus(candidate.id, 'Approved')}
                                  />
                                </div>
                                <div className="flex items-center justify-between">
                                  <Label htmlFor={`pending-${candidate.id}`}>Pending</Label>
                                  <Switch
                                    id={`pending-${candidate.id}`}
                                    checked={candidate.status === 'Pending'}
                                    onCheckedChange={() => updateCandidateStatus(candidate.id, 'Pending')}
                                  />
                                </div>
                                <div className="flex items-center justify-between">
                                  <Label htmlFor={`rejected-${candidate.id}`}>Rejected</Label>
                                  <Switch
                                    id={`rejected-${candidate.id}`}
                                    checked={candidate.status === 'Rejected'}
                                    onCheckedChange={() => updateCandidateStatus(candidate.id, 'Rejected')}
                                  />
                                </div>
                              </div>
                            </div>
                          </PopoverContent>
                        </Popover>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end space-x-2">
                          <Button variant="ghost" size="sm" onClick={() => handleEditCandidate(candidate.id)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDeleteCandidate(candidate.id)}>
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredCandidates.length === 0 && (
                <div className="py-8 text-center text-gray-500">
                  No candidates match your search criteria
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default SuperadminCandidates;
