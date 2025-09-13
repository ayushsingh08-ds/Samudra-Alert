import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ReportsProvider } from './contexts/ReportsContext';  
import { AlertsProvider } from './contexts/AlertsContext';
import MainLayout from './layouts/MainLayout';
import LoginPage from './pages/LoginPage';
import ProtectedRoute from './components/common/ProtectedRoute';
import CitizenDashboard from './pages/citizen/Dashboard';
import AnalystDashboard from './pages/analyst/Dashboard';
import AdminDashboard from './pages/admin/Dashboard';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <ReportsProvider>
        <AlertsProvider>
          <Router>
            <MainLayout>
              <Routes>
                {/* Public routes */}
                <Route path="/login" element={<LoginPage />} />
                
                {/* Protected routes */}
                <Route path="/dashboard" element={
                  <ProtectedRoute allowedRoles={['citizen']}>
                    <CitizenDashboard />
                  </ProtectedRoute>
                } />
                
                <Route path="/analyst/dashboard" element={
                  <ProtectedRoute allowedRoles={['analyst']}>
                    <AnalystDashboard />
                  </ProtectedRoute>
                } />
                
                <Route path="/admin/dashboard" element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminDashboard />
                  </ProtectedRoute>
                } />

                {/* Default redirect */}
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </MainLayout>
          </Router>
        </AlertsProvider>
      </ReportsProvider>
    </AuthProvider>
  );
}

export default App;
