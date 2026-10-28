import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  Waves,
  Map as MapIcon,
  Plus,
  Bell,
  User as UserIcon,
  Home,
  LogOut,
} from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';

interface AppShellProps {
  children: React.ReactNode;
}

/**
 * Mobile-first app shell — light minimal theme.
 * Base (<768px): sticky header + bottom tab bar with raised Report FAB.
 * Desktop (>=768px): header + left sidebar, no bottom bar.
 */
export const AppShell: React.FC<AppShellProps> = ({ children }) => {
  const { isAuthenticated, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const tabClass = ({ isActive }: { isActive: boolean }) =>
    `flex flex-col items-center justify-center gap-0.5 py-2 w-full ${
      isActive ? 'text-nivara-text-primary' : 'text-nivara-text-muted'
    }`;

  const sideClass = ({ isActive }: { isActive: boolean }) =>
    `p-3 rounded-xl transition-colors ${
      isActive
        ? 'bg-nivara-accent-primary text-white'
        : 'text-nivara-text-muted hover:bg-nivara-bg-glass'
    }`;

  return (
    <div className="min-h-[100dvh] flex flex-col">
      {/* Top header */}
      <header className="fixed top-0 left-0 right-0 h-14 glass-panel z-50 flex items-center justify-between px-4">
        <button className="flex items-center gap-2.5" onClick={() => navigate('/')}>
          <Waves className="text-nivara-text-primary" size={20} strokeWidth={2.2} />
          <span className="brand-mark text-sm text-nivara-text-primary">Samudra-Alert</span>
        </button>

        <div className="flex items-center gap-1">
          {isAuthenticated && (
            <NavLink
              to="/alerts"
              className={({ isActive }) =>
                `relative p-2 rounded-full transition-colors ${
                  isActive ? 'text-nivara-text-primary' : 'text-nivara-text-muted'
                }`
              }
              aria-label="Notifications"
            >
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-nivara-danger rounded-full" />
            </NavLink>
          )}
          {isAuthenticated ? (
            <button
              onClick={handleLogout}
              className="p-2 text-nivara-text-muted hover:text-nivara-danger rounded-full transition-colors"
              aria-label="Log out"
            >
              <LogOut size={20} />
            </button>
          ) : (
            <NavLink to="/login" className="btn-primary py-1.5 px-4 text-xs">
              Sign In
            </NavLink>
          )}
        </div>
      </header>

      {/* Desktop sidebar */}
      <aside className="fixed left-0 top-14 bottom-0 w-16 glass-panel hidden md:flex flex-col items-center py-6 gap-4 z-40">
        <NavLink to="/" className={sideClass}>
          <Home size={22} />
        </NavLink>
        <NavLink to="/map" className={sideClass}>
          <MapIcon size={22} />
        </NavLink>
        <NavLink to="/report" className={sideClass}>
          <Plus size={22} />
        </NavLink>
        <NavLink to="/alerts" className={sideClass}>
          <Bell size={22} />
        </NavLink>
        <NavLink to="/profile" className={sideClass}>
          <UserIcon size={22} />
        </NavLink>
      </aside>

      {/* Content */}
      <main
        className="flex-1 md:pl-16"
        style={{
          paddingTop: '3.5rem',
          paddingBottom: 'calc(4.5rem + env(safe-area-inset-bottom))',
        }}
      >
        {children}
      </main>

      {/* Mobile bottom tab bar */}
      <nav
        className="fixed bottom-0 left-0 right-0 md:hidden glass-panel z-50 flex items-stretch justify-around border-t border-nivara-border"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <NavLink to="/" className={tabClass}>
          <Home size={22} />
          <span className="text-[10px] font-semibold">Home</span>
        </NavLink>
        <NavLink to="/map" className={tabClass}>
          <MapIcon size={22} />
          <span className="text-[10px] font-semibold">Map</span>
        </NavLink>
        <div className="relative w-16 -mt-6">
          <NavLink
            to="/report"
            className="absolute left-1/2 -translate-x-1/2 bottom-2 w-14 h-14 bg-nivara-accent-primary rounded-full flex items-center justify-center shadow-lg shadow-black/20 text-white active:scale-95 transition-transform"
            aria-label="Report an incident"
          >
            <Plus size={28} strokeWidth={2.4} />
          </NavLink>
        </div>
        <NavLink to="/alerts" className={tabClass}>
          <Bell size={22} />
          <span className="text-[10px] font-semibold">Alerts</span>
        </NavLink>
        <NavLink to="/profile" className={tabClass}>
          <UserIcon size={22} />
          <span className="text-[10px] font-semibold">Profile</span>
        </NavLink>
      </nav>
    </div>
  );
};

export default AppShell;
