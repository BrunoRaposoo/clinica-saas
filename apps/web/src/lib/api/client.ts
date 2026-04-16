const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

let accessToken: string | null = null;
let refreshToken: string | null = null;
let isRefreshing = false;
let refreshPromise: Promise<boolean> | null = null;

export function setTokens(newAccessToken: string, newRefreshToken: string) {
  accessToken = newAccessToken;
  refreshToken = newRefreshToken;
  if (typeof window !== 'undefined') {
    localStorage.setItem('accessToken', newAccessToken);
    localStorage.setItem('refreshToken', newRefreshToken);
  }
}

export function clearTokens() {
  accessToken = null;
  refreshToken = null;
  if (typeof window !== 'undefined') {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  }
}

export function getAccessToken(): string | null {
  if (accessToken) return accessToken;
  if (typeof window !== 'undefined') {
    return localStorage.getItem('accessToken');
  }
  return null;
}

export function getRefreshToken(): string | null {
  if (refreshToken) return refreshToken;
  if (typeof window !== 'undefined') {
    return localStorage.getItem('refreshToken');
  }
  return null;
}

export function hasTokens(): boolean {
  return !!getAccessToken() && !!getRefreshToken();
}

async function refreshAccessToken(): Promise<boolean> {
  const rt = getRefreshToken();
  if (!rt) {
    console.warn('[Auth] Refresh token não disponível');
    return false;
  }
  
  if (isRefreshing && refreshPromise) {
    console.log('[Auth] Aguardando refresh em andamento');
    return refreshPromise;
  }

  isRefreshing = true;
  refreshPromise = (async () => {
    try {
      console.log('[Auth] Iniciando refresh token...');
      
      const res = await fetch(`${API_URL}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: rt }),
        credentials: 'include',
      });

      if (!res.ok) {
        console.error('[Auth] Refresh falhou:', res.status);
        return false;
      }

      const data = await res.json();
      
      if (!data.accessToken) {
        console.error('[Auth] Resposta sem accessToken');
        return false;
      }

      accessToken = data.accessToken;
      
      if (typeof window !== 'undefined') {
        localStorage.setItem('accessToken', data.accessToken);
      }

      console.log('[Auth] Token atualizado com sucesso');
      return true;
    } catch (error) {
      console.error('[Auth] Erro no refresh:', error);
      return false;
    } finally {
      isRefreshing = false;
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

export function getAuthHeaders(): HeadersInit {
  const token = getAccessToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export async function authenticatedFetch(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  const token = getAccessToken();
  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }

  let response = await fetch(url, {
    ...options,
    headers,
    credentials: 'include',
  });

  if (response.status === 401) {
    console.log('[Auth] Recebido 401, tentando refresh...');
    
    const refreshed = await refreshAccessToken();
    
    if (refreshed) {
      const newToken = getAccessToken();
      (headers as Record<string, string>)['Authorization'] = `Bearer ${newToken}`;
      
      response = await fetch(url, {
        ...options,
        headers,
        credentials: 'include',
      });
    } else {
      console.log('[Auth] Refresh falhou, redirecionando para login');
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
  }

  return response;
}

export async function apiClient<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await authenticatedFetch(`${API_URL}${endpoint}`, options);

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }

  return response.json();
}