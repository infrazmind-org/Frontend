import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { apiFetch } from '../lib/api';

export interface User {
  id: number;
  email: string;
  first_name?: string;
  last_name?: string;
  role: string;
  status: string;
  credits: number;
  created_at?: string;
  terms_version?: string;
  terms_accepted_version?: string | null;
  terms_accepted_at?: string | null;
  terms_ack_required?: boolean;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  authReady: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => {
    try {
      return localStorage.getItem('token');
    } catch {
      return null;
    }
  });
  const [authReady, setAuthReady] = useState(false);

  const logout = useCallback(() => {
    try {
      localStorage.removeItem('token');
    } catch {
      /* ignore */
    }
    setToken(null);
    setUser(null);
  }, []);

  const refreshUser = useCallback(async () => {
    if (!token) {
      setAuthReady(true);
      return;
    }
    try {
      const res = await apiFetch('/api/user/me', { token });
      if (res.ok) {
        const data = await res.json();
        setUser(data);
      } else {
        logout();
      }
    } catch (error) {
      console.error('Failed to refresh user', error);
    } finally {
      setAuthReady(true);
    }
  }, [token, logout]);

  useEffect(() => {
    if (token) {
      setAuthReady(false);
      void refreshUser();
    } else {
      setUser(null);
      setAuthReady(true);
    }
  }, [token, refreshUser]);

  const login = (newToken: string, newUser: User) => {
    try {
      localStorage.setItem('token', newToken);
    } catch {
      /* ignore */
    }
    setToken(newToken);
    setUser(newUser);
    setAuthReady(true);
  };

  return (
    <AuthContext.Provider value={{ user, token, authReady, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
