import React, { createContext, useContext, useReducer, useEffect } from 'react';

const AuthContext = createContext();

const initialState = {
  user: null,
  isAuthenticated: false,
  role: null, // 'citizen', 'analyst', 'admin'
  loading: true,
  error: null
};

function authReducer(state, action) {
  switch (action.type) {
    case 'LOGIN_START':
      return { ...state, loading: true, error: null };
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        role: action.payload.role,
        isAuthenticated: true,
        loading: false,
        error: null
      };
    case 'LOGIN_FAILURE':
      return {
        ...state,
        user: null,
        role: null,
        isAuthenticated: false,
        loading: false,
        error: action.payload
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        role: null,
        isAuthenticated: false,
        loading: false,
        error: null
      };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    default:
      return state;
  }
}

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Simulate checking for stored auth on app load
  useEffect(() => {
    const checkAuth = () => {
      const storedUser = localStorage.getItem('samudra_user');
      const storedRole = localStorage.getItem('samudra_role');
      
      if (storedUser && storedRole) {
        dispatch({
          type: 'LOGIN_SUCCESS',
          payload: {
            user: JSON.parse(storedUser),
            role: storedRole
          }
        });
      } else {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    checkAuth();
  }, []);

  const login = async (credentials) => {
    dispatch({ type: 'LOGIN_START' });
    
    try {
      // Simulate API call - replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock login logic - replace with actual authentication
      const mockUser = {
        id: 1,
        email: credentials.email,
        name: credentials.email.split('@')[0],
        avatar: null
      };
      
      const mockRole = credentials.email.includes('admin') ? 'admin' 
                     : credentials.email.includes('analyst') ? 'analyst' 
                     : 'citizen';

      localStorage.setItem('samudra_user', JSON.stringify(mockUser));
      localStorage.setItem('samudra_role', mockRole);

      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: { user: mockUser, role: mockRole }
      });

      return { success: true };
    } catch (error) {
      dispatch({
        type: 'LOGIN_FAILURE',
        payload: error.message
      });
      return { success: false, error: error.message };
    }
  };

  const logout = () => {
    localStorage.removeItem('samudra_user');
    localStorage.removeItem('samudra_role');
    dispatch({ type: 'LOGOUT' });
  };

  const value = {
    ...state,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}