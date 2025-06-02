
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Layout from '@/components/Layout';
import { Search, ChevronDown, ChevronUp, DownloadIcon } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ResultService, ElectionService } from '@/api/apiService';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface CandidateResult {
  id: number;
  candidate_id: number;
  name: string;
  party: string;
  votes: number;
  photoUrl: string;
  votePercentage: number;
}

interface ResultData {
  id: number;
  election_id: number;
  election_name: string;
  constituency_name: string;
  winner_id: number;
  winner_name: string;
  winner_party: string;
  winner_photo: string;
  total_votes: number;
  published: boolean;
  candidates: CandidateResult[];
}

const SuperadminResults = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedElection, setSelectedElection] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [expandedResult, setExpandedResult] = useState<number | null>(null);
  const [isGeneratingResults, setIsGeneratingResults] = useState(false);
  const [selectedElectionForGeneration, setSelectedElectionForGeneration] = useState<string>('');
  const [isGenerationDialogOpen, setIsGenerationDialogOpen] = useState(false);
  
  // Fetch all elections
  const { data: elections, isLoading: electionsLoading } = useQuery({
    queryKey: ['elections'],
    queryFn: async () => {
      try {
        // Only fetch completed elections
        const data = await ElectionService.getAllElections({ status: 'Completed' });
        return data || [];
      } catch (error) {
        console.error('Error fetching elections:', error);
        return [];
      }
    }
  });
  
  // Fetch results
  const { data: results, isLoading: resultsLoading } = useQuery({
    queryKey: ['admin-results', selectedElection],
    queryFn: async () => {
      try {
        const filters: any = {};
        if (selectedElection !== 'all') {
          const electionId = parseInt(selectedElection);
          if (!isNaN(electionId)) {
            filters.election_id = electionId;
          }
        }
        
        const data = await ResultService.getAllResults(filters);
        return data || [];
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
  
  // Mutation to toggle result publication
  const togglePublishMutation = useMutation({
    mutationFn: async ({ resultId, publish }: { resultId: number, publish: boolean }) => {
      return await ResultService.publishResult(resultId, publish);
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin-results'] });
      const action = variables.publish ? 'published' : 'unpublished';
      toast({
        title: `Result ${action}`,
        description: `Election results are now ${variables.publish ? 'visible' : 'hidden'} to voters`,
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update publication status",
        variant: "destructive"
      });
    }
  });
  
  // Mutation to generate results
  const generateResultsMutation = useMutation({
    mutationFn: async (electionId: number) => {
      return await ResultService.generateResults(electionId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-results'] });
      setIsGenerationDialogOpen(false);
      toast({
        title: "Results generated",
        description: "Election results have been generated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to generate results",
        variant: "destructive"
      });
    },
    onSettled: () => {
      setIsGeneratingResults(false);
    }
  });
  
  // Filter results based on selected election and search query
  const filteredResults = results 
    ? results.filter((result: ResultData) => {
        const matchesElection = selectedElection === 'all' || result.election_id.toString() === selectedElection;
        const matchesSearch = searchQuery === '' || 
          result.constituency_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          result.election_name.toLowerCase().includes(searchQuery.toLowerCase());
        
        return matchesElection && matchesSearch;
      })
    : [];
  
  // Toggle expansion of candidate details
  const toggleExpand = (resultId: number) => {
    setExpandedResult(expandedResult === resultId ? null : resultId);
  };

  // Handle generate results
  const handleGenerateResults = () => {
    if (!selectedElectionForGeneration) {
      toast({
        title: "Election required",
        description: "Please select an election to generate results for",
        variant: "destructive"
      });
      return;
    }
    
    setIsGeneratingResults(true);
    generateResultsMutation.mutate(parseInt(selectedElectionForGeneration));
  };
  
  // Handle export results
  const handleExportResults = () => {
    // Mock export functionality for now
    toast({
      title: "Results exported",
      description: "Election results have been exported to CSV",
    });
  };
  
  // Display loading state
  if (resultsLoading) {
    return (
      <Layout>
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold">Election Results</h1>
            <p className="text-gray-500">Manage and publish election results</p>
          </div>
          
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="overflow-hidden">
                <CardHeader className="bg-gray-50 pb-2">
                  <Skeleton className="h-6 w-48" />
                </CardHeader>
                <CardContent className="pt-4">
                  <Skeleton className="h-40 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
          <h1 className="text-2xl font-bold">Election Results</h1>
          <div className="flex space-x-2">
            <Dialog open={isGenerationDialogOpen} onOpenChange={setIsGenerationDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">Generate Results</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Generate Election Results</DialogTitle>
                  <DialogDescription>
                    Select an election to generate or update results. This will count all votes and determine winners.
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                  <Select 
                    value={selectedElectionForGeneration} 
                    onValueChange={setSelectedElectionForGeneration}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select an election" />
                    </SelectTrigger>
                    <SelectContent>
                      {elections?.map((election: any) => (
                        <SelectItem key={election.id} value={election.id.toString()}>
                          {election.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsGenerationDialogOpen(false)}>Cancel</Button>
                  <Button 
                    onClick={handleGenerateResults}
                    disabled={isGeneratingResults || !selectedElectionForGeneration}
                  >
                    {isGeneratingResults ? 'Generating...' : 'Generate Results'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            
            <Button 
              variant="outline"
              onClick={handleExportResults}
            >
              <DownloadIcon className="h-4 w-4 mr-2" /> Export Results
            </Button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by constituency..."
              className="pl-10 pr-4 py-2 border rounded-md w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="w-full sm:w-64">
            <Select value={selectedElection} onValueChange={setSelectedElection}>
              <SelectTrigger>
                <SelectValue placeholder="All Elections" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Elections</SelectItem>
                {elections?.map((election: any) => (
                  <SelectItem key={election.id} value={election.id.toString()}>
                    {election.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-4">
          {filteredResults.length > 0 ? (
            filteredResults.map((result: ResultData) => (
              <Card key={result.id} className="overflow-hidden">
                <CardHeader className="bg-gray-50 pb-2">
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle className="text-lg">{result.constituency_name}</CardTitle>
                      <p className="text-sm text-gray-500">{result.election_name}</p>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <Label htmlFor={`publish-${result.id}`}>
                          {result.published ? "Published" : "Unpublished"}
                        </Label>
                        <Switch 
                          id={`publish-${result.id}`} 
                          checked={result.published}
                          onCheckedChange={(checked) => 
                            togglePublishMutation.mutate({ resultId: result.id, publish: checked })
                          }
                          disabled={togglePublishMutation.isPending}
                        />
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleExpand(result.id)}
                      >
                        {expandedResult === result.id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="mb-2">
                    <div className="flex justify-between text-sm">
                      <span>Winner: <span className="font-medium">{result.winner_name}</span></span>
                      <span>Total Votes: <span className="font-medium">{result.total_votes.toLocaleString()}</span></span>
                    </div>
                  </div>
                  
                  {expandedResult === result.id && (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Candidate</TableHead>
                          <TableHead>Party</TableHead>
                          <TableHead>Votes</TableHead>
                          <TableHead className="text-right">Percentage</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {result.candidates.map((candidate) => (
                          <TableRow key={candidate.id}>
                            <TableCell>
                              <div className="flex items-center space-x-3">
                                <div className="h-10 w-10 rounded-full overflow-hidden">
                                  <img 
                                    src={candidate.photoUrl || "/placeholder.svg"} 
                                    alt={candidate.name}
                                    className="h-full w-full object-cover" 
                                  />
                                </div>
                                <div>{candidate.name}</div>
                              </div>
                            </TableCell>
                            <TableCell>{candidate.party}</TableCell>
                            <TableCell>{candidate.votes.toLocaleString()}</TableCell>
                            <TableCell className="text-right">{candidate.votePercentage.toFixed(1)}%</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                  
                  {!expandedResult || expandedResult !== result.id ? (
                    <div className="relative pt-2">
                      <div className="flex space-x-1">
                        {result.candidates.map((candidate) => (
                          <div 
                            key={candidate.id}
                            className="h-2 rounded-full" 
                            style={{ 
                              width: `${candidate.votePercentage}%`,
                              backgroundColor: getPartyColor(candidate.party)
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  ) : null}
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="py-8">
                <div className="text-center text-gray-500">
                  <p className="mb-2">No results found</p>
                  <p>Generate results for completed elections using the "Generate Results" button</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </Layout>
  );
};

// Helper function to get a color based on party name
function getPartyColor(partyName: string): string {
  // Create a simple hash of the party name to generate a consistent color
  let hash = 0;
  for (let i = 0; i < partyName.length; i++) {
    hash = partyName.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  // Convert to a hue value (0-360)
  const hue = hash % 360;
  
  // Use HSL to generate colors with consistent saturation and lightness
  return `hsl(${hue}, 70%, 50%)`;
}

export default SuperadminResults;
