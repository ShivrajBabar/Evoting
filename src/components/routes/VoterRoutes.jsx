
import React from "react";
import { Route } from "react-router-dom";
import ProtectedRoute from "@/components/ProtectedRoute";
import VoterDashboard from "@/pages/voter/Dashboard";
import VoterProfile from "@/pages/voter/Profile";
import VoterElections from "@/pages/voter/Elections";
import VoterResults from "@/pages/voter/Results";

const VoterRoutes = () => {
  return (
    <>
      <Route 
        path="/voter/dashboard" 
        element={
          <ProtectedRoute requiredRole="voter">
            <VoterDashboard />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/voter/profile" 
        element={
          <ProtectedRoute requiredRole="voter">
            <VoterProfile />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/voter/elections" 
        element={
          <ProtectedRoute requiredRole="voter">
            <VoterElections />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/voter/results" 
        element={
          <ProtectedRoute requiredRole="voter">
            <VoterResults />
          </ProtectedRoute>
        } 
      />
    </>
  );
};

export default VoterRoutes;
