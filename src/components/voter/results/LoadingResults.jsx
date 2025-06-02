
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Loader } from 'lucide-react';

const LoadingResults = () => {
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center p-10 text-center">
        <div className="relative mb-3">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-gray-200"></div>
          <div className="absolute top-0 left-0 animate-spin rounded-full h-12 w-12 border-t-2 border-primary"></div>
        </div>
        <h3 className="text-xl font-medium mb-1">Loading Results</h3>
        <p className="text-gray-500">
          Please wait while we fetch the election results...
        </p>
      </CardContent>
    </Card>
  );
};

export default LoadingResults;
