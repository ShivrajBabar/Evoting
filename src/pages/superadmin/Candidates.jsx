
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Layout from '@/components/Layout';
import { UserPlus, Search, Edit, Trash2, FileText, Mail } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Link, useNavigate } from 'react-router-dom';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CandidateService, AuthService } from '@/api/apiService';
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

const SuperadminCandidates = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [electionFilter, setElectionFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [documentPreviewUrl, setDocumentPreviewUrl] = useState(null);
  const [documentDialogOpen, setDocumentDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Mock candidates data with useState to allow updates
  const [candidates, setCandidates] = useState([
    { 
      id: 1, 
      name: "Rajesh Kumar", 
      party: "Democratic Party", 
      age: 45, 
      constituency: "Mumbai North",
      election: "Lok Sabha Elections 2025",
      status: "Approved",
      email: "rajesh.kumar@example.com"
    },
    { 
      id: 2, 
      name: "Sonia Singh", 
      party: "Progressive Alliance", 
      age: 42, 
      constituency: "Delhi East",
      election: "Lok Sabha Elections 2025",
      status: "Pending",
      email: "sonia.singh@example.com"
    },
    { 
      id: 3, 
      name: "Amit Verma", 
      party: "National Front", 
      age: 52, 
      constituency: "Bangalore Central",
      election: "Vidhan Sabha Elections 2024",
      status: "Approved",
      email: "amit.verma@example.com"
    },
    { 
      id: 4, 
      name: "Kavita Desai", 
      party: "People's Party", 
      age: 39, 
      constituency: "Chennai South",
      election: "Municipal Elections 2024",
      status: "Rejected",
      email: "kavita.desai@example.com"
    },
    { 
      id: 5, 
      name: "Prakash Joshi", 
      party: "Democratic Party", 
      age: 47, 
      constituency: "Mumbai South",
      election: "Lok Sabha Elections 2025",
      status: "Pending",
      email: "prakash.joshi@example.com"
    }
  ]);

  // Filter candidates based on search query and filters
  const filteredCandidates = candidates.filter(candidate => {
    const matchesSearch = searchQuery === '' || 
      candidate.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      candidate.party.toLowerCase().includes(searchQuery.toLowerCase()) ||
      candidate.constituency.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesElection = electionFilter === 'all' || candidate.election === electionFilter;
    const matchesStatus = statusFilter === 'all' || candidate.status === statusFilter;
    
    return matchesSearch && matchesElection && matchesStatus;
  });

  // Get unique elections for filter dropdown
  const elections = [...new Set(candidates.map(candidate => candidate.election))];

  const handleEditCandidate = (id) => {
    navigate(`/superadmin/candidates/edit/${id}`);
  };

  const handleDeleteCandidate = (id) => {
    toast({
      title: "Delete Candidate",
      description: `Deleting candidate with ID: ${id}`,
    });
  };

  // Function to view candidate document
  const handleViewDocument = async (id) => {
    try {
      setLoading(true);
      // In a real app, this would fetch the document from the API
      // const documentBlob = await CandidateService.getCandidateDocument(id);
      // const pdfUrl = URL.createObjectURL(documentBlob);
      
      // For demo purposes, use a sample PDF
      const pdfUrl = `https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf`;
      setDocumentPreviewUrl(pdfUrl);
      setDocumentDialogOpen(true);
      setLoading(false);
      
      toast({
        title: "Document Loaded",
        description: "Candidate document preview is ready",
      });
    } catch (error) {
      console.error('Error fetching document:', error);
      setLoading(false);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load candidate document",
      });
    }
  };
  
  // Send login credentials to the candidate via email
  const handleSendCredentials = async (candidate) => {
    try {
      setLoading(true);
      // In a real app, this would call the API to send credentials
      await AuthService.sendLoginCredentials(
        candidate.email,
        'tempPass123', // In real app would be generated
        'candidate'
      );
      
      setLoading(false);
      toast({
        title: "Email Sent",
        description: `Login credentials sent to ${candidate.name} at ${candidate.email}`,
      });
    } catch (error) {
      console.error('Error sending credentials:', error);
      setLoading(false);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to send login credentials",
      });
    }
  };

  // Update candidate status
  const updateCandidateStatus = (id, newStatus) => {
    setCandidates(candidates.map(candidate => 
      candidate.id === id ? { ...candidate, status: newStatus } : candidate
    ));
    
    toast({
      title: "Status Updated",
      description: `Candidate status changed to ${newStatus}`,
    });
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header with actions */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
          <h1 className="text-2xl font-bold">Candidate Management</h1>
          <Button asChild>
            <Link to="/superadmin/candidates/register">
              <UserPlus className="h-4 w-4 mr-2" /> Register Candidate
            </Link>
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
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="w-full sm:w-64">
            <Select value={electionFilter} onValueChange={setElectionFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Elections" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Elections</SelectItem>
                {elections.map((election) => (
                  <SelectItem key={election} value={election}>{election}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="w-full sm:w-48">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Approved">Approved</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Candidates Table */}
        <Card>
          <CardHeader>
            <CardTitle>Election Candidates</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3">Name</th>
                    <th className="px-6 py-3">Party</th>
                    <th className="px-6 py-3">Age</th>
                    <th className="px-6 py-3">Constituency</th>
                    <th className="px-6 py-3">Election</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCandidates.map((candidate) => (
                    <tr key={candidate.id} className="border-b hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium">{candidate.name}</td>
                      <td className="px-6 py-4">{candidate.party}</td>
                      <td className="px-6 py-4">{candidate.age}</td>
                      <td className="px-6 py-4">{candidate.constituency}</td>
                      <td className="px-6 py-4">{candidate.election}</td>
                      <td className="px-6 py-4">
                        <Popover>
                          <PopoverTrigger asChild>
                            <span 
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium cursor-pointer
                                ${candidate.status === 'Approved' ? 'bg-green-100 text-green-800' : 
                                candidate.status === 'Rejected' ? 'bg-red-100 text-red-800' : 
                                'bg-yellow-100 text-yellow-800'}`}
                            >
                              {candidate.status}
                            </span>
                          </PopoverTrigger>
                          <PopoverContent className="w-56">
                            <div className="space-y-4">
                              <h4 className="font-medium">Update Status</h4>
                              <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <Label htmlFor={`approved-${candidate.id}`}>Approved</Label>
                                  <Switch 
                                    id={`approved-${candidate.id}`} 
                                    checked={candidate.status === 'Approved'}
                                    onCheckedChange={() => updateCandidateStatus(candidate.id, 'Approved')}
                                  />
                                </div>
                                <div className="flex items-center justify-between">
                                  <Label htmlFor={`pending-${candidate.id}`}>Pending</Label>
                                  <Switch 
                                    id={`pending-${candidate.id}`} 
                                    checked={candidate.status === 'Pending'}
                                    onCheckedChange={() => updateCandidateStatus(candidate.id, 'Pending')}
                                  />
                                </div>
                                <div className="flex items-center justify-between">
                                  <Label htmlFor={`rejected-${candidate.id}`}>Rejected</Label>
                                  <Switch 
                                    id={`rejected-${candidate.id}`} 
                                    checked={candidate.status === 'Rejected'}
                                    onCheckedChange={() => updateCandidateStatus(candidate.id, 'Rejected')}
                                  />
                                </div>
                              </div>
                            </div>
                          </PopoverContent>
                        </Popover>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end space-x-2">
                          <Button variant="ghost" size="sm" onClick={() => handleEditCandidate(candidate.id)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleSendCredentials(candidate)}
                            disabled={loading}
                          >
                            <Mail className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleViewDocument(candidate.id)}
                            disabled={loading}
                          >
                            <FileText className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDeleteCandidate(candidate.id)}>
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {filteredCandidates.length === 0 && (
                <div className="py-8 text-center text-gray-500">
                  No candidates match your search criteria
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Document Preview Dialog */}
      <Dialog open={documentDialogOpen} onOpenChange={setDocumentDialogOpen}>
        <DialogContent className="sm:max-w-4xl h-[80vh]">
          <DialogHeader>
            <DialogTitle>Candidate Document</DialogTitle>
            <DialogDescription>
              Preview of candidate submitted documents
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 h-full">
            {documentPreviewUrl && (
              <iframe 
                src={documentPreviewUrl} 
                title="Document Preview" 
                className="w-full h-[60vh] border"
              />
            )}
          </div>
          <div className="flex justify-end space-x-4 mt-4">
            <Button variant="outline" onClick={() => setDocumentDialogOpen(false)}>
              Close
            </Button>
            <Button onClick={() => window.open(documentPreviewUrl, '_blank')}>
              Open in New Tab
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default SuperadminCandidates;
