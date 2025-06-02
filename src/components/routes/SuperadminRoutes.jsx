
import React from "react";
import { Route } from "react-router-dom";
import ProtectedRoute from "@/components/ProtectedRoute";
import SuperadminDashboard from "@/pages/superadmin/Dashboard";
import SuperadminCandidates from "@/pages/superadmin/Candidates";
import SuperadminAdmins from "@/pages/superadmin/Admins";
import SuperadminElections from "@/pages/superadmin/Elections";
import SuperadminResults from "@/pages/superadmin/Results";
import SuperadminProfile from "@/pages/superadmin/Profile";
import RegisterCandidate from "@/pages/superadmin/RegisterCandidate";
import EditCandidate from "@/pages/superadmin/EditCandidate";
import RegisterAdmin from "@/pages/superadmin/RegisterAdmin";
import EditAdmin from "@/pages/superadmin/EditAdmin";
import CreateElection from "@/pages/superadmin/CreateElection";
import EditElection from "@/pages/superadmin/EditElection";

const SuperadminRoutes = () => {
  return (
    <>
      <Route 
        path="/superadmin/dashboard" 
        element={
          <ProtectedRoute requiredRole="superadmin">
            <SuperadminDashboard />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/superadmin/candidates" 
        element={
          <ProtectedRoute requiredRole="superadmin">
            <SuperadminCandidates />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/superadmin/candidates/register" 
        element={
          <ProtectedRoute requiredRole="superadmin">
            <RegisterCandidate />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/superadmin/candidates/edit/:id" 
        element={
          <ProtectedRoute requiredRole="superadmin">
            <EditCandidate />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/superadmin/admins" 
        element={
          <ProtectedRoute requiredRole="superadmin">
            <SuperadminAdmins />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/superadmin/admins/register" 
        element={
          <ProtectedRoute requiredRole="superadmin">
            <RegisterAdmin />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/superadmin/admins/edit/:id" 
        element={
          <ProtectedRoute requiredRole="superadmin">
            <EditAdmin />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/superadmin/elections" 
        element={
          <ProtectedRoute requiredRole="superadmin">
            <SuperadminElections />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/superadmin/results" 
        element={
          <ProtectedRoute requiredRole="superadmin">
            <SuperadminResults />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/superadmin/elections/create" 
        element={
          <ProtectedRoute requiredRole="superadmin">
            <CreateElection />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/superadmin/elections/edit/:id" 
        element={
          <ProtectedRoute requiredRole="superadmin">
            <EditElection />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/superadmin/profile" 
        element={
          <ProtectedRoute requiredRole="superadmin">
            <SuperadminProfile />
          </ProtectedRoute>
        } 
      />
    </>
  );
};

export default SuperadminRoutes;
