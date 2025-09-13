import React from 'react';

const AlertsPage = () => {
  return (
    <div className="space-y-6">
      <div className="card">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Active Alerts</h1>
        <p className="text-gray-600">
          This page will show all active alerts and notifications including:
        </p>
        <ul className="mt-4 list-disc list-inside text-gray-600 space-y-2">
          <li>Current active alerts in user's area</li>
          <li>Alert severity levels and categories</li>
          <li>Geographic radius configuration</li>
          <li>Push notification preferences</li>
          <li>Alert history and archive</li>
          <li>Emergency contact information</li>
        </ul>
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <p className="text-blue-800 font-medium">🚧 Coming Soon</p>
          <p className="text-blue-600 text-sm mt-1">
            Alert management system is being implemented.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AlertsPage;