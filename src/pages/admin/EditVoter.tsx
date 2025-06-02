
import React, { useState, useEffect } from 'react';
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Layout from '@/components/Layout';
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from '@/contexts/AuthContext';
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
import { 
  allLoksabhas, 
  allVidhansabhas, 
  allLocalBodies, 
  allWards, 
  allBooths, 
  getOptionsForDropdown 
} from '@/utils/locationData';

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
  voter_id: z.string().min(10, {
    message: "Voter ID must be at least 10 characters.",
  }),
  dob: z.string(),
  state: z.string(),
  district: z.string(),
  loksabhaWard: z.string(),
  vidhansabhaWard: z.string(),
  localbody: z.string(),
  ward: z.string(),
  booth: z.string(),
});

const EditVoter = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  // States for dependent dropdowns
  const [loksabhas, setLoksabhas] = useState<string[]>([]);
  const [vidhansabhas, setVidhansabhas] = useState<string[]>([]);
  const [localbodies, setLocalbodies] = useState<string[]>([]);
  const [wards, setWards] = useState<string[]>([]);
  const [booths, setBooths] = useState<string[]>([]);

  // Mock voter data (would come from API)
  const voterData = {
    id: parseInt(id || "1"),
    name: "Aditya Sharma",
    email: "aditya@example.com",
    phone: "9876543210",
    voter_id: "MH0123456789",
    dob: "1990-05-15",
    state: "Maharashtra",
    district: "Mumbai",
    loksabhaWard: "Mumbai North",
    vidhansabhaWard: "Borivali",
    localbody: "Borivali Municipal Corp",
    ward: "Ward 1",
    booth: "Booth #101",
  };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: voterData,
  });

  // Set up initial dropdown values based on voter data
  useEffect(() => {
    // Initialize Lok Sabha constituencies
    if (voterData.district) {
      const newLoksabhas = getOptionsForDropdown(allLoksabhas, voterData.district);
      setLoksabhas(newLoksabhas);
    }

    // Initialize Vidhan Sabha constituencies
    if (voterData.loksabhaWard) {
      const newVidhansabhas = getOptionsForDropdown(allVidhansabhas, voterData.loksabhaWard);
      setVidhansabhas(newVidhansabhas);
    }

    // Initialize Local Bodies
    if (voterData.vidhansabhaWard) {
      const newLocalbodies = getOptionsForDropdown(allLocalBodies, voterData.vidhansabhaWard);
      setLocalbodies(newLocalbodies);
    }

    // Initialize Wards
    if (voterData.localbody) {
      const newWards = getOptionsForDropdown(allWards, voterData.localbody);
      setWards(newWards);
    }

    // Initialize Booths
    if (voterData.ward) {
      const newBooths = getOptionsForDropdown(allBooths, voterData.ward);
      setBooths(newBooths);
    }
  }, [voterData]);

  // Handle loksabha change to update vidhansabha dropdown
  const handleLoksabhaChange = (loksabha: string) => {
    form.setValue("loksabhaWard", loksabha);
    form.setValue("vidhansabhaWard", "");
    form.setValue("localbody", "");
    form.setValue("ward", "");
    form.setValue("booth", "");
    
    const newVidhansabhas = getOptionsForDropdown(allVidhansabhas, loksabha);
    setVidhansabhas(newVidhansabhas);
    setLocalbodies([]);
    setWards([]);
    setBooths([]);
  };

  // Handle vidhansabha change to update localbody dropdown
  const handleVidhansabhaChange = (vidhansabha: string) => {
    form.setValue("vidhansabhaWard", vidhansabha);
    form.setValue("localbody", "");
    form.setValue("ward", "");
    form.setValue("booth", "");
    
    const newLocalbodies = getOptionsForDropdown(allLocalBodies, vidhansabha);
    setLocalbodies(newLocalbodies);
    setWards([]);
    setBooths([]);
  };

  // Handle localbody change to update ward dropdown
  const handleLocalbodyChange = (localbody: string) => {
    form.setValue("localbody", localbody);
    form.setValue("ward", "");
    form.setValue("booth", "");
    
    const newWards = getOptionsForDropdown(allWards, localbody);
    setWards(newWards);
    setBooths([]);
  };

  // Handle ward change to update booth dropdown
  const handleWardChange = (ward: string) => {
    form.setValue("ward", ward);
    form.setValue("booth", "");
    
    const newBooths = getOptionsForDropdown(allBooths, ward);
    setBooths(newBooths);
  };

  function onSubmit(values: z.infer<typeof formSchema>) {
    // In a real application, this would send data to a backend API
    console.log(values);
    toast({
      title: "Voter Updated",
      description: `${values.name}'s information has been updated successfully.`,
    });
    navigate('/admin/voters');
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Edit Voter</h1>
          <p className="text-gray-500">Update voter information for {user?.constituency}</p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center space-x-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src="/placeholder.svg" alt={voterData.name} />
                <AvatarFallback>{voterData.name.substring(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div>
                <CardTitle>{voterData.name}</CardTitle>
                <CardDescription>Voter ID: {voterData.voter_id}</CardDescription>
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
                    name="voter_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Voter ID*</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter voter ID" {...field} />
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
                        <FormControl>
                          <Input value={user?.state || field.value} readOnly {...field} />
                        </FormControl>
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
                        <FormControl>
                          <Input value={user?.district || field.value} readOnly {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="loksabhaWard"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Lok Sabha Constituency*</FormLabel>
                        <Select 
                          onValueChange={(value) => handleLoksabhaChange(value)} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select Lok Sabha constituency" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {loksabhas.map((loksabha) => (
                              <SelectItem key={loksabha} value={loksabha}>{loksabha}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="vidhansabhaWard"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Vidhan Sabha Constituency*</FormLabel>
                        <Select 
                          onValueChange={(value) => handleVidhansabhaChange(value)} 
                          defaultValue={field.value}
                          disabled={vidhansabhas.length === 0}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select Vidhan Sabha constituency" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {vidhansabhas.map((vidhansabha) => (
                              <SelectItem key={vidhansabha} value={vidhansabha}>{vidhansabha}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="localbody"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Local Body*</FormLabel>
                        <Select 
                          onValueChange={(value) => handleLocalbodyChange(value)} 
                          defaultValue={field.value}
                          disabled={localbodies.length === 0}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select local body" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {localbodies.map((localbody) => (
                              <SelectItem key={localbody} value={localbody}>{localbody}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="ward"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ward*</FormLabel>
                        <Select 
                          onValueChange={(value) => handleWardChange(value)} 
                          defaultValue={field.value}
                          disabled={wards.length === 0}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select ward" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {wards.map((ward) => (
                              <SelectItem key={ward} value={ward}>{ward}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="booth"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Booth*</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                          disabled={booths.length === 0}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select booth" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {booths.map((booth) => (
                              <SelectItem key={booth} value={booth}>{booth}</SelectItem>
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
                  <Button type="button" variant="outline" onClick={() => navigate('/admin/voters')}>
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

export default EditVoter;
