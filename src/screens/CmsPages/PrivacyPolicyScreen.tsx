import React from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { NavigationProp, useNavigation } from '@react-navigation/native';
import AppBar from '../../components/AppBar';
import { globalStyles } from '../../styles/globalStyles';
import { Colors } from '../../constants/colors';

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

            <View style={{
                padding: 16,
            }}>
                <TouchableOpacity activeOpacity={0.7} style={styles.button} onPress={() => {
                    navigation.navigate("termsConditions");
                }}>
                    <Text style={styles.buttonText}>View Terms & Conditions</Text>
                </TouchableOpacity>
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

    button: {
        width: "100%",
        padding: 12,
        backgroundColor: Colors.light.primary,
        borderRadius: 8,
        alignItems: "center",
    },
    buttonText: {
        color: "white",
        fontSize: 15,
        fontFamily: 'MyriadPro-Bold',
    },
});

export default PrivacyPolicyScreen;