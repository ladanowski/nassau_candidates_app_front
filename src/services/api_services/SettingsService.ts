// src/services/api_services/SettingsService.ts
import { ApiClient } from './ApiClient';
import { Endpoints } from '../../config/api';

type SettingsPayload = {
  FinanceReport: boolean;
  ImportantElectionDates: boolean;
  MiscInformation: boolean;
  PetitionBatchUpdate: boolean;
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
    FinanceReport: boolean;
    ImportantElectionDates: boolean;
    MiscInformation: boolean;
    PetitionBatchUpdate: boolean;
    Qualifying: boolean;
  };

  export async function updateSettings(body: Partial<UpdateSettingsRequest>): Promise<SettingsResponse> {
    console.warn('Updating settings:', body);
    const res = await ApiClient.post<SettingsResponse>(Endpoints.settings, body);
    console.warn('Settings updated:', res);
    return res;
  }