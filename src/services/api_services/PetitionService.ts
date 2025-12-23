import { ApiClient } from './ApiClient';
import { Endpoints } from '../../config/api';

type QueueItem = {
  CandidateName: string;
  BatchNum: string | number;
  Count: number;
  Status: string;
};

type QueueResponse = {
  success: boolean;
  data?: QueueItem[];
  message?: string;
};

export async function getPetitionQueue(): Promise<QueueItem[]> {
  const res = await ApiClient.get<QueueResponse>(Endpoints.petitionQueue);
  return res.success && Array.isArray(res.data) ? res.data : [];
}