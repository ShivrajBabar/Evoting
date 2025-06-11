
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

const EditElection = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  // State for dependent dropdowns
  const [selectedState, setSelectedState] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [selectedLoksabha, setSelectedLoksabha] = useState("");
  const [selectedVidhansabha, setSelectedVidhansabha] = useState("");
  const [selectedLocalBody, setSelectedLocalBody] = useState("");

  const [states, setStates] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [loksabhas, setLoksabhas] = useState([]);
  const [vidhansabhas, setVidhansabhas] = useState([]);
  const [localbodies, setLocalbodies] = useState([]);
  const [wards, setWards] = useState([]);
  const [booths, setBooths] = useState([]);


  // Options for dropdowns based on selections
  const districtOptions = selectedState ? getOptionsForDropdown(allDistricts, selectedState) : [];
  const loksabhaOptions = selectedDistrict ? getOptionsForDropdown(allLoksabhas, selectedDistrict) : [];
  const vidhansabhaOptions = selectedLoksabha ? getOptionsForDropdown(allVidhansabhas, selectedLoksabha) : [];
  const localBodyOptions = selectedVidhansabha ? getOptionsForDropdown(allLocalBodies, selectedVidhansabha) : [];

  // Mock data for dropdowns
  const electionTypes = ["Lok Sabha", "Vidhan Sabha", "Local Body", "Panchayat"];
  const electionStatuses = ["Preparation", "Scheduled", "Active", "Completed"];

  useEffect(() => {
    const fetchElection = async () => {
      try {
        const res = await fetch(`/api/elections/${id}`);
        const data = await res.json();

        const mapped = {
          name: data.name,
          type: data.type,
          status: data.status,
          date: data.date?.split("T")[0] || "",
          applicationStartDate: data.applicationStartDate?.split("T")[0] || "",
          applicationEndDate: data.applicationEndDate?.split("T")[0] || "",
          resultDate: data.resultDate?.split("T")[0] || "",
          description: data.description || "",
          state: data.state?.toString() || "",
          district: data.district?.toString() || "",
          loksabha: data.loksabha?.toString() || "",
          vidhansabha: data.vidhansabha?.toString() || "",
          localBody: data.localBody?.toString() || "",
          ward: data.ward?.toString() || "",
        };

        setSelectedState(mapped.state);
        setSelectedDistrict(mapped.district);
        setSelectedLoksabha(mapped.loksabha);
        setSelectedVidhansabha(mapped.vidhansabha);
        setSelectedLocalBody(mapped.localBody);

        await fetchDependentData({
          state_id: mapped.state,
          district_id: mapped.district,
          local_body_id: mapped.localBody,
          ward_id: mapped.ward,
        });

        form.reset(mapped);
      } catch (err) {
        console.error("Failed to fetch election:", err);
      }
    };

    if (id) fetchElection();
  }, [id]);




  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      type: "",
      status: "",
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
      ward: ""
    },
  });

  const fetchDependentData = async (data: any) => {
    try {
      if (states.length === 0) {
        const res = await fetch('/api/states');
        const json = await res.json();
        setStates(json.map((s: any) => ({ value: s.id.toString(), label: s.name })));
      }

      if (data.state_id) {
        const res = await fetch(`/api/districts?state_id=${data.state_id}`);
        const json = await res.json();
        setDistricts(json.map((d: any) => ({ value: d.id.toString(), label: d.name })));
      }

      if (data.state_id) {
        const res = await fetch(`/api/constituencies?state_id=${data.state_id}&type=loksabha`);
        const json = await res.json();
        setLoksabhas(json.map((c: any) => ({ value: c.id.toString(), label: c.name })));
      }

      if (data.district_id) {
        const res = await fetch(`/api/constituencies?district_id=${data.district_id}&type=vidhansabha`);
        const json = await res.json();
        setVidhansabhas(json.map((c: any) => ({ value: c.id.toString(), label: c.name })));
      }

      if (data.district_id) {
        const res = await fetch(`/api/local-bodies?district_id=${data.district_id}`);
        const json = await res.json();
        setLocalbodies(json.map((lb: any) => ({ value: lb.id.toString(), label: lb.name })));
      }

      if (data.local_body_id) {
        const res = await fetch(`/api/wards?local_body_id=${data.local_body_id}`);
        const json = await res.json();
        setWards(json.map((w: any) => ({ value: w.id.toString(), label: w.name })));
      }

      if (data.ward_id) {
        const res = await fetch(`/api/booths?ward_id=${data.ward_id}`);
        const json = await res.json();
        setBooths(json.map((b: any) => ({ value: b.id.toString(), label: b.name })));
      }
    } catch (error) {
      console.error("Error fetching dependent data:", error);
    }
  };



  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const response = await fetch(`/api/elections/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...values,
          result: "No" // optional override, as in your backend
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update election");
      }

      toast({
        title: "Election Updated",
        description: `${values.name} has been updated successfully.`,
      });

      navigate("/superadmin/elections");
    } catch (error) {
      console.error("Error updating election:", error);
      toast({
        variant: "destructive",
        title: "Update failed",
        description: error.message || "Something went wrong.",
      });
    }
  }


  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Edit Election</h1>
          <p className="text-gray-500">Update election details</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Election Information</CardTitle>
            <CardDescription>Modify the details for this election</CardDescription>
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
                        <Select value={field.value} onValueChange={field.onChange}>
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
                        <Select value={field.value} onValueChange={field.onChange}>                          <FormControl>
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
                                setSelectedLoksabha("");
                                setSelectedVidhansabha("");
                                setSelectedLocalBody("");
                                form.setValue("loksabha", "");
                                form.setValue("vidhansabha", "");
                                form.setValue("localBody", "");
                                form.setValue("ward", "");
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
                              }}
                              disabled={!selectedDistrict}
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
                              }}
                              disabled={!selectedLoksabha}
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
                            <FormLabel>Local Body/Panchayat</FormLabel>
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
                                {localbodies.map((localBody) => (
                                  <SelectItem key={localBody.value} value={localBody.value}>
                                    {localBody.label}
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

                <div className="flex justify-end space-x-4">
                  <Button type="button" variant="outline" onClick={() => navigate('/superadmin/elections')}>
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

export default EditElection;
