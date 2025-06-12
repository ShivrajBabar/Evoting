import React, { useState } from 'react';
import Layout from '@/components/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { ResultService, ElectionService } from '@/api/apiService';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { FileCheck, AlertTriangle, Search, Eye, EyeOff, Trash2, RefreshCw } from 'lucide-react';
import axios from 'axios';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/components/ui/use-toast';

const SuperadminResults = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedElection, setSelectedElection] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedElectionId, setSelectedElectionId] = useState('');

  // Fetch elections from API
  const {
    data: elections = [],
    isLoading: electionsLoading,
    error: electionsError,
    refetch: refetchElections
  } = useQuery({
    queryKey: ['admin-elections'],
    queryFn: async () => {
      try {
        const response = await ElectionService.getAllElections();
        return Array.isArray(response) ? response : [];
      } catch (error) {
        console.error('Error fetching elections:', error);
        toast({
          title: "Error",
          description: "Failed to load elections",
          variant: "destructive"
        });
        return [];
      }
    }
  });


  // Fetch results

  const {
    data: results = [],
    isLoading: resultsLoading,
    refetch: refetchResults
  } = useQuery({
    queryKey: ['admin-results', selectedElection],
    queryFn: async () => {
      try {
        const queryParams = new URLSearchParams();

        if (selectedElection !== 'all') {
          const electionId = parseInt(selectedElection);
          if (!isNaN(electionId)) {
            queryParams.append('election_id', electionId);
          }
        }

        const response = await fetch(`http://localhost:3000/api/results?${queryParams.toString()}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to fetch results");
        }

        // Transform the data - handle string "1"/"0" for published status
        return data.data.map(result => ({
          id: result.id,
          election_id: result.election_id,
          election_name: result.election_name,
          winner_name: result.winner,
          winner_party: result.winner_party,
          total_votes: result.total_votes,
          published: result.published === "1", // Handle string "1" or "0"
          published_date: result.date,
          vidhansabha_id: result.vidhansabha_id,
          loksabha_id: result.loksabha_id,
          constituency_name: result.vidhansabha_name || result.loksabha_name || 'Unknown Constituency',
          winner_id: result.winner_id
        }));
      } catch (error) {
        console.error('Error fetching results:', error);
        toast({
          title: "Error",
          description: "Failed to load election results",
          variant: "destructive"
        });
        return [];
      }
    }
  });

  // Format election options for the dropdown
  const electionOptions = [
    { id: 'all', name: 'All Elections' },
    ...(Array.isArray(elections) ? elections.map((election) => ({
      id: election.id.toString(),
      name: election.name
    })) : []
    )];

  // Filter results based on search query
  const filteredResults = results.filter(result => {
    if (!searchQuery) return true;

    const query = searchQuery.toLowerCase();
    return (
      result.constituency_name?.toLowerCase().includes(query) ||
      result.election_name?.toLowerCase().includes(query) ||
      result.winner_name?.toLowerCase().includes(query)
    );
  });


  const togglePublishStatus = async (resultId, currentPublishStatus) => {
    try {
      const newStatus = currentPublishStatus ? 0 : 1;

      const response = await axios.patch(`http://localhost:3000/api/results/${resultId}/publish`, {
        published: newStatus
      });

      if (response.data.success) {
        toast({
          title: "Success",
          description: newStatus === 1 ? "Result published" : "Result unpublished",
          variant: "default"
        });

        // Optimistically update the UI
        queryClient.setQueryData(['admin-results', selectedElection], (oldData) => {
          return oldData.map(result => {
            if (result.id === resultId) {
              return {
                ...result,
                published: newStatus === 1,
                published_date: newStatus === 1 ? new Date().toISOString() : result.published_date
              };
            }
            return result;
          });
        });

        // Force a refetch to ensure consistency
        await queryClient.invalidateQueries(['admin-results', selectedElection]);
      } else {
        throw new Error(response.data.error || "Failed to update status");
      }
    } catch (error) {
      console.error('❌ Error toggling publish status:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update result status",
        variant: "destructive"
      });
      // Revert by forcing a refetch
      await queryClient.invalidateQueries(['admin-results', selectedElection]);
    }
  };





  // Delete result
  const deleteResult = async (resultId) => {
    try {
      console.log('Deleting result with ID:', resultId); // Debug log

      const response = await fetch(`http://localhost:3000/api/results/${resultId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete result');
      }

      toast({
        title: "Success",
        description: "Result deleted successfully",
        variant: "default"
      });

      // Refresh the results list
      await refetchResults();
    } catch (error) {
      console.error('Error deleting result:', error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };


  const generateResults = async () => {
    if (!selectedElectionId) {
      toast({
        title: "Error",
        description: "Please select an election",
        variant: "destructive"
      });
      return;
    }

    // Find selected election object
    const selectedElection = elections.find(
      e => e.id.toString() === selectedElectionId
    );

    if (!selectedElection) {
      toast({
        title: "Error",
        description: "Election not found",
        variant: "destructive"
      });
      return;
    }

    try {
      // First fetch the vote counts
      const voteCountsResponse = await fetch(`http://localhost:3000/api/votes/counts?election_id=${selectedElection.id}`);
      const voteCountsData = await voteCountsResponse.json();

      if (!voteCountsResponse.ok) {
        throw new Error(voteCountsData.error || "Failed to fetch vote counts");
      }

      if (!Array.isArray(voteCountsData)) {
        throw new Error("Invalid vote counts data received");
      }

      // Calculate total votes and find winner
      let totalVotes = 0;
      let winner = null;
      const candidates = [];

      voteCountsData.forEach(candidate => {
        totalVotes += candidate.vote_count || 0;
        candidates.push({
          candidate_id: candidate.candidate_id,
          candidate_name: candidate.candidate_name,
          party: candidate.party,
          vote_count: candidate.vote_count || 0
        });

        // Determine winner (highest votes)
        if (!winner || candidate.vote_count > winner.vote_count) {
          winner = candidate;
        }
      });

      // Prepare payload
      const payload = {
        election_id: selectedElection.id,
        election_name: selectedElection.name,
        result_date: selectedElection.resultDate || new Date().toISOString(),
        vidhansabha_id: selectedElection.vidhansabha,
        loksabha_id: selectedElection.loksabha,
        total_votes: totalVotes,
        winner_id: winner?.candidate_id || null,
        winner_name: winner?.candidate_name || null,
        winner_party: winner?.party || null,
        published: 0, // Default to unpublished
        candidates: candidates,
        status: 'completed' // Add status field if required by your backend
      };

      console.log("📤 Sending JSON to backend:", payload);

      // Send to generate results API
      const response = await fetch('http://localhost:3000/api/results/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      console.log("✅ Results from backend:", results);


      const text = await response.text();
      console.log("🔍 Raw API response:", text);

      let data;
      try {
        data = JSON.parse(text);
      } catch (e) {
        throw new Error("Response was not valid JSON: " + text);
      }

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate result");
      }

      toast({
        title: "Success",
        description: "Results generated successfully",
        variant: "default"
      });

      refetchResults();

    } catch (error) {
      console.error("❌ Error generating results:", error.message);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };





  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'Not published';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (electionsError) {
    return (
      <Layout>
        <div className="space-y-6">
          <h1 className="text-3xl font-bold">Election Results</h1>
          <Card>
            <CardContent className="flex flex-col items-center justify-center p-10 text-center">
              <AlertTriangle className="h-8 w-8 mb-2 text-destructive" />
              <h3 className="text-xl font-medium mb-1">Error Loading Elections</h3>
              <p className="text-gray-500">
                Failed to load election data. Please try again later.
              </p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => refetchElections()}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry
              </Button>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  if (resultsLoading || electionsLoading) {
    return (
      <Layout>
        <div className="space-y-6">
          <h1 className="text-3xl font-bold">Election Results</h1>
          <Card>
            <CardContent className="flex flex-col items-center justify-center p-10 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-3"></div>
              <h3 className="text-xl font-medium mb-1">Loading Results</h3>
              <p className="text-gray-500">
                Please wait while we fetch the election results...
              </p>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
          <h1 className="text-3xl font-bold">Election Results</h1>

          <div className="flex">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" className="flex items-center">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Generate Results
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Generate Election Results</AlertDialogTitle>
                  <AlertDialogDescription>
                    Select an election to generate results for. This will process all votes and determine winners.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <div className="py-4">
                  <Select onValueChange={setSelectedElectionId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select an election" />
                    </SelectTrigger>
                    <SelectContent>
                      {elections.map(election => (
                        <SelectItem key={election.id} value={election.id.toString()}>
                          {election.name} ({election.type})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={generateResults}>
                    Generate
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center gap-2">
                <FileCheck className="h-5 w-5 text-primary" />
                <CardTitle>Manage Election Results</CardTitle>
              </div>

              <div className="flex flex-col md:flex-row gap-2 md:items-center">
                <div className="relative">
                  <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search results..."
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                <Select value={selectedElection} onValueChange={setSelectedElection}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="All Elections" />
                  </SelectTrigger>
                  <SelectContent>
                    {electionOptions.map(option => (
                      <SelectItem key={option.id} value={option.id}>
                        {option.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="all">
              <TabsList className="mb-4">
                <TabsTrigger value="all">All Results</TabsTrigger>
                <TabsTrigger value="published">Published</TabsTrigger>
                <TabsTrigger value="unpublished">Unpublished</TabsTrigger>
              </TabsList>

              {['all', 'published', 'unpublished'].map(tab => (
                <TabsContent key={tab} value={tab}>
                  <div className="border rounded-md">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Constituency</TableHead>
                          <TableHead>Election</TableHead>
                          <TableHead>Winner</TableHead>
                          <TableHead>Total Votes</TableHead>
                          <TableHead>Published</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredResults
                          .filter(result => {
                            if (tab === 'all') return true;
                            if (tab === 'published') return result.published;
                            if (tab === 'unpublished') return !result.published;
                            return true;
                          })
                          .map(result => (
                            <TableRow key={result.id}>
                              <TableCell>{result.constituency_name}</TableCell>
                              <TableCell>{result.election_name}</TableCell>
                              <TableCell>
                                <div className="flex items-center space-x-2">
                                  <span>{result.winner_name}</span>
                                  <Badge variant="outline">{result.winner_party}</Badge>
                                </div>
                              </TableCell>
                              <TableCell>{result.total_votes?.toLocaleString()}</TableCell>
                              <TableCell>
                                <Badge variant={result.published ? "success" : "secondary"}>
                                  {result.published ? "Yes" : "No"}
                                </Badge>
                              </TableCell>
                              <TableCell>{formatDate(result.published_date)}</TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end space-x-2">
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => togglePublishStatus(result.id, result.published)}
                                    title={result.published ? "Unpublish result" : "Publish result"}
                                  >
                                    {result.published ?
                                      <EyeOff className="h-4 w-4" /> :
                                      <Eye className="h-4 w-4" />
                                    }
                                  </Button>

                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        className="text-destructive"
                                        title="Delete result"
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                      <AlertDialogHeader>
                                        <AlertDialogTitle>Delete Result</AlertDialogTitle>
                                        <AlertDialogDescription>
                                          Are you sure you want to delete this result? This action cannot be undone.
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction
                                          onClick={() => deleteResult(result.id)}
                                          className="bg-destructive text-destructive-foreground"
                                        >
                                          Delete
                                        </AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}

                        {filteredResults.filter(result => {
                          if (tab === 'all') return true;
                          if (tab === 'published') return result.published;
                          if (tab === 'unpublished') return !result.published;
                          return true;
                        }).length === 0 && (
                            <TableRow>
                              <TableCell colSpan={7} className="text-center py-4">
                                <div className="flex flex-col items-center justify-center text-gray-500">
                                  <AlertTriangle className="h-8 w-8 mb-2" />
                                  <p>No results found</p>
                                </div>
                              </TableCell>
                            </TableRow>
                          )}
                      </TableBody>
                    </Table>
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default SuperadminResults;