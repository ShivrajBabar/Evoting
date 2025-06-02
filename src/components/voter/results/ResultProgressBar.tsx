
import React from 'react';
import { CandidateResult } from '@/types/election';
import { getPartyColor } from '@/utils/colorUtils';

interface ResultProgressBarProps {
  candidates: CandidateResult[];
}

const ResultProgressBar: React.FC<ResultProgressBarProps> = ({ candidates }) => {
  return (
    <div className="relative pt-4">
      <div className="flex space-x-1">
        {candidates.map((candidate) => (
          <div 
            key={candidate.id}
            className="h-4 rounded-full" 
            style={{ 
              width: `${candidate.votePercentage}%`,
              backgroundColor: getPartyColor(candidate.party)
            }}
          />
        ))}
      </div>
      <div className="flex justify-between text-xs mt-1">
        {candidates.map((candidate) => (
          <div key={candidate.id} style={{ width: `${candidate.votePercentage}%` }}>
            {candidate.votePercentage > 10 && (
              <div className="text-center font-medium">{candidate.votePercentage.toFixed(1)}%</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ResultProgressBar;
