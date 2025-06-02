
import React, { useState } from 'react';
import Layout from '@/components/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { ResultService, ElectionService } from '@/api/apiService';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { FileCheck, AlertTriangle, Search, Eye, EyeOff, Trash2, RefreshCw } from 'lucide-react';

const SuperadminResults = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedElection, setSelectedElection] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch elections for the dropdown
  const {
    data: elections = [],
    isLoading: electionsLoading
  } = useQuery({
    queryKey: ['admin-elections'],
    queryFn: async () => {
      try {
        // Fetch all elections
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
        // Mock data for demonstration purposes
        const mockResults = [
          {
            id: 1,
            election_id: 1,
            election_name: "Lok Sabha Elections 2024",
            election_type: "Lok Sabha",
            constituency_id: 1,
            constituency_name: "Mumbai North",
            winner_id: 101,
            winner_name: "Rahul Sharma",
            winner_party: "National Democratic Party",
            total_votes: 158745,
            voter_turnout: 68.5,
            published: true,
            completed_date: "2024-03-20T15:30:00.000Z",
            published_date: "2024-03-22T10:15:00.000Z",
            candidates: [
              {
                id: 101,
                name: "Rahul Sharma",
                party: "National Democratic Party",
                votes: 85420,
                percentage: 53.8,
                photo_url: "https://randomuser.me/api/portraits/men/32.jpg",
                symbol_url: "/placeholder.svg"
              },
              {
                id: 102,
                name: "Priya Patel",
                party: "Progressive Alliance",
                votes: 65325,
                percentage: 41.2,
                photo_url: "https://randomuser.me/api/portraits/women/44.jpg",
                symbol_url: "/placeholder.svg"
              }
            ]
          },
          {
            id: 2,
            election_id: 1,
            election_name: "Lok Sabha Elections 2024",
            election_type: "Lok Sabha",
            constituency_id: 2,
            constituency_name: "Delhi East",
            winner_id: 201,
            winner_name: "Sneha Gupta",
            winner_party: "Progressive Alliance",
            total_votes: 145230,
            voter_turnout: 72.1,
            published: false,
            completed_date: "2024-03-20T16:45:00.000Z",
            published_date: null,
            candidates: [
              {
                id: 201,
                name: "Sneha Gupta",
                party: "Progressive Alliance",
                votes: 78450,
                percentage: 54.0,
                photo_url: "https://randomuser.me/api/portraits/women/22.jpg",
                symbol_url: "/placeholder.svg"
              },
              {
                id: 202,
                name: "Vikram Malhotra",
                party: "National Democratic Party",
                votes: 61780,
                percentage: 42.5,
                photo_url: "https://randomuser.me/api/portraits/men/54.jpg",
                symbol_url: "/placeholder.svg"
              }
            ]
          },
          {
            id: 3,
            election_id: 2,
            election_name: "Maharashtra Assembly Elections 2024",
            election_type: "Vidhan Sabha",
            constituency_id: 3,
            constituency_name: "Pune Central",
            winner_id: 301,
            winner_name: "Anand Joshi",
            winner_party: "Regional Front",
            total_votes: 98560,
            voter_turnout: 65.3,
            published: true,
            completed_date: "2024-02-15T14:20:00.000Z",
            published_date: "2024-02-17T09:45:00.000Z",
            candidates: [
              {
                id: 301,
                name: "Anand Joshi",
                party: "Regional Front",
                votes: 45230,
                percentage: 45.9,
                photo_url: "https://randomuser.me/api/portraits/men/78.jpg",
                symbol_url: "/placeholder.svg"
              },
              {
                id: 302,
                name: "Kavita Deshmukh",
                party: "Progressive Alliance",
                votes: 42330,
                percentage: 43.0,
                photo_url: "https://randomuser.me/api/portraits/women/67.jpg",
                symbol_url: "/placeholder.svg"
              }
            ]
          }
        ];

        // Try to get actual data from API, fallback to mock data
        let actualData = [];
        const filters = {};
        if (selectedElection !== 'all') {
          const electionId = parseInt(selectedElection);
          if (!isNaN(electionId)) {
            filters.election_id = electionId;
          }
        }

        try {
          actualData = await ResultService.getAllResults(filters);
          console.log("Actual results data:", actualData);

          if (Array.isArray(actualData) && actualData.length > 0) {
            return actualData;
          } else {
            console.log("Using mock results data");
            return selectedElection === 'all' ? mockResults :
              mockResults.filter(r => r.election_id.toString() === selectedElection);
          }
        } catch (error) {
          console.log("API error, using mock data:", error);
          return selectedElection === 'all' ? mockResults :
            mockResults.filter(r => r.election_id.toString() === selectedElection);
        }
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
  const electionOptions = Array.isArray(elections) ? elections.map((election) => ({
    id: election.id.toString(),
    name: election.name
  })) : [];

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

  // Toggle publish status
  const togglePublishStatus = async (resultId, currentPublishStatus) => {
    try {
      await ResultService.updateResult(resultId, { published: !currentPublishStatus });

      toast({
        title: "Success",
        description: currentPublishStatus ? "Result unpublished" : "Result published",
        variant: "default"
      });

      refetchResults();
    } catch (error) {
      console.error('Error toggling publish status:', error);
      toast({
        title: "Error",
        description: "Failed to update result status",
        variant: "destructive"
      });
    }
  };

  // Delete result
  const deleteResult = async (resultId) => {
    try {
      await ResultService.deleteResult(resultId);

      toast({
        title: "Success",
        description: "Result deleted successfully",
        variant: "default"
      });

      refetchResults();
    } catch (error) {
      console.error('Error deleting result:', error);
      toast({
        title: "Error",
        description: "Failed to delete result",
        variant: "destructive"
      });
    }
  };

  // Generate results for an election
  const generateResults = async (electionId) => {
    try {
      await ResultService.generateResults(electionId);

      toast({
        title: "Success",
        description: "Results generated successfully",
        variant: "default"
      });

      refetchResults();
    } catch (error) {
      console.error('Error generating results:', error);
      toast({
        title: "Error",
        description: "Failed to generate results",
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

  if (resultsLoading) {
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
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select an election" />
                    </SelectTrigger>
                    <SelectContent>
                      {elections.map(election => (
                        <SelectItem key={election.id} value={election.id.toString()}>
                          {election.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={() => generateResults(1)}>Generate</AlertDialogAction>
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
                    <SelectItem value="all">All Elections</SelectItem>
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
