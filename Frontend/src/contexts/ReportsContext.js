import React, { createContext, useContext, useReducer } from 'react';

const ReportsContext = createContext();

const initialState = {
  reports: [],
  selectedReport: null,
  filters: {
    status: 'all', // 'all', 'pending', 'verified', 'rejected'
    type: 'all', // 'all', 'flood', 'storm', 'tsunami', 'pollution'
    dateRange: 'all' // 'all', 'today', 'week', 'month'
  },
  loading: false,
  error: null
};

function reportsReducer(state, action) {
  switch (action.type) {
    case 'FETCH_REPORTS_START':
      return { ...state, loading: true, error: null };
    case 'FETCH_REPORTS_SUCCESS':
      return {
        ...state,
        reports: action.payload,
        loading: false,
        error: null
      };
    case 'FETCH_REPORTS_FAILURE':
      return {
        ...state,
        loading: false,
        error: action.payload
      };
    case 'ADD_REPORT':
      return {
        ...state,
        reports: [action.payload, ...state.reports]
      };
    case 'UPDATE_REPORT':
      return {
        ...state,
        reports: state.reports.map(report =>
          report.id === action.payload.id ? action.payload : report
        )
      };
    case 'DELETE_REPORT':
      return {
        ...state,
        reports: state.reports.filter(report => report.id !== action.payload)
      };
    case 'SET_SELECTED_REPORT':
      return { ...state, selectedReport: action.payload };
    case 'SET_FILTERS':
      return {
        ...state,
        filters: { ...state.filters, ...action.payload }
      };
    case 'CLEAR_FILTERS':
      return {
        ...state,
        filters: initialState.filters
      };
    default:
      return state;
  }
}

export function ReportsProvider({ children }) {
  const [state, dispatch] = useReducer(reportsReducer, initialState);

  const fetchReports = async (filters = {}) => {
    dispatch({ type: 'FETCH_REPORTS_START' });
    
    try {
      // Simulate API call - replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock data - replace with actual API response
      const mockReports = [
        {
          id: 1,
          title: 'Severe Flooding in Downtown',
          type: 'flood',
          status: 'verified',
          severity: 'high',
          location: { lat: 19.0760, lng: 72.8777, address: 'Mumbai, India' },
          reportedBy: 'citizen123',
          reportedAt: new Date('2024-01-15T10:30:00'),
          description: 'Heavy rainfall causing severe flooding in downtown area',
          images: ['flood1.jpg', 'flood2.jpg'],
          verified: true,
          verifiedBy: 'analyst456',
          verifiedAt: new Date('2024-01-15T11:00:00')
        },
        {
          id: 2,
          title: 'Oil Spill Near Coast',
          type: 'pollution',
          status: 'pending',
          severity: 'medium',
          location: { lat: 18.9220, lng: 72.8347, address: 'Bandra Coast, Mumbai' },
          reportedBy: 'citizen789',
          reportedAt: new Date('2024-01-15T14:20:00'),
          description: 'Spotted oil spill affecting marine life',
          images: ['spill1.jpg'],
          verified: false
        }
      ];

      dispatch({ type: 'FETCH_REPORTS_SUCCESS', payload: mockReports });
    } catch (error) {
      dispatch({ type: 'FETCH_REPORTS_FAILURE', payload: error.message });
    }
  };

  const addReport = (report) => {
    const newReport = {
      ...report,
      id: Date.now(),
      reportedAt: new Date(),
      status: 'pending',
      verified: false
    };
    dispatch({ type: 'ADD_REPORT', payload: newReport });
  };

  const updateReport = (reportId, updates) => {
    const updatedReport = {
      ...state.reports.find(r => r.id === reportId),
      ...updates
    };
    dispatch({ type: 'UPDATE_REPORT', payload: updatedReport });
  };

  const deleteReport = (reportId) => {
    dispatch({ type: 'DELETE_REPORT', payload: reportId });
  };

  const setSelectedReport = (report) => {
    dispatch({ type: 'SET_SELECTED_REPORT', payload: report });
  };

  const setFilters = (newFilters) => {
    dispatch({ type: 'SET_FILTERS', payload: newFilters });
  };

  const clearFilters = () => {
    dispatch({ type: 'CLEAR_FILTERS' });
  };

  const value = {
    ...state,
    fetchReports,
    addReport,
    updateReport,
    deleteReport,
    setSelectedReport,
    setFilters,
    clearFilters
  };

  return (
    <ReportsContext.Provider value={value}>
      {children}
    </ReportsContext.Provider>
  );
}

export function useReports() {
  const context = useContext(ReportsContext);
  if (!context) {
    throw new Error('useReports must be used within a ReportsProvider');
  }
  return context;
}