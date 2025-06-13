import React from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { NavigationProp, useNavigation } from '@react-navigation/native';
import AppBar from '../../components/AppBar';
import { globalStyles } from '../../styles/globalStyles';
import { Colors } from '../../constants/colors';
import Button from '../../components/Button';

const PrivacyPolicyScreen: React.FC = () => {
    const navigation = useNavigation<NavigationProp<any>>();

    return (
        <SafeAreaView style={globalStyles.safeAreaContainer}>
            <AppBar title={"Privacy Policy"} />

            <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
                <Text style={styles.text}>
                    The Privacy Policy explains how this app handles and protects your personal information. The Terms and Conditions defines the legal conditions for your use of this app.{"\n \n"}Please view and read these policies carefully. You must accept both policies by tapping the Agree button to continue using this app.
                </Text>
            </ScrollView>

            <View style={{ padding: 16, }}> 
                <Button title="View Terms & Conditions" onPress={() => navigation.navigate("termsConditions")} />
            </View>
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
    text: {
        fontSize: 16,
        lineHeight: 24,
        textAlign: 'left',
        fontFamily: 'MyriadPro-Regular',
    },
});

export default PrivacyPolicyScreen;