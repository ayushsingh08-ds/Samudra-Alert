import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { AlertsProvider } from './context/AlertsContext';
import { ReportsProvider } from './context/ReportsContext';
import ProtectedRoute from './components/common/ProtectedRoute';

// Layouts
import CitizenLayout from './layouts/citizen/CitizenLayout';
import AdminLayout from './layouts/admin/AdminLayout';

// Pages
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import CitizenDashboard from './pages/citizen/Dashboard';
import ReportHazard from './pages/citizen/ReportHazard';
import MyReports from './pages/citizen/MyReports';
import AlertsPage from './pages/citizen/AlertsPage';
import AnalystDashboard from './pages/analyst/Dashboard';
import ReportsManagement from './pages/analyst/ReportsManagement';
import MapView from './pages/analyst/MapView';
import Analytics from './pages/analyst/Analytics';
import AdminDashboard from './pages/admin/Dashboard';
import UserManagement from './pages/admin/UserManagement';
import SystemSettings from './pages/admin/SystemSettings';
import AlertBroadcasting from './pages/admin/AlertBroadcasting';

function App() {
  return (
    <AuthProvider>
      <AlertsProvider>
        <ReportsProvider>
          <div className="App">
            <Routes>
              {/* Public routes */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              
              {/* Citizen routes */}
              <Route path="/citizen" element={
                <ProtectedRoute allowedRoles={['citizen']}>
                  <CitizenLayout />
                </ProtectedRoute>
              }>
                <Route index element={<CitizenDashboard />} />
                <Route path="dashboard" element={<CitizenDashboard />} />
                <Route path="report" element={<ReportHazard />} />
                <Route path="my-reports" element={<MyReports />} />
                <Route path="alerts" element={<AlertsPage />} />
              </Route>
              
              {/* Analyst routes */}
              <Route path="/analyst" element={
                <ProtectedRoute allowedRoles={['analyst', 'admin']}>
                  <AdminLayout />
                </ProtectedRoute>
              }>
                <Route index element={<AnalystDashboard />} />
                <Route path="dashboard" element={<AnalystDashboard />} />
                <Route path="reports" element={<ReportsManagement />} />
                <Route path="map" element={<MapView />} />
                <Route path="analytics" element={<Analytics />} />
              </Route>
              
              {/* Admin routes */}
              <Route path="/admin" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminLayout />
                </ProtectedRoute>
              }>
                <Route index element={<AdminDashboard />} />
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="users" element={<UserManagement />} />
                <Route path="settings" element={<SystemSettings />} />
                <Route path="alerts" element={<AlertBroadcasting />} />
              </Route>
              
              {/* Default redirect */}
              <Route path="/" element={<Navigate to="/login" replace />} />
              <Route path="*" element={<div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                  <h1 className="text-4xl font-bold text-gray-800 mb-4">404</h1>
                  <p className="text-gray-600">Page not found</p>
                </div>
              </div>} />
            </Routes>
          </div>
        </ReportsProvider>
      </AlertsProvider>
    </AuthProvider>
  );
}

export default App;