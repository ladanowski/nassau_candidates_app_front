import React, { useEffect, useState } from 'react';
import { Alert, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { NavigationProp, RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import AppBar from '../../components/AppBar';
import { globalStyles } from '../../styles/globalStyles';
import { Colors } from '../../constants/colors';
import { svgs } from '../../constants/images';
import SwitchOptionItem from '../../components/SwitchOptionItem';
import LoginPopup from '../../components/LoginPopup';
import { StorageKeys } from '../../constants/storage_keys';
import StorageService from '../../services/StorageService';

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

  useEffect(() => {
    const checkAuthToken = async () => {
      const token = await StorageService.getItem<string>(StorageKeys.authToken);
      setAuthToken(token);
    };

    checkAuthToken();
  }, []);


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
            await StorageService.removeItem(StorageKeys.authToken);
            setAuthToken(null);
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={globalStyles.safeAreaContainer}>
      <AppBar title={title} />

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <SwitchOptionItem title="Finance Report" value={isFinanceReport} onValueChange={(val) => authToken ? setIsFinanceReport(val) : setShowLoginPopup(true)} />
        <SwitchOptionItem title="Important Election Dates" value={isImportantElectionDates} onValueChange={(val) => authToken ? setIsImportantElectionDates(val) : setShowLoginPopup(true)} />
        <SwitchOptionItem title="Miscellaneous Information" value={isMiscellaneousInfo} onValueChange={(val) => authToken ? setIsMiscellaneousInfo(val) : setShowLoginPopup(true)} />
        <SwitchOptionItem title="Petition Batch Update" value={isPetitionBatchUpdate} onValueChange={(val) => authToken ? setIsPetitionBatchUpdate(val) : setShowLoginPopup(true)} />
        <SwitchOptionItem title="Qualifying" value={isQualifying} onValueChange={(val) => authToken ? setIsQualifying(val) : setShowLoginPopup(true)} />
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
        onLogin={async (credentials) => {
          console.log('Login credentials:', credentials);
          // Handle your login logic here
          await StorageService.saveItem(StorageKeys.authToken, 'TOKEN123');
          setAuthToken('TOKEN123');
        }}
      />

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