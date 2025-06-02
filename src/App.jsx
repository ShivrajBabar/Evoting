
import React from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import NotFound from "@/pages/NotFound.tsx";
import Login from "@/pages/Login.jsx";
import SuperadminDashboard from "@/pages/superadmin/Dashboard.tsx";
import SuperadminCandidates from "@/pages/superadmin/Candidates.tsx";
import SuperadminAdmins from "@/pages/superadmin/Admins.tsx";
import SuperadminElections from "@/pages/superadmin/Elections.jsx";
import SuperadminResults from "@/pages/superadmin/Results.jsx";
import SuperadminProfile from "@/pages/superadmin/Profile.tsx";
import AdminDashboard from "@/pages/admin/Dashboard.tsx";
import AdminVoters from "@/pages/admin/Voters.jsx";
import AdminCandidates from "@/pages/admin/Candidates.tsx";
import AdminProfile from "@/pages/admin/Profile.tsx";
import VoterDashboard from "@/pages/voter/Dashboard.tsx";
import VoterProfile from "@/pages/voter/Profile.tsx";
import VoterElections from "@/pages/voter/Elections.tsx";
import VoterResults from "@/pages/voter/Results.jsx";
import Index from "@/pages/Index.jsx";

// Import the form pages
import RegisterCandidate from "@/pages/superadmin/RegisterCandidate.tsx";
import EditCandidate from "@/pages/superadmin/EditCandidate.tsx";
import RegisterAdmin from "@/pages/superadmin/RegisterAdmin.tsx";
import EditAdmin from "@/pages/superadmin/EditAdmin.tsx";
import CreateElection from "@/pages/superadmin/CreateElection.tsx";
import EditElection from "@/pages/superadmin/EditElection.tsx";
import RegisterVoter from "@/pages/admin/RegisterVoter.tsx";
import EditVoter from "@/pages/admin/EditVoter.tsx";

// Create a new QueryClient instance outside of component
const queryClient = new QueryClient();

const App = () => {
  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <AuthProvider>
            <Routes>
              {/* Public routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/" element={<Index />} />
              
              {/* Superadmin routes */}
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
              
              {/* Admin routes */}
              <Route 
                path="/admin/dashboard" 
                element={
                  <ProtectedRoute requiredRole="admin">
                    <AdminDashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/voters" 
                element={
                  <ProtectedRoute requiredRole="admin">
                    <AdminVoters />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/voters/register" 
                element={
                  <ProtectedRoute requiredRole="admin">
                    <RegisterVoter />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/voters/edit/:id" 
                element={
                  <ProtectedRoute requiredRole="admin">
                    <EditVoter />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/candidates" 
                element={
                  <ProtectedRoute requiredRole="admin">
                    <AdminCandidates />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/profile" 
                element={
                  <ProtectedRoute requiredRole="admin">
                    <AdminProfile />
                  </ProtectedRoute>
                } 
              />
              
              {/* Voter routes */}
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
              
              {/* Catch-all route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthProvider>
        </TooltipProvider>
      </QueryClientProvider>
    </BrowserRouter>
  );
};

export default App;
