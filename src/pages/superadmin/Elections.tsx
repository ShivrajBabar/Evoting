
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Layout from '@/components/Layout';
import { Plus, Search, Edit, Trash2, Calendar, Eye } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Link, useNavigate } from 'react-router-dom';

const SuperadminElections = () => {
  const { toast } = useToast();
  const navigate = useNavigate();

  // Mock elections data
  const elections = [
    { 
      id: 1, 
      name: 'Lok Sabha Elections 2025', 
      type: 'Lok Sabha',
      status: 'Scheduled',
      date: '2025-04-15',
      candidates: 245,
      voters: 984567,
      turnout: null
    },
    { 
      id: 2, 
      name: 'Maharashtra Vidhan Sabha Elections', 
      type: 'Vidhan Sabha',
      status: 'Preparation',
      date: '2024-10-20',
      candidates: 542,
      voters: 125678,
      turnout: null
    },
    { 
      id: 3, 
      name: 'Delhi Municipal Corporation Elections', 
      type: 'Local Body',
      status: 'Active',
      date: '2024-08-05',
      candidates: 324,
      voters: 87542,
      turnout: '45%'
    },
    { 
      id: 4, 
      name: 'Gujarat Panchayat Elections', 
      type: 'Panchayat',
      status: 'Completed',
      date: '2023-12-15',
      candidates: 876,
      voters: 45678,
      turnout: '72%'
    }
  ];

  const handleEditElection = (id: number) => {
    navigate(`/superadmin/elections/edit/${id}`);
    toast({
      title: "Edit Election",
      description: `Navigating to edit election with ID: ${id}`,
    });
  };

  const handleDeleteElection = (id: number) => {
    toast({
      title: "Delete Election",
      description: `Deleting election with ID: ${id}`,
    });
  };

  const handleViewResults = (id: number) => {
    toast({
      title: "View Results",
      description: `Viewing results for election ID: ${id}`,
    });
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header with actions */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
          <h1 className="text-2xl font-bold">Election Management</h1>
          <Button asChild>
            <Link to="/superadmin/elections/create">
              <Plus className="h-4 w-4 mr-2" /> Create Election
            </Link>
          </Button>
        </div>

        {/* Search and filters */}
        <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search elections..."
              className="pl-10 pr-4 py-2 border rounded-md w-full"
            />
          </div>
          <select className="border rounded-md px-4 py-2">
            <option value="all">All Types</option>
            <option value="lok-sabha">Lok Sabha</option>
            <option value="vidhan-sabha">Vidhan Sabha</option>
            <option value="local-body">Local Body</option>
          </select>
          <select className="border rounded-md px-4 py-2">
            <option value="all">All Statuses</option>
            <option value="scheduled">Scheduled</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        {/* Elections Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {elections.map((election) => (
            <Card key={election.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle>{election.name}</CardTitle>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium 
                    ${election.status === 'Active' ? 'bg-green-100 text-green-800' : 
                    election.status === 'Scheduled' ? 'bg-blue-100 text-blue-800' : 
                    election.status === 'Preparation' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'}`}>
                    {election.status}
                  </span>
                </div>
                <CardDescription>{election.type} Election</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                    <span className="text-sm">{election.date}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-gray-500">Candidates</p>
                      <p className="font-medium">{election.candidates}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Eligible Voters</p>
                      <p className="font-medium">{election.voters.toLocaleString()}</p>
                    </div>
                    {election.turnout && (
                      <div>
                        <p className="text-gray-500">Turnout</p>
                        <p className="font-medium">{election.turnout}</p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleEditElection(election.id)}
                  >
                    <Edit className="h-4 w-4 mr-1" /> Edit
                  </Button>
                  {election.status === 'Completed' && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleViewResults(election.id)}
                    >
                      <Eye className="h-4 w-4 mr-1" /> Results
                    </Button>
                  )}
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => handleDeleteElection(election.id)}
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default SuperadminElections;
