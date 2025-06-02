
import React from 'react';

interface ResultsPageHeaderProps {
  electionCount?: number;
}

const ResultsPageHeader: React.FC<ResultsPageHeaderProps> = ({ electionCount = 0 }) => {
  return (
    <div>
      <h1 className="text-2xl font-bold">Election Results</h1>
      <p className="text-gray-500">
        View published election results
        {electionCount > 0 && ` (${electionCount} ${electionCount === 1 ? 'election' : 'elections'} available)`}
      </p>
    </div>
  );
};

export default ResultsPageHeader;
