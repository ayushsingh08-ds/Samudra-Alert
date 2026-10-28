import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import AppShell from './components/ui/AppShell';
import WaveBackground from './components/ui/WaveBackground';
import ToastHost, { toast } from './components/ui/Toast';
import OfflineBanner from './components/offline/OfflineBanner';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import MapView from './pages/MapView';
import ReportHazard from './pages/ReportHazard';
import ModeratorDashboard from './pages/ModeratorDashboard';
import AdminAlertComposer from './pages/AdminAlertComposer';
import OfflineQueue from './pages/OfflineQueue';
import ReportDetail from './pages/ReportDetail';
import AlertsPage from './pages/AlertsPage';
import ProfilePage from './pages/ProfilePage';
import Login from './pages/Login';
import Register from './pages/Register';
import Onboarding from './pages/Onboarding';

const ONBOARDING_KEY = 'nivara.onboarded';

/** Redirects to /onboarding on first ever launch. */
function FirstLaunchGate({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const needsOnboarding = !localStorage.getItem(ONBOARDING_KEY) && location.pathname !== '/onboarding';
  if (needsOnboarding) return <Navigate to="/onboarding" replace />;
  return <>{children}</>;
}
import { useAuthStore } from './store/useAuthStore';
import { useOfflineStore } from './store/useOfflineStore';
import { useSocket } from './hooks/useSocket';
import { usePush } from './hooks/usePush';

function ShellSwitch({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const isAuthPage =
    location.pathname === '/login' ||
    location.pathname === '/register' ||
    location.pathname === '/onboarding';
  if (isAuthPage) return <>{children}</>;
  return <AppShell>{children}</AppShell>;
}

const App: React.FC = () => {
  const queryClient = useQueryClient();
  const checkAuth = useAuthStore((s) => s.checkAuth);
  const loadQueue = useOfflineStore((s) => s.loadQueue);

  // Auth + offline bootstrap
  useEffect(() => {
    const pathname = window.location.pathname;
    if (pathname !== '/login' && pathname !== '/register' && pathname !== '/onboarding') {
      checkAuth();
    } else {
      useAuthStore.setState({ isLoading: false });
    }
    loadQueue();
  }, [checkAuth, loadQueue]);

  // Realtime: server events -> cache invalidation + toasts
  useSocket((event, payload) => {
    const p = (payload ?? {}) as { title?: string; message?: string; _id?: string };
    switch (event) {
      case 'report:created':
        queryClient.invalidateQueries({ queryKey: ['reports'] });
        queryClient.invalidateQueries({ queryKey: ['nearby'] });
        toast.info('New hazard report', p.title);
        break;
      case 'report:updated':
        queryClient.invalidateQueries({ queryKey: ['reports'] });
        queryClient.invalidateQueries({ queryKey: ['report', p._id ?? ''] });
        queryClient.invalidateQueries({ queryKey: ['pending-reports'] });
        queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
        break;
      case 'alert:broadcast':
        queryClient.invalidateQueries({ queryKey: ['alerts'] });
        toast.danger(p.title ?? 'New alert', p.message);
        break;
      default:
        break;
    }
  });

  // Native push -> toast + invalidate
  usePush({
    onNotification: (n) => {
      toast.warning(n.title ?? 'Notification', n.body ?? undefined);
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
    },
  });

  return (
    <BrowserRouter>
      <FirstLaunchGate>
      <WaveBackground />
      <OfflineBanner />
      <ToastHost />
      <ShellSwitch>
        <Routes>
          {/* Public */}
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<Home />} />
          <Route path="/map" element={<MapView />} />
          <Route path="/report/:id" element={<ReportDetail />} />

          {/* Authenticated (citizen+) */}
          <Route element={<ProtectedRoute allowedRoles={['citizen', 'moderator', 'admin']} />}>
            <Route path="/report" element={<ReportHazard />} />
            <Route path="/offline" element={<OfflineQueue />} />
          </Route>

          {/* Moderator/Admin */}
          <Route element={<ProtectedRoute allowedRoles={['moderator', 'admin']} />}>
            <Route path="/dashboard" element={<ModeratorDashboard />} />
          </Route>

          {/* Admin only */}
          <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
            <Route path="/admin/alerts" element={<AdminAlertComposer />} />
          </Route>

          {/* Any authenticated user */}
          <Route element={<ProtectedRoute />}>
            <Route path="/alerts" element={<AlertsPage />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Route>
        </Routes>
      </ShellSwitch>
    </FirstLaunchGate>
    </BrowserRouter>
  );
};

export default App;
