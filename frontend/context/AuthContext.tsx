'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { API_URL } from '../lib/api';

// Struktur Data User
interface User {
  id: number;
  username: string;
  email: string;
  tier: string;
  thrift_tokens: number;
  wallet_address: string;
}

// Definisi Tipe untuk Context
interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  register: (username: string, email: string, password: string) => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('auth_token');
    const storedUser = localStorage.getItem('auth_user');
    
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  // Fungsi Login
  const login = async (username: string, password: string) => {
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ username, password }),
      });

      if (!res.ok) {
        let errText = 'Login failed';
        try {
          const errData = await res.json();
          errText = errData.detail || errText;
        } catch {
          errText = await res.text();
        }
        throw new Error(errText);
      }

      const data = await res.json();
      
      const userData = await fetch(`${API_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${data.access_token}` },
      }).then((r) => r.json());

      setToken(data.access_token);
      setUser(userData);
      localStorage.setItem('auth_token', data.access_token);
      localStorage.setItem('auth_user', JSON.stringify(userData));
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  // Fungsi Logout
  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
  };

  // Fungsi Registrasi
  const register = async (username: string, email: string, password: string) => {
    try {
      const walletAddress = `THFT-${Math.random().toString(36).slice(2, 10).toUpperCase()}-${Date.now()}`;
      
      const res = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          username, 
          email, 
          password,
          wallet_address: walletAddress 
        }),
      });

      if (!res.ok) {
        let errText = 'Registration failed';
        try {
          const errData = await res.json();
          errText = errData.detail || errText;
        } catch {
          errText = await res.text();
        }
        throw new Error(errText);
      }

      await login(username, password);
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!token,
        login,
        logout,
        register,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
