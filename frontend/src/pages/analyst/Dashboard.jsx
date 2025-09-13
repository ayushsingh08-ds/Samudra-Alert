import React from 'react';

const Dashboard = () => {
  return (
    <div className="space-y-6">
      <div className="card">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Analyst Dashboard</h1>
        <p className="text-gray-600">
          This page will contain analytics and insights for ocean hazard data including:
        </p>
        <ul className="mt-4 list-disc list-inside text-gray-600 space-y-2">
          <li>Real-time statistics and metrics</li>
          <li>Pending reports requiring verification</li>
          <li>Geographic distribution of hazards</li>
          <li>Trend analysis and patterns</li>
          <li>Alert impact assessment</li>
          <li>Quick verification tools</li>
        </ul>
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <p className="text-blue-800 font-medium">🚧 Coming Soon</p>
          <p className="text-blue-600 text-sm mt-1">
            Advanced analytics dashboard is being implemented.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;