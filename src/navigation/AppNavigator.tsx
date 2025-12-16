import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { navigationRef } from '../services/NavigationService';
// import { createStackNavigator } from '@react-navigation/stack';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import DashboardScreen from '../screens/Dashboard/DashboardScreen';
import PetitionQueueScreen from '../screens/petitionQueue/PetitionQueueScreen';
import NotificationsScreen from '../screens/notifications/NotificationsScreen';
import WebViewScreen from '../screens/WebView/WebViewScreen';
import SettingsScreen from '../screens/settings/SettingsScreen';
import NotificationDetailsScreen from '../screens/notifications/NotificationDetailsScreen';
import PrivacyPolicyScreen from '../screens/CmsPages/PrivacyPolicyScreen';
import TermsConditionsScreen from '../screens/CmsPages/TermsConditionsScreen';
import CandidateFinanceReport from '../screens/settings/CandidateFinanceReport';
import CommitteeFinanceReport from '../screens/settings/CommitteeFinanceReport';
import ImportantElectionDates from '../screens/settings/ImportantElectionDates';
import PetitionDueDateCounty from '../screens/settings/PetitionDueDateCounty';
import PetitionDueDateJudicial from '../screens/settings/PetitionDueDateJudicial';
import ContactUsScreen from '../screens/contactUs/ContactUsScreen';

const Stack = createNativeStackNavigator();

const AppNavigator = () => (
  <NavigationContainer ref={navigationRef}>
    <Stack.Navigator initialRouteName="Dashboard" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Dashboard" component={DashboardScreen} />
      <Stack.Screen name="webView" component={WebViewScreen} />
      <Stack.Screen name="notifications" component={NotificationsScreen} />
      <Stack.Screen name="notificationDetails" component={NotificationDetailsScreen} />
      <Stack.Screen name="petitionQueue" component={PetitionQueueScreen} />
      <Stack.Screen name="settings" component={SettingsScreen} />
      <Stack.Screen name="candidateFinanceReport" component={CandidateFinanceReport} />
      <Stack.Screen name="committeeFinanceReport" component={CommitteeFinanceReport} />
      <Stack.Screen name="importantElectionDates" component={ImportantElectionDates} />
      <Stack.Screen name="petitionDueDateCounty" component={PetitionDueDateCounty} />
      <Stack.Screen name="petitionDueDateJudicial" component={PetitionDueDateJudicial} />
      <Stack.Screen name="privacyPolicy" component={PrivacyPolicyScreen} />
      <Stack.Screen name="termsConditions" component={TermsConditionsScreen} />
      <Stack.Screen name="contactUs" component={ContactUsScreen} />
    </Stack.Navigator>
  </NavigationContainer>
);

export default AppNavigator;