import React from 'react';

const ElectionSelector = ({ selectedElection, setSelectedElection, electionOptions }) => {
  return (
    <div className="mb-6">
      <label htmlFor="election-selector" className="block mb-2 text-sm font-medium">
        Filter by Election:
      </label>
      <select
        id="election-selector"
        value={selectedElection}
        onChange={(e) => setSelectedElection(e.target.value)}
        className="w-full md:w-80 p-2 border border-gray-300 rounded-md"
      >
        <option value="all">All Elections</option>
        {electionOptions.map((election) => (
          <option key={election.id} value={election.id}>
            {election.name}
          </option>
        ))}
      </select>
    </div>
  );
};

export default ElectionSelector;
