import { ApiClient } from './ApiClient';
import { Endpoints } from '../../config/api';

type LoginResponse = {
  success: boolean;
  token?: string;
  user?: any;
  message?: string;
};

export async function loginCandidate(email: string, password: string): Promise<LoginResponse> {
  return ApiClient.post<LoginResponse>(Endpoints.loginCandidate, { email, password });
}