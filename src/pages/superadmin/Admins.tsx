
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
import { Edit, MoreVertical, PlusCircle, Search, Trash2, UserPlus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Define the admin interface to fix TypeScript errors
interface Admin {
  id: string;
  name: string;
  email: string;
  phone?: string;
  status: string;
  constituency: string;
  state: string;
  district: string;
}

const Admins = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [filteredAdmins, setFilteredAdmins] = useState<Admin[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  
  const [selectedAdmin, setSelectedAdmin] = useState<Admin | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  // Sort states
  const [sortField, setSortField] = useState<keyof Admin>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  
  // Fetch admins data
  useEffect(() => {
    const fetchAdmins = async () => {
      try {
        // In a real app, you'd fetch from an API
        // For now, let's use mock data
        const mockAdmins: Admin[] = [
          {
            id: "1",
            name: "John Smith",
            email: "john@example.com",
            phone: "9876543210",
            status: "active",
            constituency: "Mumbai North",
            state: "Maharashtra",
            district: "Mumbai"
          },
          {
            id: "2",
            name: "Jane Doe",
            email: "jane@example.com",
            phone: "8765432109",
            status: "inactive",
            constituency: "Mumbai South",
            state: "Maharashtra",
            district: "Mumbai"
          },
          {
            id: "3",
            name: "Alex Johnson",
            email: "alex@example.com",
            phone: "7654321098",
            status: "active",
            constituency: "Pune",
            state: "Maharashtra",
            district: "Pune"
          }
        ];
        
        setAdmins(mockAdmins);
        setFilteredAdmins(mockAdmins);
        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch admins:", error);
        setLoading(false);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load admin data",
        });
      }
    };
    
    fetchAdmins();
  }, [toast]);
  
  // Handle search
  useEffect(() => {
    const filtered = admins.filter(admin =>
      admin.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      admin.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      admin.constituency.toLowerCase().includes(searchQuery.toLowerCase())
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
    
    setFilteredAdmins(sorted);
  }, [searchQuery, admins, sortField, sortDirection]);
  
  // Handle sort toggle
  const handleSortToggle = (field: keyof Admin) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };
  
  // Handle admin status toggle
  const handleStatusToggle = (admin: Admin) => {
    const updatedAdmins = admins.map(a => {
      if (a.id === admin.id) {
        const newStatus = a.status === 'active' ? 'inactive' : 'active';
        return { ...a, status: newStatus };
      }
      return a;
    });
    
    setAdmins(updatedAdmins);
    
    toast({
      title: "Status Updated",
      description: `${admin.name}'s status has been updated.`,
    });
  };
  
  // Handle delete
  const handleDelete = () => {
    if (!selectedAdmin) return;
    
    const updatedAdmins = admins.filter(admin => admin.id !== selectedAdmin.id);
    setAdmins(updatedAdmins);
    setIsDeleteDialogOpen(false);
    setSelectedAdmin(null);
    
    toast({
      title: "Admin Deleted",
      description: `${selectedAdmin.name} has been removed from the system.`,
    });
  };
  
  return (
    <Layout>
      <div className="container mx-auto p-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Manage Admins</h1>
          <Button onClick={() => navigate('/superadmin/admins/register')}>
            <UserPlus className="mr-2 h-4 w-4" />
            Register New Admin
          </Button>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Admins</CardTitle>
            <CardDescription>
              Manage constituency admins. You can register new admins, edit their information, or deactivate their accounts.
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
                    {filteredAdmins.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                          No admins found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredAdmins.map((admin) => (
                        <TableRow key={admin.id}>
                          <TableCell>{admin.name}</TableCell>
                          <TableCell>{admin.email}</TableCell>
                          <TableCell>{admin.phone || 'N/A'}</TableCell>
                          <TableCell>{admin.constituency}</TableCell>
                          <TableCell>
                            <Badge variant={admin.status === 'active' ? 'default' : 'outline'}>
                              {admin.status === 'active' ? 'Active' : 'Inactive'}
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
                                <DropdownMenuItem onClick={() => navigate(`/superadmin/admins/edit/${admin.id}`)}>
                                  <Edit className="mr-2 h-4 w-4" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleStatusToggle(admin)}>
                                  {admin.status === 'active' ? 'Deactivate' : 'Activate'}
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem 
                                  className="text-destructive focus:text-destructive"
                                  onClick={() => {
                                    setSelectedAdmin(admin);
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
              {filteredAdmins.length} admin{filteredAdmins.length !== 1 && 's'} found
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
              This action cannot be undone. This will permanently delete {selectedAdmin?.name}'s account and remove their data from our servers.
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

export default Admins;
