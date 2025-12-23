import { ApiClient } from './ApiClient';
import { Endpoints } from '../../config/api';

type ContactUsPayload = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  message: string;
};

type ContactUsResponse = {
  success: boolean;
  message?: string;
};

export async function contactUs(body: ContactUsPayload): Promise<ContactUsResponse> {
  return ApiClient.post<ContactUsResponse>(Endpoints.contactUs, body);
}