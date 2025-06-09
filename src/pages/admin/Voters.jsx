import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Edit, MoreVertical, PlusCircle, Search, Trash2, UserPlus, Mail } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AuthService } from '@/api/apiService';

const Voters = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  
  const [voters, setVoters] = useState([]);
  const [filteredVoters, setFilteredVoters] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [emailLoading, setEmailLoading] = useState(false);
  
  const [selectedVoter, setSelectedVoter] = useState(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  // Sort states
  const [sortField, setSortField] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');
  
  // Fetch voters data
  useEffect(() => {
    const fetchVoters = async () => {
      try {
        const response = await fetch('/api/voters');
        if (!response.ok) {
          throw new Error('Failed to fetch voters');
        }
        const data = await response.json();
        
        // Transform the API data to match our expected format
        const transformedVoters = data.map(voter => ({
          id: voter.voter_id,
          user_id: voter.user_id,
          name: voter.name,
          email: voter.email,
          phone: voter.phone,
          dob: voter.dob,
          status: voter.status,
          photo_name: voter.photo_name,
          voter_card_number: voter.voter_card_number,
          state_id: voter.state_id,
          district_id: voter.district_id,
          loksabha_ward_id: voter.loksabha_ward_id,
          vidhansabha_ward_id: voter.vidhansabha_ward_id,
          municipal_corp_id: voter.municipal_corp_id,
          municipal_corp_ward_id: voter.municipal_corp_ward_id,
          booth_id: voter.booth_id
        }));
        
        // Filter voters by admin's constituency if needed
        // (Assuming we might filter by some ward ID in the future)
        const filteredByConstituency = transformedVoters;
          
        setVoters(filteredByConstituency);
        setFilteredVoters(filteredByConstituency);
        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch voters:", error);
        setLoading(false);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load voters data",
        });
      }
    };
    
    fetchVoters();
  }, [user, toast]);
  
  // Handle search
  useEffect(() => {
    const filtered = voters.filter(voter =>
      voter.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      voter.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      voter.voter_card_number?.toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    const sorted = [...filtered].sort((a, b) => {
      const valueA = a[sortField];
      const valueB = b[sortField];
      
      if (valueA === valueB) return 0;
      
      if (sortDirection === 'asc') {
        return valueA < valueB ? -1 : 1;
      } else {
        return valueA > valueB ? -1 : 1;
      }
    });
    
    setFilteredVoters(sorted);
  }, [searchQuery, voters, sortField, sortDirection]);
  
  // Handle sort toggle
  const handleSortToggle = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };
  
  // Handle voter status toggle
  const handleStatusToggle = async (voter) => {
    try {
      const newStatus = voter.status === 'active' ? 'inactive' : 'active';
      
      // Update in the database first
      const response = await fetch(`/api/users/${voter.user_id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus })
      });
      
      if (!response.ok) {
        throw new Error('Failed to update status');
      }
      
      // Then update local state
      const updatedVoters = voters.map(v => {
        if (v.id === voter.id) {
          return { ...v, status: newStatus };
        }
        return v;
      });
      
      setVoters(updatedVoters);
      
      toast({
        title: "Status Updated",
        description: `${voter.name}'s status has been updated to ${newStatus}.`,
      });
    } catch (error) {
      console.error("Error updating status:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update voter status",
      });
    }
  };
  
  // Handle delete
  const handleDelete = async () => {
    if (!selectedVoter) return;
    
    try {
      // First delete from the database
      const response = await fetch(`/api/voters/${selectedVoter.id}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete voter');
      }
      
      // Then update local state
      const updatedVoters = voters.filter(voter => voter.id !== selectedVoter.id);
      setVoters(updatedVoters);
      setIsDeleteDialogOpen(false);
      setSelectedVoter(null);
      
      toast({
        title: "Voter Deleted",
        description: `${selectedVoter.name} has been removed from the system.`,
      });
    } catch (error) {
      console.error("Error deleting voter:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete voter",
      });
    }
  };

  // Send login credentials to voter
  const handleSendCredentials = async (voter) => {
    try {
      setEmailLoading(true);
      
      await AuthService.sendLoginCredentials(
        voter.email,
        'tempPass123', // In real app would be generated
        'voter'
      );
      
      setEmailLoading(false);
      toast({
        title: "Email Sent",
        description: `Login credentials sent to ${voter.name} at ${voter.email}`,
      });
    } catch (error) {
      console.error('Error sending credentials:', error);
      setEmailLoading(false);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to send login credentials",
      });
    }
  };
  
  return (
    <Layout>
      <div className="container mx-auto p-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Manage Voters</h1>
          <Button onClick={() => navigate('/admin/voters/register')}>
            <UserPlus className="mr-2 h-4 w-4" />
            Register New Voter
          </Button>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Voters</CardTitle>
            <CardDescription>
              Manage voters in your constituency. You can register new voters, edit their information, or deactivate their accounts.
            </CardDescription>
            <div className="flex items-center pt-3">
              <Search className="mr-2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email or voter ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="max-w-sm"
              />
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="cursor-pointer" onClick={() => handleSortToggle('name')}>
                        Name {sortField === 'name' && (sortDirection === 'asc' ? '↑' : '↓')}
                      </TableHead>
                      <TableHead className="cursor-pointer" onClick={() => handleSortToggle('email')}>
                        Email {sortField === 'email' && (sortDirection === 'asc' ? '↑' : '↓')}
                      </TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead className="cursor-pointer" onClick={() => handleSortToggle('voter_card_number')}>
                        Voter ID {sortField === 'voter_card_number' && (sortDirection === 'asc' ? '↑' : '↓')}
                      </TableHead>
                      <TableHead className="cursor-pointer" onClick={() => handleSortToggle('status')}>
                        Status {sortField === 'status' && (sortDirection === 'asc' ? '↑' : '↓')}
                      </TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredVoters.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                          No voters found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredVoters.map((voter) => (
                        <TableRow key={voter.id}>
                          <TableCell>{voter.name}</TableCell>
                          <TableCell>{voter.email}</TableCell>
                          <TableCell>{voter.phone || 'N/A'}</TableCell>
                          <TableCell>{voter.voter_card_number || 'N/A'}</TableCell>
                          <TableCell>
                            <Badge variant={voter.status === 'active' ? 'default' : 'outline'}>
                              {voter.status === 'active' ? 'Active' : 'Inactive'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuItem onClick={() => navigate(`/admin/voters/edit/${voter.id}`)}>
                                  <Edit className="mr-2 h-4 w-4" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleSendCredentials(voter)} disabled={emailLoading}>
                                  <Mail className="mr-2 h-4 w-4" />
                                  Send Credentials
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleStatusToggle(voter)}>
                                  {voter.status === 'active' ? 'Deactivate' : 'Activate'}
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem 
                                  className="text-destructive focus:text-destructive"
                                  onClick={() => {
                                    setSelectedVoter(voter);
                                    setIsDeleteDialogOpen(true);
                                  }}
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-between">
            <div className="text-sm text-muted-foreground">
              {filteredVoters.length} voter{filteredVoters.length !== 1 && 's'} found
            </div>
          </CardFooter>
        </Card>
      </div>
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete {selectedVoter?.name}'s account and remove their data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Layout>
  );
};

export default Voters;