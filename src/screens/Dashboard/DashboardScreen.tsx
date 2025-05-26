import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import BannerHeader from '../../components/BannerHeader';
import { Colors } from '../../constants/colors';
// import BellIcon from '../../../assets/svgs/bell.svg';
import { svgs } from '../../constants/images';
import { useNavigation, NavigationProp } from '@react-navigation/native';

const DashboardScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp<any>>();
  
  return (
    <SafeAreaView style={{
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: Colors.light.background,
    }}>
      <BannerHeader />
      <View style={styles.container}>
        <View style={{ width: '100%', alignItems: 'center', backgroundColor: '#F2F2F2', padding: 8, flexDirection: 'row', justifyContent: 'center', }}>
          <Text style={{ fontSize: 16, fontWeight: 'bold', fontStyle: 'italic', color: '#C30017', }}>— A Public Office is a Public Trust —</Text>
          <TouchableOpacity onPress={() => navigation.navigate('notifications')}>
            <View style={{
              marginLeft: 16,
              // width: 24,
              // height: 24,
              borderRadius: 50,
              padding: 6,
              backgroundColor: Colors.light.primary,
              justifyContent: 'center',
              alignItems: 'center',
            }}>
              <svgs.bellIcon width={18} height={18}/>
            </View>
          </TouchableOpacity>
        </View>
        
        
      </View>
    </SafeAreaView>
  );
};

export default DashboardScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    width: '100%',
  },
  text: {
    fontSize: 28,
    fontWeight: 'bold',
  },
});