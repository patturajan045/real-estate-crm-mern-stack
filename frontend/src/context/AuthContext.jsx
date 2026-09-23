import React, { createContext, useContext, useState, useEffect } from 'react';
import authService from '../services/authService';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('crm_jwt_token'));
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('crm_user_profile');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function verifyAuth() {
      const storedToken = localStorage.getItem('crm_jwt_token');
      if (storedToken) {
        try {
          const res = await authService.getMe();
          if (res.status === 'success' && res.data) {
            setUser(res.data);
            localStorage.setItem('crm_user_profile', JSON.stringify(res.data));
          } else {
            clearAuth();
          }
        } catch {
          clearAuth();
        }
      } else {
        clearAuth();
      }
      setLoading(false);
    }
    verifyAuth();
  }, []);

  const clearAuth = () => {
    localStorage.removeItem('crm_jwt_token');
    localStorage.removeItem('crm_user_profile');
    setToken(null);
    setUser(null);
  };

  const login = async (credentials) => {
    const res = await authService.login(credentials);
    if (res.status === 'success' && res.token) {
      localStorage.setItem('crm_jwt_token', res.token);
      localStorage.setItem('crm_user_profile', JSON.stringify(res.user));
      setToken(res.token);
      setUser(res.user);
    }
    return res;
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch {
      // Ignore network errors on logout
    } finally {
      clearAuth();
    }
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('crm_user_profile', JSON.stringify(updatedUser));
  };

  const hasRole = (allowedRoles) => {
    if (!user) return false;
    if (!allowedRoles || allowedRoles.length === 0) return true;
    return allowedRoles.includes(user.role);
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        loading,
        login,
        logout,
        updateUser,
        hasRole,
        isAuthenticated: !!token && !!user,
      }}
    >
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
