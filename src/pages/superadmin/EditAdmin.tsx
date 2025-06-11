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

const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  phone: z.string().min(10, { message: "Phone number must be at least 10 digits." }),
  dob: z.string().optional(),
  state: z.string().nonempty({ message: "State is required." }),
  district: z.string().nonempty({ message: "District is required." }),
  vidhansabha: z.string().nonempty({ message: "Vidhan Sabha is required." }),
});

const EditAdmin = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  // State for dropdown options
  const [states, setStates] = useState<{ value: string; label: string }[]>([]);
  const [districts, setDistricts] = useState<{ value: string; label: string }[]>([]);
  const [vidhansabhas, setVidhansabhas] = useState<{ value: string; label: string }[]>([]);
  const [photoFile, setPhotoFile] = useState<File | null>(null); // ✅ Add this line


  // Avatar photo URL state
  const [avatarUrl, setAvatarUrl] = useState<string>("/placeholder.svg");

  // React Hook Form setup
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

  // Load initial data: states and admin info
  useEffect(() => {
    const fetchAll = async () => {
      await fetchStates();
      if (id) await fetchAdmin(id);
    };

    fetchAll();
  }, [id]);

  // Fetch list of states for dropdown
  const fetchStates = async () => {
    try {
      const response = await fetch("http://localhost:3000/api/states");
      if (!response.ok) throw new Error("Failed to fetch states");
      const data = await response.json();
      setStates(
        data.map((state: any) => ({
          value: state.id.toString(),
          label: state.name,
        }))
      );
    } catch (error) {
      console.error("Error fetching states:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch states",
      });
    }
  };

  const fetchDependentData = async (data: any) => {
    try {
      if (states.length === 0) {
        const statesRes = await fetch('/api/states');
        const statesData = await statesRes.json();
        setStates(statesData.map((s: any) => ({ value: s.id.toString(), label: s.name })));
      }

      if (data.state_id) {
        const districtsRes = await fetch(`/api/districts?state_id=${data.state_id}`);
        const districtsData = await districtsRes.json();
        setDistricts(districtsData.map((d: any) => ({ value: d.id.toString(), label: d.name })));
      }

      if (data.district_id) {
        const vidhansabhaRes = await fetch(`/api/constituencies?district_id=${data.district_id}&type=vidhansabha`);
        const vidhansabhaData = await vidhansabhaRes.json();
        setVidhansabhas(vidhansabhaData.map((c: any) => ({ value: c.id.toString(), label: c.name })));
      }
    } catch (error) {
      console.error('Error fetching dependent data:', error);
    }
  };

  const fetchAdmin = async (userId: string) => {
    try {
      const res = await fetch(`http://localhost:3000/api/admins/users/${userId}`);
      if (!res.ok) throw new Error("Failed to load admin data");
      const data = await res.json();

      await fetchDependentData(data); // <-- fetch all dependent dropdowns

      // Format dob as YYYY-MM-DD for input type="date"
      const formattedDob = data.dob ? new Date(data.dob).toISOString().split("T")[0] : "";

      form.reset({
        name: data.name || "",
        email: data.email || "",
        phone: data.phone || "",
        dob: formattedDob,
        state: data.state_id?.toString() || "",
        district: data.district_id?.toString() || "",
        vidhansabha: data.constituency_id?.toString() || "",
      });

      // Use photo_url if available, fallback to placeholder
      if (data.photo_url) {
        setAvatarUrl(
          data.photo_url.startsWith("http")
            ? data.photo_url
            : `http://localhost:3000${data.photo_url}`
        );
      } else if (data.photo_name) {
        setAvatarUrl(`http://localhost:3000/uploads/${data.photo_name}`);
      } else {
        setAvatarUrl("/placeholder.svg");
      }

    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: err.message,
      });
    }
  };

  // When state changes: fetch districts and reset downstream selects
  const handleStateChange = async (stateId: string, resetChild = true) => {
    try {
      const response = await fetch(
        `http://localhost:3000/api/districts?state_id=${stateId}`
      );
      if (!response.ok) throw new Error("Failed to fetch districts");
      const data = await response.json();

      setDistricts(
        data.map((district: any) => ({
          value: district.id.toString(),
          label: district.name,
        }))
      );

      if (resetChild) {
        setVidhansabhas([]);
        form.setValue("district", "");
        form.setValue("vidhansabha", "");
      }
    } catch (error) {
      console.error("Error fetching districts:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch districts",
      });
    }
  };

  // When district changes: fetch Vidhan Sabhas and reset downstream selects
  const handleDistrictChange = async (districtId: string, resetChild = true) => {
    try {
      const response = await fetch(
        `http://localhost:3000/api/constituencies?district_id=${districtId}&type=vidhansabha`
      );
      if (!response.ok) throw new Error("Failed to fetch Vidhan Sabhas");
      const data = await response.json();

      setVidhansabhas(
        data.map((constituency: any) => ({
          value: constituency.id.toString(),
          label: constituency.name,
        }))
      );

      if (resetChild) {
        form.setValue("vidhansabha", "");
      }
    } catch (error) {
      console.error("Error fetching Vidhan Sabhas:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch Vidhan Sabha constituencies",
      });
    }
  };

  // Submit handler to update admin data
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const formData = new FormData(); // ✅ Create FormData

      formData.append("name", values.name);
      formData.append("email", values.email);
      formData.append("phone", values.phone);
      formData.append("dob", values.dob || "");
      formData.append("state_id", values.state);
      formData.append("district_id", values.district);
      formData.append("constituency_id", values.vidhansabha);

      if (photoFile) {
        formData.append("photo", photoFile); // ✅ Append photo if selected
      }

      const res = await fetch(`http://localhost:3000/api/admins/${id}`, {
        method: "PUT",
        body: formData, // ✅ Send FormData
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
                <CardDescription>
                  {vidhansabhas.find((v) => v.value === form.watch("vidhansabha"))?.label || "Constituency Admin"}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6" noValidate>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Full Name" {...field} />
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
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="Email" {...field} />
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
                        <FormLabel>Phone</FormLabel>
                        <FormControl>
                          <Input placeholder="Phone Number" {...field} />
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
                        <FormLabel>Date of Birth</FormLabel>
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
                        <FormLabel>State</FormLabel>
                        <Select
                          onValueChange={(val) => {
                            field.onChange(val);
                            handleStateChange(val);
                          }}
                          value={field.value}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select a state" />
                          </SelectTrigger>
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
                          onValueChange={(val) => {
                            field.onChange(val);
                            handleDistrictChange(val);
                          }}
                          value={field.value}
                          disabled={!field.value && districts.length === 0}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select a district" />
                          </SelectTrigger>
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
                        <FormLabel>Vidhan Sabha</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                          disabled={!field.value && vidhansabhas.length === 0}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select Vidhan Sabha" />
                          </SelectTrigger>
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
                </div>
                <Button type="submit">Save Changes</Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default EditAdmin;
