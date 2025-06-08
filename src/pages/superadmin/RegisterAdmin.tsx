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
  dob: z.string().refine(val => val, {
    message: "Date of birth is required",
  }),
  state: z.string().min(1, {
    message: "State is required",
  }),
  district: z.string().min(1, {
    message: "District is required",
  }),
  vidhansabha: z.string().min(1, {
    message: "Vidhan Sabha constituency is required",
  }),
  password: z.string().min(8, {
    message: "Password must be at least 8 characters.",
  }),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

const RegisterAdmin = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // States for dependent dropdowns
  const [states, setStates] = useState<{ value: string, label: string }[]>([]);
  const [districts, setDistricts] = useState<{ value: string, label: string }[]>([]);
  const [vidhansabhas, setVidhansabhas] = useState<{ value: string, label: string }[]>([]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      dob: "",
      state: "",
      district: "",
      vidhansabha: "",
      password: "",
      confirmPassword: "",
    },
  });

  // Fetch states when component mounts
  const fetchStates = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/states');
      const data = await response.json();
      setStates(data.map((state: any) => ({
        value: state.id.toString(),
        label: state.name
      })));
    } catch (error) {
      console.error('Error fetching states:', error);
      toast({
        title: "Error",
        description: "Failed to fetch states",
        variant: "destructive"
      });
    }
  };

  const handleStateChange = async (stateId: string) => {
    try {
      const response = await fetch(`http://localhost:3000/api/districts?state_id=${stateId}`);
      const data = await response.json();
      setDistricts(data.map((district: any) => ({
        value: district.id.toString(),
        label: district.name
      })));
      // Clear dependent fields
      setVidhansabhas([]);
      form.setValue('district', '');
      form.setValue('vidhansabha', '');
    } catch (error) {
      console.error('Error fetching districts:', error);
      toast({
        title: "Error",
        description: "Failed to fetch districts",
        variant: "destructive"
      });
    }
  };

  const handleDistrictChange = async (districtId: string) => {
    try {
      const response = await fetch(
        `http://localhost:3000/api/constituencies?district_id=${districtId}&type=vidhansabha`
      );
      const data = await response.json();
      setVidhansabhas(data.map((constituency: any) => ({
        value: constituency.id.toString(),
        label: constituency.name
      })));
      form.setValue('vidhansabha', '');
    } catch (error) {
      console.error('Error fetching vidhansabhas:', error);
      toast({
        title: "Error",
        description: "Failed to fetch Vidhan Sabha constituencies",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    fetchStates();
  }, []);

  // Update the onSubmit function in your RegisterAdmin.tsx
  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('name', values.name);
      formData.append('email', values.email);
      formData.append('phone', values.phone);

      // Ensure dob is properly formatted and included
      if (values.dob) {
        // Convert date to YYYY-MM-DD format if needed
        const dobDate = new Date(values.dob);
        const formattedDob = dobDate.toISOString().split('T')[0];
        formData.append('dob', formattedDob);
      }

      formData.append('password', values.password);
      formData.append('state_id', values.state);
      formData.append('district_id', values.district);
      formData.append('constituency_id', values.vidhansabha);

      // Append photo if present
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      if (fileInput?.files?.[0]) {
        formData.append('photo', fileInput.files[0]);
      }

      const response = await fetch('http://localhost:3000/api/admins', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to register admin');
      }

      toast({
        title: "Success",
        description: "Admin registered successfully!",
      });

      form.reset();
    } catch (error: any) {
      toast({
        title: "Registration Failed",
        description: error.message || "An error occurred during registration",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Register Admin</h1>
          <p className="text-gray-500">Add a new admin for constituency management</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Admin Information</CardTitle>
            <CardDescription>Enter the admin's personal and access details</CardDescription>
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
                          onValueChange={(value) => {
                            field.onChange(value);
                            handleStateChange(value);
                          }}
                          value={field.value}
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
                          onValueChange={(value) => {
                            field.onChange(value);
                            handleDistrictChange(value);
                          }}
                          value={field.value}
                          disabled={districts.length === 0}
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
                    name="vidhansabha"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Vidhan Sabha Constituency*</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                          disabled={vidhansabhas.length === 0}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select Vidhan Sabha constituency" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {vidhansabhas.map((constituency) => (
                              <SelectItem key={constituency.value} value={constituency.value}>
                                {constituency.label}
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
                  <FormLabel>Admin Photo</FormLabel>
                  <Input type="file" name="photo" accept="image/*" />
                </div>

                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Registering..." : "Register Admin"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default RegisterAdmin;