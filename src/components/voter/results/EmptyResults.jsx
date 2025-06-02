
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { FileSearch, AlertCircle } from 'lucide-react';

const EmptyResults = () => {
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center p-10 text-center">
        <FileSearch size={48} className="text-gray-400 mb-3" />
        <h3 className="text-xl font-medium mb-1">No Results Available</h3>
        <p className="text-gray-500 max-w-md">
          No election results have been published yet for the selected filters. Results will appear here after they are verified and published by the Election Commission.
        </p>
        <div className="mt-6 p-3 bg-amber-50 border border-amber-200 rounded-md flex items-start">
          <AlertCircle size={20} className="text-amber-500 mr-2 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-amber-800 text-left">
            Results are typically published within 24-48 hours after an election concludes. Check back soon for updates.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default EmptyResults;
