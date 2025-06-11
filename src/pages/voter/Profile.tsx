import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import Layout from "@/components/Layout";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";

const VoterProfile = () => {
  const { user } = useAuth();
  const [voterDetails, setVoterDetails] = useState<any>(null);
  const [error, setError] = useState<string>();

  useEffect(() => {
    if (!user?.id) return;

    const fetchVoterDetails = async () => {
      try {
        const res = await fetch(`http://localhost:3000/api/voters/${user.id}`);
        const data = await res.json();

        if (!res.ok) {
          setError(data.error || "Failed to fetch voter details");
          return;
        }

        setVoterDetails(data);
      } catch (err: any) {
        setError(err.message || "Unknown error");
      }
    };

    fetchVoterDetails();
  }, [user?.id]);

  if (error) {
    return (
      <Layout>
        <div className="text-center text-red-500 py-10">
          Error loading voter profile:<br />{error}
        </div>
      </Layout>
    );
  }

  if (!voterDetails) {
    return (
      <Layout>
        <div className="text-center text-gray-500 py-10">Loading voter profile...</div>
      </Layout>
    );
  }

  const photoUrl = voterDetails.photo_name
    ? `http://localhost:3000/uploads/photos/${voterDetails.photo_name}`
    : "";

  return (
    <Layout>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Voter Profile</CardTitle>
            <CardDescription>Your personal details and voter information</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-6">
              {/* Profile Picture */}
              <div className="flex flex-col items-center space-y-4">
                <Avatar className="h-32 w-32">
                  <AvatarImage src={photoUrl} alt={voterDetails.name} />
                  <AvatarFallback className="text-lg">
                    {voterDetails.name
                      ?.split(" ")
                      .map((n: string) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="text-center">
                  <h3 className="font-medium text-lg">{voterDetails.name}</h3>
                  <p className="text-sm text-gray-500">{voterDetails.voter_card_number}</p>
                </div>
              </div>

              {/* Details */}
              <div className="flex-1 space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-4">Personal Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InfoRow label="Email" value={voterDetails.email} />
                    <InfoRow label="Phone" value={voterDetails.phone} />
                    <InfoRow label="Date of Birth" value={voterDetails.dob} />
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-4">Location Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InfoRow label="State" value={voterDetails.state_name} />
                    <InfoRow label="District" value={voterDetails.district_name} />
                    <InfoRow label="Lok Sabha Constituency" value={voterDetails.loksabha_name} />
                    <InfoRow label="Vidhan Sabha Constituency" value={voterDetails.vidhansabha_name} />
                    <InfoRow label="Municipal Corporation" value={voterDetails.municipal_corp_name} />
                    <InfoRow label="Ward" value={voterDetails.ward_name} />
                    <InfoRow label="Booth" value={voterDetails.booth_name} />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

const InfoRow = ({ label, value }: { label: string; value: string }) => (
  <div className="space-y-1">
    <p className="text-sm text-gray-500">{label}</p>
    <p>{value || "N/A"}</p>
  </div>
);

export default VoterProfile;
