
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ResultData } from '@/types/election';
import ResultTable from './ResultTable';
import ResultVisualization from './ResultVisualization';
import ResultProgressBar from './ResultProgressBar';

interface ResultCardProps {
  result: ResultData;
}

const ResultCard: React.FC<ResultCardProps> = ({ result }) => {
  return (
    <Card key={result.id} className="overflow-hidden">
      <CardHeader className="bg-gray-50 pb-2">
        <div>
          <CardTitle className="text-lg">{result.constituency_name}</CardTitle>
          <p className="text-sm text-gray-500">{result.election_name}</p>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="mb-4">
          <div className="flex justify-between text-sm">
            <span>Winner: <span className="font-medium">{result.winner_name}</span></span>
            <span>Total Votes: <span className="font-medium">{result.total_votes.toLocaleString()}</span></span>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <ResultTable candidates={result.candidates} winnerId={result.winner_id} />
          <ResultVisualization candidates={result.candidates} />
        </div>
        
        <ResultProgressBar candidates={result.candidates} />
      </CardContent>
    </Card>
  );
};

export default ResultCard;
