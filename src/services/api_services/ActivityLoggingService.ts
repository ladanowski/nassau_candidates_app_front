import {Platform} from 'react-native';
import DeviceInfo from 'react-native-device-info';
import {Endpoints} from '../../config/api';
import {StorageKeys} from '../../constants/storage_keys';
import StorageService from '../StorageService';
import {ApiClient} from './ApiClient';

type ActivityEventType = 'app_opened' | 'screen_view';

type LogActivityPayload = {
  eventType: ActivityEventType;
  screenName?: string;
  occurredAt?: string;
  platform?: string;
  appVersion?: string;
};

function buildActivityContext(payload: LogActivityPayload) {
  return {
    eventType: payload.eventType,
    screenName: payload.screenName ?? null,
  };
}

async function sendActivity(payload: LogActivityPayload): Promise<void> {
  const token = await StorageService.getItem<string>(StorageKeys.authToken);
  if (!token) {
    console.log('Skipping candidate activity log because auth token is missing:', buildActivityContext(payload));
    return;
  }

  try {
    await ApiClient.post<{success: boolean}>(Endpoints.activityLog, {
      ...payload,
      occurredAt: payload.occurredAt ?? new Date().toISOString(),
      platform: payload.platform ?? Platform.OS,
      appVersion: payload.appVersion ?? DeviceInfo.getVersion(),
    });
    console.log('Candidate activity logged successfully:', buildActivityContext(payload));
  } catch (error) {
    console.warn('Failed to log candidate activity:', {
      ...buildActivityContext(payload),
      error,
    });
  }
}

export const ActivityLoggingService = {
  async logAppOpened(): Promise<void> {
    await sendActivity({eventType: 'app_opened'});
  },
  async logScreenView(screenName: string): Promise<void> {
    const normalizedScreenName = screenName?.trim();
    if (!normalizedScreenName) {
      console.log('Skipping screen_view activity because screenName is empty.');
      return;
    }

    await sendActivity({
      eventType: 'screen_view',
      screenName: normalizedScreenName,
    });
  },
};
