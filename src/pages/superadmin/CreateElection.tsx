
import React, { useState } from 'react';
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
import { 
  states, 
  allDistricts, 
  allLoksabhas, 
  allVidhansabhas, 
  allLocalBodies, 
  getOptionsForDropdown 
} from '@/utils/locationData';

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
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
  
  // State for dependent dropdowns
  const [selectedState, setSelectedState] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [selectedLoksabha, setSelectedLoksabha] = useState("");
  const [selectedVidhansabha, setSelectedVidhansabha] = useState("");
  const [selectedLocalBody, setSelectedLocalBody] = useState("");

  // Options for dropdowns based on selections
  const districtOptions = selectedState ? getOptionsForDropdown(allDistricts, selectedState) : [];
  const loksabhaOptions = selectedDistrict ? getOptionsForDropdown(allLoksabhas, selectedDistrict) : [];
  const vidhansabhaOptions = selectedLoksabha ? getOptionsForDropdown(allVidhansabhas, selectedLoksabha) : [];
  const localBodyOptions = selectedVidhansabha ? getOptionsForDropdown(allLocalBodies, selectedVidhansabha) : [];

  // Mock data for dropdowns
  const electionTypes = ["Lok Sabha", "Vidhan Sabha", "Local Body", "Panchayat"];
  const electionStatuses = ["Preparation", "Scheduled", "Active", "Completed"];

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      type: "",
      status: "Preparation",
      date: "",
      applicationStartDate: "",
      applicationEndDate: "",
      resultDate: "",
      description: "",
      state: "",
      district: "",
      loksabha: "",
      vidhansabha: "",
      localBody: "",
      ward: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    // In a real application, this would send data to a backend API
    console.log(values);
    toast({
      title: "Election Created",
      description: `${values.name} has been created successfully.`,
    });
    form.reset();
  }

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
                              }} 
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
                            <FormLabel>District</FormLabel>
                            <Select 
                              onValueChange={(value) => {
                                field.onChange(value);
                                setSelectedDistrict(value);
                                setSelectedLoksabha("");
                                setSelectedVidhansabha("");
                                setSelectedLocalBody("");
                                form.setValue("loksabha", "");
                                form.setValue("vidhansabha", "");
                                form.setValue("localBody", "");
                                form.setValue("ward", "");
                              }}
                              defaultValue={field.value}
                              disabled={!selectedState}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select district" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {districtOptions.map((district) => (
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
                            <FormLabel>Lok Sabha Constituency</FormLabel>
                            <Select 
                              onValueChange={(value) => {
                                field.onChange(value);
                                setSelectedLoksabha(value);
                                setSelectedVidhansabha("");
                                setSelectedLocalBody("");
                                form.setValue("vidhansabha", "");
                                form.setValue("localBody", "");
                                form.setValue("ward", "");
                              }}
                              defaultValue={field.value}
                              disabled={!selectedDistrict}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select Lok Sabha constituency" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {loksabhaOptions.map((loksabha) => (
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
                            <FormLabel>Vidhan Sabha Constituency</FormLabel>
                            <Select 
                              onValueChange={(value) => {
                                field.onChange(value);
                                setSelectedVidhansabha(value);
                                setSelectedLocalBody("");
                                form.setValue("localBody", "");
                                form.setValue("ward", "");
                              }}
                              defaultValue={field.value}
                              disabled={!selectedLoksabha}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select Vidhan Sabha constituency" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {vidhansabhaOptions.map((vidhansabha) => (
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
                        name="localBody"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Local Body/Panchayat</FormLabel>
                            <Select 
                              onValueChange={(value) => {
                                field.onChange(value);
                                setSelectedLocalBody(value);
                              }}
                              defaultValue={field.value}
                              disabled={!selectedVidhansabha}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select local body" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {localBodyOptions.map((localBody) => (
                                  <SelectItem key={localBody} value={localBody}>{localBody}</SelectItem>
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
                  <Button type="submit">Create Election</Button>
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
