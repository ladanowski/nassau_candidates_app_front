import React from 'react';
import { SafeAreaView, View, StyleSheet, Text } from "react-native";
import { Colors } from "../../constants/colors";

const SettingsScreen: React.FC = () => {
  return (
    <SafeAreaView style={{
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: Colors.light.background,
    }}>
      <View>
        <Text style={{ fontSize: 16, color: '#C30017', fontFamily: 'MyriadPro-Bold', fontStyle: 'italic', }}>Settings Screen</Text>
      </View>
    </SafeAreaView>
  );
};

export default SettingsScreen;