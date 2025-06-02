
import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CandidateResult } from '@/types/election';

interface ResultTableProps {
  candidates: CandidateResult[];
  winnerId: number;
}

const ResultTable: React.FC<ResultTableProps> = ({ candidates, winnerId }) => {
  return (
    <div>
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
          {candidates.map((candidate) => (
            <TableRow 
              key={candidate.id} 
              className={candidate.candidate_id === winnerId ? "bg-green-50" : ""}
            >
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
    </div>
  );
};

export default ResultTable;
