import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, FlatList, Dimensions, ActivityIndicator } from 'react-native';
import BannerHeader from '../../components/BannerHeader';
import { Colors } from '../../constants/colors';
import { svgs } from '../../constants/images';
import { useNavigation, NavigationProp, useFocusEffect } from '@react-navigation/native';
import Footer from '../../components/Footer';
import { globalStyles } from '../../styles/globalStyles';
import CountdownTimer from './CountdownTimer';
import firestore from '@react-native-firebase/firestore';
import TermsPopup from '../../components/terms_popup';
import { StorageKeys } from '../../constants/storage_keys';
import StorageService from '../../services/StorageService';
import LoginPopup from '../../components/LoginPopup';
import { getUnreadNotificationsCount } from '../../services/api_services/NotificationsService';

const gridItems = [
  { key: 'Announced Candidates', icon: svgs.optionAnnouncedCandidate, url: 'https://www.votenassaufl.gov/announced-candidates-and-committees', label: 'Announced Candidates' },
  { key: 'Campaign Finance', icon: svgs.optionCampaignFinance, url: 'https://www.votenassaufl.gov/campaign-finance-reports', label: 'Campaign Finance', requiredAuth: true },
  { key: 'Canvassing Board Schedule', icon: svgs.optionCanvassingBoard, url: 'https://www.votenassaufl.gov/canvassing-board', label: 'Canvassing Board Schedule' },
  { key: 'Contact Us', icon: svgs.optionContactUs, url: 'https://www.votenassaufl.gov/contact', label: 'Contact Us' },
  { key: 'Election Countdown', icon: svgs.optionElectionCountdown, url: 'https://www.votenassaufl.gov/upcoming-elections', label: 'Election Countdown' },
  { key: 'Notifications', icon: svgs.optionNotifications, url: null, routeTo: 'notifications', label: 'Notifications', requiredAuth: true },
  { key: 'Offices up for Election', icon: svgs.optionOfficeUpForElection, url: 'https://www.votenassaufl.gov/offices-up-for-election', label: 'Offices up for Election' },
  { key: 'Petition Queue', icon: svgs.optionPetitionQueue, url: null, label: 'Petition Queue', routeTo: 'petitionQueue'},
  { key: 'Polling Locations & 150’ Sign Restrictions', icon: svgs.optionPollingLocation, url: 'https://www.votenassaufl.gov/150-ft-no-solicitation-zones', label: 'Polling Locations & 150’ Sign Restrictions' },
  { key: 'Request Vote-by-Mail data', icon: svgs.optionRequestVoteByMail, url: 'https://www.votenassaufl.gov/vote-by-mail-data', label: 'Request Vote-by-Mail data', requiredAuth: true },
  { key: 'Schedule Appointment', icon: svgs.optionAppointmentSchedule, url: 'https://www.votenassaufl.gov/qualifying-for-office', label: 'Schedule Appointment' },
  { key: 'Settings – Notifications', icon: svgs.optionSettings, url: null, routeTo: 'settings', label: 'Settings – Notifications' },
];

type CountdownItem = {
  id: string;
  label: string;
  date: Date;
};

const DashboardScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp<any>>();

  const [countdownData, setCountdownData] = useState<CountdownItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showTermsPopup, setShowTermsPopup] = useState(false);

  const [showLoginPopup, setShowLoginPopup] = useState(false);

  const [unreadNotifications, setUnreadNotifications] = useState(0);

  const [authToken, setAuthToken] = useState<string | null>(null);


  useEffect(() => {
    const fetchCountdownDates = async () => {
      try {

        const snapshot = await firestore().collection('dates').orderBy('order').get();

        const fetchedData = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            label: data.label,
            date: data.date.toDate(),
          };
        });

        console.log('Fetched countdown data:', fetchedData);
        setCountdownData(fetchedData);

      } catch (error) {
        console.error('Failed to fetch countdowns from Firestore:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCountdownDates();

    const checkFirstLaunch = async () => {
      const isFirstLaunch = await StorageService.getItem<boolean>(StorageKeys.isFirstTime);
      setShowTermsPopup(isFirstLaunch === null ? true : isFirstLaunch);
    };

    checkFirstLaunch();

  }, []);

  useFocusEffect(
    useCallback(() => {
      const checkAuthToken = async () => {
        const token = await StorageService.getItem<string>(StorageKeys.authToken);
        setAuthToken(token);
        if (token) {
          const unreadNotificationsCount = await getUnreadNotificationsCount();
          setUnreadNotifications(unreadNotificationsCount.unreadCount || 0);
        }
      };

      checkAuthToken();
    }, [])
  );


  const renderGridItem = ({ item }: any) => (
    <TouchableOpacity style={styles.gridItem} activeOpacity={0.7} onPress={async () => {
      // Check if the item requires authentication
      const authToken = await StorageService.getItem<string>(StorageKeys.authToken);
      if (item.requiredAuth && !authToken) {
        // If auth is required and no token, show login popup
        setShowLoginPopup(true);
        return;
      }


      // Proceed if no auth needed or user is logged in
      if (item.url) {
        // If the item has a URL, navigate to the web view
        navigation.navigate('webView', {
          title: item.label,
          link: item.url,
        });
      } else {
        // If the item has a routeTo, navigate to that screen
        if (item.routeTo) {
          navigation.navigate(item.routeTo, {
            title: item.label,
          });
        }
      }
    }}>
      <item.icon width={80} height={80} />
      <Text style={styles.gridLabel}>{item.label}</Text>
    </TouchableOpacity>
  );

  const handlePopupClose = async () => {
    await StorageService.saveItem(StorageKeys.isFirstTime, false);
    setShowTermsPopup(false);
  };

  return (
    <SafeAreaView style={globalStyles.safeAreaContainer}>
      <BannerHeader />
      <View style={styles.container}>
        <View style={{ width: '100%', alignItems: 'center', backgroundColor: '#F2F2F2', padding: 12, flexDirection: 'row', justifyContent: 'center', }}>
          <Text style={{ fontSize: 16, color: Colors.light.secondary, fontFamily: 'MyriadPro-Bold', fontStyle: 'italic', }}>— A Public Office is a Public Trust —</Text>
          {authToken && unreadNotifications > 0 && (
            <TouchableOpacity onPress={() => {
              navigation.navigate('notifications', {
                title: 'Notifications',
              });
            }}>
              <View style={styles.unreadNotificationsContainer}>
                <svgs.bellIcon width={18} height={18}/>
                <View style={styles.unreadNotificationsCountContainer}>
                  <Text style={styles.unreadNotificationsCountText}>
                    {unreadNotifications > 99 ? '99+' : unreadNotifications}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          )}
        </View>
        <ScrollView contentContainerStyle={{ flexGrow: 1, backgroundColor: Colors.light.primary, }} showsVerticalScrollIndicator={false}>
          <View style={{ position: 'relative', width: '100%', flex: 1 }}>
            <svgs.nassauCountry
              style={{
                position: 'absolute',
                top: 0,
                left: '50%',
                transform: [{ translateX: -0.5 * 0.9 * Dimensions.get('window').width }],
                bottom: 0,
                opacity: 0.45,
                zIndex: 0,
              }}
              width="90%"
              height="90%"
              preserveAspectRatio="xMidYMid meet"
            />

            <FlatList
              data={gridItems}
              renderItem={renderGridItem}
              keyExtractor={item => item.key}
              numColumns={3}
              scrollEnabled={false}
              contentContainerStyle={styles.gridList}
              columnWrapperStyle={styles.gridRow}
              style={{ zIndex: 1 }} // Optional: to ensure it's above background
            />
          </View>


          {loading ? (
            <ActivityIndicator size="large" color={Colors.light.primary} style={{ backgroundColor: Colors.light.background, padding: 20 }} />
          ) : countdownData.length > 0 && (<View style={{
            justifyContent: 'center', paddingTop: 14, backgroundColor: Colors.light.background,
          }}>
            <Text style={{ textAlign: 'center', fontSize: 18, color: Colors.light.primary, fontFamily: 'MyriadPro-Bold', marginBottom: 8, textTransform: 'uppercase' }}>
              Countdown to 2026 Elections
            </Text>
            <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'flex-start' }}>
              {countdownData.map(item => (
                <CountdownTimer
                  key={item.id}
                  targetDate={item.date}
                  label={item.label}
                />
              ))}
            </View>
          </View>)}
          <Footer />
        </ScrollView>

      </View>
      {showTermsPopup && (
        <TermsPopup
          onClose={handlePopupClose}
        />
      )}

      <LoginPopup
        visible={showLoginPopup}
        onClose={() => setShowLoginPopup(false)}
        onLoginSuccess={async (data) => {
          console.log('Login response:', data);
          if (data.token) {
            // Store the actual token from API response
            await StorageService.saveItem(StorageKeys.authToken, data.token);
            await StorageService.saveItem(StorageKeys.candidateId, data.user?.id);
            setAuthToken(data.token);
          }
        }}
      />

    </SafeAreaView>
  );
};

export default DashboardScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
    width: '100%',
  },

  gridList: {
    paddingVertical: 12,
    paddingHorizontal: 12,
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
  gridLabel: {
    fontSize: 12,
    color: '#fff',
    fontFamily: 'MyriadPro-Bold',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 15,
  },
  unreadNotificationsContainer: {
    marginLeft: 16,
    // width: 24,
    // height: 24,
    borderRadius: 50,
    padding: 6,
    backgroundColor: Colors.light.primary,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  unreadNotificationsCountContainer: {
    position: 'absolute',
    top: -4,
    right: -8,
    backgroundColor: Colors.light.secondary,
    borderRadius: 50,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  unreadNotificationsCountText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontFamily: 'MyriadPro-Bold',
    textAlign: 'center',
    lineHeight: 18,
    textAlignVertical: 'center',
    includeFontPadding: false,
  }
});