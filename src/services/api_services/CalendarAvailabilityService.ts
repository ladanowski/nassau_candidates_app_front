import { ApiClient } from './ApiClient';

const CALENDAR_BUSY_ENDPOINT = '/api/calendar/busy';

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

  const path = `${CALENDAR_BUSY_ENDPOINT}?${params.toString()}`;
  const res = await ApiClient.get<BusyIntervalsResponse>(path);
  return res.success && Array.isArray(res.data) ? res.data : [];
}
