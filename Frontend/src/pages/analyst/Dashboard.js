import React, { useEffect, useCallback } from 'react';
import { useReports } from '../../contexts/ReportsContext';
import { useAlerts } from '../../contexts/AlertsContext';
import DashboardLayout from '../../layouts/DashboardLayout';
import MapContainer from '../../components/maps/MapContainer';
import { ReportsOverTimeChart, ReportsByTypeChart, SeverityDistributionChart } from '../../components/charts/ChartContainer';
import ReportCard from '../../components/common/ReportCard';
import { 
  FileText, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
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

  // Convert reports to map markers
  const mapMarkers = reports.map(report => ({
    lat: report.location.lat,
    lng: report.location.lng,
    title: report.title,
    description: report.description,
    type: report.type,
    severity: report.severity,
    reportedAt: report.reportedAt,
    onClick: (marker) => {
      console.log('Marker clicked:', marker);
    }
  }));

  // Convert alerts to map alert areas
  const mapAlerts = activeAlerts.map(alert => ({
    ...alert,
    coordinates: alert.coordinates || { lat: 19.0760, lng: 72.8777, radius: 25 }
  }));

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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Map */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Reports Map</h2>
            <MapContainer
              center={[19.0760, 72.8777]}
              zoom={10}
              markers={mapMarkers}
              alerts={mapAlerts}
              height="400px"
            />
          </div>

          {/* Reports Over Time Chart */}
          <div>
            <ReportsOverTimeChart reports={reports} />
          </div>
        </div>

        {/* Analytics Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <ReportsByTypeChart reports={reports} />
          <SeverityDistributionChart reports={reports} />
          
          {/* Recent Reports List */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Recent Reports</h2>
            </div>
            <div className="p-6 max-h-96 overflow-y-auto">
              <div className="space-y-4">
                {recentReports.map((report) => (
                  <ReportCard
                    key={report.id}
                    report={report}
                    compact={true}
                    onView={(report) => console.log('View report:', report)}
                  />
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