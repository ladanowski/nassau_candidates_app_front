import React from 'react';
import { SafeAreaView } from "react-native";
import { RouteProp, useRoute } from '@react-navigation/native';
import AppBar from '../../components/AppBar';
import { globalStyles } from '../../styles/globalStyles';

type NotificationsRouteParams = {
  notifications: {
    title: string;
  };
};

const NotificationsScreen: React.FC = () => {
  const route = useRoute<RouteProp<NotificationsRouteParams, 'notifications'>>();
  const { title } = route.params;

  return (
    <SafeAreaView style={globalStyles.safeAreaContainer}>
      <AppBar title={title} />
    </SafeAreaView>
  );
};

export default NotificationsScreen;