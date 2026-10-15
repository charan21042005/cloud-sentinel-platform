'use client';

import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authApi } from '../api';
import { User, LoginCredentials } from '../types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  sessionCheckFailed: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  refreshUser: () => Promise<User>;
  retrySessionCheck: () => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sessionCheckFailed, setSessionCheckFailed] = useState(false);
  const router = useRouter();

  const retrySessionCheck = useCallback(async () => {
    setIsLoading(true);
    setSessionCheckFailed(false);
    const token = localStorage.getItem('token');
    if (!token) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    try {
      const userData = await authApi.getMe();
      // Ignore a response from an old session if the user logged in again
      // while this profile request was still in flight.
      if (localStorage.getItem('token') === token) {
        setUser(userData);
      }
    } catch (error) {
      // A transient network/server failure is not proof that the token is invalid.
      if (localStorage.getItem('token') === token) {
        const status = (error as { response?: { status?: number } })?.response?.status;
        if (status === 401) {
          localStorage.removeItem('token');
          setUser(null);
        } else {
          setSessionCheckFailed(true);
        }
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => void retrySessionCheck(), 0);
    return () => window.clearTimeout(timer);
  }, [retrySessionCheck]);

  const login = async (credentials: LoginCredentials) => {
    setSessionCheckFailed(false);
    const { access_token } = await authApi.login(credentials);
    localStorage.setItem('token', access_token);
    const userData = await authApi.getMe();
    setUser(userData);
    router.push('/dashboard');
  };

  const refreshUser = async () => {
    const userData = await authApi.getMe();
    setUser(userData);
    return userData;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setSessionCheckFailed(false);
    router.push('/auth/login');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        sessionCheckFailed,
        login,
        refreshUser,
        retrySessionCheck,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
