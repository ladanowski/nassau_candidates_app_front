// src/services/api_services/SettingsService.ts
import { ApiClient } from './ApiClient';
import { Endpoints } from '../../config/api';

type SettingsPayload = {
  CampaignFinance: boolean;
  ElectionInformation: boolean;
  Misc: boolean;
  Petitions: boolean;
  Qualifying: boolean;
};

type SettingsResponse = {
  success: boolean;
  data?: SettingsPayload;
  message?: string;
};

export async function getSettings(): Promise<SettingsPayload | null> {
  const res = await ApiClient.get<SettingsResponse>(Endpoints.settings);
  return res.success && res.data ? res.data : null;
}

export type UpdateSettingsRequest = {
    CampaignFinance: boolean;
    ElectionInformation: boolean;
    Misc: boolean;
    Petitions: boolean;
    Qualifying: boolean;
  };

  export async function updateSettings(body: Partial<UpdateSettingsRequest>): Promise<SettingsResponse> {
    return await ApiClient.post<SettingsResponse>(Endpoints.settings, body);
  }

  type SetupAppointmentTimesResponse = {
    success: boolean;
    message?: string;
    added?: number;
    updated?: number;
    total?: number;
    restrictions?: Array<{
      id: string;
      day: string;
      begin: string;
      end: string;
    }>;
    error?: string;
  };

  export async function setupAppointmentTimes(): Promise<SetupAppointmentTimesResponse> {
    return await ApiClient.post<SetupAppointmentTimesResponse>(`${Endpoints.settings}/setup-appointment-times`, {});
  }