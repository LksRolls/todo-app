'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';
import api, { setAccessToken, getAccessToken } from './api';

interface User {
  id: string;
  email: string;
  displayName: string;
  avatarUrl?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, displayName: string) => Promise<void>;
  logout: () => Promise<void>;
  setTokenFromUrl: (token: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchMe = useCallback(async () => {
    try {
      const res = await api.get('/auth/me');
      setUser(res.data.data);
    } catch {
      setUser(null);
      setAccessToken(null);
    }
  }, []);

  // Try to restore session on mount
  useEffect(() => {
    const init = async () => {
      // Check for token from Google OAuth redirect
      if (typeof window !== 'undefined') {
        const params = new URLSearchParams(window.location.search);
        const token = params.get('token');
        if (token) {
          setAccessToken(token);
          window.history.replaceState({}, '', window.location.pathname);
        }
      }

      if (getAccessToken()) {
        await fetchMe();
      } else {
        // Try refreshing the token
        try {
          const res = await api.post('/auth/refresh');
          setAccessToken(res.data.data.accessToken);
          await fetchMe();
        } catch {
          // Not authenticated
        }
      }
      setLoading(false);
    };
    init();
  }, [fetchMe]);

  const login = async (email: string, password: string) => {
    const res = await api.post('/auth/login', { email, password });
    setAccessToken(res.data.data.accessToken);
    await fetchMe();
  };

  const register = async (
    email: string,
    password: string,
    displayName: string,
  ) => {
    const res = await api.post('/auth/register', {
      email,
      password,
      displayName,
    });
    setAccessToken(res.data.data.accessToken);
    await fetchMe();
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // Ignore errors
    }
    setAccessToken(null);
    setUser(null);
  };

  const setTokenFromUrl = (token: string) => {
    setAccessToken(token);
    fetchMe();
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, login, register, logout, setTokenFromUrl }}
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
