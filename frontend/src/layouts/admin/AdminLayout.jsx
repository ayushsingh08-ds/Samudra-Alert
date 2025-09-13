import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import NotificationPanel from '../../components/common/NotificationPanel';

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();

  const getNavigationForRole = (role) => {
    const baseNavigation = [
      { name: 'Dashboard', href: '/admin/dashboard', icon: '📊', roles: ['admin'] },
      { name: 'Analytics', href: '/analyst/analytics', icon: '📈', roles: ['analyst', 'admin'] },
      { name: 'Reports Management', href: '/analyst/reports', icon: '📋', roles: ['analyst', 'admin'] },
      { name: 'Map View', href: '/analyst/map', icon: '🗺️', roles: ['analyst', 'admin'] },
      { name: 'User Management', href: '/admin/users', icon: '👥', roles: ['admin'] },
      { name: 'Alert Broadcasting', href: '/admin/alerts', icon: '📢', roles: ['admin'] },
      { name: 'System Settings', href: '/admin/settings', icon: '⚙️', roles: ['admin'] },
    ];

    return baseNavigation.filter(item => item.roles.includes(role));
  };

  const navigation = getNavigationForRole(user?.role);

  const isActiveLink = (href) => {
    return location.pathname === href || 
           (href === '/admin/dashboard' && location.pathname === '/admin') ||
           (href === '/analyst/dashboard' && location.pathname === '/analyst');
  };

  return (
    <div className="h-screen flex bg-gray-50">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-gray-600 bg-opacity-75 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-30 w-64 bg-white shadow-lg transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex items-center justify-center h-16 px-4 bg-gradient-to-r from-ocean-600 to-ocean-700">
          <h1 className="text-xl font-bold text-white">🌊 Samudra Admin</h1>
        </div>
        
        <nav className="mt-8 px-4">
          <ul className="space-y-2">
            {navigation.map((item) => (
              <li key={item.name}>
                <Link
                  to={item.href}
                  className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-200 ${
                    isActiveLink(item.href)
                      ? 'bg-ocean-100 text-ocean-800 border-r-4 border-ocean-600'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <span className="mr-3 text-lg">{item.icon}</span>
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
          <div className="flex items-center mb-4">
            <div className="w-8 h-8 bg-gradient-to-r from-ocean-600 to-ocean-700 rounded-full flex items-center justify-center text-white text-sm font-semibold">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900">{user?.name}</p>
              <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200"
          >
            <span className="mr-3">🚪</span>
            Sign out
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top navigation */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between px-4 py-4">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(true)}
                className="text-gray-500 hover:text-gray-700 focus:outline-none focus:text-gray-700 lg:hidden"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <h2 className="ml-4 text-xl font-semibold text-gray-900 lg:ml-0">
                {navigation.find(item => isActiveLink(item.href))?.name || 'Dashboard'}
              </h2>
            </div>
            
            <div className="flex items-center space-x-4">
              <NotificationPanel />
              <div className="hidden md:flex items-center space-x-4">
                <span className="px-2 py-1 text-xs font-medium bg-ocean-100 text-ocean-800 rounded-full capitalize">
                  {user?.role}
                </span>
                <span className="text-sm text-gray-600">Welcome, {user?.name}</span>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;