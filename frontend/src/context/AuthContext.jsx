import React, { createContext, useContext, useReducer, useEffect } from 'react';
import axios from '../api/config';

const AuthContext = createContext();

const initialState = {
  user: null,
  token: localStorage.getItem('token'),
  isLoading: true,
  error: null,
};

function authReducer(state, action) {
  switch (action.type) {
    case 'AUTH_START':
      return { ...state, isLoading: true, error: null };
    case 'AUTH_SUCCESS':
      return {
        ...state,
        isLoading: false,
        user: action.payload.user,
        token: action.payload.token,
        error: null,
      };
    case 'AUTH_ERROR':
      return { ...state, isLoading: false, error: action.payload, user: null, token: null };
    case 'LOGOUT':
      return { ...state, user: null, token: null, error: null };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    default:
      return state;
  }
}

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // Verify token with backend
      validateToken(token);
    } else {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  const validateToken = async (token) => {
    try {
      // Handle demo tokens for development
      if (token.startsWith('demo-token-')) {
        const role = token.replace('demo-token-', '');
        const demoUser = {
          id: Date.now(),
          name: `Demo ${role.charAt(0).toUpperCase() + role.slice(1)}`,
          email: `${role}@demo.com`,
          role,
        };
        dispatch({
          type: 'AUTH_SUCCESS',
          payload: { user: demoUser, token },
        });
        return;
      }

      const response = await axios.get('/auth/verify', {
        headers: { Authorization: `Bearer ${token}` },
      });
      dispatch({
        type: 'AUTH_SUCCESS',
        payload: { user: response.data.user, token },
      });
    } catch (error) {
      localStorage.removeItem('token');
      dispatch({ type: 'AUTH_ERROR', payload: 'Invalid token' });
    }
  };

  const login = async (credentials) => {
    dispatch({ type: 'AUTH_START' });
    try {
      const response = await axios.post('/auth/login', credentials);
      const { user, token } = response.data;
      
      localStorage.setItem('token', token);
      dispatch({ type: 'AUTH_SUCCESS', payload: { user, token } });
      
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed';
      dispatch({ type: 'AUTH_ERROR', payload: message });
      return { success: false, error: message };
    }
  };

  const register = async (userData) => {
    dispatch({ type: 'AUTH_START' });
    try {
      const response = await axios.post('/auth/register', userData);
      const { user, token } = response.data;
      
      localStorage.setItem('token', token);
      dispatch({ type: 'AUTH_SUCCESS', payload: { user, token } });
      
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed';
      dispatch({ type: 'AUTH_ERROR', payload: message });
      return { success: false, error: message };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    dispatch({ type: 'LOGOUT' });
  };

  const value = {
    user: state.user,
    token: state.token,
    isLoading: state.isLoading,
    error: state.error,
    isAuthenticated: !!state.user,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};