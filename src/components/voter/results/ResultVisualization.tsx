
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { CandidateResult } from '@/types/election';
import { getPartyColor } from '@/utils/colorUtils';

interface ResultVisualizationProps {
  candidates: CandidateResult[];
}

const ResultVisualization: React.FC<ResultVisualizationProps> = ({ candidates }) => {
  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={candidates}
            nameKey="name"
            dataKey="votes"
            cx="50%"
            cy="50%"
            outerRadius={80}
            label={({ name, votePercentage }) => `${name}: ${votePercentage.toFixed(1)}%`}
          >
            {candidates.map((candidate, index) => (
              <Cell key={`cell-${index}`} fill={getPartyColor(candidate.party)} />
            ))}
          </Pie>
          <Tooltip formatter={(value: number) => [value.toLocaleString(), 'Votes']} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ResultVisualization;
