
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
import { Edit, MoreVertical, PlusCircle, Search, Trash2, UserPlus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Define the voter interface to fix the TypeScript errors
interface Voter {
  id: string;
  name: string;
  email: string;
  phone?: string;
  status: string;
  constituency: string;
  state: string;
  district: string;
}

const Voters = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  
  const [voters, setVoters] = useState<Voter[]>([]);
  const [filteredVoters, setFilteredVoters] = useState<Voter[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  
  const [selectedVoter, setSelectedVoter] = useState<Voter | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  // Sort states
  const [sortField, setSortField] = useState<keyof Voter>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  
  // Fetch voters data
  useEffect(() => {
    const fetchVoters = async () => {
      try {
        // In a real app, you'd fetch from an API
        // For now, let's use mock data
        const mockVoters: Voter[] = [
          {
            id: "1",
            name: "John Doe",
            email: "john@example.com",
            phone: "9876543210",
            status: "active",
            constituency: "Mumbai North",
            state: "Maharashtra",
            district: "Mumbai"
          },
          {
            id: "2",
            name: "Jane Smith",
            email: "jane@example.com",
            phone: "8765432109",
            status: "inactive",
            constituency: "Mumbai North",
            state: "Maharashtra",
            district: "Mumbai"
          },
          {
            id: "3",
            name: "Alex Johnson",
            email: "alex@example.com",
            phone: "7654321098",
            status: "active",
            constituency: "Mumbai North",
            state: "Maharashtra",
            district: "Mumbai"
          }
        ];
        
        // Filter voters by admin's constituency
        const filteredByConstituency = user?.constituency 
          ? mockVoters.filter(voter => voter.constituency === user.constituency)
          : mockVoters;
          
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
      voter.constituency.toLowerCase().includes(searchQuery.toLowerCase())
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
  const handleSortToggle = (field: keyof Voter) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };
  
  // Handle voter status toggle
  const handleStatusToggle = (voter: Voter) => {
    const updatedVoters = voters.map(v => {
      if (v.id === voter.id) {
        const newStatus = v.status === 'active' ? 'inactive' : 'active';
        return { ...v, status: newStatus };
      }
      return v;
    });
    
    setVoters(updatedVoters);
    
    toast({
      title: "Status Updated",
      description: `${voter.name}'s status has been updated.`,
    });
  };
  
  // Handle delete
  const handleDelete = () => {
    if (!selectedVoter) return;
    
    const updatedVoters = voters.filter(voter => voter.id !== selectedVoter.id);
    setVoters(updatedVoters);
    setIsDeleteDialogOpen(false);
    setSelectedVoter(null);
    
    toast({
      title: "Voter Deleted",
      description: `${selectedVoter.name} has been removed from the system.`,
    });
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
                placeholder="Search by name, email or constituency..."
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
                      <TableHead className="cursor-pointer" onClick={() => handleSortToggle('constituency')}>
                        Constituency {sortField === 'constituency' && (sortDirection === 'asc' ? '↑' : '↓')}
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
                          <TableCell>{voter.constituency}</TableCell>
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
