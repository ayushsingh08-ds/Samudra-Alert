import React, { useEffect, useCallback } from 'react';
import { useReports } from '../../contexts/ReportsContext';
import { useAlerts } from '../../contexts/AlertsContext';
import DashboardLayout from '../../layouts/DashboardLayout';
import { 
  Users, 
  FileText, 
  AlertTriangle, 
  Settings,
  Activity
} from 'lucide-react';

const AdminDashboard = () => {
  const { reports, fetchReports } = useReports();
  const { activeAlerts, fetchAlerts } = useAlerts();

  const fetchData = useCallback(async () => {
    await Promise.all([fetchReports(), fetchAlerts()]);
  }, [fetchReports, fetchAlerts]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Mock user data - replace with actual API call
  const totalUsers = 1247;
  const activeUsers = 892;
  const analysts = 12;
  const citizens = totalUsers - analysts - 1; // -1 for admin

  const systemStats = [
    {
      name: 'Total Users',
      value: totalUsers,
      icon: Users,
      color: 'bg-blue-500',
      change: '+8.2%'
    },
    {
      name: 'Active Reports',
      value: reports.length,
      icon: FileText,
      color: 'bg-green-500',
      change: '+15.3%'
    },
    {
      name: 'Active Alerts',
      value: activeAlerts.length,
      icon: AlertTriangle,
      color: 'bg-red-500',
      change: '-12.1%'
    },
    {
      name: 'System Health',
      value: '99.2%',
      icon: Activity,
      color: 'bg-purple-500',
      change: '+0.1%'
    }
  ];

  const userBreakdown = [
    { name: 'Citizens', count: citizens, percentage: (citizens / totalUsers * 100).toFixed(1), color: 'bg-blue-500' },
    { name: 'Analysts', count: analysts, percentage: (analysts / totalUsers * 100).toFixed(1), color: 'bg-green-500' },
    { name: 'Admins', count: 1, percentage: (1 / totalUsers * 100).toFixed(1), color: 'bg-red-500' }
  ];

  const systemMetrics = [
    { name: 'API Response Time', value: '125ms', status: 'good' },
    { name: 'Database Performance', value: '98.5%', status: 'excellent' },
    { name: 'Storage Usage', value: '67%', status: 'good' },
    { name: 'Error Rate', value: '0.02%', status: 'excellent' }
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Welcome Header */}
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold text-gray-900">
            System Administration
          </h1>
          <p className="text-gray-600 mt-1">
            Monitor system performance and manage platform operations
          </p>
        </div>

        {/* System Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {systemStats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.name} className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className={`${stat.color} rounded-md p-3`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-4 flex-1">
                    <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                    <div className="flex items-center space-x-2">
                      <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
                      <span className={`text-sm ${
                        stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {stat.change}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* User Distribution */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">User Distribution</h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {userBreakdown.map((user) => (
                  <div key={user.name} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${user.color}`}></div>
                      <span className="text-sm font-medium text-gray-900">{user.name}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-semibold text-gray-900">{user.count}</span>
                      <span className="text-xs text-gray-500 ml-1">({user.percentage}%)</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 pt-4 border-t border-gray-200">
                <div className="flex justify-between text-sm">
                  <span className="font-medium text-gray-900">Active Today</span>
                  <span className="text-green-600 font-semibold">{activeUsers}</span>
                </div>
              </div>
            </div>
          </div>

          {/* System Metrics */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">System Metrics</h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {systemMetrics.map((metric) => (
                  <div key={metric.name} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">{metric.name}</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-gray-900">{metric.value}</span>
                      <div className={`w-2 h-2 rounded-full ${
                        metric.status === 'excellent' ? 'bg-green-500' :
                        metric.status === 'good' ? 'bg-yellow-500' : 'bg-red-500'
                      }`}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">New analyst registered</p>
                    <p className="text-xs text-gray-500">analyst@coastal.gov</p>
                    <p className="text-xs text-gray-400">2 hours ago</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">System backup completed</p>
                    <p className="text-xs text-gray-500">Database backup successful</p>
                    <p className="text-xs text-gray-400">4 hours ago</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">Security scan completed</p>
                    <p className="text-xs text-gray-500">No vulnerabilities found</p>
                    <p className="text-xs text-gray-400">6 hours ago</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">Alert threshold updated</p>
                    <p className="text-xs text-gray-500">Tsunami warning levels</p>
                    <p className="text-xs text-gray-400">8 hours ago</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Management Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <button className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow text-left">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-500 rounded-md p-3">
                <Users className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Manage Users</h3>
                <p className="text-sm text-gray-600">Add, edit, or deactivate users</p>
              </div>
            </div>
          </button>

          <button className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow text-left">
            <div className="flex items-center space-x-3">
              <div className="bg-green-500 rounded-md p-3">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Review Reports</h3>
                <p className="text-sm text-gray-600">Monitor all platform reports</p>
              </div>
            </div>
          </button>

          <button className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow text-left">
            <div className="flex items-center space-x-3">
              <div className="bg-red-500 rounded-md p-3">
                <AlertTriangle className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Alert System</h3>
                <p className="text-sm text-gray-600">Configure alert settings</p>
              </div>
            </div>
          </button>

          <button className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow text-left">
            <div className="flex items-center space-x-3">
              <div className="bg-purple-500 rounded-md p-3">
                <Settings className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">System Settings</h3>
                <p className="text-sm text-gray-600">Configure platform settings</p>
              </div>
            </div>
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;