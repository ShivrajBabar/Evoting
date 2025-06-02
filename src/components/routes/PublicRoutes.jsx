
import React from "react";
import { Route } from "react-router-dom";
import Login from "@/pages/Login";
import Index from "@/pages/Index";
import NotFound from "@/pages/NotFound";

const PublicRoutes = () => {
  return (
    <>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<Index />} />
      <Route path="*" element={<NotFound />} />
    </>
  );
};

export default PublicRoutes;
