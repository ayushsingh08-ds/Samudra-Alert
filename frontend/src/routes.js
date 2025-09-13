// Centralized route definitions for the application
export const routes = {
  // Public routes
  login: '/login',
  register: '/register',
  
  // Citizen routes
  citizen: {
    base: '/citizen',
    dashboard: '/citizen/dashboard',
    report: '/citizen/report',
    myReports: '/citizen/my-reports',
    alerts: '/citizen/alerts',
  },
  
  // Analyst routes
  analyst: {
    base: '/analyst',
    dashboard: '/analyst/dashboard',
    reports: '/analyst/reports',
    map: '/analyst/map',
    analytics: '/analyst/analytics',
  },
  
  // Admin routes
  admin: {
    base: '/admin',
    dashboard: '/admin/dashboard',
    users: '/admin/users',
    settings: '/admin/settings',
    alerts: '/admin/alerts',
  },
};

// Helper function to get default redirect based on user role
export const getDefaultRedirect = (role) => {
  switch (role) {
    case 'admin':
      return routes.admin.dashboard;
    case 'analyst':
      return routes.analyst.dashboard;
    case 'citizen':
    default:
      return routes.citizen.dashboard;
  }
};