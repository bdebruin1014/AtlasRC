import React from 'react';
import { Rss } from 'lucide-react';

const SubscribedReportsPage = () => {
  return (
    <div className="p-6">
      <div className="flex items-center gap-2 mb-6">
        <Rss className="w-5 h-5 text-gray-500" />
        <h1 className="text-lg font-semibold text-gray-900">Subscribed Reports</h1>
      </div>
      <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
        <Rss className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500">Manage your report subscriptions</p>
      </div>
    </div>
  );
};
export default SubscribedReportsPage;
