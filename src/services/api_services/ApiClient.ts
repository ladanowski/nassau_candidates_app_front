import { API_BASE_URL, RequestConfig } from '../../config/api';
import { StorageKeys } from '../../constants/storage_keys';
import StorageService from '../StorageService';

class ApiError extends Error {
  status?: number;
  data?: unknown;
  constructor(message: string, status?: number, data?: unknown) {
    super(message);
    this.status = status;
    this.data = data;
  }
}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const id = setTimeout(() => reject(new ApiError('Request timeout', 0)), ms);
    promise.then(
      (res) => { clearTimeout(id); resolve(res); },
      (err) => { clearTimeout(id); reject(err); },
    );
  });
}

async function getAuthToken(): Promise<string | undefined> {
  try {
    const token = await StorageService.getItem<string>(StorageKeys.authToken)
    return token ?? undefined;
  } catch {
    return undefined;
  }
}

async function request<T>(path: string, init?: RequestInit & { bodyObj?: any }): Promise<T> {
  const token = await getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(init?.headers as Record<string, string> | undefined),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const fetchPromise = fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers,
    body: init?.bodyObj ? JSON.stringify(init.bodyObj) : init?.body,
  });

  const res = await withTimeout(fetchPromise, RequestConfig.timeoutMs);

  const text = await res.text();
  let data: any = null;
  try { data = text ? JSON.parse(text) : null; } catch { data = text; }

  if (!res.ok) {
    const serverMsg = (data && ((data as any).message || (data as any).error)) as string | undefined;
    if (res.status === 401 || res.status === 403) {
       await StorageService.removeItem(StorageKeys.authToken);
       await StorageService.removeItem(StorageKeys.candidateId);
      // normalize token errors
      throw new ApiError(serverMsg || 'Session expired. Please login again.', res.status, data);
    }
    throw new ApiError(serverMsg || `HTTP ${res.status}`, res.status, data);
  }
  return data as T;
}

export const ApiClient = {
  get: <T>(path: string, headers?: Record<string, string>) =>
    request<T>(path, { method: 'GET', headers }),
  post: <T>(path: string, bodyObj?: any, headers?: Record<string, string>) =>
    request<T>(path, { method: 'POST', headers, bodyObj }),
};