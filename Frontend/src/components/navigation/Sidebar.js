import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FileText, 
  CheckCircle, 
  BarChart3, 
  Users, 
  Settings,
  AlertTriangle,
  Plus,
  Waves
} from 'lucide-react';

const Sidebar = ({ role }) => {
  const location = useLocation();

  const getMenuItems = () => {
    switch (role) {
      case 'citizen':
        return [
          { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
          { name: 'Submit Report', href: '/submit-report', icon: Plus },
          { name: 'My Reports', href: '/my-reports', icon: FileText },
          { name: 'Alerts', href: '/alerts', icon: AlertTriangle },
        ];
      case 'analyst':
        return [
          { name: 'Dashboard', href: '/analyst/dashboard', icon: LayoutDashboard },
          { name: 'All Reports', href: '/analyst/reports', icon: FileText },
          { name: 'Verification', href: '/analyst/verification', icon: CheckCircle },
          { name: 'Analytics', href: '/analyst/analytics', icon: BarChart3 },
        ];
      case 'admin':
        return [
          { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
          { name: 'Users', href: '/admin/users', icon: Users },
          { name: 'Reports', href: '/admin/reports', icon: FileText },
          { name: 'Alerts', href: '/admin/alerts', icon: AlertTriangle },
          { name: 'Settings', href: '/admin/settings', icon: Settings },
        ];
      default:
        return [];
    }
  };

  const menuItems = getMenuItems();

  return (
    <div className="bg-white w-64 shadow-lg flex flex-col">
      {/* Logo */}
      <div className="flex items-center h-16 px-6 border-b border-gray-200">
        <Link to="/dashboard" className="flex items-center space-x-2">
          <Waves className="h-8 w-8 text-ocean-600" />
          <span className="text-xl font-bold text-gray-900">Samudra Alert</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.href;
          
          return (
            <Link
              key={item.name}
              to={item.href}
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-ocean-50 text-ocean-700 border-r-2 border-ocean-600'
                  : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <Icon className={`h-5 w-5 ${isActive ? 'text-ocean-600' : 'text-gray-500'}`} />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Role indicator */}
      <div className="px-6 py-4 border-t border-gray-200">
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${
            role === 'admin' ? 'bg-red-500' :
            role === 'analyst' ? 'bg-yellow-500' : 'bg-green-500'
          }`}></div>
          <span className="text-sm font-medium text-gray-600 capitalize">{role}</span>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;