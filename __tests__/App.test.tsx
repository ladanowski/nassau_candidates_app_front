/**
 * @format
 */

import React from 'react';
import ReactTestRenderer from 'react-test-renderer';

jest.mock('@react-native-firebase/messaging', () => {
  const mockMessaging = () => ({
    requestPermission: jest.fn(async () => 1),
    getToken: jest.fn(async () => 'test-fcm-token'),
    getInitialNotification: jest.fn(async () => null),
    onNotificationOpenedApp: jest.fn(() => jest.fn()),
    onMessage: jest.fn(() => jest.fn()),
    onTokenRefresh: jest.fn(() => jest.fn()),
  });

  mockMessaging.AuthorizationStatus = {
    AUTHORIZED: 1,
    PROVISIONAL: 2,
  };

  return mockMessaging;
});

jest.mock('@react-native-firebase/firestore', () => {
  const firestore = () => ({
    collection: () => ({
      doc: () => ({
        get: jest.fn(async () => ({ exists: false })),
        set: jest.fn(async () => undefined),
      }),
    }),
    app: { options: { projectId: 'test' }, name: 'test' },
  });

  firestore.FieldValue = { serverTimestamp: jest.fn(() => null) };
  firestore.Timestamp = { fromDate: jest.fn((d: Date) => d) };

  return firestore;
});

jest.mock('react-native-device-info', () => ({
  getBrand: () => 'test',
  getModel: () => 'test',
  getSystemName: () => 'test',
  getSystemVersion: () => 'test',
  getVersion: () => 'test',
  getDeviceId: () => 'test',
  getUniqueId: () => 'test',
}));

jest.mock('../src/services/NotificationService', () => ({
  __esModule: true,
  default: {
    showNotification: jest.fn(),
  },
}));

jest.mock('../src/services/StorageService', () => ({
  __esModule: true,
  default: {
    saveItem: jest.fn(async () => undefined),
    getItem: jest.fn(async () => null),
    removeItem: jest.fn(async () => undefined),
  },
}));

jest.mock('@react-navigation/native', () => ({
  NavigationContainer: ({ children }: any) => children,
  createNavigationContainerRef: () => ({
    isReady: () => false,
    navigate: jest.fn(),
    dispatch: jest.fn(),
    goBack: jest.fn(),
    getCurrentRoute: jest.fn(),
    reset: jest.fn(),
  }),
  useNavigation: () => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
  }),
  useRoute: () => ({
    params: { title: '' },
  }),
  useFocusEffect: jest.fn(),
  NavigationProp: {},
  RouteProp: {},
}));

jest.mock('@react-navigation/native-stack', () => ({
  createNativeStackNavigator: () => {
    const Screen = ({ children }: any) => children ?? null;
    const Navigator = ({ children }: any) => children ?? null;
    return { Screen, Navigator };
  },
}));

jest.mock('@react-native-community/push-notification-ios', () => ({
  setApplicationIconBadgeNumber: jest.fn(),
}));

jest.mock('../src/navigation/AppNavigator', () => {
  const React = require('react');
  return function MockAppNavigator() {
    return React.createElement(React.Fragment, null);
  };
});

const App = require('../App').default;

test('renders correctly', async () => {
  await ReactTestRenderer.act(() => {
    ReactTestRenderer.create(<App />);
  });
});
