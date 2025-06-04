import React, { useEffect } from 'react';
import {
  Platform,
  PermissionsAndroid,
} from 'react-native';
import messaging, { FirebaseMessagingTypes } from '@react-native-firebase/messaging';
import AppNavigator from './src/navigation/AppNavigator';
import NotificationService from './src/services/NotificationService';
import firestore from '@react-native-firebase/firestore';
import DeviceInfo from 'react-native-device-info';

const App = () => {
  useEffect(() => {
    const initializeApp = async () => {
      // Request permission
      await requestUserPermission();

      // Get FCM token
      await getFCMToken();

      // Handle background/quit state notifications
      await handleBackgroundNotification();

      // Set up foreground listener
      const unsubscribe = setupForegroundListener();

      // Listen for token refresh
      setupTokenRefreshListener();

      // Cleanup function
      return () => {
        unsubscribe();
      };
    };

    initializeApp();
  }, []);

  const requestUserPermission = async () => {
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
  };

  const getFCMToken = async () => {
    try {
      const fcmToken = await messaging().getToken();
      if (fcmToken) {
        console.log('FCM Token:', fcmToken);
        // Send this token to your backend server
        // await sendTokenToServer(fcmToken);
        saveTokenToFirestore(fcmToken);
        return fcmToken;
      }
    } catch (error) {
      console.log('Error getting FCM token:', error);
    }
  };

  // Handle notification when app is in background or quit state
  const handleBackgroundNotification = async () => {
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
  };

  // Show local notification instead of Alert
  const showLocalNotification = (remoteMessage: FirebaseMessagingTypes.RemoteMessage) => {
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
  };

  // Handle foreground notifications - UPDATED
  const setupForegroundListener = () => {
    const unsubscribe = messaging().onMessage(async remoteMessage => {
      console.log('Notification received in foreground:', remoteMessage);

      // Show local notification instead of Alert
      showLocalNotification(remoteMessage);
    });

    return unsubscribe;
  };

  // Handle token refresh
  const setupTokenRefreshListener = () => {
    messaging().onTokenRefresh(token => {
      console.log('FCM Token refreshed:', token);
      // Send updated token to your server
      // sendTokenToServer(token);
      saveTokenToFirestore(token);
    });
  };

  // Handle navigation based on notification data
  const handleNotificationNavigation = (remoteMessage: FirebaseMessagingTypes.RemoteMessage) => {
    if (remoteMessage.data?.screen) {
      console.log('Navigating to screen:', remoteMessage.data.screen);
      // You can implement navigation logic here
      // For example, using a navigation ref or context
      // NavigationService.navigate(remoteMessage.data.screen, remoteMessage.data.params);
    }
  };

  const saveTokenToFirestore = async (token: string) => {
  if (!token) return;

  try {
    const tokenDocId = token.replace(/\//g, '_'); // Avoid invalid Firestore IDs
    const tokenDocRef = firestore().collection('fcmTokens').doc(tokenDocId);

    const existingDoc = await tokenDocRef.get();

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
      ...(existingDoc.exists()
        ? { updatedAt: firestore.FieldValue.serverTimestamp() }
        : { createdAt: firestore.FieldValue.serverTimestamp() }),
    };

    await tokenDocRef.set(dataToSave, { merge: true });

    console.log(`FCM token ${existingDoc.exists() ? 'updated' : 'created'} in Firestore`
    );
  } catch (error) {
    console.error(' Error saving FCM token to Firestore:', error);
  }
};


  return <AppNavigator />;
};

export default App;