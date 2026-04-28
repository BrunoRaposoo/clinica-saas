'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { AuthUserResponse } from '@clinica-saas/contracts';
import { setTokens, clearTokens, getAccessToken, getRefreshToken, hasTokens, clearTokens as clientClearTokens } from '@/lib/api/client';

interface SessionContextType {
  user: AuthUserResponse | null;
  role: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  hasRole: (roles: string[]) => boolean;
  isRole: (role: string) => boolean;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUserResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedAccessToken = localStorage.getItem('accessToken');
    const storedRefreshToken = localStorage.getItem('refreshToken');

    if (storedUser && storedAccessToken && storedRefreshToken) {
      setUser(JSON.parse(storedUser));
      setTokens(storedAccessToken, storedRefreshToken);
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1'}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
      credentials: 'include',
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || 'Login failed');
    }

    const response = await res.json();
    
    localStorage.setItem('accessToken', response.accessToken);
    localStorage.setItem('refreshToken', response.refreshToken);
    localStorage.setItem('user', JSON.stringify(response.user));
    
    setTokens(response.accessToken, response.refreshToken);
    setUser(response.user);
  };

  const logout = async () => {
    const refreshToken = getRefreshToken();
    if (refreshToken) {
      try {
        await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1'}/auth/logout`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken }),
          credentials: 'include',
        });
      } catch (e) {
        console.error('Logout error:', e);
      }
    }
    
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    
    clientClearTokens();
    setUser(null);
  };

  const role = user?.roleName || null;

  const hasRole = (roles: string[]): boolean => {
    return role ? roles.includes(role) : false;
  };

  const isRole = (roleToCheck: string): boolean => {
    return role === roleToCheck;
  };

  return (
    <SessionContext.Provider
      value={{
        user,
        role,
        isLoading,
        isAuthenticated: !!user,
        login,
        logout,
        hasRole,
        isRole,
      }}
    >
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const context = useContext(SessionContext);
  if (!context) throw new Error('useSession must be used within SessionProvider');
  return context;
}