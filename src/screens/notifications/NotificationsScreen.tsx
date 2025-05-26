import React from 'react';
import { SafeAreaView, View, StyleSheet, Text } from "react-native";
import { Colors } from "../../constants/colors";

const NotificationsScreen: React.FC = () => {
  return (
    <SafeAreaView style={{
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: Colors.light.background,
    }}>
      <View>
        <Text style={{ fontSize: 16, fontWeight: 'bold', fontStyle: 'italic', color: '#C30017', }}>Notifications Screen</Text>
      </View>
    </SafeAreaView>
  );
};

export default NotificationsScreen;