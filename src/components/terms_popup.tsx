import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Dimensions } from 'react-native';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { Colors } from '../constants/colors';

const { width } = Dimensions.get("window");

interface TermsPopupProps {
    onClose: () => void;
}

const TermsPopup: React.FC<TermsPopupProps> = ({ onClose }) => {
    const navigation = useNavigation<NavigationProp<any>>();

    const [modalVisible, setModalVisible] = useState(true);

    const handleAgree = () => {
        setModalVisible(false);
        onClose();
    };

    return (
        <Modal transparent visible={modalVisible} animationType="slide">
            <View style={styles.modalContainer}>
                <View style={styles.modalContent}>
                    <Text style={styles.title}>Vote Nassau FL: Candidate App</Text>

                    <Text style={styles.description}>
                        Please review our Privacy Policy and Terms & Conditions before proceeding with the app.
                    </Text>

                    <TouchableOpacity activeOpacity={0.7} style={styles.linkButton} onPress={() => {
                        // setModalVisible(false);
                        navigation.navigate("privacyPolicy");
                    }}>
                        <Text style={styles.linkText}>View Privacy Policy</Text>
                    </TouchableOpacity>

                    <TouchableOpacity activeOpacity={0.7} style={styles.linkButton} onPress={() => {
                        // setModalVisible(false);
                        navigation.navigate("termsConditions");
                    }}>
                        <Text style={styles.linkText}>View Terms and Conditions</Text>
                    </TouchableOpacity>

                    <TouchableOpacity activeOpacity={0.7} style={styles.agreeButton} onPress={handleAgree}>
                        <Text style={styles.agreeButtonText}>Agree & Continue</Text>
                    </TouchableOpacity>

                    <Text style={styles.footnote}>
                        By clicking Agree & Continue, you acknowledge that you have read and understood our policies.
                    </Text>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: 'rgba(255,255,255,0.2)',
    },
    modalContent: {
        width: width * 0.85,
        backgroundColor: Colors.light.background,
        borderRadius: 12,
        padding: 20,
        alignItems: "center",
        borderWidth: 2,
        borderColor: Colors.light.primary,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    title: {
        fontSize: 22,
        color: Colors.light.primary,
        fontFamily: 'MyriadPro-Bold',
        marginBottom: 15,
        textAlign: "center",
    },
    description: {
        fontSize: 14,
        textAlign: "center",
        marginBottom: 20,
        color: Colors.light.text,
        fontFamily: 'MyriadPro-Regular',
        lineHeight: 18,
    },
    linkButton: {
        width: "100%",
        padding: 12,
        marginVertical: 6,
        borderWidth: 1,
        borderColor: Colors.light.primary,
        borderRadius: 8,
        alignItems: "center",
    },
    linkText: {
        color: Colors.light.primary,
        fontSize: 15,
        fontFamily: 'MyriadPro-Regular',
    },
    agreeButton: {
        width: "100%",
        padding: 12,
        marginTop: 15,
        marginBottom: 10,
        backgroundColor: Colors.light.primary,
        borderRadius: 8,
        alignItems: "center",
    },
    agreeButtonText: {
        color: "white",
        fontSize: 15,
        fontFamily: 'MyriadPro-Bold',
    },
    footnote: {
        fontSize: 12,
        color: Colors.light.text,
        fontFamily: 'MyriadPro-Regular',
        textAlign: "center",
        marginTop: 15,
        lineHeight: 16,
    },
});

export default TermsPopup;