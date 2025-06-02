
import React from 'react';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const LoadingResults: React.FC = () => {
  return (
    <div className="space-y-4">
      <div className="w-full sm:w-64">
        <Skeleton className="h-10" />
      </div>
      
      {[1, 2].map((i) => (
        <Card key={i} className="overflow-hidden">
          <CardHeader className="bg-gray-50 pb-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-32" />
          </CardHeader>
          <CardContent className="pt-4">
            <Skeleton className="h-40 w-full" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default LoadingResults;
