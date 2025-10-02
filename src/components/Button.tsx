import React from 'react';
import { Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors } from '../constants/colors';

interface BannerHeaderProps {
    title: string;
    onPress: () => void;
}

const Button: React.FC<BannerHeaderProps> = ({ title, onPress }) => {

    return (
        <TouchableOpacity activeOpacity={0.7} style={styles.button} onPress={onPress}>
            <Text style={styles.buttonText}>{title}</Text>
        </TouchableOpacity>
    );
};

export default Button;

const styles = StyleSheet.create({
    button: {
        width: "100%",
        padding: 12,
        marginTop: 15,
        marginBottom: 10,
        backgroundColor: Colors.light.primary,
        borderRadius: 8,
        alignItems: "center",
    },
    buttonText: {
        color: "white",
        fontSize: 16,
        fontFamily: 'MyriadPro-Bold',
    },
});
