import React, { useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useReports } from '../../contexts/ReportsContext';
import { useAlerts } from '../../contexts/AlertsContext';
import DashboardLayout from '../../layouts/DashboardLayout';
import { 
  AlertTriangle, 
  FileText, 
  CheckCircle, 
  Clock,
  MapPin,
  Plus
} from 'lucide-react';

const CitizenDashboard = () => {
  const { user } = useAuth();
  const { reports, fetchReports } = useReports();
  const { activeAlerts, fetchAlerts } = useAlerts();

  const fetchData = useCallback(async () => {
    await Promise.all([fetchReports(), fetchAlerts()]);
  }, [fetchReports, fetchAlerts]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const userReports = reports.filter(report => report.reportedBy === user?.id);
  const recentReports = userReports.slice(0, 3);

  const stats = [
    {
      name: 'My Reports',
      value: userReports.length,
      icon: FileText,
      color: 'bg-blue-500'
    },
    {
      name: 'Verified',
      value: userReports.filter(r => r.verified).length,
      icon: CheckCircle,
      color: 'bg-green-500'
    },
    {
      name: 'Pending',
      value: userReports.filter(r => r.status === 'pending').length,
      icon: Clock,
      color: 'bg-yellow-500'
    },
    {
      name: 'Active Alerts',
      value: activeAlerts.length,
      icon: AlertTriangle,
      color: 'bg-red-500'
    }
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Welcome Header */}
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back, {user?.name}!
          </h1>
          <p className="text-gray-600 mt-1">
            Monitor ocean hazards and submit reports in your area
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.name} className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className={`${stat.color} rounded-md p-3`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                    <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Reports */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Recent Reports</h2>
                <Link
                  to="/submit-report"
                  className="flex items-center space-x-2 text-ocean-600 hover:text-ocean-700 text-sm font-medium"
                >
                  <Plus className="h-4 w-4" />
                  <span>New Report</span>
                </Link>
              </div>
            </div>
            <div className="p-6">
              {recentReports.length > 0 ? (
                <div className="space-y-4">
                  {recentReports.map((report) => (
                    <div key={report.id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                      <div className={`w-2 h-2 rounded-full ${
                        report.status === 'verified' ? 'bg-green-500' :
                        report.status === 'pending' ? 'bg-yellow-500' : 'bg-red-500'
                      }`}></div>
                      <div className="flex-1">
                        <h3 className="text-sm font-medium text-gray-900">{report.title}</h3>
                        <p className="text-xs text-gray-500 flex items-center mt-1">
                          <MapPin className="h-3 w-3 mr-1" />
                          {report.location.address}
                        </p>
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(report.reportedAt).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No reports yet</p>
                  <Link
                    to="/submit-report"
                    className="mt-2 text-ocean-600 hover:text-ocean-700 text-sm font-medium"
                  >
                    Submit your first report
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Active Alerts */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Active Alerts</h2>
            </div>
            <div className="p-6">
              {activeAlerts.length > 0 ? (
                <div className="space-y-4">
                  {activeAlerts.slice(0, 3).map((alert) => (
                    <div key={alert.id} className="p-4 bg-red-50 border border-red-200 rounded-lg">
                      <div className="flex items-start space-x-3">
                        <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                        <div className="flex-1">
                          <h3 className="text-sm font-medium text-red-900">{alert.title}</h3>
                          <p className="text-sm text-red-700 mt-1">{alert.message}</p>
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-xs text-red-600">{alert.area}</span>
                            <span className="text-xs text-red-600">
                              {new Date(alert.issuedAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <AlertTriangle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No active alerts</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CitizenDashboard;