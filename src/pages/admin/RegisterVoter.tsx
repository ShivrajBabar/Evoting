"use client";
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
  password: z.string().min(8, {
    message: "Password must be at least 8 characters.",
  }),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

const RegisterVoter = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      voter_id: "",
      dob: "",
      state: user?.state || "Maharashtra",
      district: user?.district || "Mumbai",
      loksabhaWard: "",
      vidhansabhaWard: "",
      localbody: "",
      ward: "",
      booth: "",
      password: "",
      confirmPassword: "",
    },
  });

  // States for dependent dropdowns
  type Option = { value: string; label: string };

  const [states, setStates] = useState<Option[]>([]);
  const [districts, setDistricts] = useState<Option[]>([]);
  const [vidhansabhas, setVidhansabhas] = useState<Option[]>([]);
  const [loksabhas, setLoksabhas] = useState<Option[]>([]);
  const [localbodies, setLocalbodies] = useState<Option[]>([]);
  const [wards, setWards] = useState<Option[]>([]);
  const [booths, setBooths] = useState<Option[]>([]);

  const adminStateId = user?.state_id?.toString();
  const adminDistrictId = user?.district_id?.toString();
  const adminVidhansabhaId = user?.vidhansabha_id?.toString();




useEffect(() => {
  const preloadDropdownValues = async () => {
    try {
      const statesRes = await fetch('http://localhost:3000/api/states');
      const allStates = await statesRes.json();
      setStates(allStates.map((s) => ({ value: s.id.toString(), label: s.name })));

      const districtsRes = await fetch(`http://localhost:3000/api/districts?state_id=${adminStateId}`);
      const allDistricts = await districtsRes.json();
      setDistricts(allDistricts.map((d) => ({ value: d.id.toString(), label: d.name })));

      const vidhansabhaRes = await fetch(`http://localhost:3000/api/constituencies?district_id=${adminDistrictId}&type=vidhansabha`);
      const allVidhanSabhas = await vidhansabhaRes.json();
      setVidhansabhas(allVidhanSabhas.map((v) => ({ value: v.id.toString(), label: v.name })));

      // Manually trigger dependent fetches
      await handleLoksabhaChange(adminStateId || '');
      await handleDistrictChange(adminDistrictId || '');
      await handleVidhansabhaChange(adminVidhansabhaId || '', adminDistrictId || '');

      // Set values in the form
      form.setValue("state", adminStateId || '');
      form.setValue("district", adminDistrictId || '');
      form.setValue("vidhansabhaWard", adminVidhansabhaId || '');
    } catch (err) {
      console.error("Error preloading dropdown values:", err);
    }
  };

  if (adminStateId && adminDistrictId && adminVidhansabhaId) {
    preloadDropdownValues();
  }
}, [adminStateId, adminDistrictId, adminVidhansabhaId, form]);


  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setPhotoFile(e.target.files[0]);
    }
  };

  const handleLoksabhaChange = async (stateId: string) => {
    try {
      const res = await fetch(`http://localhost:3000/api/constituencies?state_id=${stateId}&type=loksabha`);
      const data = await res.json();
      const options = data.map((c) => ({
        value: c.id.toString(),
        label: c.name,
      }));
      setLoksabhas(options);
      form.setValue("loksabhaWard", "");
    } catch (error) {
      console.error("Error fetching loksabhas:", error);
    }
  };

  const handleLocalbodyChange = async (localBodyId: string) => {
    try {
      const res = await fetch(`http://localhost:3000/api/wards?local_body_id=${localBodyId}`);
      const data = await res.json();
      const options = data.map((ward) => ({
        value: ward.id.toString(),
        label: ward.name
      }));
      setWards(options);
      form.setValue("localbody", localBodyId);
      form.setValue("ward", "");
      setBooths([]);
    } catch (error) {
      console.error("Error fetching wards:", error);
    }
  };

  const handleWardChange = async (wardId: string) => {
    try {
      const res = await fetch(`http://localhost:3000/api/booths?ward_id=${wardId}`);
      const data = await res.json();
      const options = data.map((booth) => ({
        value: booth.id.toString(),
        label: booth.name
      }));
      setBooths(options);
      form.setValue("ward", wardId);
      form.setValue("booth", "");
    } catch (error) {
      console.error("Error fetching booths:", error);
    }
  };

  useEffect(() => {
    fetchStates();
  }, []);

  const fetchStates = async () => {
    try {
      const res = await fetch('http://localhost:3000/api/states');
      const data = await res.json();
      setStates(data.map((state) => ({
        value: state.id.toString(),
        label: state.name
      })));
    } catch (error) {
      console.error("Error fetching states:", error);
    }
  };

  const handleStateChange = async (stateId: string) => {
    try {
      const res = await fetch(`http://localhost:3000/api/districts?state_id=${stateId}`);
      const data = await res.json();
      setDistricts(data.map((district) => ({
        value: district.id.toString(),
        label: district.name
      })));
      setVidhansabhas([]);
      form.setValue("district", "");
      form.setValue("vidhansabhaWard", "");
      await handleLoksabhaChange(stateId);
    } catch (error) {
      console.error("Error fetching districts:", error);
    }
  };

  const handleVidhansabhaChange = async (vidhansabhaId: string, districtId: string) => {
    try {
      const res = await fetch(`http://localhost:3000/api/local-bodies?district_id=${districtId}`);
      const data = await res.json();
      setLocalbodies(data.map((lb) => ({
        value: lb.id.toString(),
        label: lb.name
      })));
      form.setValue("vidhansabhaWard", vidhansabhaId);
      form.setValue("localbody", "");
      setWards([]);
      setBooths([]);
    } catch (error) {
      console.error("Error fetching local bodies:", error);
    }
  };

  const handleDistrictChange = async (districtId: string) => {
    try {
      const res = await fetch(`http://localhost:3000/api/constituencies?district_id=${districtId}&type=vidhansabha`);
      const data = await res.json();
      setVidhansabhas(data.map((c) => ({
        value: c.id.toString(),
        label: c.name
      })));
      form.setValue("vidhansabhaWard", "");
    } catch (error) {
      console.error("Error fetching vidhansabhas:", error);
    }
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    try {
      const formData = new FormData();

      // Append all form values
      Object.entries(values).forEach(([key, value]) => {
        if (value) formData.append(key, value);
      });

      // Append photo file if exists
      if (photoFile) {
        formData.append('photo', photoFile);
      }

      const response = await fetch('http://localhost:3000/api/voters', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const contentType = response.headers.get("content-type");

        if (contentType && contentType.includes("application/json")) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to register voter');
        } else {
          const errorText = await response.text();
          throw new Error("Non-JSON error: " + errorText);
        }
      }


      toast({
        title: "Voter Registered",
        description: `${values.name} has been registered successfully as a voter.`,
        variant: "default",
      });

      form.reset();
      setPhotoFile(null);
    } catch (error) {
      console.error("Registration error:", error);
      toast({
        title: "Registration Failed",
        description: error instanceof Error ? error.message : 'An unexpected error occurred',
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Register Voter</h1>
          <p className="text-gray-500">Add a new voter to {user?.constituency || 'your constituency'}</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Voter Information</CardTitle>
            <CardDescription>Enter the voter's personal and voting details</CardDescription>
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
                        <Select value={field.value} disabled>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select State" />
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
                        <Select value={field.value} disabled>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select District" />
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
                    name="loksabhaWard"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Lok Sabha Constituency*</FormLabel>
                        <Select
                          onValueChange={(value) => form.setValue("loksabhaWard", value)}
                          value={form.watch("loksabhaWard")}
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
                    name="vidhansabhaWard"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Vidhan Sabha*</FormLabel>
                        <Select value={field.value} disabled>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select Vidhan Sabha" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {vidhansabhas.map((vs) => (
                              <SelectItem key={vs.value} value={vs.value}>
                                {vs.label}
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
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password*</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter password" type="password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirm Password*</FormLabel>
                        <FormControl>
                          <Input placeholder="Confirm password" type="password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div>
                  <FormLabel>Voter Photo</FormLabel>
                  <Input
                    type="file"
                    className="mt-1"
                    onChange={handlePhotoChange}
                    accept="image/*"
                  />
                </div>

                <div className="flex justify-end">
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Registering..." : "Register Voter"}
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

export default RegisterVoter;