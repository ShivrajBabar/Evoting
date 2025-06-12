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
import { useLocation } from 'react-router-dom';
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

type Option = { value: string; label: string };

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
  phone: z.string().min(10, "Phone number is required"),
  voter_id: z.string().min(1, "Voter ID is required"),
  dob: z.string().min(1, "Date of Birth is required"),
  state: z.string().min(1, "State is required"),
  district: z.string().min(1, "District is required"),
  loksabhaWard: z.string().min(1, "Lok Sabha is required"),
  vidhansabhaWard: z.string().min(1, "Vidhan Sabha is required"),
  localbody: z.string().min(1, "Local Body is required"),
  ward: z.string().min(1, "Ward is required"),
  booth: z.string().min(1, "Booth is required")
});

const EditVoter = () => {
  const { id } = useParams();
  const { state: locationState } = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [initialData, setInitialData] = useState<any>(locationState || null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // States for dependent dropdowns
  const [states, setStates] = useState<Option[]>([]);
  const [districts, setDistricts] = useState<Option[]>([]);
  const [vidhansabhas, setVidhansabhas] = useState<Option[]>([]);
  const [loksabhas, setLoksabhas] = useState<Option[]>([]);
  const [localbodies, setLocalbodies] = useState<Option[]>([]);
  const [wards, setWards] = useState<Option[]>([]);
  const [booths, setBooths] = useState<Option[]>([]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      voter_id: '',
      dob: '',
      state: user?.state_id?.toString() || '',
      district: user?.district_id?.toString() || '',
      loksabhaWard: '',
      vidhansabhaWard: '',
      localbody: '',
      ward: '',
      booth: ''
    }
  });

  // Fetch if voter data not passed from route
  useEffect(() => {
    const fetchVoter = async () => {
      try {
        const res = await fetch(`http://localhost:3000/api/voters/${id}`);
        if (!res.ok) throw new Error("Failed to fetch voter");
        const data = await res.json();
        setInitialData(data);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load voter data.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    if (!locationState && id) fetchVoter();
    else setLoading(false);
  }, [id, locationState, toast]);

  // Preload dropdown values
  useEffect(() => {
    const preloadDropdownValues = async () => {
      try {
        // Fetch and set States
        const statesRes = await fetch('http://localhost:3000/api/states');
        const allStates = await statesRes.json();
        const stateOptions = allStates.map((s: any) => ({ value: s.id.toString(), label: s.name }));
        setStates(stateOptions);

        // Fetch and set Districts
        const districtsRes = await fetch(`http://localhost:3000/api/districts?state_id=${user?.state_id}`);
        const allDistricts = await districtsRes.json();
        const districtOptions = allDistricts.map((d: any) => ({ value: d.id.toString(), label: d.name }));
        setDistricts(districtOptions);

        // Fetch and set Vidhan Sabhas
        const vidhansabhaRes = await fetch(
          `http://localhost:3000/api/constituencies?district_id=${user?.district_id}&type=vidhansabha`
        );
        const allVidhanSabhas = await vidhansabhaRes.json();
        const vidhansabhaOptions = allVidhanSabhas.map((v: any) => ({ value: v.id.toString(), label: v.name }));
        setVidhansabhas(vidhansabhaOptions);

        // Fetch and set Lok Sabhas
        const loksabhaRes = await fetch(
          `http://localhost:3000/api/constituencies?state_id=${user?.state_id}&type=loksabha`
        );
        const allLokSabhas = await loksabhaRes.json();
        const loksabhaOptions = allLokSabhas.map((l: any) => ({ value: l.id.toString(), label: l.name }));
        setLoksabhas(loksabhaOptions);

        // Fetch and set Local Bodies
        const localBodiesRes = await fetch(
          `http://localhost:3000/api/local-bodies?district_id=${user?.district_id}`
        );
        const allLocalBodies = await localBodiesRes.json();
        const localbodyOptions = allLocalBodies.map((lb: any) => ({ value: lb.id.toString(), label: lb.name }));
        setLocalbodies(localbodyOptions);

        // Match names to IDs
        const findIdByName = (options: Option[], name: string) =>
          options.find((opt) => opt.label === name)?.value || '';

        const matchedLoksabhaId = findIdByName(loksabhaOptions, initialData?.loksabha_name);
        const matchedVidhansabhaId = findIdByName(vidhansabhaOptions, initialData?.vidhansabha_name);
        const matchedLocalbodyId = findIdByName(localbodyOptions, initialData?.municipal_corp_name);

        let wardOptions: Option[] = [];
        let boothOptions: Option[] = [];

        // Fetch wards if local body matched
        if (matchedLocalbodyId) {
          const wardsRes = await fetch(`http://localhost:3000/api/wards?local_body_id=${matchedLocalbodyId}`);
          const allWards = await wardsRes.json();
          wardOptions = allWards.map((w: any) => ({ value: w.id.toString(), label: w.name }));
          setWards(wardOptions);
        }

        const matchedWardId = findIdByName(wardOptions, initialData?.ward_name);

        // Fetch booths if ward matched
        if (matchedWardId) {
          const boothsRes = await fetch(`http://localhost:3000/api/booths?ward_id=${matchedWardId}`);
          const allBooths = await boothsRes.json();
          boothOptions = allBooths.map((b: any) => ({ value: b.id.toString(), label: b.name }));
          setBooths(boothOptions);
        }

        const matchedBoothId = findIdByName(boothOptions, initialData?.booth_name);

        // ✅ Reset form with matched IDs
        form.reset({
          name: initialData.name || '',
          email: initialData.email || '',
          phone: initialData.phone || '',
          voter_id: initialData.voter_card_number || '',
          dob: initialData.dob?.split('T')[0] || '',
          state: user?.state_id?.toString() || '',
          district: user?.district_id?.toString() || '',
          loksabhaWard: matchedLoksabhaId,
          vidhansabhaWard: matchedVidhansabhaId,
          localbody: matchedLocalbodyId,
          ward: matchedWardId,
          booth: matchedBoothId
        });

        console.log("Final Voter Form Data:", {
          ...initialData,
          loksabhaWard: matchedLoksabhaId,
          vidhansabhaWard: matchedVidhansabhaId,
          localbody: matchedLocalbodyId,
          ward: matchedWardId,
          booth: matchedBoothId,
          photoURL: initialData?.photo_name ? `/uploads/${initialData.photo_name}` : ''
        });

      } catch (err) {
        console.error("Dropdown preload error:", err);
      }
    };

    if (initialData && user?.state_id && user?.district_id) {
      preloadDropdownValues();
    }
  }, [initialData, user, form]);


  useEffect(() => {
    if (initialData) {
      console.log("Loaded Voter Data:", initialData);
      form.reset({
        name: initialData.name || '',
        email: initialData.email || '',
        phone: initialData.phone || '',
        voter_id: initialData.voter_card_number || '',
        dob: initialData.dob?.split('T')[0] || '',
        state: user?.state_id?.toString() || '',
        district: user?.district_id?.toString() || '',
        loksabhaWard: initialData.loksabha_ward_id?.toString() || '',
        vidhansabhaWard: initialData.vidhansabha_ward_id?.toString() || '',
        localbody: initialData.municipal_corp_id?.toString() || '',
        ward: initialData.municipal_corp_ward_id?.toString() || '',
        booth: initialData.booth_id?.toString() || ''
      });
    }
  }, [initialData, form, user]);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setPhotoFile(e.target.files[0]);
    }
  };

  const handleLocalbodyChange = async (localBodyId: string) => {
    try {
      const res = await fetch(`http://localhost:3000/api/wards?local_body_id=${localBodyId}`);
      const data = await res.json();
      const options = data.map((ward: any) => ({
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
      const options = data.map((booth: any) => ({
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

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    try {
      const formData = new FormData();

      // Append all form values
      Object.entries(values).forEach(([key, value]) => {
        if (value) formData.append(key, value);
      });

      // Add status (default to 'active')
      formData.append('status', 'active');

      // Append photo file if exists
      if (photoFile) {
        formData.append('photo', photoFile);
      }

      const response = await fetch(`http://localhost:3000/api/voters/update/${id}`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to update voter');
        } else {
          const errorText = await response.text();
          throw new Error("Non-JSON error: " + errorText);
        }
      }

      toast({
        title: "Success",
        description: "Voter details updated successfully.",
      });

      navigate('/admin/voters');
    } catch (error) {
      console.error("Update error:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'Failed to update voter',
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <Layout><div className="p-6">Loading voter data...</div></Layout>;

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
                <AvatarImage
                  src={
                    initialData?.photo_name
                      ? `http://localhost:3000/api/voters/photo/${initialData.photo_name}`
                      : "/placeholder.svg"
                  }
                  alt={initialData?.name}
                />


                <AvatarFallback>{initialData?.name?.substring(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div>
                <CardTitle>{initialData?.name}</CardTitle>
                <CardDescription>Voter ID: {initialData?.voter_card_number}</CardDescription>
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
                          onValueChange={field.onChange}
                          value={field.value}
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
                        <Select
                          onValueChange={field.onChange}
                          value={field.value} disabled
                        >
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
                          onValueChange={(value) => {
                            field.onChange(value);
                            handleLocalbodyChange(value);
                          }}
                          value={field.value}
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
                          onValueChange={(value) => {
                            field.onChange(value);
                            handleWardChange(value);
                          }}
                          value={field.value}
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
                          value={field.value}
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
                </div>

                <div>
                  <FormLabel>Update Photo</FormLabel>
                  <Input
                    type="file"
                    className="mt-1"
                    onChange={handlePhotoChange}
                    accept="image/*"
                  />
                </div>

                <div className="flex justify-end space-x-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate('/admin/voters')}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Updating..." : "Save Changes"}
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

export default EditVoter;