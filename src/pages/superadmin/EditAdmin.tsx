import React, { useState, useEffect } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Layout from "@/components/Layout";
import { useToast } from "@/components/ui/use-toast";
import { useParams, useNavigate } from "react-router-dom";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from "@/components/ui/avatar";
import {
  states,
  allDistricts,
  allVidhansabhas,
  getOptionsForDropdown,
} from "@/utils/locationData";

const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  phone: z.string().min(10, { message: "Phone number must be at least 10 digits." }),
  dob: z.string(),
  state: z.string(),
  district: z.string(),
  vidhansabha: z.string(),
});

const EditAdmin = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();


  const [avatarUrl, setAvatarUrl] = useState<string>("/placeholder.svg");

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
    },
  });

  // Fetch admin data by ID
  useEffect(() => {
    const fetchAll = async () => {
      await fetchStates(); // 🔧 this was missing!
      if (id) await fetchAdmin();
    };

    fetchAll();
  }, [id]);


  const fetchAdmin = async () => {
    try {
      const res = await fetch(`http://localhost:3000/api/admins/${id}`);
      if (!res.ok) throw new Error("Failed to load admin data");
      const data = await res.json();

      form.reset({
        name: data.name,
        email: data.email,
        phone: data.phone,
        dob: data.dob || "",
        state: data.state_id.toString(),
        district: data.district_id.toString(),
        vidhansabha: data.constituency_id.toString(),
      });

      setAvatarUrl(data.photo_url || "/placeholder.svg");

      await handleStateChange(data.state_id.toString());
      await handleDistrictChange(data.district_id.toString());
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: err.message,
      });
    }
  };




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

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const res = await fetch(`http://localhost:3000/api/admins/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (!res.ok) throw new Error("Failed to update admin");

      toast({
        title: "Admin Updated",
        description: `${values.name}'s info has been successfully updated.`,
      });

      navigate("/superadmin/admins");
    } catch (err: any) {
      toast({ variant: "destructive", title: "Error", description: err.message });
    }
  };

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
                <AvatarImage src={avatarUrl} alt="Admin Photo" />
                <AvatarFallback>AD</AvatarFallback>
              </Avatar>
              <div>
                <CardTitle>{form.watch("name")}</CardTitle>
                <CardDescription>{form.watch("vidhansabha")} Constituency Admin</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6" noValidate>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Name, Email, Phone, DOB */}
                  {["name", "email", "phone", "dob"].map((field) => (
                    <FormField
                      key={field}
                      control={form.control}
                      name={field as any}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{field.name.charAt(0).toUpperCase() + field.name.slice(1)}*</FormLabel>
                          <FormControl>
                            <Input {...field} type={field.name === "dob" ? "date" : "text"} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  ))}

                  {/* State Dropdown */}
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

                  {/* District Dropdown */}
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

                  {/* Vidhansabha Dropdown */}
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
                </div>

                {/* File upload (optional) */}
                <div>
                  <FormLabel>Update Photo</FormLabel>
                  <Input type="file" className="mt-1" />
                </div>

                <div className="flex justify-end space-x-4">
                  <Button type="button" variant="outline" onClick={() => navigate("/superadmin/admins")}>Cancel</Button>
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
