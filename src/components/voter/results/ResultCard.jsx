
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { ChevronDown, ChevronUp, Award, Users, BarChart, TrendingUp, Percent } from 'lucide-react';
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Generate consistent colors for candidates
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A569BD', '#5DADE2', '#58D68D', '#F4D03F', '#EB984E', '#EC7063'];

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

const ResultCard = ({ result }) => {
  const [expanded, setExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState("chart");

  if (!result || !result.candidates) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-gray-500">Result data is incomplete</p>
        </CardContent>
      </Card>
    );
  }

  // Transform candidate results for pie chart
  const chartData = result.candidates.map((candidate, index) => ({
    name: candidate.name || `Candidate ${index + 1}`,
    value: candidate.votes || 0,
    color: COLORS[index % COLORS.length]
  }));

  // Get winner
  const winner = result.candidates.reduce((prev, current) => 
    (prev.votes > current.votes) ? prev : current, { votes: 0 });

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-gray-50 border-b flex flex-row justify-between items-center">
        <div>
          <CardTitle>{result.election_name || 'Election Result'}</CardTitle>
          <p className="text-sm text-gray-500">
            {formatDate(result.completed_date)}
            {result.constituency_name && ` • ${result.constituency_name}`}
          </p>
        </div>
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => setExpanded(!expanded)}
          className="transition-all"
        >
          {expanded ? 
            <ChevronUp className="h-4 w-4" /> : 
            <ChevronDown className="h-4 w-4" />
          }
        </Button>
      </CardHeader>
      
      <CardContent className="pt-4">
        {/* Winner display */}
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Award className="text-green-600 mr-2 h-5 w-5" />
              <h3 className="text-sm font-medium text-green-800">Winner</h3>
            </div>
            <div className="text-sm text-green-800">
              <span>Margin: </span>
              {result.candidates.length > 1 && (
                <span className="font-medium">
                  {(winner.votes - result.candidates.sort((a, b) => b.votes - a.votes)[1].votes).toLocaleString()} votes
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center mt-1">
            {winner.photo_url && (
              <img 
                src={winner.photo_url} 
                alt={`${winner.name} photo`}
                className="h-12 w-12 rounded-full mr-3 object-cover border-2 border-green-300"
                onError={(e) => { e.target.src = '/placeholder.svg'; }}
              />
            )}
            <div>
              <p className="font-medium text-lg">{winner.name || 'Unknown'}</p>
              <div className="flex items-center">
                <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full mr-2">
                  {winner.party || 'Independent'}
                </span>
                <span className="text-sm text-gray-600">
                  {winner.votes?.toLocaleString() || 0} votes 
                  {result.total_votes > 0 ? ` (${Math.round((winner.votes / result.total_votes) * 100)}%)` : ''}
                </span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Expanded content */}
        {expanded && (
          <div className="animate-accordion-down mt-4">
            <Tabs defaultValue="chart" value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid grid-cols-3 mb-4">
                <TabsTrigger value="chart" className="flex items-center">
                  <PieChart className="h-4 w-4 mr-2" />
                  Chart
                </TabsTrigger>
                <TabsTrigger value="table" className="flex items-center">
                  <BarChart className="h-4 w-4 mr-2" />
                  Table
                </TabsTrigger>
                <TabsTrigger value="stats" className="flex items-center">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Stats
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="chart" className="space-y-4">
                <div className="my-4 h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        nameKey="name"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`${value.toLocaleString()} votes`, 'Votes']} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                
                {/* Progress bars for each candidate */}
                <div className="space-y-3">
                  {result.candidates
                    .sort((a, b) => b.votes - a.votes)
                    .map((candidate, index) => {
                      const percentage = result.total_votes > 0 
                        ? Math.round((candidate.votes / result.total_votes) * 100) 
                        : 0;
                      return (
                        <div key={index} className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span>{candidate.name} ({candidate.party || 'Independent'})</span>
                            <span>{percentage}%</span>
                          </div>
                          <Progress 
                            value={percentage} 
                            className="h-2" 
                            indicatorClassName={`bg-[${COLORS[index % COLORS.length]}]`}
                          />
                        </div>
                      );
                  })}
                </div>
              </TabsContent>
              
              <TabsContent value="table">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left">Rank</th>
                        <th className="px-4 py-2 text-left">Candidate</th>
                        <th className="px-4 py-2 text-left">Party</th>
                        <th className="px-4 py-2 text-right">Votes</th>
                        <th className="px-4 py-2 text-right">Percentage</th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.candidates.sort((a, b) => b.votes - a.votes).map((candidate, index) => (
                        <tr key={index} className={index === 0 ? "bg-green-50" : "border-b"}>
                          <td className="px-4 py-3">{index + 1}</td>
                          <td className="px-4 py-3">
                            <div className="flex items-center">
                              {candidate.photo_url && (
                                <img 
                                  src={candidate.photo_url} 
                                  alt={`${candidate.name} photo`}
                                  className="h-8 w-8 rounded-full mr-2 object-cover"
                                  onError={(e) => { e.target.src = '/placeholder.svg'; }}
                                />
                              )}
                              {candidate.name || 'Unknown Candidate'}
                            </div>
                          </td>
                          <td className="px-4 py-3">{candidate.party || 'Independent'}</td>
                          <td className="px-4 py-3 text-right">{candidate.votes?.toLocaleString() || 0}</td>
                          <td className="px-4 py-3 text-right">
                            {result.total_votes > 0 ? 
                              `${Math.round((candidate.votes / result.total_votes) * 100)}%` : '0%'}
                          </td>
                        </tr>
                      ))}
                      <tr className="bg-gray-50 font-medium">
                        <td colSpan="3" className="px-4 py-2 text-right">Total</td>
                        <td className="px-4 py-2 text-right">{result.total_votes?.toLocaleString() || 0}</td>
                        <td className="px-4 py-2 text-right">100%</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </TabsContent>
              
              <TabsContent value="stats">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="p-4 bg-gray-50 rounded-md">
                    <div className="flex items-center mb-2">
                      <Users className="h-4 w-4 mr-2 text-blue-600" />
                      <h4 className="font-medium">Election Details</h4>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Type:</span>
                        <span className="font-medium">{result.election_type || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Constituency:</span>
                        <span className="font-medium">{result.constituency_name || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Total Candidates:</span>
                        <span className="font-medium">{result.candidates?.length || 0}</span>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-md">
                    <div className="flex items-center mb-2">
                      <Percent className="h-4 w-4 mr-2 text-green-600" />
                      <h4 className="font-medium">Voting Statistics</h4>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Total Votes:</span>
                        <span className="font-medium">{result.total_votes?.toLocaleString() || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Voter Turnout:</span>
                        <span className="font-medium">{result.voter_turnout || 'N/A'}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Results Published:</span>
                        <span className="font-medium">{formatDate(result.published_date)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ResultCard;
