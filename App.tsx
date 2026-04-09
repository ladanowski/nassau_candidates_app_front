import React, { useCallback, useEffect } from 'react';
import {
  AppState,
  AppStateStatus,
  Platform,
  PermissionsAndroid,
} from 'react-native';
import messaging, { FirebaseMessagingTypes } from '@react-native-firebase/messaging';
import AppNavigator from './src/navigation/AppNavigator';
import NotificationService from './src/services/NotificationService';
import {ActivityLoggingService} from './src/services/api_services/ActivityLoggingService';
import {navigationRef} from './src/services/NavigationService';
import firestore from '@react-native-firebase/firestore';
import DeviceInfo from 'react-native-device-info';
import StorageService from './src/services/StorageService';
import { StorageKeys } from './src/constants/storage_keys';

const App = () => {
  const appStateRef = React.useRef(AppState.currentState);

  const requestUserPermission = useCallback(async () => {
    if (Platform.OS === 'ios') {
      const authStatus = await messaging().requestPermission();
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;

      if (enabled) {
        console.log('Authorization status:', authStatus);
        return true;
      }
    } else if (Platform.OS === 'android') {
      if (Platform.Version >= 33) {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      }
      return true;
    }
    return false;
  }, []);

  // Handle notification when app is in background or quit state
  // Handle navigation based on notification data
  const handleNotificationNavigation = useCallback((remoteMessage: FirebaseMessagingTypes.RemoteMessage) => {
    if (remoteMessage.data?.screen) {
      console.log('Navigating to screen:', remoteMessage.data.screen);
      // You can implement navigation logic here
      // For example, using a navigation ref or context
      // NavigationService.navigate(remoteMessage.data.screen, remoteMessage.data.params);
    }
  }, []);

  const saveTokenToFirestore = useCallback(async (token: string) => {
    if (!token) return;

    try {
      const tokenDocId = token.replace(/\//g, '_'); // Avoid invalid Firestore IDs
      const tokenDocRef = firestore().collection('fcmTokens').doc(tokenDocId);

      const existingDoc = await tokenDocRef.get();
      const docExists =
        typeof (existingDoc as any).exists === 'function'
          ? (existingDoc as any).exists()
          : (existingDoc as any).exists;

      const deviceInfo = {
        brand: DeviceInfo.getBrand(),
        model: DeviceInfo.getModel(),
        systemName: DeviceInfo.getSystemName(),
        systemVersion: DeviceInfo.getSystemVersion(),
        appVersion: DeviceInfo.getVersion(),
        deviceId: DeviceInfo.getDeviceId(),
        uniqueId: DeviceInfo.getUniqueId(),
      };

      const dataToSave = {
        fcmToken: token,
        deviceInfo,
        ...(docExists
          ? { updatedAt: firestore.FieldValue.serverTimestamp() }
          : { createdAt: firestore.FieldValue.serverTimestamp() }),
      };

      await tokenDocRef.set(dataToSave, { merge: true });

      console.log(`FCM token ${docExists ? 'updated' : 'created'} in Firestore`);
    } catch (error) {
      console.error(' Error saving FCM token to Firestore:', error);
    }
  }, []);

  const getFCMToken = useCallback(async () => {
    try {
      const fcmToken = await messaging().getToken();
      if (fcmToken) {
        console.log('FCM Token:', fcmToken);
        await StorageService.saveItem(StorageKeys.fcmToken, fcmToken);
        saveTokenToFirestore(fcmToken);
        return fcmToken;
      }
    } catch (error) {
      console.log('Error getting FCM token:', error);
    }
  }, [saveTokenToFirestore]);

  const handleBackgroundNotification = useCallback(async () => {
    // Handle notification that opened the app from quit state
    const initialNotification = await messaging().getInitialNotification();
    if (initialNotification) {
      console.log('Notification caused app to open from quit state:', initialNotification);
      handleNotificationNavigation(initialNotification);
    }

    // Handle notification when app is in background
    messaging().onNotificationOpenedApp(remoteMessage => {
      console.log('Notification caused app to open from background state:', remoteMessage);
      handleNotificationNavigation(remoteMessage);
    });
  }, [handleNotificationNavigation]);

  // Show local notification instead of Alert
  const showLocalNotification = useCallback((remoteMessage: FirebaseMessagingTypes.RemoteMessage) => {
    const { notification, data } = remoteMessage;

    console.log('Notification', notification);

    // Determine priority based on data or notification content
    const priority = data?.priority === 'high' ? 'high' : 'default';

    NotificationService.showNotification(
      notification?.title || 'New Notification',
      notification?.body || 'You have a new message',
      {
        ...data, // Include all custom data
        messageId: remoteMessage.messageId,
        screen: data?.screen, // For navigation
      },
      priority,
    );
  }, []);

  // Handle foreground notifications
  const setupForegroundListener = useCallback(() => {
    const unsubscribe = messaging().onMessage(async remoteMessage => {
      console.log('Notification received in foreground:', remoteMessage);
      showLocalNotification(remoteMessage);
    });

    return unsubscribe;
  }, [showLocalNotification]);

  // Handle token refresh
  const setupTokenRefreshListener = useCallback(() => {
    messaging().onTokenRefresh(token => {
      console.log('FCM Token refreshed:', token);
      saveTokenToFirestore(token);
    });
  }, [saveTokenToFirestore]);

  const logCurrentScreenView = useCallback(async () => {
    if (!navigationRef.isReady()) {
      return;
    }

    const currentRouteName = navigationRef.getCurrentRoute()?.name;
    if (!currentRouteName) {
      return;
    }

    await ActivityLoggingService.logScreenView(currentRouteName);
  }, []);

  const handleAppStateChange = useCallback((nextAppState: AppStateStatus) => {
    const wasInBackground = /inactive|background/.test(appStateRef.current);
    if (wasInBackground && nextAppState === 'active') {
      void ActivityLoggingService.logAppOpened();
      void logCurrentScreenView();
    }

    appStateRef.current = nextAppState;
  }, [logCurrentScreenView]);

  useEffect(() => {
    let unsubscribeForeground: undefined | (() => void);
    const appStateSubscription = AppState.addEventListener('change', handleAppStateChange);

    const initializeApp = async () => {
      await requestUserPermission();
      await getFCMToken();
      await handleBackgroundNotification();
      unsubscribeForeground = setupForegroundListener();
      setupTokenRefreshListener();
      await ActivityLoggingService.logAppOpened();
    };

    initializeApp();

    return () => {
      if (unsubscribeForeground) unsubscribeForeground();
      appStateSubscription.remove();
    };
  }, [
    handleAppStateChange,
    requestUserPermission,
    getFCMToken,
    handleBackgroundNotification,
    setupForegroundListener,
    setupTokenRefreshListener,
  ]);

  return <AppNavigator />;
};

export default App;