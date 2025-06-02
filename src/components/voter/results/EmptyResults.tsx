
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";

const EmptyResults: React.FC = () => {
  return (
    <Card>
      <CardContent className="py-8">
        <div className="text-center text-gray-500">
          <p className="mb-2">No published results are available yet</p>
          <p>Results will be displayed here once they are published by the Election Commission</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default EmptyResults;
