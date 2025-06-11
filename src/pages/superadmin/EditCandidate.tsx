
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


interface Candidate {
  name: string;
  email: string;
  phone: string;
  aadhar: string;
  dob: string;
  state_id?: number;
  district_id?: number;
  loksabha_id?: number;
  vidhansabha_id?: number;
  local_body_id?: number;
  ward_id?: number;
  booth_id?: number;
  election_id?: number;
  income?: string;
  income_no?: string;
  nationality: string;
  nationality_no: string;
  education: string;
  religion: string;
  cast: string;
  cast_no: string;
  non_crime_no: string;
  party: string;
  amount?: string;
  method?: string;
  election?: string;

  photo?: string;
  signature?: string;
  income_photo?: string;
  nationality_photo?: string;
  education_photo?: string;
  cast_photo?: string;
  non_crime_photo?: string;
  party_logo?: string;
}

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
  const [isLoading, setIsLoading] = useState(true);
  const [candidateData, setCandidateData] = useState<Candidate | null>(null);
  type Option = { value: string; label: string };

  // States for dependent dropdowns
  const [states, setStates] = useState<Option[]>([]);
  const [districts, setDistricts] = useState<Option[]>([]);
  const [loksabhas, setLoksabhas] = useState<Option[]>([]);
  const [vidhansabhas, setVidhansabhas] = useState<Option[]>([]);
  const [localbodies, setLocalbodies] = useState<Option[]>([]);
  const [wards, setWards] = useState<Option[]>([]);
  const [booths, setBooths] = useState<Option[]>([]);
  const [electionsList, setElectionsList] = useState<Option[]>([]);

  const [fileInputs, setFileInputs] = useState<{
    photo: File | null;
    signature: File | null;
    income_photo: File | null;
    nationality_photo: File | null;
    education_photo: File | null;
    cast_photo: File | null;
    non_crime_photo: File | null;
    party_logo: File | null;
  }>({
    photo: null,
    signature: null,
    income_photo: null,
    nationality_photo: null,
    education_photo: null,
    cast_photo: null,
    non_crime_photo: null,
    party_logo: null,
  });


  // Initialize form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      aadhar: "",
      dob: "",
      state: "",
      district: "",
      loksabha: "",
      vidhansabha: "",
      localbody: "",
      ward: "",
      booth: "",
      election: "",
      income: "",
      income_no: "",
      nationality: "Indian",
      nationality_no: "",
      education: "",
      religion: "",
      cast: "",
      cast_no: "",
      non_crime_no: "",
      party: "",
      amount: "",
      method: "Online",
    },
  });

  // Fetch candidate data and initialize form
  useEffect(() => {
    const fetchCandidate = async () => {
      try {
        const response = await fetch(`/api/candidates/${id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch candidate data');
        }
        const data = await response.json();
        setCandidateData(data);

        // Initialize form with fetched data
        form.reset({
          name: data.name,
          email: data.email,
          phone: data.phone,
          aadhar: data.aadhar,
          dob: data.dob?.split("T")[0] || "",
          state: data.state_id?.toString(),
          district: data.district_id?.toString(),
          loksabha: data.loksabha_id?.toString(),
          vidhansabha: data.vidhansabha_id?.toString(),
          localbody: data.local_body_id?.toString(),
          ward: data.ward_id?.toString(),
          booth: data.booth_id?.toString(),
          election: data.election_id?.toString(),
          income: data.income,
          income_no: data.income_no,
          nationality: data.nationality,
          nationality_no: data.nationality_no,
          education: data.education,
          religion: data.religion,
          cast: data.cast,
          cast_no: data.cast_no,
          non_crime_no: data.non_crime_no,
          party: data.party,
          amount: data.amount?.toString() || "",
          method: data.method,
        });

        // Fetch dependent dropdown data
        await fetchDependentData(data);

      } catch (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
      const fetchStates = async () => {
        const res = await fetch('http://localhost:3000/api/states');
        const data = await res.json();
        setStates(data.map((s: any) => ({ value: s.id.toString(), label: s.name })));
      };
      fetchStates();
      await fetchElections();
    };

    const fetchElections = async () => {
      try {
        const res = await fetch('http://localhost:3000/api/elections');
        const data = await res.json();
        setElectionsList(data.map((e: any) => ({
          value: e.id.toString(),
          label: e.name,
        })));
      } catch (error) {
        console.error('Error fetching elections:', error);
      }
    };

    const fetchDependentData = async (data) => {
      try {
        // Fetch states if not already loaded
        if (states.length === 0) {
          const statesRes = await fetch('/api/states');
          const statesData = await statesRes.json();
          setStates(statesData.map(s => ({ value: s.id.toString(), label: s.name })));
        }

        // Fetch districts if state is set
        if (data.state_id) {
          const districtsRes = await fetch(`/api/districts?state_id=${data.state_id}`);
          const districtsData = await districtsRes.json();
          setDistricts(districtsData.map(d => ({ value: d.id.toString(), label: d.name })));
        }

        // Lok Sabha
        if (data.state_id) {
          const loksabhaRes = await fetch(`/api/constituencies?state_id=${data.state_id}&type=loksabha`);
          const loksabhaData = await loksabhaRes.json();
          setLoksabhas(loksabhaData.map((c: any) => ({ value: c.id.toString(), label: c.name })));
        }

        // Vidhan Sabha
        if (data.district_id) {
          const vidhansabhaRes = await fetch(`/api/constituencies?district_id=${data.district_id}&type=vidhansabha`);
          const vidhansabhaData = await vidhansabhaRes.json();
          setVidhansabhas(vidhansabhaData.map((c: any) => ({ value: c.id.toString(), label: c.name })));
        }

        // Local Bodies
        if (data.district_id) {
          const localbodyRes = await fetch(`/api/local-bodies?district_id=${data.district_id}`);
          const localbodyData = await localbodyRes.json();
          setLocalbodies(localbodyData.map((lb: any) => ({ value: lb.id.toString(), label: lb.name })));
        }

        // Wards
        if (data.local_body_id) {
          const wardRes = await fetch(`/api/wards?local_body_id=${data.local_body_id}`);
          const wardData = await wardRes.json();
          setWards(wardData.map((w: any) => ({ value: w.id.toString(), label: w.name })));
        }

        // Booths
        if (data.ward_id) {
          const boothRes = await fetch(`/api/booths?ward_id=${data.ward_id}`);
          const boothData = await boothRes.json();
          setBooths(boothData.map((b: any) => ({ value: b.id.toString(), label: b.name })));
        }


      } catch (error) {
        console.error('Error fetching dependent data:', error);
      }
    };

    fetchCandidate();
  }, [id]);

  const handleStateChange = async (stateId: string) => {
    form.setValue("state", stateId);
    form.setValue("district", "");
    form.setValue("loksabha", "");
    form.setValue("vidhansabha", "");
    form.setValue("localbody", "");
    form.setValue("ward", "");
    form.setValue("booth", "");

    const res = await fetch(`http://localhost:3000/api/districts?state_id=${stateId}`);
    const data = await res.json();
    setDistricts(data.map((d: any) => ({ value: d.id.toString(), label: d.name })));

    // Get Lok Sabha
    const loksabhaRes = await fetch(`http://localhost:3000/api/constituencies?state_id=${stateId}&type=loksabha`);
    const loksabhaData = await loksabhaRes.json();
    setLoksabhas(loksabhaData.map((c: any) => ({ value: c.id.toString(), label: c.name })));
  };

  const handleDistrictChange = async (districtId: string) => {
    form.setValue("district", districtId);
    form.setValue("vidhansabha", "");
    form.setValue("localbody", "");
    form.setValue("ward", "");
    form.setValue("booth", "");

    const res = await fetch(`http://localhost:3000/api/constituencies?district_id=${districtId}&type=vidhansabha`);
    const data = await res.json();
    setVidhansabhas(data.map((c: any) => ({ value: c.id.toString(), label: c.name })));
  };


  const handleLoksabhaChange = (loksabhaId: string) => {
    form.setValue("loksabha", loksabhaId);
    form.setValue("vidhansabha", "");
    form.setValue("localbody", "");
    form.setValue("ward", "");
    form.setValue("booth", "");
    // You can optionally call APIs here if needed
  };


  // Handle vidhansabha change to update localbody dropdown
  const handleVidhansabhaChange = async (vidhansabhaId: string) => {
    const districtId = form.getValues("district");
    form.setValue("vidhansabha", vidhansabhaId);
    form.setValue("localbody", "");
    form.setValue("ward", "");
    form.setValue("booth", "");

    const res = await fetch(`http://localhost:3000/api/local-bodies?district_id=${districtId}`);
    const data = await res.json();
    setLocalbodies(data.map((lb: any) => ({ value: lb.id.toString(), label: lb.name })));
  };


  // Handle localbody change to update ward dropdown
  const handleLocalbodyChange = async (localBodyId: string) => {
    form.setValue("localbody", localBodyId);
    form.setValue("ward", "");
    form.setValue("booth", "");

    const res = await fetch(`http://localhost:3000/api/wards?local_body_id=${localBodyId}`);
    const data = await res.json();
    setWards(data.map((w: any) => ({ value: w.id.toString(), label: w.name })));
  };


  // Handle ward change to update booth dropdown
  const handleWardChange = async (wardId: string) => {
    form.setValue("ward", wardId);
    form.setValue("booth", "");

    const res = await fetch(`http://localhost:3000/api/booths?ward_id=${wardId}`);
    const data = await res.json();
    setBooths(data.map((b: any) => ({ value: b.id.toString(), label: b.name })));
  };

  const parties = ["Democratic Party", "Progressive Alliance", "National Front", "People's Party"];


  if (isLoading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <div>Loading candidate data...</div>
        </div>
      </Layout>
    );
  }

  if (!candidateData) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <div>Candidate not found</div>
        </div>
      </Layout>
    );
  }


  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const formData = new FormData();

      // Append all form values
      Object.entries(values).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(key, value.toString());
        }
      });

      // Append all files that have been selected for upload
      Object.entries(fileInputs).forEach(([key, file]) => {
        if (file) {
          formData.append(key, file);
        }
      });

      const res = await fetch(`/api/candidates/${id}`, {
        method: "PUT",
        body: formData,
        // Don't set Content-Type header - let the browser set it with the correct boundary
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to update candidate");
      }

      toast({
        title: "Success",
        description: "Candidate updated successfully.",
      });

      navigate("/superadmin/candidates");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      console.error("Update error:", error);
    }
  };

  const handleFileChange = (field: keyof typeof fileInputs) => (e: React.ChangeEvent<HTMLInputElement>) => {
  setFileInputs(prev => ({
    ...prev,
    [field]: e.target.files?.[0] || null
  }));
};



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
                <AvatarImage src={candidateData?.photo || "/placeholder.svg"} alt={candidateData?.name || ''} />
                <AvatarFallback>{(candidateData?.name || '').substring(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div>
                <CardTitle>{candidateData?.name}</CardTitle>
                <CardDescription>{candidateData?.party} | {candidateData?.election}</CardDescription>
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
                          value={field.value}
                          onValueChange={(value) => {
                            field.onChange(value);
                            handleStateChange(value);
                          }}
                        >

                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select state" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {states.map((state) => (
                              <SelectItem key={state.value} value={state.value}>
                                {state.label}
                              </SelectItem>
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
                          value={field.value}
                          onValueChange={(value) => {
                            field.onChange(value);
                            handleDistrictChange(value);
                          }}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select district" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {districts.map((district) => (
                              <SelectItem key={district.value} value={district.value}>
                                {district.label}
                              </SelectItem>
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
                          value={field.value}
                          onValueChange={(value) => {
                            field.onChange(value);          // ✅ update form state
                            handleLoksabhaChange(value);    // ✅ your custom logic
                          }}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select Lok Sabha constituency" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {loksabhas.map((loksabha) => (
                              <SelectItem key={loksabha.value} value={loksabha.value}>
                                {loksabha.label}
                              </SelectItem>
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
                          value={field.value}
                          onValueChange={(value) => {
                            field.onChange(value);
                            handleVidhansabhaChange(value);
                          }}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select Vidhan Sabha constituency" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {vidhansabhas.map((vidhansabha) => (
                              <SelectItem key={vidhansabha.value} value={vidhansabha.value}>
                                {vidhansabha.label}
                              </SelectItem>
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
                          value={field.value}
                          onValueChange={(value) => {
                            field.onChange(value);
                            handleLocalbodyChange(value);
                          }}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select local body" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {localbodies.map((localbody) => (
                              <SelectItem key={localbody.value} value={localbody.value}>
                                {localbody.label}
                              </SelectItem>
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
                          value={field.value}
                          onValueChange={(value) => {
                            field.onChange(value);
                            handleWardChange(value);
                          }}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select ward" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {wards.map((ward) => (
                              <SelectItem key={ward.value} value={ward.value}>
                                {ward.label}
                              </SelectItem>
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
                          value={field.value}
                          onValueChange={field.onChange}
                        >

                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select booth" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {booths.map((booth) => (
                              <SelectItem key={booth.value} value={booth.value}>
                                {booth.label}
                              </SelectItem>
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
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select election" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {electionsList.map((e) => (
                              <SelectItem key={e.value} value={e.value}>
                                {e.label}
                              </SelectItem>
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
                      {candidateData?.photo && (
                        <img src={candidateData.photo} alt="Candidate Photo" className="w-24 h-24 object-cover mb-2 rounded" />
                      )}
                      <Input type="file" onChange={handleFileChange('photo')} />
                    </div>

                    <div>
                      <FormLabel>Signature</FormLabel>
                      {candidateData?.signature && (
                        <img src={candidateData.signature} alt="Signature" className="w-24 h-24 object-cover mb-2 rounded" />
                      )}
                      <Input type="file" onChange={handleFileChange('photo')} />
                    </div>

                    <div>
                      <FormLabel>Income Certificate</FormLabel>
                      {candidateData?.income_photo && (
                        <img src={candidateData.income_photo} alt="Income Certificate" className="w-24 h-24 object-cover mb-2 rounded" />
                      )}
                      <Input type="file" onChange={handleFileChange('photo')} />
                    </div>

                    <div>
                      <FormLabel>Nationality Certificate</FormLabel>
                      {candidateData?.nationality_photo && (
                        <img src={candidateData.nationality_photo} alt="Nationality Certificate" className="w-24 h-24 object-cover mb-2 rounded" />
                      )}
                      <Input type="file" onChange={handleFileChange('photo')} />
                    </div>

                    <div>
                      <FormLabel>Education Certificate</FormLabel>
                      {candidateData?.education_photo && (
                        <img src={candidateData.education_photo} alt="Education Certificate" className="w-24 h-24 object-cover mb-2 rounded" />
                      )}
                      <Input type="file" onChange={handleFileChange('photo')}/>
                    </div>

                    <div>
                      <FormLabel>Cast Certificate</FormLabel>
                      {candidateData?.cast_photo && (
                        <img src={candidateData.cast_photo} alt="Cast Certificate" className="w-24 h-24 object-cover mb-2 rounded" />
                      )}
                      <Input type="file" onChange={handleFileChange('photo')} />
                    </div>

                    <div>
                      <FormLabel>Non-Criminal Certificate</FormLabel>
                      {candidateData?.non_crime_photo && (
                        <img src={candidateData.non_crime_photo} alt="Non-Criminal Certificate" className="w-24 h-24 object-cover mb-2 rounded" />
                      )}
                      <Input type="file" onChange={handleFileChange('photo')} />
                    </div>

                    <div>
                      <FormLabel>Party Logo</FormLabel>
                      {candidateData?.party_logo && (
                        <img src={candidateData.party_logo} alt="Party Logo" className="w-24 h-24 object-cover mb-2 rounded" />
                      )}
                      <Input type="file" onChange={handleFileChange('photo')} />
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
