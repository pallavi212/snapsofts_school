import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check local storage for session
    const storedUser = localStorage.getItem('school_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (role, email, password) => {
    try {
      if (!email || !password) throw new Error('Email and password required');
      const data = await authApi.login({ email, password, role });
      
      const loggedUser = {
        ...data.user,
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(data.user.name)}&background=random`
      };
      
      setUser(loggedUser);
      localStorage.setItem('school_token', data.token);
      localStorage.setItem('school_user', JSON.stringify(loggedUser));
      return { success: true };
    } catch (e) {
      console.error("Login failed:", e);
      return { success: false, error: e.message };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('school_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user, loading }}>
        {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
