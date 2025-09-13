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
          reportedBy: 'citizen',
          reportedAt: new Date('2024-01-15T10:30:00'),
          description: 'Heavy rainfall causing severe flooding in downtown area. Water level reaching up to 3 feet in some areas. Multiple vehicles stranded.',
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
          reportedBy: 'citizen',
          reportedAt: new Date('2024-01-15T14:20:00'),
          description: 'Spotted oil spill affecting marine life. Approximately 500 meters of coastline affected. Dead fish observed.',
          images: ['spill1.jpg'],
          verified: false
        },
        {
          id: 3,
          title: 'Storm Damage at Harbor',
          type: 'storm',
          status: 'verified',
          severity: 'high',
          location: { lat: 19.0896, lng: 72.8656, address: 'Mumbai Harbor' },
          reportedBy: 'citizen',
          reportedAt: new Date('2024-01-14T22:45:00'),
          description: 'Severe storm damage to harbor infrastructure. Multiple boats damaged, pier partially destroyed.',
          images: ['storm1.jpg', 'storm2.jpg', 'storm3.jpg'],
          verified: true,
          verifiedBy: 'analyst123',
          verifiedAt: new Date('2024-01-15T08:00:00')
        },
        {
          id: 4,
          title: 'Chemical Contamination',
          type: 'pollution',
          status: 'pending',
          severity: 'medium',
          location: { lat: 19.0330, lng: 72.8570, address: 'Worli, Mumbai' },
          reportedBy: 'citizen',
          reportedAt: new Date('2024-01-16T09:15:00'),
          description: 'Chemical contamination observed in water near industrial area. Strong chemical odor reported.',
          images: ['chemical1.jpg'],
          verified: false
        },
        {
          id: 5,
          title: 'Minor Flooding',
          type: 'flood',
          status: 'verified',
          severity: 'low',
          location: { lat: 19.0176, lng: 72.8562, address: 'Colaba, Mumbai' },
          reportedBy: 'citizen',
          reportedAt: new Date('2024-01-13T16:30:00'),
          description: 'Minor flooding due to high tide. Water receding, no immediate danger.',
          images: [],
          verified: true,
          verifiedBy: 'analyst789',
          verifiedAt: new Date('2024-01-13T18:00:00')
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