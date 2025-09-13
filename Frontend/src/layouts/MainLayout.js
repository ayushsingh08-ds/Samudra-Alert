import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import Navigation from '../components/navigation/Navigation';
import AlertBanner from '../components/alerts/AlertBanner';

const MainLayout = ({ children }) => {
  const { isAuthenticated, role } = useAuth();

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50">
        {children}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AlertBanner />
      <Navigation role={role} />
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
};

export default MainLayout;