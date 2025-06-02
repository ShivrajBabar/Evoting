
import React, { useState } from 'react';
import Layout from '@/components/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { ResultService, ElectionService } from '@/api/apiService';
import { useQuery } from '@tanstack/react-query';
import ResultsPageHeader from '@/components/voter/results/ResultsPageHeader';
import ElectionSelector from '@/components/voter/results/ElectionSelector';
import ResultCard from '@/components/voter/results/ResultCard';
import EmptyResults from '@/components/voter/results/EmptyResults';
import LoadingResults from '@/components/voter/results/LoadingResults';
import { ResultData } from '@/types/election';

const VoterResults = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedElection, setSelectedElection] = useState<string>('all');
  
  // Fetch elections for the dropdown
  const { data: elections, isLoading: electionsLoading } = useQuery({
    queryKey: ['elections'],
    queryFn: async () => {
      try {
        // Only fetch completed elections
        const response = await ElectionService.getAllElections({ status: 'Completed' });
        return response || [];
      } catch (error) {
        console.error('Error fetching elections:', error);
        return [];
      }
    }
  });
  
  // Fetch published results - ensure only published results are shown (superadmin confirmation)
  const { data: results, isLoading: resultsLoading } = useQuery({
    queryKey: ['voter-results', selectedElection],
    queryFn: async () => {
      try {
        const filters: any = { published: true }; // Only fetch published results
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
  
  // Format election options for the dropdown
  const electionOptions = elections?.map((election: any) => ({
    id: election.id,
    name: election.name
  })) || [];
  
  // Display loading state
  if (resultsLoading) {
    return (
      <Layout>
        <div className="space-y-6">
          <ResultsPageHeader />
          <LoadingResults />
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
          <ResultsPageHeader electionCount={results?.length || 0} />
        </div>

        <ElectionSelector 
          selectedElection={selectedElection} 
          setSelectedElection={setSelectedElection} 
          electionOptions={electionOptions} 
        />

        <div className="space-y-4">
          {results && results.length > 0 ? (
            results.map((result: ResultData) => (
              <ResultCard key={result.id} result={result} />
            ))
          ) : (
            <EmptyResults />
          )}
        </div>
      </div>
    </Layout>
  );
};

export default VoterResults;
