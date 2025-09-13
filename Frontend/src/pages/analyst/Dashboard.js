import React, { useEffect, useCallback } from 'react';
import { useReports } from '../../contexts/ReportsContext';
import { useAlerts } from '../../contexts/AlertsContext';
import DashboardLayout from '../../layouts/DashboardLayout';
import { 
  FileText, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  MapPin,
  BarChart3
} from 'lucide-react';

const AnalystDashboard = () => {
  const { reports, fetchReports } = useReports();
  const { activeAlerts, fetchAlerts } = useAlerts();

  const fetchData = useCallback(async () => {
    await Promise.all([fetchReports(), fetchAlerts()]);
  }, [fetchReports, fetchAlerts]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const pendingReports = reports.filter(r => r.status === 'pending');
  const verifiedReports = reports.filter(r => r.verified);
  const recentReports = reports.slice(0, 5);

  const stats = [
    {
      name: 'Total Reports',
      value: reports.length,
      icon: FileText,
      color: 'bg-blue-500',
      change: '+12%'
    },
    {
      name: 'Pending Review',
      value: pendingReports.length,
      icon: Clock,
      color: 'bg-yellow-500',
      change: '+5%'
    },
    {
      name: 'Verified',
      value: verifiedReports.length,
      icon: CheckCircle,
      color: 'bg-green-500',
      change: '+8%'
    },
    {
      name: 'Active Alerts',
      value: activeAlerts.length,
      icon: AlertTriangle,
      color: 'bg-red-500',
      change: '-2%'
    }
  ];

  const reportTypes = [
    { name: 'Flooding', count: reports.filter(r => r.type === 'flood').length, color: 'bg-blue-500' },
    { name: 'Pollution', count: reports.filter(r => r.type === 'pollution').length, color: 'bg-green-500' },
    { name: 'Storm', count: reports.filter(r => r.type === 'storm').length, color: 'bg-yellow-500' },
    { name: 'Tsunami', count: reports.filter(r => r.type === 'tsunami').length, color: 'bg-red-500' }
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Welcome Header */}
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold text-gray-900">
            Analyst Dashboard
          </h1>
          <p className="text-gray-600 mt-1">
            Review reports, analyze trends, and manage ocean hazard data
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
          {/* Recent Reports */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Recent Reports</h2>
                <button className="text-ocean-600 hover:text-ocean-700 text-sm font-medium">
                  View all
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {recentReports.map((report) => (
                  <div key={report.id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                    <div className={`w-3 h-3 rounded-full ${
                      report.severity === 'high' ? 'bg-red-500' :
                      report.severity === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                    }`}></div>
                    <div className="flex-1">
                      <h3 className="text-sm font-medium text-gray-900">{report.title}</h3>
                      <p className="text-xs text-gray-500 flex items-center mt-1">
                        <MapPin className="h-3 w-3 mr-1" />
                        {report.location.address}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        report.status === 'verified' ? 'bg-green-100 text-green-800' :
                        report.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {report.status}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(report.reportedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Report Types */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Report Types</h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {reportTypes.map((type) => (
                  <div key={type.name} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${type.color}`}></div>
                      <span className="text-sm font-medium text-gray-900">{type.name}</span>
                    </div>
                    <span className="text-sm text-gray-600">{type.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Action Items */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button className="w-full flex items-center justify-between p-3 bg-yellow-50 hover:bg-yellow-100 rounded-lg transition-colors">
                <div className="flex items-center space-x-3">
                  <Clock className="h-5 w-5 text-yellow-600" />
                  <span className="text-sm font-medium text-yellow-900">Review Pending Reports</span>
                </div>
                <span className="bg-yellow-200 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium">
                  {pendingReports.length}
                </span>
              </button>
              
              <button className="w-full flex items-center justify-between p-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
                <div className="flex items-center space-x-3">
                  <BarChart3 className="h-5 w-5 text-blue-600" />
                  <span className="text-sm font-medium text-blue-900">Generate Report</span>
                </div>
              </button>
              
              <button className="w-full flex items-center justify-between p-3 bg-green-50 hover:bg-green-100 rounded-lg transition-colors">
                <div className="flex items-center space-x-3">
                  <AlertTriangle className="h-5 w-5 text-green-600" />
                  <span className="text-sm font-medium text-green-900">Create Alert</span>
                </div>
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3 text-sm">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-gray-600">Verified flood report in Mumbai</span>
                <span className="text-gray-400">2h ago</span>
              </div>
              <div className="flex items-center space-x-3 text-sm">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-gray-600">Updated storm alert for West Coast</span>
                <span className="text-gray-400">4h ago</span>
              </div>
              <div className="flex items-center space-x-3 text-sm">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <span className="text-gray-600">New pollution report received</span>
                <span className="text-gray-400">6h ago</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AnalystDashboard;