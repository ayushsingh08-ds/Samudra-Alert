import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useReports } from '../../context/ReportsContext';
import { useAlerts } from '../../context/AlertsContext';

const Dashboard = () => {
  const { user } = useAuth();
  const { myReports, fetchMyReports } = useReports();
  const { alerts } = useAlerts();
  const [stats, setStats] = useState({
    totalReports: 0,
    pendingReports: 0,
    verifiedReports: 0,
    activeAlerts: 0,
  });

  useEffect(() => {
    fetchMyReports();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (myReports.length > 0) {
      setStats({
        totalReports: myReports.length,
        pendingReports: myReports.filter(report => report.status === 'pending').length,
        verifiedReports: myReports.filter(report => report.status === 'verified').length,
        activeAlerts: alerts.filter(alert => alert.status === 'active').length,
      });
    }
  }, [myReports, alerts]);

  const quickActions = [
    {
      title: 'Report Hazard',
      description: 'Report a new ocean hazard in your area',
      icon: '📝',
      href: '/citizen/report',
      color: 'bg-red-500 hover:bg-red-600',
    },
    {
      title: 'View My Reports',
      description: 'Check the status of your submitted reports',
      icon: '📊',
      href: '/citizen/my-reports',
      color: 'bg-blue-500 hover:bg-blue-600',
    },
    {
      title: 'Active Alerts',
      description: 'View current alerts in your area',
      icon: '🚨',
      href: '/citizen/alerts',
      color: 'bg-yellow-500 hover:bg-yellow-600',
    },
  ];

  const recentReports = myReports.slice(0, 3);
  const recentAlerts = alerts.slice(0, 3);

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-ocean-600 to-ocean-700 rounded-lg p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">
          Welcome back, {user?.name}! 👋
        </h1>
        <p className="text-ocean-100">
          Thank you for helping keep our oceans safe. Your reports make a difference in protecting marine life and coastal communities.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 text-blue-600">
              📊
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Reports</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalReports}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
              ⏳
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending Review</p>
              <p className="text-2xl font-bold text-gray-900">{stats.pendingReports}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 text-green-600">
              ✅
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Verified</p>
              <p className="text-2xl font-bold text-gray-900">{stats.verifiedReports}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-red-100 text-red-600">
              🚨
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Alerts</p>
              <p className="text-2xl font-bold text-gray-900">{stats.activeAlerts}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {quickActions.map((action) => (
            <Link
              key={action.title}
              to={action.href}
              className={`card hover:shadow-lg transition-all duration-200 ${action.color} text-white p-6`}
            >
              <div className="text-3xl mb-3">{action.icon}</div>
              <h3 className="text-lg font-semibold mb-2">{action.title}</h3>
              <p className="text-sm opacity-90">{action.description}</p>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Reports */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Recent Reports</h3>
            <Link
              to="/citizen/my-reports"
              className="text-sm text-ocean-600 hover:text-ocean-700"
            >
              View all
            </Link>
          </div>
          
          {recentReports.length > 0 ? (
            <div className="space-y-3">
              {recentReports.map((report) => (
                <div key={report.id} className="flex items-center p-3 bg-gray-50 rounded-lg">
                  <div className="flex-shrink-0">
                    <div className={`w-3 h-3 rounded-full ${
                      report.status === 'verified' ? 'bg-green-500' :
                      report.status === 'pending' ? 'bg-yellow-500' :
                      'bg-red-500'
                    }`}></div>
                  </div>
                  <div className="ml-3 flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {report.hazardType} - {report.severity}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(report.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex-shrink-0">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      report.status === 'verified' ? 'bg-green-100 text-green-800' :
                      report.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {report.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <div className="text-4xl mb-2">📝</div>
              <p>No reports yet</p>
              <Link
                to="/citizen/report"
                className="text-ocean-600 hover:text-ocean-700 font-medium"
              >
                Create your first report
              </Link>
            </div>
          )}
        </div>

        {/* Recent Alerts */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Recent Alerts</h3>
            <Link
              to="/citizen/alerts"
              className="text-sm text-ocean-600 hover:text-ocean-700"
            >
              View all
            </Link>
          </div>
          
          {recentAlerts.length > 0 ? (
            <div className="space-y-3">
              {recentAlerts.map((alert) => (
                <div key={alert.id} className="flex items-center p-3 bg-gray-50 rounded-lg">
                  <div className="flex-shrink-0">
                    <div className={`w-3 h-3 rounded-full ${
                      alert.severity === 'high' ? 'bg-red-500' :
                      alert.severity === 'medium' ? 'bg-yellow-500' :
                      'bg-green-500'
                    }`}></div>
                  </div>
                  <div className="ml-3 flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {alert.title}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(alert.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex-shrink-0">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      alert.severity === 'high' ? 'bg-red-100 text-red-800' :
                      alert.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {alert.severity}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <div className="text-4xl mb-2">🚨</div>
              <p>No recent alerts</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;