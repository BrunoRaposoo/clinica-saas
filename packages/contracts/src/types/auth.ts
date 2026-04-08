export interface AuthUser {
  id: string;
  email: string;
  name: string;
  organizationId?: string | null;
  roleId: string;
  roleName: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: AuthUser;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  organizationId?: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  accessToken: string;
  expiresIn: number;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

export interface LogoutResponse {
  success: boolean;
}

export interface TokenPayload {
  sub: string;
  email: string;
  name: string;
  organizationId?: string;
  roleId: string;
  roleName: string;
  jti: string;
  iat: number;
  exp: number;
}