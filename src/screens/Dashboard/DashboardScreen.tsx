import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, FlatList, Image, Linking } from 'react-native';
import BannerHeader from '../../components/BannerHeader';
import { Colors } from '../../constants/colors';
import { svgs } from '../../constants/images';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import Footer from '../../components/Footer';
import { globalStyles } from '../../styles/globalStyles';

const gridItems = [
  { key: 'Announced Candidates', icon: svgs.settings, url: 'https://www.votenassaufl.gov/announced-candidates-and-committees', label: 'Announced Candidates' },
  { key: 'Canvassing Board Schedule', icon: svgs.settings, url: 'https://www.votenassaufl.gov/canvassing-board', label: 'Canvassing Board Schedule' },
  { key: 'Contact Us', icon: svgs.settings, url: 'https://www.votenassaufl.gov/contact', label: 'Contact Us' },
  { key: 'Election Countdown', icon: svgs.settings, url: 'https://www.votenassaufl.gov/upcoming-elections', label: 'Election Countdown' },
  { key: 'Offices up for Election', icon: svgs.settings, url: 'https://www.votenassaufl.gov/offices-up-for-election', label: 'Offices up for Election' },
  { key: 'Petition Queue', icon: svgs.settings, url: null, label: 'Petition Queue' },
  { key: 'Polling Locations & 150’ Sign Restrictions', icon: svgs.settings, url: 'https://www.votenassaufl.gov/150-ft-no-solicitation-zones', label: 'Polling Locations & 150’ Sign Restrictions' },
  { key: 'Request Vote-by-Mail data', icon: svgs.settings, url: 'https://www.votenassaufl.gov/vote-by-mail-data', label: 'Request Vote-by-Mail data' },
  { key: 'Settings', icon: svgs.settings, url: null, label: 'Settings' },
  { key: 'Campaign Finance', icon: svgs.settings, url: 'https://www.votenassaufl.gov/campaign-finance-reports', label: 'Campaign Finance' },
  { key: 'Notifications', icon: svgs.settings, url: null, routeTo: 'notifications', label: 'Notifications' },
  { key: 'Schedule Appointment', icon: svgs.settings, url: 'https://calendly.com/ncsoe/60min?month=2025-02', label: 'Schedule Appointment' },

];

const DashboardScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp<any>>();

  const renderGridItem = ({ item }: any) => (
    <TouchableOpacity style={styles.gridItem} activeOpacity={0.7} onPress={() => {
      if (item.url) {
        // Linking.openURL(item.url).catch(err => console.error("Failed to open URL:", err));
        navigation.navigate('webView', {
          title: item.label,
          link: item.url,
        });
      } else {
        if (item.routeTo) {
          navigation.navigate(item.routeTo);
        }
      }}}>
      <View style={styles.iconCircle}>
        <item.icon width={40} height={40} />
      </View>
      <Text style={styles.gridLabel}>{item.label}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={globalStyles.safeAreaContainer}>
      <BannerHeader />
      <View style={styles.container}>
        <View style={{ width: '100%', alignItems: 'center', backgroundColor: '#F2F2F2', padding: 12, flexDirection: 'row', justifyContent: 'center', }}>
          <Text style={{ fontSize: 16, color: '#C30017', fontFamily: 'MyriadPro-Bold', fontStyle: 'italic', }}>— A Public Office is a Public Trust —</Text>
          {/* <TouchableOpacity onPress={() => navigation.navigate('notifications')}>
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
          </TouchableOpacity> */}
        </View>


        {/* Want a View that will be scrolable. It will have a Grid List of Icons 3 in a row. and total 13 items. and  then after grid list there will be a footer with three social icons. Both Grid and footer be in same Scroll view*/}
        <ScrollView contentContainerStyle={{ flexGrow: 1, backgroundColor: Colors.light.primary, }}>
          <FlatList
            data={gridItems}
            renderItem={renderGridItem}
            keyExtractor={item => item.key}
            numColumns={3}
            scrollEnabled={false}
            contentContainerStyle={styles.gridList}
            columnWrapperStyle={styles.gridRow}
          />
        <Footer/>  
        </ScrollView>

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

  gridList: {
    paddingVertical: 24,
    paddingHorizontal: 8,
  },
  gridRow: {
    marginBottom: 24,
  },
  gridItem: {
    flex: 1,
    margin: 8,
    alignItems: 'center',
    justifyContent: 'flex-start',
    height: 100,

  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 52.5,
    borderWidth: 5,
    borderColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.light.primary,
  },
  gridLabel: {
    fontSize: 12,
    color: '#fff',
    fontFamily: 'MyriadPro-Bold',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 14,
  },
});