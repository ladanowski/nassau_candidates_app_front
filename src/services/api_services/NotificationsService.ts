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

type UpdateNotificationResponse = {
  success: boolean;
  message?: string;
};

type UnreadNotificationsCountResponse = {
  success: boolean;
  unreadCount?: number;
};

export async function getNotifications(page: number, limit: number = 10): Promise<NotificationResponse> {
 const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  return ApiClient.get<NotificationResponse>(`${Endpoints.notifications}?${params.toString()}`);
}

export async function markNotificationAsRead(notificationId: string, isRead: boolean = true): Promise<UpdateNotificationResponse> {
  const body: Record<string, any> = { notificationId, isRead };
  return ApiClient.patch<UpdateNotificationResponse>(Endpoints.notificationRead, body);
}

export async function getUnreadNotificationsCount(): Promise<UnreadNotificationsCountResponse> {
   return ApiClient.get<UnreadNotificationsCountResponse>(Endpoints.notificationUnreadCount);
 }