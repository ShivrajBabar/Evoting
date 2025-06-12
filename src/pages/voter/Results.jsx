import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { useQuery } from '@tanstack/react-query';
import ResultsPageHeader from '@/components/voter/results/ResultsPageHeader';
import ElectionSelector from '@/components/voter/results/ElectionSelector';
import ResultCard from '@/components/voter/results/ResultCard';
import EmptyResults from '@/components/voter/results/EmptyResults';
import LoadingResults from '@/components/voter/results/LoadingResults';

const VoterResults = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedElection, setSelectedElection] = useState('all');
  const [voteCounts, setVoteCounts] = useState([]);
  const [loadingVotes, setLoadingVotes] = useState(false);

  // Fetch all election results
  const { data: allResults = [], isLoading: resultsLoading } = useQuery({
    queryKey: ['results'],
    queryFn: async () => {
      try {
        const response = await fetch(`/api/results`);
        const data = await response.json();
        console.log('API /api/results response:', data);
        return data.success ? data.data : [];
      } catch (error) {
        console.error('Error fetching results:', error);
        toast({
          title: 'Error',
          description: 'Failed to load results',
          variant: 'destructive',
        });
        return [];
      }
    },
  });

  // Fetch vote counts for all elections
  useEffect(() => {
    const fetchAllVoteCounts = async () => {
      if (!allResults || allResults.length === 0) return;

      setLoadingVotes(true);
      const uniqueElectionIds = [...new Set(allResults.map(r => r.election_id))];

      try {
        const allCounts = await Promise.all(
          uniqueElectionIds.map(async (id) => {
            try {
              const response = await fetch(`/api/votes/counts?election_id=${id}`);
              const data = await response.json();
              console.log(`Vote counts for election_id=${id}:`, data);
              const resultArray = Array.isArray(data) ? data : data.data || [];
              return resultArray.map(item => ({ ...item, election_id: id }));
            } catch (innerError) {
              console.error(`Error fetching vote counts for election_id=${id}:`, innerError);
              return [];
            }
          })
        );

        setVoteCounts(allCounts.flat());
      } catch (error) {
        console.error('Error fetching all vote counts:', error);
        toast({
          title: 'Error',
          description: 'Failed to load vote counts',
          variant: 'destructive',
        });
      } finally {
        setLoadingVotes(false);
      }
    };

    fetchAllVoteCounts();
  }, [allResults]);

  // Filter results by selected election
  const filteredResults = selectedElection === 'all'
    ? allResults
    : allResults.filter(r => r.election_id === parseInt(selectedElection));

  // Merge vote counts into each result
  const mergedResults = filteredResults.map(result => {
    const candidates = voteCounts
      .filter(vc => vc.election_id === result.election_id)
      .map(vc => ({
        id: vc.candidate_id,
        name: vc.candidate_name,
        party: vc.party,
        votes: parseInt(vc.vote_count),
        percentage: 0,
        photo_url: '/placeholder.jpg',
        symbol_url: '/placeholder.svg',
      }));

    const totalVotes = candidates.reduce((sum, c) => sum + c.votes, 0);

    candidates.forEach(c => {
      c.percentage = totalVotes > 0 ? ((c.votes / totalVotes) * 100).toFixed(1) : 0;
    });

    let winner = null;
    let secondPlace = null;
    let winningMargin = 0;

    if (candidates.length > 0) {
      winner = candidates[0];
      secondPlace = candidates[1] || { votes: 0 };
      winningMargin = winner.votes - secondPlace.votes;
    }

    return {
      ...result,
      total_votes: totalVotes,
      candidates,
      winner_name: winner?.name || '',
      winner_party: winner?.party || '',
      winner_id: winner?.id || '',
      winning_margin: winningMargin,
    };
  });

  const electionOptions = allResults.map(e => ({
    id: e.election_id,
    name: e.election_name,
  }));

  if (resultsLoading || loadingVotes) {
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
          <ResultsPageHeader electionCount={mergedResults.length} />
        </div>

        <ElectionSelector
          selectedElection={selectedElection}
          setSelectedElection={setSelectedElection}
          electionOptions={electionOptions}
        />

        <div className="space-y-4">
          {mergedResults.length > 0 ? (
            mergedResults.map(result => (
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
