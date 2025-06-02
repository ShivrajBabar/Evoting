
import React from "react";
import { Route } from "react-router-dom";
import ProtectedRoute from "@/components/ProtectedRoute";
import AdminDashboard from "@/pages/admin/Dashboard";
import AdminVoters from "@/pages/admin/Voters";
import AdminCandidates from "@/pages/admin/Candidates";
import AdminProfile from "@/pages/admin/Profile";
import RegisterVoter from "@/pages/admin/RegisterVoter";
import EditVoter from "@/pages/admin/EditVoter";

const AdminRoutes = () => {
  return (
    <>
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
    </>
  );
};

export default AdminRoutes;
