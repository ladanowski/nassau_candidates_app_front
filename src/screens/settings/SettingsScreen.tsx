import React from 'react';
import { SafeAreaView } from "react-native";
import { RouteProp, useRoute } from '@react-navigation/native';
import AppBar from '../../components/AppBar';
import { globalStyles } from '../../styles/globalStyles';

type SettingsRouteParams = {
  settings: {
    title: string;
  };
};

const SettingsScreen: React.FC = () => {
  const route = useRoute<RouteProp<SettingsRouteParams, 'settings'>>();
  const { title } = route.params;

  return (
    <SafeAreaView style={globalStyles.safeAreaContainer}>
      <AppBar title={title} />
    </SafeAreaView>
  );
};

export default SettingsScreen;