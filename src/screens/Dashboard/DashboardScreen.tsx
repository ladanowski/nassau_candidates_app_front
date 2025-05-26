import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, FlatList, Image, Linking } from 'react-native';
import BannerHeader from '../../components/BannerHeader';
import { Colors } from '../../constants/colors';
import { svgs } from '../../constants/images';
import { useNavigation, NavigationProp } from '@react-navigation/native';

const gridItems = [
  { key: 'Announced Candidates', icon: svgs.settings, url: 'https://www.facebook.com/votenassaufl/', label: 'Announced Candidates' },
  { key: 'Canvassing Board Schedule', icon: svgs.settings, url: 'https://www.instagram.com/votenassaufl/', label: 'Canvassing Board Schedule' },
  { key: 'Contact Us', icon: svgs.settings, url: 'https://twitter.com/votenassaufl/', label: 'Contact Us' },
  { key: 'Election Countdown', icon: svgs.settings, url: 'https://www.facebook.com/votenassaufl/', label: 'Election Countdown' },
  { key: 'Offices up for Election', icon: svgs.settings, url: 'https://www.instagram.com/votenassaufl/', label: 'Offices up for Election' },
  { key: 'Petition Queue', icon: svgs.settings, url: 'https://www.instagram.com/votenassaufl/', label: 'Petition Queue' },
  { key: 'Polling Locations & 150’ Sign Restrictions', icon: svgs.settings, url: 'https://www.instagram.com/votenassaufl/', label: 'Polling Locations & 150’ Sign Restrictions' },
  { key: 'Request Vote-by-Mail data', icon: svgs.settings, url: 'https://www.instagram.com/votenassaufl/', label: 'Request Vote-by-Mail data' },
  { key: 'Settings', icon: svgs.settings, url: 'https://www.instagram.com/votenassaufl/', label: 'Settings' },
  { key: 'Campaign Finance', icon: svgs.settings, url: 'https://www.instagram.com/votenassaufl/', label: 'Campaign Finance' },
  { key: 'Notifications', icon: svgs.settings, url: 'https://www.instagram.com/votenassaufl/', label: 'Notifications' },
  { key: 'Schedule Appointment', icon: svgs.settings, url: 'https://www.instagram.com/votenassaufl/', label: 'Schedule Appointment' },

];

const socialIcons = [
  { key: 'facebook', icon: svgs.facebook, url: 'https://www.facebook.com/votenassaufl/' },
  { key: 'instagram', icon: svgs.instagram, url: 'https://www.instagram.com/votenassaufl/' },
  { key: 'twitter', icon: svgs.twitter, url: 'https://twitter.com/votenassaufl/' },
];

const DashboardScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp<any>>();

  const renderGridItem = ({ item }: any) => (
    <TouchableOpacity style={styles.gridItem} activeOpacity={0.7}>
      {/* Replace with your icon */}
      <View style={styles.iconCircle}>
        <item.icon width={40} height={40} />
      </View>
      <Text style={styles.gridLabel}>{item.label}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={{
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: Colors.light.background,
    }}>
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
          {/* Follow us! @votenassaufl */}
          <View style={styles.footer}>
            <Text style={{ textAlign: 'center', fontSize: 16, color: Colors.light.primary, fontFamily: 'MyriadPro-Bold', marginBottom: 8 }}>
              Follow us! @votenassaufl
            </Text>
            <View style={styles.socialIcons}>
              {socialIcons.map(icon => (
                <TouchableOpacity key={icon.key} style={styles.socialIcon} activeOpacity={0.7} onPress={() => Linking.openURL(icon.url)}>
                  <icon.icon width={36} height={36} />
                </TouchableOpacity>
              ))}
            </View>
          </View>
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
    fontSize: 14,
    color: '#fff',
    fontFamily: 'MyriadPro-Bold',
    textAlign: 'center',
    marginTop: 8,
  },
  footer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    backgroundColor: Colors.light.background,
  },
  socialIcons: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  socialIcon: {
    marginHorizontal: 12,
  },

});