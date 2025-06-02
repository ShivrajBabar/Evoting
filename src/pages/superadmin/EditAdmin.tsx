
import React, { useState, useEffect } from 'react';
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Layout from '@/components/Layout';
import { useToast } from "@/components/ui/use-toast";
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { states, allDistricts, allVidhansabhas, getOptionsForDropdown } from '@/utils/locationData';

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  phone: z.string().min(10, {
    message: "Phone number must be at least 10 digits.",
  }),
  dob: z.string(),
  state: z.string(),
  district: z.string(),
  vidhansabha: z.string(),
});

const EditAdmin = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // States for dependent dropdowns
  const [districts, setDistricts] = useState<string[]>([]);
  const [vidhansabhas, setVidhansabhas] = useState<string[]>([]);

  // Mock admin data (would come from API)
  const adminData = {
    id: parseInt(id || "1"),
    name: "Vikram Singh",
    email: "vikram@example.com",
    phone: "9876543210",
    dob: "1985-08-20",
    state: "Maharashtra",
    district: "Mumbai",
    vidhansabha: "Borivali",
  };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: adminData,
  });

  // Set up initial dropdown values based on admin data
  useEffect(() => {
    if (adminData.state) {
      const newDistricts = getOptionsForDropdown(allDistricts, adminData.state);
      setDistricts(newDistricts);
      
      if (adminData.district) {
        // Get Lok Sabha constituencies for district
        const loksabhas = getOptionsForDropdown(allDistricts, adminData.district);
        let allAvailableVidhansabhas: string[] = [];
        
        // Collect all Vidhan Sabha constituencies
        loksabhas.forEach(loksabha => {
          const vidhansabhasForLoksabha = getOptionsForDropdown(allVidhansabhas, loksabha);
          allAvailableVidhansabhas = [...allAvailableVidhansabhas, ...vidhansabhasForLoksabha];
        });
        
        setVidhansabhas(Array.from(new Set(allAvailableVidhansabhas)));
      }
    }
  }, [adminData]);

  // Handle state change to update districts dropdown
  const handleStateChange = (state: string) => {
    form.setValue("state", state);
    form.setValue("district", "");
    form.setValue("vidhansabha", "");
    
    const newDistricts = getOptionsForDropdown(allDistricts, state);
    setDistricts(newDistricts);
    setVidhansabhas([]);
  };

  // Handle district change to update vidhansabha dropdown
  const handleDistrictChange = (district: string) => {
    form.setValue("district", district);
    form.setValue("vidhansabha", "");
    
    // For districts, we need to get Lok Sabha constituencies first, then gather all Vidhan Sabha from them
    const loksabhas = getOptionsForDropdown(allDistricts, district);
    let allAvailableVidhansabhas: string[] = [];
    
    // Collect all Vidhan Sabha constituencies from all Lok Sabha constituencies in this district
    loksabhas.forEach(loksabha => {
      const vidhansabhasForLoksabha = getOptionsForDropdown(allVidhansabhas, loksabha);
      allAvailableVidhansabhas = [...allAvailableVidhansabhas, ...vidhansabhasForLoksabha];
    });
    
    setVidhansabhas(Array.from(new Set(allAvailableVidhansabhas)));
  };

  function onSubmit(values: z.infer<typeof formSchema>) {
    // In a real application, this would send data to a backend API
    console.log(values);
    toast({
      title: "Admin Updated",
      description: `${values.name}'s information has been updated successfully.`,
    });
    navigate('/superadmin/admins');
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Edit Admin</h1>
          <p className="text-gray-500">Update admin information</p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center space-x-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src="/placeholder.svg" alt={adminData.name} />
                <AvatarFallback>{adminData.name.substring(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div>
                <CardTitle>{adminData.name}</CardTitle>
                <CardDescription>{adminData.vidhansabha} Constituency Admin</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name*</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter full name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email*</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter email address" type="email" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number*</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter phone number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="dob"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Date of Birth*</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="state"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>State*</FormLabel>
                        <Select 
                          onValueChange={(value) => handleStateChange(value)} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select state" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {states.map((state) => (
                              <SelectItem key={state} value={state}>{state}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="district"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>District*</FormLabel>
                        <Select 
                          onValueChange={(value) => handleDistrictChange(value)} 
                          defaultValue={field.value}
                          disabled={districts.length === 0}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select district" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {districts.map((district) => (
                              <SelectItem key={district} value={district}>{district}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="vidhansabha"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Vidhan Sabha Constituency*</FormLabel>
                        <Select 
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          disabled={vidhansabhas.length === 0}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select Vidhan Sabha constituency" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {vidhansabhas.map((constituency) => (
                              <SelectItem key={constituency} value={constituency}>{constituency}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div>
                  <FormLabel>Update Photo</FormLabel>
                  <Input type="file" className="mt-1" />
                </div>

                <div className="flex justify-end space-x-4">
                  <Button type="button" variant="outline" onClick={() => navigate('/superadmin/admins')}>
                    Cancel
                  </Button>
                  <Button type="submit">Save Changes</Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default EditAdmin;
