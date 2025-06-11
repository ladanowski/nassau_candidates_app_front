import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { navigationRef } from '../services/NavigationService';
// import { createStackNavigator } from '@react-navigation/stack';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import DashboardScreen from '../screens/Dashboard/DashboardScreen';
import NotificationsScreen from '../screens/notifications/NotificationsScreen';
import WebViewScreen from '../screens/WebView/WebViewScreen';
import SettingsScreen from '../screens/settings/SettingsScreen';
import NotificationDetailsScreen from '../screens/notifications/NotificationDetailsScreen';

const Stack = createNativeStackNavigator();

const AppNavigator = () => (
  <NavigationContainer ref={navigationRef}>
    <Stack.Navigator initialRouteName="Dashboard" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Dashboard" component={DashboardScreen}  />
      <Stack.Screen name="webView" component={WebViewScreen}  />
      <Stack.Screen name="notifications" component={NotificationsScreen}  />
      <Stack.Screen name="notificationDetails" component={NotificationDetailsScreen}  />
      <Stack.Screen name="settings" component={SettingsScreen}  />
    </Stack.Navigator>
  </NavigationContainer>
);

export default AppNavigator;