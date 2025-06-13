import React from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { NavigationProp, RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import AppBar from '../../components/AppBar';
import { globalStyles } from '../../styles/globalStyles';
import { Colors } from '../../constants/colors';
import { svgs } from '../../constants/images';
import SwitchOptionItem from '../../components/SwitchOptionItem';

type SettingsRouteParams = {
  settings: {
    title: string;
  };
};

const SettingsScreen: React.FC = () => {
  const route = useRoute<RouteProp<SettingsRouteParams, 'settings'>>();
  const { title } = route.params;
  const navigation = useNavigation<NavigationProp<any>>();

  return (
    <SafeAreaView style={globalStyles.safeAreaContainer}>
      <AppBar title={title} />

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {renderSettingsItem("Candidate Finance Report", () => navigation.navigate("candidateFinanceReport"))}
        {renderSettingsItem("Committee Finance Report", () => navigation.navigate("committeeFinanceReport"))}
        {renderSettingsItem("Important Election Dates", () => navigation.navigate("importantElectionDates"))}

        <SwitchOptionItem title="Miscellaneous Information" value={true} onValueChange={(val) => {/* handle toggle */ }} />
        <SwitchOptionItem title="Petition Batch Update" value={false} onValueChange={(val) => {/* handle toggle */ }} />

        {renderSettingsItem("Petition Due Date - County", () => { })}
        {renderSettingsItem("Petition Due Date - Judicial", () => { })}
        {renderSettingsItem("Login", () => { })}
        {renderSettingsItem("Privacy Policy", () => navigation.navigate("privacyPolicy"))}
        {renderSettingsItem("Terms & Conditions", () => navigation.navigate("termsConditions"))}
      </ScrollView>
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