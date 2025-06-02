import React from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import SuperadminDashboard from "./pages/superadmin/Dashboard";
import SuperadminCandidates from "./pages/superadmin/Candidates";
import SuperadminAdmins from "./pages/superadmin/Admins";
import SuperadminElections from "./pages/superadmin/Elections";
import SuperadminResults from "./pages/superadmin/Results";
import SuperadminProfile from "./pages/superadmin/Profile";
import AdminDashboard from "./pages/admin/Dashboard";
import AdminVoters from "./pages/admin/Voters";
import AdminCandidates from "./pages/admin/Candidates";
import AdminProfile from "./pages/admin/Profile";
import VoterDashboard from "./pages/voter/Dashboard";
import VoterProfile from "./pages/voter/Profile";
import VoterElections from "./pages/voter/Elections";
import VoterResults from "./pages/voter/Results";
import Index from "./pages/Index";

// Import the form pages
import RegisterCandidate from "./pages/superadmin/RegisterCandidate";
import EditCandidate from "./pages/superadmin/EditCandidate";
import RegisterAdmin from "./pages/superadmin/RegisterAdmin";
import EditAdmin from "./pages/superadmin/EditAdmin";
import CreateElection from "./pages/superadmin/CreateElection";
import EditElection from "./pages/superadmin/EditElection";
import RegisterVoter from "./pages/admin/RegisterVoter";
import EditVoter from "./pages/admin/EditVoter";

// Create a new QueryClient instance outside of component
const queryClient = new QueryClient();

const App: React.FC = () => {
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
