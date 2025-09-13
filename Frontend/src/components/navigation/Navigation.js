import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Waves, 
  Menu, 
  X, 
  User, 
  LogOut,
  Bell,
  Settings
} from 'lucide-react';

const Navigation = ({ role }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();

  const getNavItems = () => {
    switch (role) {
      case 'citizen':
        return [
          { name: 'Dashboard', href: '/dashboard', icon: null },
          { name: 'Submit Report', href: '/submit-report', icon: null },
          { name: 'My Reports', href: '/my-reports', icon: null },
          { name: 'Alerts', href: '/alerts', icon: null },
        ];
      case 'analyst':
        return [
          { name: 'Dashboard', href: '/analyst/dashboard', icon: null },
          { name: 'Reports', href: '/analyst/reports', icon: null },
          { name: 'Verification', href: '/analyst/verification', icon: null },
          { name: 'Analytics', href: '/analyst/analytics', icon: null },
        ];
      case 'admin':
        return [
          { name: 'Dashboard', href: '/admin/dashboard', icon: null },
          { name: 'Users', href: '/admin/users', icon: null },
          { name: 'Reports', href: '/admin/reports', icon: null },
          { name: 'Settings', href: '/admin/settings', icon: null },
        ];
      default:
        return [];
    }
  };

  const navItems = getNavItems();

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and brand */}
          <div className="flex items-center">
            <Link to="/dashboard" className="flex items-center space-x-2">
              <Waves className="h-8 w-8 text-ocean-600" />
              <span className="text-xl font-bold text-gray-900">Samudra Alert</span>
            </Link>
          </div>

          {/* Desktop navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  location.pathname === item.href
                    ? 'text-ocean-600 bg-ocean-50'
                    : 'text-gray-700 hover:text-ocean-600 hover:bg-gray-50'
                }`}
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* User menu */}
          <div className="hidden md:flex items-center space-x-4">
            <button className="p-2 text-gray-600 hover:text-ocean-600 transition-colors">
              <Bell className="h-5 w-5" />
            </button>
            
            <div className="relative group">
              <button className="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-50 transition-colors">
                <User className="h-5 w-5 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">{user?.name}</span>
              </button>
              
              {/* Dropdown menu */}
              <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                <div className="py-1">
                  <Link
                    to="/profile"
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <User className="h-4 w-4 mr-2" />
                    Profile
                  </Link>
                  <Link
                    to="/settings"
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Settings
                  </Link>
                  <button
                    onClick={logout}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-md text-gray-600 hover:text-ocean-600 hover:bg-gray-50 transition-colors"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden bg-white border-t border-gray-200">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                  location.pathname === item.href
                    ? 'text-ocean-600 bg-ocean-50'
                    : 'text-gray-700 hover:text-ocean-600 hover:bg-gray-50'
                }`}
                onClick={() => setIsOpen(false)}
              >
                {item.name}
              </Link>
            ))}
          </div>
          
          {/* Mobile user menu */}
          <div className="pt-4 pb-3 border-t border-gray-200">
            <div className="px-4 flex items-center">
              <User className="h-8 w-8 text-gray-400" />
              <div className="ml-3">
                <div className="text-base font-medium text-gray-800">{user?.name}</div>
                <div className="text-sm font-medium text-gray-500 capitalize">{role}</div>
              </div>
            </div>
            <div className="mt-3 px-2 space-y-1">
              <Link
                to="/profile"
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-ocean-600 hover:bg-gray-50"
                onClick={() => setIsOpen(false)}
              >
                Profile
              </Link>
              <Link
                to="/settings"
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-ocean-600 hover:bg-gray-50"
                onClick={() => setIsOpen(false)}
              >
                Settings
              </Link>
              <button
                onClick={() => {
                  logout();
                  setIsOpen(false);
                }}
                className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-ocean-600 hover:bg-gray-50"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navigation;