
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Layout from '@/components/Layout';
import { Search, Eye, Download } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog";

type Candidate = {
  id: number;
  name: string;
  party: string;
  symbol: string;
  election: string;
  status: string;
  photoUrl: string; // Added photo URL
};

const AdminCandidates = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [viewCandidate, setViewCandidate] = useState<Candidate | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Mock candidates data for admin's constituency with photo URLs
  const candidates = [
    { 
      id: 1, 
      name: 'Rajesh Kumar', 
      party: 'Democratic Party', 
      symbol: '🌸 Flower',
      election: 'Lok Sabha Elections 2025',
      status: 'Approved',
      photoUrl: 'https://randomuser.me/api/portraits/men/32.jpg'
    },
    { 
      id: 2, 
      name: 'Priya Sharma', 
      party: 'Progressive Alliance', 
      symbol: '🌿 Leaf',
      election: 'Lok Sabha Elections 2025',
      status: 'Approved',
      photoUrl: 'https://randomuser.me/api/portraits/women/44.jpg'
    },
    { 
      id: 3, 
      name: 'Amit Singh', 
      party: 'National Front', 
      symbol: '🌞 Sun',
      election: 'Municipal Corporation Elections',
      status: 'Pending',
      photoUrl: 'https://randomuser.me/api/portraits/men/67.jpg'
    },
    { 
      id: 4, 
      name: 'Kavita Patel', 
      party: 'People\'s Party', 
      symbol: '🏵️ Rosette',
      election: 'Lok Sabha Elections 2025',
      status: 'Approved',
      photoUrl: 'https://randomuser.me/api/portraits/women/22.jpg'
    }
  ];

  const handleViewCandidate = (candidate: Candidate) => {
    setViewCandidate(candidate);
    setDialogOpen(true);
  };

  const handleDownloadCandidateList = () => {
    toast({
      title: "Download Initiated",
      description: "Candidate list download started.",
    });
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header with actions */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
          <div>
            <h1 className="text-2xl font-bold">Candidates</h1>
            <p className="text-gray-500">Candidates in {user?.constituency || 'your constituency'}</p>
          </div>
          <Button variant="outline" onClick={handleDownloadCandidateList}>
            <Download className="h-4 w-4 mr-2" /> Download List
          </Button>
        </div>

        {/* Search and filters */}
        <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search candidates..."
              className="pl-10 pr-4 py-2 border rounded-md w-full"
            />
          </div>
          <select className="border rounded-md px-4 py-2">
            <option value="all">All Elections</option>
            <option value="lok-sabha">Lok Sabha Elections</option>
            <option value="municipal">Municipal Corporation Elections</option>
          </select>
          <select className="border rounded-md px-4 py-2">
            <option value="all">All Parties</option>
            <option value="democratic">Democratic Party</option>
            <option value="progressive">Progressive Alliance</option>
            <option value="national">National Front</option>
          </select>
        </div>

        {/* Candidates Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Candidates</CardTitle>
            <CardDescription>Candidates registered for elections in your constituency</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="px-4 py-3 text-left">Photo</th>
                    <th className="px-4 py-3 text-left">Name</th>
                    <th className="px-4 py-3 text-left">Party</th>
                    <th className="px-4 py-3 text-left">Symbol</th>
                    <th className="px-4 py-3 text-left">Election</th>
                    <th className="px-4 py-3 text-left">Status</th>
                    <th className="px-4 py-3 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {candidates.map((candidate) => (
                    <tr key={candidate.id} className="border-b">
                      <td className="px-4 py-3">
                        <div className="h-10 w-10 rounded-full overflow-hidden">
                          <img 
                            src={candidate.photoUrl} 
                            alt={candidate.name}
                            className="h-full w-full object-cover" 
                          />
                        </div>
                      </td>
                      <td className="px-4 py-3 font-medium">{candidate.name}</td>
                      <td className="px-4 py-3">{candidate.party}</td>
                      <td className="px-4 py-3">{candidate.symbol}</td>
                      <td className="px-4 py-3">{candidate.election}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium 
                          ${candidate.status === 'Approved' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                          {candidate.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleViewCandidate(candidate)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Candidate Details Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Candidate Details</DialogTitle>
            <DialogDescription>
              Information about the selected candidate
            </DialogDescription>
          </DialogHeader>
          {viewCandidate && (
            <div className="space-y-4">
              <div className="flex justify-center mb-4">
                <div className="h-32 w-32 rounded-full overflow-hidden">
                  <img 
                    src={viewCandidate.photoUrl} 
                    alt={viewCandidate.name}
                    className="h-full w-full object-cover" 
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Name</p>
                  <p className="text-sm">{viewCandidate.name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">ID</p>
                  <p className="text-sm">{viewCandidate.id}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Party</p>
                  <p className="text-sm">{viewCandidate.party}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Symbol</p>
                  <p className="text-sm">{viewCandidate.symbol}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Election</p>
                  <p className="text-sm">{viewCandidate.election}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Status</p>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium 
                    ${viewCandidate.status === 'Approved' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                    {viewCandidate.status}
                  </span>
                </div>
              </div>
              <div className="pt-4">
                <Button 
                  variant="secondary" 
                  onClick={() => setDialogOpen(false)}
                  className="w-full"
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default AdminCandidates;
