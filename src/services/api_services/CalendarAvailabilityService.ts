import { ApiClient } from './ApiClient';
import { Endpoints } from '../../config/api';

export type BusyInterval = {
  start: string;
  end: string;
};

type BusyIntervalsResponse = {
  success: boolean;
  message?: string;
  data?: BusyInterval[];
};

export async function getOffice365BusyIntervals(
  startIso: string,
  endIso: string,
): Promise<BusyInterval[]> {
  const params = new URLSearchParams();
  params.append('start', startIso);
  params.append('end', endIso);

  const path = `${Endpoints.calendarBusy}?${params.toString()}`;
  const res = await ApiClient.get<BusyIntervalsResponse>(path);
  return res.success && Array.isArray(res.data) ? res.data : [];
}
