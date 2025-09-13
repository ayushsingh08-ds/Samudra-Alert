import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import Sidebar from '../components/navigation/Sidebar';

const DashboardLayout = ({ children }) => {
  const { role } = useAuth();

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar role={role} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;