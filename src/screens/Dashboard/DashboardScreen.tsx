import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import BannerHeader from '../../components/BannerHeader';
import { Colors } from '../../constants/colors';

const DashboardScreen: React.FC = () => {
  return (
    <SafeAreaView style={{flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.light.background,}}>
      <BannerHeader />
      <View style={styles.container}>
        <Text style={styles.text}>Dashboard</Text>
      </View>
    </SafeAreaView>
  );
};

export default DashboardScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  text: {
    fontSize: 28,
    fontWeight: 'bold',
  },
});