import React from 'react';

const ReportHazard = () => {
  return (
    <div className="space-y-6">
      <div className="card">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Report Hazard</h1>
        <p className="text-gray-600">
          This page will contain a comprehensive form for citizens to report ocean hazards including:
        </p>
        <ul className="mt-4 list-disc list-inside text-gray-600 space-y-2">
          <li>Hazard type selection (Oil spill, Marine debris, etc.)</li>
          <li>Location picker with GPS integration</li>
          <li>Severity assessment</li>
          <li>Description and details</li>
          <li>Photo and video upload</li>
          <li>Contact information</li>
        </ul>
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <p className="text-blue-800 font-medium">🚧 Coming Soon</p>
          <p className="text-blue-600 text-sm mt-1">
            Full hazard reporting functionality is being implemented.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ReportHazard;