import React, { useEffect, useState } from 'react';
import { Alert, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View, ActivityIndicator, Modal } from "react-native";
import { NavigationProp, RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import AppBar from '../../components/AppBar';
import { globalStyles } from '../../styles/globalStyles';
import { Colors } from '../../constants/colors';
import { svgs } from '../../constants/images';
import SwitchOptionItem from '../../components/SwitchOptionItem';
import LoginPopup from '../../components/LoginPopup';
import { StorageKeys } from '../../constants/storage_keys';
import StorageService from '../../services/StorageService';
import { getSettings, updateSettings } from '../../services/api_services/SettingsService';

type SettingsRouteParams = {
  settings: {
    title: string;
  };
};

const SettingsScreen: React.FC = () => {
  const route = useRoute<RouteProp<SettingsRouteParams, 'settings'>>();
  const { title } = route.params;
  const navigation = useNavigation<NavigationProp<any>>();

  const [showLoginPopup, setShowLoginPopup] = useState(false);

  const [isFinanceReport, setIsFinanceReport] = useState(false);
  const [isImportantElectionDates, setIsImportantElectionDates] = useState(false);
  const [isMiscellaneousInfo, setIsMiscellaneousInfo] = useState(false);
  const [isPetitionBatchUpdate, setIsPetitionBatchUpdate] = useState(false);
  const [isQualifying, setIsQualifying] = useState(false);

  const [authToken, setAuthToken] = useState<string | null>(null);

  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const checkAuthToken = async () => {
      const token = await StorageService.getItem<string>(StorageKeys.authToken);
      setAuthToken(token);
    };

    checkAuthToken();
  }, []);


  useEffect(() => {
    if (!authToken) return;
    fetchSettings();
  }, [authToken]);

  const fetchSettings = async () => {
    try {
      const settings = await getSettings();
      setIsFinanceReport(settings?.FinanceReport || false);
      setIsImportantElectionDates(settings?.ImportantElectionDates || false);
      setIsMiscellaneousInfo(settings?.MiscInformation || false);
      setIsPetitionBatchUpdate(settings?.PetitionBatchUpdate || false);
      setIsQualifying(settings?.Qualifying || false);

    } catch (error: any) {
      if (error?.status === 401 || error?.status === 403) {
        Alert.alert('Session expired', error.message || 'Please login again.');
        await resetAuthAndSwitches({ promptLogin: true });
        return;
      } else {
        Alert.alert('Settings', error?.message || 'Failed to fetch settings. Please try again later.');
        return;
      }
    }
  };

  // Handler for updating settings
  const updateSingleSetting = async (
    key: 'FinanceReport' | 'ImportantElectionDates' | 'MiscInformation' | 'PetitionBatchUpdate' | 'Qualifying',
    val: boolean
  ) => {
    if (!authToken) { setShowLoginPopup(true); return; }
    setUpdating(true);
    try {
      const settings = await updateSettings({ [key]: val });
      console.log('Update settings response:', settings);
  
      // update the matching state only on success
      setIsFinanceReport(settings.data?.FinanceReport || false);
      setIsImportantElectionDates(settings.data?.ImportantElectionDates || false);
      setIsMiscellaneousInfo(settings.data?.MiscInformation || false);
      setIsPetitionBatchUpdate(settings.data?.PetitionBatchUpdate || false);
      setIsQualifying(settings.data?.Qualifying || false);

    } catch (e: any) {
      if (e?.status === 401 || e?.status === 403) {
        console.log('Session expired:', e);
        await resetAuthAndSwitches({ promptLogin: true });
        return;
      }
      console.error('Failed to update settings:', e);
    } finally {
      setUpdating(false);
    }
  };
  

  const resetAuthAndSwitches = async (options?: { promptLogin?: boolean }) => {
    await StorageService.removeItem(StorageKeys.authToken);
    setAuthToken(null);

    // reset switches
    setIsFinanceReport(false);
    setIsImportantElectionDates(false);
    setIsMiscellaneousInfo(false);
    setIsPetitionBatchUpdate(false);
    setIsQualifying(false);

    if (options?.promptLogin) {
      setShowLoginPopup(true);
    }
  };

  // Handler for logout
  const handleLogout = async () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        {
          text: "No",
          style: "cancel"
        },
        {
          text: "Yes",
          onPress: async () => {
            await resetAuthAndSwitches();
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={globalStyles.safeAreaContainer}>
      <AppBar title={title} />

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <SwitchOptionItem
          title="Finance Report"
          value={isFinanceReport}
          onValueChange={(val) => updateSingleSetting('FinanceReport', val)}
       />

        <SwitchOptionItem
          title="Important Election Dates"
          value={isImportantElectionDates}
          onValueChange={(val) => updateSingleSetting('ImportantElectionDates', val)} />

        <SwitchOptionItem
          title="Miscellaneous Information"
          value={isMiscellaneousInfo}
          onValueChange={(val) => updateSingleSetting('MiscInformation', val)} />

        <SwitchOptionItem
          title="Petition Batch Update"
          value={isPetitionBatchUpdate}
          onValueChange={(val) => updateSingleSetting('PetitionBatchUpdate', val)} />

        <SwitchOptionItem
          title="Qualifying"
          value={isQualifying}
          onValueChange={(val) => updateSingleSetting('Qualifying', val)} />

        {authToken
          ? renderSettingsItem("Logout", handleLogout)
          : renderSettingsItem("Login", () => setShowLoginPopup(true))
        }
        {renderSettingsItem("Privacy Policy", () => navigation.navigate("privacyPolicy"))}
        {renderSettingsItem("Terms & Conditions", () => navigation.navigate("termsConditions"))}
      </ScrollView>

      <LoginPopup
        visible={showLoginPopup}
        onClose={() => setShowLoginPopup(false)}
        onLoginSuccess={async (data) => {
          console.log('Login response:', data);
          if (data.token) {
            // Store the actual token from API response
            await StorageService.saveItem(StorageKeys.authToken, data.token);
            setAuthToken(data.token);
            await StorageService.saveItem(StorageKeys.candidateId, data.user?.id);

            // fetch settings
            fetchSettings();
          }
        }}
      />

      <Modal transparent visible={updating} animationType="fade">
        <View style={{ flex: 1, backgroundColor: '#0008', justifyContent: 'center', alignItems: 'center' }}>
          <View style={{ backgroundColor: 'white', padding: 20, borderRadius: 12, alignItems: 'center', minWidth: 200 }}>
            <ActivityIndicator size="large" color={Colors.light.primary} />
            <Text style={{ marginTop: 12, color: Colors.light.text, fontFamily: 'MyriadPro-Regular' }}>
              Updating settings...
            </Text>
          </View>
        </View>
      </Modal>

    </SafeAreaView>

  );
};

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
  },
  scrollContent: {
    paddingVertical: 16,
  },
});

const renderSettingsItem = (title: string, onPress: () => void) => (
  <TouchableOpacity activeOpacity={0.7} onPress={onPress} style={{ marginBottom: 12 }}>
    <View style={{
      backgroundColor: Colors.light.primary,
      flexDirection: 'row',
      paddingVertical: 16,
      paddingHorizontal: 12,
      borderRadius: 8,
      alignItems: 'center'
    }}>
      <Text style={{
        color: "white",
        fontFamily: 'MyriadPro-Bold',
        fontSize: 16,
        flex: 1,
      }}>{title}</Text>
      <svgs.chevronRight width={16} height={16} color={"white"} />
    </View>
  </TouchableOpacity>
);

export default SettingsScreen;