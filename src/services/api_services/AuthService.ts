import { ApiClient } from './ApiClient';
import { Endpoints } from '../../config/api';

type LoginResponse = {
  success: boolean;
  token?: string;
  user?: any;
  message?: string;
};

export async function loginCandidate(email: string, password: string, fcmToken?: string | null): Promise<LoginResponse> {
  const body: Record<string, any> = { email, password };
  if (fcmToken) {
    body.fcmToken = fcmToken;
  }
  console.warn('Login Request Body', body)
  return ApiClient.post<LoginResponse>(Endpoints.loginCandidate, body);
}