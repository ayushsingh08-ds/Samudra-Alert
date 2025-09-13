import React, { useState } from 'react';
import { Link, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const { login, isAuthenticated, user } = useAuth();
  const location = useLocation();

  const from = location.state?.from?.pathname || getDefaultRedirect(user?.role);

  if (isAuthenticated) {
    return <Navigate to={from} replace />;
  }

  function getDefaultRedirect(role) {
    switch (role) {
      case 'admin':
        return '/admin/dashboard';
      case 'analyst':
        return '/analyst/dashboard';
      case 'citizen':
      default:
        return '/citizen/dashboard';
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const result = await login(formData);
    
    if (!result.success) {
      setError(result.error);
    }
    
    setIsLoading(false);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Demo login functions for testing
  const demoLogin = async (role) => {
    setIsLoading(true);
    setError('');
    
    // Simulate demo login (in real app, this would call actual API)
    setTimeout(() => {
      // Simulate successful login
      localStorage.setItem('token', 'demo-token-' + role);
      window.location.reload(); // This will trigger auth context to update
    }, 1000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-ocean-50 to-ocean-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="mx-auto h-20 w-20 flex items-center justify-center rounded-full bg-ocean-600 text-white text-3xl">
            🌊
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to Samudra Alert
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Ocean Hazard Reporting Platform
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="alert-error">
              {error}
            </div>
          )}
          
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email" className="sr-only">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-ocean-500 focus:border-ocean-500 focus:z-10 sm:text-sm"
                placeholder="Email address"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-ocean-500 focus:border-ocean-500 focus:z-10 sm:text-sm"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full flex justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                'Sign in'
              )}
            </button>
          </div>

          <div className="text-center">
            <Link
              to="/register"
              className="font-medium text-ocean-600 hover:text-ocean-500"
            >
              Don't have an account? Sign up
            </Link>
          </div>
        </form>

        {/* Demo Login Section */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-center text-sm text-gray-600 mb-4">
            Quick Demo Access
          </p>
          <div className="space-y-2">
            <button
              onClick={() => demoLogin('citizen')}
              disabled={isLoading}
              className="w-full btn-secondary text-sm"
            >
              Demo as Citizen
            </button>
            <button
              onClick={() => demoLogin('analyst')}
              disabled={isLoading}
              className="w-full btn-secondary text-sm"
            >
              Demo as Analyst
            </button>
            <button
              onClick={() => demoLogin('admin')}
              disabled={isLoading}
              className="w-full btn-secondary text-sm"
            >
              Demo as Admin
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;