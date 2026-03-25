import { ApiClient } from './ApiClient';

const CALENDAR_BUSY_ENDPOINT = '/api/calendar/busy';
const CALENDAR_EVENT_ENDPOINT = '/api/calendar/events';

export type BusyInterval = {
  start: string;
  end: string;
};

type BusyIntervalsResponse = {
  success: boolean;
  message?: string;
  data?: BusyInterval[];
};

type CreateCalendarEventResponse = {
  success: boolean;
  message?: string;
  data?: {
    id?: string;
    webLink?: string;
    iCalUId?: string;
  };
};

export type CreateOffice365EventPayload = {
  subject: string;
  notes?: string;
  attendeeEmail?: string;
  attendeeName?: string;
  attendeePhone?: string;
  locationDisplayName?: string;
  startIso: string;
  endIso: string;
};

export async function getOffice365BusyIntervals(
  startIso: string,
  endIso: string,
): Promise<BusyInterval[]> {
  const params = new URLSearchParams();
  params.append('start', startIso);
  params.append('end', endIso);

  const path = `${CALENDAR_BUSY_ENDPOINT}?${params.toString()}`;
  try {
    const res = await ApiClient.get<BusyIntervalsResponse>(path);
    return res.success && Array.isArray(res.data) ? res.data : [];
  } catch (error: any) {
    console.error('[Office365Debug] Failed to load busy intervals from API', {
      endpoint: path,
      message: error?.message,
      status: error?.status,
      data: error?.data,
    });
    throw error;
  }
}

export async function createOffice365CalendarEvent(
  payload: CreateOffice365EventPayload,
): Promise<{ id?: string; webLink?: string; iCalUId?: string } | null> {
  try {
    const res = await ApiClient.post<CreateCalendarEventResponse>(CALENDAR_EVENT_ENDPOINT, payload);
    return res.success && res.data ? res.data : null;
  } catch (error: any) {
    console.error('[Office365Debug] Failed to create Office365 event from API', {
      endpoint: CALENDAR_EVENT_ENDPOINT,
      message: error?.message,
      status: error?.status,
      data: error?.data,
    });
    throw error;
  }
}
