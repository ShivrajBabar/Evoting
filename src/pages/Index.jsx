
import React from 'react';
import { useRedirect } from '@/hooks/useRedirect';
import LoadingSpinner from '@/components/common/LoadingSpinner';

const Index = () => {
  const { loading } = useRedirect();
  
  // Show loading state while redirecting
  return <LoadingSpinner message="Welcome to Ballet Secure E-voting" />;
};

export default Index;
