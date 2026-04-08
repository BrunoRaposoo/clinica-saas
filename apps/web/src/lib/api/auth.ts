import { LoginInput, LoginResponsePayload, ForgotPasswordInput, ResetPasswordInput } from '@clinica-saas/contracts';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

export interface AuthApiClient {
  login(data: LoginInput): Promise<LoginResponsePayload>;
  register(data: { email: string; password: string; name: string; organizationId?: string }): Promise<LoginResponsePayload>;
  logout(refreshToken: string): Promise<void>;
  refreshToken(refreshToken: string): Promise<{ accessToken: string; expiresIn: number }>;
  forgotPassword(data: ForgotPasswordInput): Promise<{ success: boolean; message: string }>;
  resetPassword(data: ResetPasswordInput): Promise<{ success: boolean; message: string }>;
}

export const authApi: AuthApiClient = {
  async login(data) {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
      credentials: 'include',
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || 'Login failed');
    }
    return res.json();
  },

  async register(data) {
    const res = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
      credentials: 'include',
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || 'Registration failed');
    }
    return res.json();
  },

  async logout(refreshToken) {
    const res = await fetch(`${API_URL}/auth/logout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
      credentials: 'include',
    });
    if (!res.ok) {
      throw new Error('Logout failed');
    }
  },

  async refreshToken(refreshToken) {
    const res = await fetch(`${API_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
      credentials: 'include',
    });
    if (!res.ok) {
      throw new Error('Token refresh failed');
    }
    return res.json();
  },

  async forgotPassword(data) {
    const res = await fetch(`${API_URL}/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async resetPassword(data) {
    const res = await fetch(`${API_URL}/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || 'Password reset failed');
    }
    return res.json();
  },
};