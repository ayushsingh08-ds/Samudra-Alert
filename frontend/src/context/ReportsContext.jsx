import React, { createContext, useContext, useReducer } from 'react';
import axios from '../api/config';

const ReportsContext = createContext();

const initialState = {
  reports: [],
  myReports: [],
  isLoading: false,
  error: null,
  filters: {
    status: 'all',
    hazardType: 'all',
    severity: 'all',
    dateRange: 'all',
  },
};

function reportsReducer(state, action) {
  switch (action.type) {
    case 'FETCH_REPORTS_START':
      return { ...state, isLoading: true, error: null };
    case 'FETCH_REPORTS_SUCCESS':
      return { ...state, isLoading: false, reports: action.payload };
    case 'FETCH_MY_REPORTS_SUCCESS':
      return { ...state, isLoading: false, myReports: action.payload };
    case 'FETCH_REPORTS_ERROR':
      return { ...state, isLoading: false, error: action.payload };
    case 'ADD_REPORT':
      return {
        ...state,
        reports: [action.payload, ...state.reports],
        myReports: [action.payload, ...state.myReports],
      };
    case 'UPDATE_REPORT':
      return {
        ...state,
        reports: state.reports.map(report =>
          report.id === action.payload.id ? action.payload : report
        ),
        myReports: state.myReports.map(report =>
          report.id === action.payload.id ? action.payload : report
        ),
      };
    case 'DELETE_REPORT':
      return {
        ...state,
        reports: state.reports.filter(report => report.id !== action.payload),
        myReports: state.myReports.filter(report => report.id !== action.payload),
      };
    case 'SET_FILTERS':
      return { ...state, filters: { ...state.filters, ...action.payload } };
    default:
      return state;
  }
}

export function ReportsProvider({ children }) {
  const [state, dispatch] = useReducer(reportsReducer, initialState);

  const fetchReports = async (filters = {}) => {
    dispatch({ type: 'FETCH_REPORTS_START' });
    try {
      const params = new URLSearchParams(filters);
      const response = await axios.get(`/reports?${params}`);
      dispatch({ type: 'FETCH_REPORTS_SUCCESS', payload: response.data });
    } catch (error) {
      dispatch({ type: 'FETCH_REPORTS_ERROR', payload: error.message });
    }
  };

  const fetchMyReports = async () => {
    dispatch({ type: 'FETCH_REPORTS_START' });
    try {
      const response = await axios.get('/reports/my');
      dispatch({ type: 'FETCH_MY_REPORTS_SUCCESS', payload: response.data });
    } catch (error) {
      dispatch({ type: 'FETCH_REPORTS_ERROR', payload: error.message });
    }
  };

  const createReport = async (reportData) => {
    try {
      const formData = new FormData();
      
      // Add text fields
      Object.keys(reportData).forEach(key => {
        if (key !== 'images' && key !== 'videos') {
          formData.append(key, reportData[key]);
        }
      });
      
      // Add media files
      if (reportData.images) {
        reportData.images.forEach((image, index) => {
          formData.append(`images`, image);
        });
      }
      
      if (reportData.videos) {
        reportData.videos.forEach((video, index) => {
          formData.append(`videos`, video);
        });
      }

      const response = await axios.post('/reports', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      dispatch({ type: 'ADD_REPORT', payload: response.data });
      return { success: true, data: response.data };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to create report';
      return { success: false, error: message };
    }
  };

  const updateReport = async (id, reportData) => {
    try {
      const response = await axios.put(`/reports/${id}`, reportData);
      dispatch({ type: 'UPDATE_REPORT', payload: response.data });
      return { success: true, data: response.data };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update report';
      return { success: false, error: message };
    }
  };

  const deleteReport = async (id) => {
    try {
      await axios.delete(`/reports/${id}`);
      dispatch({ type: 'DELETE_REPORT', payload: id });
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to delete report';
      return { success: false, error: message };
    }
  };

  const verifyReport = async (id, verificationData) => {
    try {
      const response = await axios.post(`/reports/${id}/verify`, verificationData);
      dispatch({ type: 'UPDATE_REPORT', payload: response.data });
      return { success: true, data: response.data };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to verify report';
      return { success: false, error: message };
    }
  };

  const setFilters = (newFilters) => {
    dispatch({ type: 'SET_FILTERS', payload: newFilters });
  };

  const getFilteredReports = () => {
    let filtered = state.reports;
    
    if (state.filters.status !== 'all') {
      filtered = filtered.filter(report => report.status === state.filters.status);
    }
    
    if (state.filters.hazardType !== 'all') {
      filtered = filtered.filter(report => report.hazardType === state.filters.hazardType);
    }
    
    if (state.filters.severity !== 'all') {
      filtered = filtered.filter(report => report.severity === state.filters.severity);
    }
    
    if (state.filters.dateRange !== 'all') {
      const now = new Date();
      const cutoffDate = new Date();
      
      switch (state.filters.dateRange) {
        case 'today':
          cutoffDate.setHours(0, 0, 0, 0);
          break;
        case 'week':
          cutoffDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          cutoffDate.setMonth(now.getMonth() - 1);
          break;
        default:
          return filtered; // Early return if no specific date range
      }
      
      filtered = filtered.filter(report => new Date(report.createdAt) >= cutoffDate);
    }
    
    return filtered;
  };

  const value = {
    reports: state.reports,
    myReports: state.myReports,
    filteredReports: getFilteredReports(),
    isLoading: state.isLoading,
    error: state.error,
    filters: state.filters,
    fetchReports,
    fetchMyReports,
    createReport,
    updateReport,
    deleteReport,
    verifyReport,
    setFilters,
  };

  return (
    <ReportsContext.Provider value={value}>
      {children}
    </ReportsContext.Provider>
  );
}

export const useReports = () => {
  const context = useContext(ReportsContext);
  if (!context) {
    throw new Error('useReports must be used within a ReportsProvider');
  }
  return context;
};