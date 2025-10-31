import { ApiClient } from './ApiClient';
import { Endpoints } from '../../config/api';

type NotificationResponse = {
  success: boolean;
  data?: any[];
  total?: number;
  page?: number;
  limit?: number;
  message?: string;
};

export async function getNotifications(page: number, limit: number = 10): Promise<NotificationResponse> {
  const body = { page, limit };
  return ApiClient.post<NotificationResponse>(Endpoints.notifications, body);
}