import React, { createContext, useContext, useReducer, useEffect } from 'react';
import axios from '../api/config';

const AlertsContext = createContext();

const initialState = {
  alerts: [],
  notifications: [],
  isLoading: false,
  error: null,
};

function alertsReducer(state, action) {
  switch (action.type) {
    case 'FETCH_ALERTS_START':
      return { ...state, isLoading: true, error: null };
    case 'FETCH_ALERTS_SUCCESS':
      return { ...state, isLoading: false, alerts: action.payload };
    case 'FETCH_ALERTS_ERROR':
      return { ...state, isLoading: false, error: action.payload };
    case 'ADD_ALERT':
      return { ...state, alerts: [action.payload, ...state.alerts] };
    case 'UPDATE_ALERT':
      return {
        ...state,
        alerts: state.alerts.map(alert =>
          alert.id === action.payload.id ? action.payload : alert
        ),
      };
    case 'DELETE_ALERT':
      return {
        ...state,
        alerts: state.alerts.filter(alert => alert.id !== action.payload),
      };
    case 'ADD_NOTIFICATION':
      return {
        ...state,
        notifications: [action.payload, ...state.notifications.slice(0, 9)], // Keep only 10 most recent
      };
    case 'REMOVE_NOTIFICATION':
      return {
        ...state,
        notifications: state.notifications.filter(notif => notif.id !== action.payload),
      };
    case 'CLEAR_NOTIFICATIONS':
      return { ...state, notifications: [] };
    default:
      return state;
  }
}

export function AlertsProvider({ children }) {
  const [state, dispatch] = useReducer(alertsReducer, initialState);

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    dispatch({ type: 'FETCH_ALERTS_START' });
    try {
      const response = await axios.get('/alerts');
      dispatch({ type: 'FETCH_ALERTS_SUCCESS', payload: response.data });
    } catch (error) {
      dispatch({ type: 'FETCH_ALERTS_ERROR', payload: error.message });
    }
  };

  const createAlert = async (alertData) => {
    try {
      const response = await axios.post('/alerts', alertData);
      dispatch({ type: 'ADD_ALERT', payload: response.data });
      addNotification({
        type: 'success',
        title: 'Alert Created',
        message: 'New alert has been created successfully.',
      });
      return { success: true, data: response.data };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to create alert';
      addNotification({
        type: 'error',
        title: 'Error',
        message,
      });
      return { success: false, error: message };
    }
  };

  const updateAlert = async (id, alertData) => {
    try {
      const response = await axios.put(`/alerts/${id}`, alertData);
      dispatch({ type: 'UPDATE_ALERT', payload: response.data });
      addNotification({
        type: 'success',
        title: 'Alert Updated',
        message: 'Alert has been updated successfully.',
      });
      return { success: true, data: response.data };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update alert';
      addNotification({
        type: 'error',
        title: 'Error',
        message,
      });
      return { success: false, error: message };
    }
  };

  const deleteAlert = async (id) => {
    try {
      await axios.delete(`/alerts/${id}`);
      dispatch({ type: 'DELETE_ALERT', payload: id });
      addNotification({
        type: 'success',
        title: 'Alert Deleted',
        message: 'Alert has been deleted successfully.',
      });
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to delete alert';
      addNotification({
        type: 'error',
        title: 'Error',
        message,
      });
      return { success: false, error: message };
    }
  };

  const addNotification = (notification) => {
    const id = Date.now().toString();
    dispatch({
      type: 'ADD_NOTIFICATION',
      payload: { ...notification, id, timestamp: new Date() },
    });
    
    // Auto-remove notification after 5 seconds
    setTimeout(() => {
      dispatch({ type: 'REMOVE_NOTIFICATION', payload: id });
    }, 5000);
  };

  const removeNotification = (id) => {
    dispatch({ type: 'REMOVE_NOTIFICATION', payload: id });
  };

  const clearNotifications = () => {
    dispatch({ type: 'CLEAR_NOTIFICATIONS' });
  };

  const value = {
    alerts: state.alerts,
    notifications: state.notifications,
    isLoading: state.isLoading,
    error: state.error,
    fetchAlerts,
    createAlert,
    updateAlert,
    deleteAlert,
    addNotification,
    removeNotification,
    clearNotifications,
  };

  return (
    <AlertsContext.Provider value={value}>
      {children}
    </AlertsContext.Provider>
  );
}

export const useAlerts = () => {
  const context = useContext(AlertsContext);
  if (!context) {
    throw new Error('useAlerts must be used within an AlertsProvider');
  }
  return context;
};