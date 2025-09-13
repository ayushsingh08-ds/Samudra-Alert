import React, { createContext, useContext, useReducer } from 'react';

const AlertsContext = createContext();

const initialState = {
  alerts: [],
  activeAlerts: [],
  notifications: [],
  loading: false,
  error: null
};

function alertsReducer(state, action) {
  switch (action.type) {
    case 'FETCH_ALERTS_START':
      return { ...state, loading: true, error: null };
    case 'FETCH_ALERTS_SUCCESS':
      return {
        ...state,
        alerts: action.payload.alerts,
        activeAlerts: action.payload.alerts.filter(alert => alert.active),
        loading: false,
        error: null
      };
    case 'FETCH_ALERTS_FAILURE':
      return {
        ...state,
        loading: false,
        error: action.payload
      };
    case 'ADD_ALERT':
      const newAlert = action.payload;
      return {
        ...state,
        alerts: [newAlert, ...state.alerts],
        activeAlerts: newAlert.active 
          ? [newAlert, ...state.activeAlerts]
          : state.activeAlerts
      };
    case 'UPDATE_ALERT':
      const updatedAlert = action.payload;
      return {
        ...state,
        alerts: state.alerts.map(alert =>
          alert.id === updatedAlert.id ? updatedAlert : alert
        ),
        activeAlerts: state.activeAlerts.map(alert =>
          alert.id === updatedAlert.id ? updatedAlert : alert
        ).filter(alert => alert.active)
      };
    case 'DELETE_ALERT':
      return {
        ...state,
        alerts: state.alerts.filter(alert => alert.id !== action.payload),
        activeAlerts: state.activeAlerts.filter(alert => alert.id !== action.payload)
      };
    case 'ADD_NOTIFICATION':
      return {
        ...state,
        notifications: [action.payload, ...state.notifications]
      };
    case 'REMOVE_NOTIFICATION':
      return {
        ...state,
        notifications: state.notifications.filter(notif => notif.id !== action.payload)
      };
    case 'CLEAR_NOTIFICATIONS':
      return {
        ...state,
        notifications: []
      };
    default:
      return state;
  }
}

export function AlertsProvider({ children }) {
  const [state, dispatch] = useReducer(alertsReducer, initialState);

  const fetchAlerts = async () => {
    dispatch({ type: 'FETCH_ALERTS_START' });
    
    try {
      // Simulate API call - replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Mock data - replace with actual API response
      const mockAlerts = [
        {
          id: 1,
          title: 'Tsunami Warning',
          type: 'tsunami',
          severity: 'critical',
          area: 'West Coast',
          coordinates: { lat: 19.0760, lng: 72.8777, radius: 50 },
          message: 'Tsunami warning issued for West Coast. Evacuate immediately.',
          issuedAt: new Date('2024-01-15T09:00:00'),
          expiresAt: new Date('2024-01-15T18:00:00'),
          active: true,
          source: 'National Weather Service'
        },
        {
          id: 2,
          title: 'Storm Watch',
          type: 'storm',
          severity: 'medium',
          area: 'Mumbai Region',
          coordinates: { lat: 19.0760, lng: 72.8777, radius: 25 },
          message: 'Severe storm approaching Mumbai region. Take precautionary measures.',
          issuedAt: new Date('2024-01-15T12:00:00'),
          expiresAt: new Date('2024-01-16T06:00:00'),
          active: true,
          source: 'Regional Weather Center'
        }
      ];

      dispatch({ type: 'FETCH_ALERTS_SUCCESS', payload: { alerts: mockAlerts } });
    } catch (error) {
      dispatch({ type: 'FETCH_ALERTS_FAILURE', payload: error.message });
    }
  };

  const addAlert = (alert) => {
    const newAlert = {
      ...alert,
      id: Date.now(),
      issuedAt: new Date(),
      active: true
    };
    dispatch({ type: 'ADD_ALERT', payload: newAlert });
    
    // Also add as notification
    addNotification({
      type: 'alert',
      title: `New ${alert.severity} Alert`,
      message: alert.title,
      severity: alert.severity
    });
  };

  const updateAlert = (alertId, updates) => {
    const existingAlert = state.alerts.find(a => a.id === alertId);
    const updatedAlert = { ...existingAlert, ...updates };
    dispatch({ type: 'UPDATE_ALERT', payload: updatedAlert });
  };

  const deleteAlert = (alertId) => {
    dispatch({ type: 'DELETE_ALERT', payload: alertId });
  };

  const addNotification = (notification) => {
    const newNotification = {
      ...notification,
      id: Date.now(),
      timestamp: new Date(),
      read: false
    };
    dispatch({ type: 'ADD_NOTIFICATION', payload: newNotification });
    
    // Auto-remove notification after 5 seconds for non-critical alerts
    if (notification.severity !== 'critical') {
      setTimeout(() => {
        removeNotification(newNotification.id);
      }, 5000);
    }
  };

  const removeNotification = (notificationId) => {
    dispatch({ type: 'REMOVE_NOTIFICATION', payload: notificationId });
  };

  const clearNotifications = () => {
    dispatch({ type: 'CLEAR_NOTIFICATIONS' });
  };

  const value = {
    ...state,
    fetchAlerts,
    addAlert,
    updateAlert,
    deleteAlert,
    addNotification,
    removeNotification,
    clearNotifications
  };

  return (
    <AlertsContext.Provider value={value}>
      {children}
    </AlertsContext.Provider>
  );
}

export function useAlerts() {
  const context = useContext(AlertsContext);
  if (!context) {
    throw new Error('useAlerts must be used within an AlertsProvider');
  }
  return context;
}