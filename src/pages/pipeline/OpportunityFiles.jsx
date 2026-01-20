import React from 'react';
import { FolderOpen } from 'lucide-react';

export default function OpportunityFiles() {
  return (
    <div className="p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Files</h2>
      <div className="bg-white border rounded-lg p-12 text-center">
        <FolderOpen className="w-16 h-16 mx-auto text-gray-300 mb-4" />
        <p className="text-gray-600 font-medium">Mock data interface - Real integration coming</p>
        <p className="text-gray-400 text-sm mt-2">
          Document management will be integrated with Supabase Storage
        </p>
      </div>
    </div>
  );
}
