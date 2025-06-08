import React, { useState, useEffect } from 'react';
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Layout from '@/components/Layout';
import { useToast } from "@/components/ui/use-toast";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  type: z.string(),
  status: z.string(),
  date: z.string(),
  applicationStartDate: z.string(),
  applicationEndDate: z.string(),
  resultDate: z.string().optional(),
  description: z.string().optional(),
  state: z.string().optional(),
  district: z.string().optional(),
  loksabha: z.string().optional(),
  vidhansabha: z.string().optional(),
  localBody: z.string().optional(),
  ward: z.string().optional(),
});

const CreateElection = () => {
  const { toast } = useToast();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });
  const [states, setStates] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [loksabhas, setLoksabhas] = useState([]);
  const [vidhansabhas, setVidhansabhas] = useState([]);
  const [localBodies, setLocalBodies] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [selectedState, setSelectedState] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedLoksabha, setSelectedLoksabha] = useState('');
  const [selectedVidhansabha, setSelectedVidhansabha] = useState('');
  const [selectedLocalBody, setSelectedLocalBody] = useState("");

  useEffect(() => {
    fetchStates();
  }, []);

  const fetchStates = async () => {
    try {
      const res = await fetch('http://localhost:3000/api/states');
      const data = await res.json();
      setStates(data.map((s) => ({ value: s.id.toString(), label: s.name })));
    } catch (err) {
      toast({ title: 'Error', description: 'Failed to fetch states', variant: 'destructive' });
    }
  };

  const handleStateChange = async (stateId: string) => {
    try {
      const districtsRes = await fetch(`http://localhost:3000/api/districts?state_id=${stateId}`);
      const districtsData = await districtsRes.json();
      setDistricts(districtsData.map((d) => ({ value: d.id.toString(), label: d.name })));

      const loksabhaRes = await fetch(`http://localhost:3000/api/constituencies?state_id=${stateId}&type=loksabha`);
      const loksabhaData = await loksabhaRes.json();
      setLoksabhas(loksabhaData.map((c) => ({ value: c.id.toString(), label: c.name })));

      setLocalBodies([]);
      form.resetField("district");
      form.resetField("loksabha");
      form.resetField("vidhansabha");
      form.resetField("localBody");
      form.resetField("ward");

      setSelectedState(stateId);
    } catch (err) {
      toast({ title: 'Error', description: 'Failed to fetch data on state change', variant: 'destructive' });
    }
  };

  const handleDistrictChange = async (districtId: string) => {
    try {
      const vidhansabhaRes = await fetch(`http://localhost:3000/api/constituencies?district_id=${districtId}&type=vidhansabha`);
      const vidhansabhaData = await vidhansabhaRes.json();
      setVidhansabhas(vidhansabhaData.map((c) => ({ value: c.id.toString(), label: c.name })));

      setLocalBodies([]);
      form.resetField("vidhansabha");
      form.resetField("localBody");
      form.resetField("ward");

      setSelectedDistrict(districtId);
    } catch (err) {
      toast({ title: 'Error', description: 'Failed to fetch Vidhan Sabha constituencies', variant: 'destructive' });
    }
  };

  const handleLoksabhaChange = (loksabhaId: string) => {
    setSelectedLoksabha(loksabhaId);
  };

  const handleVidhansabhaChange = async (vidhansabhaId: string) => {
    try {
      const districtId = form.getValues("district");
      setSelectedVidhansabha(vidhansabhaId);

      const res = await fetch(`http://localhost:3000/api/local-bodies?district_id=${districtId}`);
      const data = await res.json();
      setLocalBodies(data.map((b) => ({ value: b.id.toString(), label: b.name })));

      form.resetField("localBody");
      form.resetField("ward");
    } catch (err) {
      toast({ title: 'Error', description: 'Failed to fetch local bodies', variant: 'destructive' });
    }
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    try {
      const response = await fetch('http://localhost:3000/api/elections', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: values.name,
          type: values.type,
          status: values.status,
          date: values.date,
          applicationStartDate: values.applicationStartDate,
          applicationEndDate: values.applicationEndDate,
          resultDate: values.resultDate || null,
          state: values.state || null,
          district: values.district || null,
          loksabha: values.loksabha || null,
          vidhansabha: values.vidhansabha || null,
          localBody: values.localBody || null,
          description: values.description || null
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // If the server returns an error message, use it
        const errorMessage = data.error || 'Failed to create election';
        throw new Error(errorMessage);
      }

      toast({
        title: "Election Created",
        description: `${values.name} has been created successfully.`,
        variant: "default"
      });
      form.reset();
    } catch (error) {
      console.error('Error creating election:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create election",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  const electionTypes = ["Lok Sabha", "Vidhan Sabha", "Local Body", "Panchayat"];
  const electionStatuses = ["Preparation", "Scheduled", "Active", "Completed"];

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Create Election</h1>
          <p className="text-gray-500">Set up a new election</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Election Information</CardTitle>
            <CardDescription>Enter the details for the new election</CardDescription>
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
                        <FormLabel>Election Name*</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter election name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Election Type*</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select election type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {electionTypes.map((type) => (
                              <SelectItem key={type} value={type}>{type}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Election Date*</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status*</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {electionStatuses.map((status) => (
                              <SelectItem key={status} value={status}>{status}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="applicationStartDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Application Start Date*</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="applicationEndDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Application End Date*</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="resultDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Result Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Election Location</CardTitle>
                    <CardDescription>Specify the area for this election</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="state"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>State</FormLabel>
                            <Select
                              value={field.value}
                              onValueChange={(value) => {
                                field.onChange(value);
                                setSelectedState(value);
                                setSelectedDistrict("");
                                setSelectedLoksabha("");
                                setSelectedVidhansabha("");
                                setSelectedLocalBody("");
                                form.setValue("district", "");
                                form.setValue("loksabha", "");
                                form.setValue("vidhansabha", "");
                                form.setValue("localBody", "");
                                form.setValue("ward", "");
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
                            <FormLabel>District</FormLabel>
                            <Select
                              value={field.value}
                              onValueChange={(value) => {
                                field.onChange(value);
                                setSelectedDistrict(value);
                                setSelectedVidhansabha("");
                                setSelectedLocalBody("");
                                form.setValue("vidhansabha", "");
                                form.setValue("localBody", "");
                                form.setValue("ward", "");
                                handleDistrictChange(value);
                              }}
                              disabled={!selectedState}
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
                            <FormLabel>Lok Sabha Constituency</FormLabel>
                            <Select
                              value={field.value}
                              onValueChange={(value) => {
                                field.onChange(value);
                                setSelectedLoksabha(value);
                                setSelectedVidhansabha("");
                                setSelectedLocalBody("");
                                form.setValue("vidhansabha", "");
                                form.setValue("localBody", "");
                                form.setValue("ward", "");
                                handleLoksabhaChange(value);
                              }}
                              disabled={!selectedState}
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
                            <FormLabel>Vidhan Sabha Constituency</FormLabel>
                            <Select
                              value={field.value}
                              onValueChange={(value) => {
                                field.onChange(value);
                                setSelectedVidhansabha(value);
                                setSelectedLocalBody("");
                                form.setValue("localBody", "");
                                form.setValue("ward", "");
                                handleVidhansabhaChange(value);
                              }}
                              disabled={!selectedDistrict && !selectedLoksabha}
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
                        name="localBody"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Local Body / Panchayat</FormLabel>
                            <Select
                              value={field.value}
                              onValueChange={(value) => {
                                field.onChange(value);
                                setSelectedLocalBody(value);
                              }}
                              disabled={!selectedVidhansabha}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select local body" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {localBodies.map((body) => (
                                  <SelectItem key={body.value} value={body.value}>
                                    {body.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Enter details about the election"
                          className="resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end">
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Creating..." : "Create Election"}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default CreateElection;