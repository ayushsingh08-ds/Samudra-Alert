import React, { useEffect } from 'react';
import { useAlerts } from '../../contexts/AlertsContext';
import DashboardLayout from '../../layouts/DashboardLayout';
import EmptyState from '../../components/common/EmptyState';
import { 
  AlertTriangle, 
  MapPin, 
  Calendar, 
  Clock,
  Info,
  CheckCircle
} from 'lucide-react';

const Alerts = () => {
  const { alerts, activeAlerts, fetchAlerts } = useAlerts();

  useEffect(() => {
    fetchAlerts();
  }, [fetchAlerts]);

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'critical':
        return <AlertTriangle className="h-5 w-5 text-red-600" />;
      case 'high':
        return <AlertTriangle className="h-5 w-5 text-orange-600" />;
      case 'medium':
        return <Info className="h-5 w-5 text-yellow-600" />;
      case 'low':
        return <Info className="h-5 w-5 text-blue-600" />;
      default:
        return <Info className="h-5 w-5 text-gray-600" />;
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-50 border-red-200';
      case 'high':
        return 'bg-orange-50 border-orange-200';
      case 'medium':
        return 'bg-yellow-50 border-yellow-200';
      case 'low':
        return 'bg-blue-50 border-blue-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const getStatusColor = (active) => {
    return active 
      ? 'text-green-700 bg-green-100' 
      : 'text-gray-700 bg-gray-100';
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString();
  };

  const isExpired = (alert) => {
    return alert.expiresAt && new Date(alert.expiresAt) < new Date();
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Alert Center</h1>
          <p className="text-gray-600 mt-1">
            Stay informed about ocean hazards and emergency alerts in your area
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="bg-red-500 rounded-md p-3">
                <AlertTriangle className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Alerts</p>
                <p className="text-2xl font-semibold text-gray-900">{activeAlerts.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="bg-yellow-500 rounded-md p-3">
                <Calendar className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Alerts</p>
                <p className="text-2xl font-semibold text-gray-900">{alerts.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="bg-blue-500 rounded-md p-3">
                <CheckCircle className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Critical Alerts</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {alerts.filter(a => a.severity === 'critical').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Active Alerts */}
        {activeAlerts.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Active Alerts</h2>
            <div className="space-y-4">
              {activeAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`p-6 border rounded-lg ${getSeverityColor(alert.severity)}`}
                >
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 mt-1">
                      {getSeverityIcon(alert.severity)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            {alert.title}
                          </h3>
                          <p className="text-gray-700 mb-4">{alert.message}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(alert.active)}`}>
                            {alert.active ? 'Active' : 'Inactive'}
                          </span>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 capitalize">
                            {alert.severity}
                          </span>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 mt-4">
                        <div className="flex items-center space-x-2">
                          <MapPin className="h-4 w-4" />
                          <span>{alert.area}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4" />
                          <span>Issued: {formatDate(alert.issuedAt)}</span>
                        </div>
                        {alert.expiresAt && (
                          <div className="flex items-center space-x-2">
                            <Clock className="h-4 w-4" />
                            <span>Expires: {formatDate(alert.expiresAt)}</span>
                          </div>
                        )}
                      </div>
                      
                      {alert.source && (
                        <div className="mt-3 text-xs text-gray-500">
                          Source: {alert.source}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* All Alerts */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">All Alerts</h2>
          {alerts.length > 0 ? (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="divide-y divide-gray-200">
                {alerts.map((alert) => (
                  <div key={alert.id} className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4 flex-1">
                        <div className="flex-shrink-0 mt-1">
                          {getSeverityIcon(alert.severity)}
                        </div>
                        <div className="flex-1">
                          <h3 className="text-base font-medium text-gray-900 mb-1">
                            {alert.title}
                          </h3>
                          <p className="text-sm text-gray-600 mb-2">{alert.message}</p>
                          <div className="flex items-center space-x-4 text-xs text-gray-500">
                            <div className="flex items-center space-x-1">
                              <MapPin className="h-3 w-3" />
                              <span>{alert.area}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Calendar className="h-3 w-3" />
                              <span>{formatDate(alert.issuedAt)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          isExpired(alert) ? 'bg-gray-100 text-gray-800' :
                          alert.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {isExpired(alert) ? 'Expired' : alert.active ? 'Active' : 'Inactive'}
                        </span>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 capitalize">
                          {alert.severity}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <EmptyState
              icon={AlertTriangle}
              title="No alerts available"
              description="There are currently no alerts for your area. We'll notify you when new alerts are issued."
            />
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Alerts;