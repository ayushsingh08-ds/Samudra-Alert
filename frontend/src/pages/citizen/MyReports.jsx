import React from 'react';

const MyReports = () => {
  return (
    <div className="space-y-6">
      <div className="card">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">My Reports</h1>
        <p className="text-gray-600">
          This page will display all reports submitted by the citizen including:
        </p>
        <ul className="mt-4 list-disc list-inside text-gray-600 space-y-2">
          <li>List of all submitted reports</li>
          <li>Status tracking (Pending, Under Review, Verified, Rejected)</li>
          <li>Filter and search functionality</li>
          <li>Detailed view of each report</li>
          <li>Update/edit capability for pending reports</li>
          <li>Communication thread with analysts</li>
        </ul>
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <p className="text-blue-800 font-medium">🚧 Coming Soon</p>
          <p className="text-blue-600 text-sm mt-1">
            Report management features are being implemented.
          </p>
        </div>
      </div>
    </div>
  );
};

export default MyReports;