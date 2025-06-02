
import React, { useState, useEffect } from 'react';
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Layout from '@/components/Layout';
import { useToast } from "@/components/ui/use-toast";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useParams, useNavigate } from 'react-router-dom';
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

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
  aadhar: z.string().min(12, {
    message: "Aadhar number must be 12 digits.",
  }),
  dob: z.string(),
  state: z.string(),
  district: z.string(),
  loksabha: z.string(),
  vidhansabha: z.string(),
  localbody: z.string(),
  ward: z.string(),
  booth: z.string(),
  election: z.string(),
  income: z.string().optional(),
  income_no: z.string().optional(),
  nationality: z.string(),
  nationality_no: z.string(),
  education: z.string(),
  religion: z.string(),
  cast: z.string(),
  cast_no: z.string(),
  non_crime_no: z.string(),
  party: z.string(),
  amount: z.string().optional(),
  method: z.string().optional(),
});

const EditCandidate = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  // States for dependent dropdowns
  const [districts, setDistricts] = useState<string[]>([]);
  const [loksabhas, setLoksabhas] = useState<string[]>([]);
  const [vidhansabhas, setVidhansabhas] = useState<string[]>([]);
  const [localbodies, setLocalbodies] = useState<string[]>([]);
  const [wards, setWards] = useState<string[]>([]);
  const [booths, setBooths] = useState<string[]>([]);

  // Mock data for dropdowns
  const states = ["Maharashtra", "Delhi", "Karnataka", "Tamil Nadu"];
  const allDistricts = {
    "Maharashtra": ["Mumbai", "Pune", "Nagpur", "Thane"],
    "Delhi": ["Central Delhi", "East Delhi", "New Delhi", "North Delhi"],
    "Karnataka": ["Bangalore", "Mysore", "Hubli", "Mangalore"],
    "Tamil Nadu": ["Chennai", "Coimbatore", "Madurai", "Salem"]
  };
  
  const allLoksabhas = {
    "Mumbai": ["Mumbai North", "Mumbai South", "Mumbai North East"],
    "Pune": ["Pune", "Baramati"],
    "Delhi": ["East Delhi", "New Delhi", "North Delhi"],
    "Bangalore": ["Bangalore Central", "Bangalore North", "Bangalore South"]
  };
  
  const allVidhansabhas = {
    "Mumbai North": ["Borivali", "Dahisar", "Kandivali East"],
    "Mumbai South": ["Worli", "Byculla", "Malabar Hill"],
    "East Delhi": ["Preet Vihar", "Vishwas Nagar", "Laxmi Nagar"],
    "Bangalore Central": ["Shivajinagar", "Shantinagar", "Gandhinagar"]
  };
  
  const allLocalBodies = {
    "Borivali": ["Borivali Municipal Corp", "Borivali Gram Panchayat"],
    "Dahisar": ["Dahisar Municipal Corp", "Dahisar Gram Panchayat"],
    "Worli": ["Worli Municipal Corp"],
    "Preet Vihar": ["Preet Vihar Municipal Corp"],
    "Shivajinagar": ["Shivajinagar Municipal Corp"]
  };
  
  const allWards = {
    "Borivali Municipal Corp": ["Ward 1", "Ward 2", "Ward 3"],
    "Worli Municipal Corp": ["Ward A", "Ward B", "Ward C"],
    "Preet Vihar Municipal Corp": ["Ward 10", "Ward 11", "Ward 12"],
    "Shivajinagar Municipal Corp": ["Ward X", "Ward Y", "Ward Z"]
  };
  
  const allBooths = {
    "Ward 1": ["Booth #101", "Booth #102", "Booth #103"],
    "Ward A": ["Booth #201", "Booth #202", "Booth #203"],
    "Ward 10": ["Booth #301", "Booth #302", "Booth #303"],
    "Ward X": ["Booth #401", "Booth #402", "Booth #403"]
  };
  
  const elections = ["Lok Sabha Elections 2025", "Vidhan Sabha Elections 2024", "Municipal Elections 2024"];
  const parties = ["Democratic Party", "Progressive Alliance", "National Front", "People's Party"];

  // Mock candidate data (in a real app, this would come from an API)
  const candidateData = {
    id: 1,
    name: "Rajesh Kumar",
    email: "rajesh@example.com",
    phone: "9876543210",
    aadhar: "123456789012",
    dob: "1980-05-15",
    state: "Maharashtra",
    district: "Mumbai",
    loksabha: "Mumbai North",
    vidhansabha: "Borivali",
    localbody: "Borivali Municipal Corp",
    ward: "Ward 1",
    booth: "Booth #101",
    election: "Lok Sabha Elections 2025",
    income: "5,00,000",
    income_no: "INC123456",
    nationality: "Indian",
    nationality_no: "NAT987654",
    education: "Graduate",
    religion: "Hindu",
    cast: "General",
    cast_no: "CAST123456",
    non_crime_no: "NCR123456",
    party: "Democratic Party",
    amount: "10000",
    method: "Online",
  };

  // Initialize form with candidate data
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: candidateData,
  });

  // Set up initial dropdown values based on candidate data
  useEffect(() => {
    if (candidateData.state) {
      setDistricts(allDistricts[candidateData.state as keyof typeof allDistricts] || []);
    }
    if (candidateData.district) {
      setLoksabhas(allLoksabhas[candidateData.district as keyof typeof allLoksabhas] || []);
    }
    if (candidateData.loksabha) {
      setVidhansabhas(allVidhansabhas[candidateData.loksabha as keyof typeof allVidhansabhas] || []);
    }
    if (candidateData.vidhansabha) {
      setLocalbodies(allLocalBodies[candidateData.vidhansabha as keyof typeof allLocalBodies] || []);
    }
    if (candidateData.localbody) {
      setWards(allWards[candidateData.localbody as keyof typeof allWards] || []);
    }
    if (candidateData.ward) {
      setBooths(allBooths[candidateData.ward as keyof typeof allBooths] || []);
    }
  }, []);

  // Handle state change to update districts dropdown
  const handleStateChange = (state: string) => {
    form.setValue("state", state);
    form.setValue("district", "");
    form.setValue("loksabha", "");
    form.setValue("vidhansabha", "");
    form.setValue("localbody", "");
    form.setValue("ward", "");
    form.setValue("booth", "");
    setDistricts(allDistricts[state as keyof typeof allDistricts] || []);
    setLoksabhas([]);
    setVidhansabhas([]);
    setLocalbodies([]);
    setWards([]);
    setBooths([]);
  };

  // Handle district change to update loksabha dropdown
  const handleDistrictChange = (district: string) => {
    form.setValue("district", district);
    form.setValue("loksabha", "");
    form.setValue("vidhansabha", "");
    form.setValue("localbody", "");
    form.setValue("ward", "");
    form.setValue("booth", "");
    setLoksabhas(allLoksabhas[district as keyof typeof allLoksabhas] || []);
    setVidhansabhas([]);
    setLocalbodies([]);
    setWards([]);
    setBooths([]);
  };

  // Handle loksabha change to update vidhansabha dropdown
  const handleLoksabhaChange = (loksabha: string) => {
    form.setValue("loksabha", loksabha);
    form.setValue("vidhansabha", "");
    form.setValue("localbody", "");
    form.setValue("ward", "");
    form.setValue("booth", "");
    setVidhansabhas(allVidhansabhas[loksabha as keyof typeof allVidhansabhas] || []);
    setLocalbodies([]);
    setWards([]);
    setBooths([]);
  };

  // Handle vidhansabha change to update localbody dropdown
  const handleVidhansabhaChange = (vidhansabha: string) => {
    form.setValue("vidhansabha", vidhansabha);
    form.setValue("localbody", "");
    form.setValue("ward", "");
    form.setValue("booth", "");
    setLocalbodies(allLocalBodies[vidhansabha as keyof typeof allLocalBodies] || []);
    setWards([]);
    setBooths([]);
  };

  // Handle localbody change to update ward dropdown
  const handleLocalbodyChange = (localbody: string) => {
    form.setValue("localbody", localbody);
    form.setValue("ward", "");
    form.setValue("booth", "");
    setWards(allWards[localbody as keyof typeof allWards] || []);
    setBooths([]);
  };

  // Handle ward change to update booth dropdown
  const handleWardChange = (ward: string) => {
    form.setValue("ward", ward);
    form.setValue("booth", "");
    setBooths(allBooths[ward as keyof typeof allBooths] || []);
  };

  function onSubmit(values: z.infer<typeof formSchema>) {
    // In a real application, this would send data to a backend API
    console.log(values);
    toast({
      title: "Candidate Updated",
      description: `${values.name}'s information has been updated successfully.`,
    });
    navigate('/superadmin/candidates');
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Edit Candidate</h1>
          <p className="text-gray-500">Update candidate information</p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center space-x-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src="/placeholder.svg" alt={candidateData.name} />
                <AvatarFallback>{candidateData.name.substring(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div>
                <CardTitle>{candidateData.name}</CardTitle>
                <CardDescription>{candidateData.party} | {candidateData.election}</CardDescription>
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
                    name="aadhar"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Aadhar Number*</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter Aadhar number" {...field} />
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
                    name="loksabha"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Lok Sabha Constituency*</FormLabel>
                        <Select 
                          onValueChange={(value) => handleLoksabhaChange(value)} 
                          defaultValue={field.value}
                          disabled={loksabhas.length === 0}
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
                    name="vidhansabha"
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

                  <FormField
                    control={form.control}
                    name="election"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Election*</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select election" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {elections.map((election) => (
                              <SelectItem key={election} value={election}>{election}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="party"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Political Party*</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select party" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {parties.map((party) => (
                              <SelectItem key={party} value={party}>{party}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="religion"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Religion*</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter religion" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="cast"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cast*</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter cast" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="cast_no"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cast Certificate Number*</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter cast certificate number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="education"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Education*</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter education qualification" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="non_crime_no"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Non-Criminal Certificate Number*</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter certificate number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="nationality"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nationality*</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter nationality" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="nationality_no"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nationality Certificate Number*</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter certificate number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Registration Amount</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter amount" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="method"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Payment Method</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select payment method" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Online">Online</SelectItem>
                            <SelectItem value="Cash">Cash</SelectItem>
                            <SelectItem value="Cheque">Cheque</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                {/* File upload fields */}
                <div className="pt-4">
                  <h3 className="font-semibold mb-2">Update Documents</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <FormLabel>Candidate Photo</FormLabel>
                      <Input type="file" />
                    </div>
                    <div>
                      <FormLabel>Signature</FormLabel>
                      <Input type="file" />
                    </div>
                    <div>
                      <FormLabel>Income Certificate</FormLabel>
                      <Input type="file" />
                    </div>
                    <div>
                      <FormLabel>Nationality Certificate</FormLabel>
                      <Input type="file" />
                    </div>
                    <div>
                      <FormLabel>Education Certificate</FormLabel>
                      <Input type="file" />
                    </div>
                    <div>
                      <FormLabel>Cast Certificate</FormLabel>
                      <Input type="file" />
                    </div>
                    <div>
                      <FormLabel>Non-Criminal Certificate</FormLabel>
                      <Input type="file" />
                    </div>
                    <div>
                      <FormLabel>Party Logo</FormLabel>
                      <Input type="file" />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-4">
                  <Button type="button" variant="outline" onClick={() => navigate('/superadmin/candidates')}>
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

export default EditCandidate;
