
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ElectionSelectorProps {
  selectedElection: string;
  setSelectedElection: (value: string) => void;
  electionOptions: { id: number; name: string }[];
}

const ElectionSelector: React.FC<ElectionSelectorProps> = ({ 
  selectedElection, 
  setSelectedElection, 
  electionOptions 
}) => {
  return (
    <div className="w-full sm:w-64">
      <Select value={selectedElection} onValueChange={setSelectedElection}>
        <SelectTrigger>
          <SelectValue placeholder="All Elections" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Elections</SelectItem>
          {electionOptions.map((election) => (
            <SelectItem key={election.id} value={election.id.toString()}>
              {election.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default ElectionSelector;
