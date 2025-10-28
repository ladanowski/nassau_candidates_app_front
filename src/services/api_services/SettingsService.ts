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