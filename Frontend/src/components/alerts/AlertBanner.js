import React from 'react';
import { useAlerts } from '../../contexts/AlertsContext';
import { AlertTriangle, X, Info, AlertCircle } from 'lucide-react';

const AlertBanner = () => {
  const { activeAlerts, notifications, removeNotification } = useAlerts();

  // Get the most critical active alert
  const criticalAlert = activeAlerts.find(alert => alert.severity === 'critical');
  const highAlert = activeAlerts.find(alert => alert.severity === 'high');
  const displayAlert = criticalAlert || highAlert;

  const getSeverityStyles = (severity) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-600 text-white';
      case 'high':
        return 'bg-orange-500 text-white';
      case 'medium':
        return 'bg-yellow-400 text-gray-900';
      case 'low':
        return 'bg-blue-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'critical':
        return <AlertTriangle className="h-5 w-5" />;
      case 'high':
        return <AlertCircle className="h-5 w-5" />;
      case 'medium':
        return <Info className="h-5 w-5" />;
      default:
        return <Info className="h-5 w-5" />;
    }
  };

  if (!displayAlert && notifications.length === 0) {
    return null;
  }

  return (
    <>
      {/* Critical/High Alert Banner */}
      {displayAlert && (
        <div className={`${getSeverityStyles(displayAlert.severity)} px-4 py-3`}>
          <div className="flex items-center justify-between max-w-7xl mx-auto">
            <div className="flex items-center space-x-3">
              {getSeverityIcon(displayAlert.severity)}
              <div>
                <span className="font-semibold">{displayAlert.title}</span>
                <span className="ml-2">{displayAlert.message}</span>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm opacity-90">
                {displayAlert.area}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Notification Toasts */}
      <div className="fixed top-20 right-4 z-50 space-y-2">
        {notifications.slice(0, 3).map((notification) => (
          <div
            key={notification.id}
            className={`max-w-sm w-full ${getSeverityStyles(notification.severity)} rounded-lg shadow-lg p-4 transform transition-all duration-300 ease-in-out`}
          >
            <div className="flex items-start">
              <div className="flex-shrink-0">
                {getSeverityIcon(notification.severity)}
              </div>
              <div className="ml-3 w-0 flex-1">
                <p className="text-sm font-medium">
                  {notification.title}
                </p>
                <p className="mt-1 text-sm opacity-90">
                  {notification.message}
                </p>
              </div>
              <div className="ml-4 flex-shrink-0 flex">
                <button
                  onClick={() => removeNotification(notification.id)}
                  className="inline-flex text-white hover:opacity-75 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default AlertBanner;