import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    Modal,
    StyleSheet,
    Alert,
    KeyboardAvoidingView,
    Platform,
    TouchableWithoutFeedback,
    Dimensions,
} from 'react-native';
import { Colors } from '../constants/colors';
import { globalStyles } from '../styles/globalStyles';
import Button from './Button';

const { width } = Dimensions.get("window");

interface LoginPopupProps {
    visible: boolean;
    onClose: () => void;
    onLogin?: (credentials: { email: string; password: string }) => void;
}

const LoginPopup: React.FC<LoginPopupProps> = ({ visible, onClose, onLogin }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

    const validateForm = (): boolean => {
        const newErrors: { email?: string; password?: string } = {};

        if (!email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(email)) {
            newErrors.email = 'Email is invalid';
        }

        if (!password.trim()) {
            newErrors.password = 'Password is required';
        } else if (password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleLogin = async () => {
        if (!validateForm()) return;

        setIsLoading(true);

        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1500));

            // Call the onLogin callback with credentials
            if (onLogin) {
                onLogin({ email, password });
            }

            // Reset form
            resetForm();

            Alert.alert('Success', 'Login successful!');
            onClose();
        } catch (error) {
            Alert.alert('Error', 'Login failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const resetForm = () => {
        setEmail('');
        setPassword('');
        setErrors({});
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    return (
        <Modal
            transparent
            visible={visible}
            animationType="fade"
            onRequestClose={handleClose}
        >
            <TouchableWithoutFeedback onPress={handleClose}>
                <View style={globalStyles.modalContainer}>
                    <TouchableWithoutFeedback onPress={() => { }}>
                        <KeyboardAvoidingView
                            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                            style={styles.keyboardAvoidingView}
                        >
                            <View style={[globalStyles.modalContent, { width: width * 0.9 }]}>
                                {/* Header */}
                                <View style={styles.header}>
                                    <Text style={styles.title}>Login</Text>
                                    <TouchableOpacity
                                        activeOpacity={0.7}
                                        style={styles.closeButton}
                                        onPress={handleClose}
                                    >
                                        <Text style={styles.closeButtonText}>×</Text>
                                    </TouchableOpacity>
                                </View>

                                <Text style={styles.description}>
                                    Please enter your credentials to continue
                                </Text>

                                {/* Form */}
                                <View style={styles.form}>
                                    <View style={styles.inputContainer}>
                                        <Text style={styles.label}>Email</Text>
                                        <TextInput
                                            style={[
                                                styles.input,
                                                errors.email && styles.inputError
                                            ]}
                                            placeholder="Enter your email"
                                            placeholderTextColor={Colors.light.text + '80'}
                                            value={email}
                                            onChangeText={setEmail}
                                            keyboardType="email-address"
                                            autoCapitalize="none"
                                            autoCorrect={false}
                                        />
                                        {errors.email && (
                                            <Text style={styles.errorText}>{errors.email}</Text>
                                        )}
                                    </View>

                                    <View style={styles.inputContainer}>
                                        <Text style={styles.label}>Password</Text>
                                        <TextInput
                                            style={[
                                                styles.input,
                                                errors.password && styles.inputError
                                            ]}
                                            placeholder="Enter your password"
                                            placeholderTextColor={Colors.light.text + '80'}
                                            value={password}
                                            onChangeText={setPassword}
                                            secureTextEntry={true}
                                            autoCapitalize="none"
                                            autoCorrect={false}
                                        />
                                        {errors.password && (
                                            <Text style={styles.errorText}>{errors.password}</Text>
                                        )}
                                    </View>


                                    <Button title={isLoading ? 'Signing In...' : 'Sign In'} onPress={handleLogin} />

                                    <TouchableOpacity
                                        activeOpacity={0.7}
                                        style={styles.forgotPassword}
                                        onPress={() => {
                                            // Handle forgot password
                                            Alert.alert('Forgot Password', 'Password reset functionality will be implemented here.');
                                        }}
                                    >
                                        <Text style={styles.forgotPasswordText}>
                                            Forgot Password?
                                        </Text>
                                    </TouchableOpacity>
                                </View>

                                <Text style={styles.footnote}>
                                    By signing in, you agree to our Terms & Conditions and Privacy Policy.
                                </Text>
                            </View>
                        </KeyboardAvoidingView>
                    </TouchableWithoutFeedback>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );
};

const styles = StyleSheet.create({

    keyboardAvoidingView: {
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },

    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        marginBottom: 10,
    },
    title: {
        fontSize: 22,
        color: Colors.light.primary,
        fontFamily: 'MyriadPro-Bold',
        textAlign: "center",
        flex: 1,
    },
    closeButton: {
        width: 26,
        height: 26,
        borderRadius: 15,
        backgroundColor: Colors.light.primary + '20',
        justifyContent: 'center',
        alignItems: 'center',
    },
    closeButtonText: {
        fontSize: 18,
        fontFamily: 'MyriadPro-Bold',
        lineHeight: 20,
        color: Colors.light.primary,
    },
    description: {
        fontSize: 14,
        textAlign: "center",
        marginBottom: 20,
        color: Colors.light.text,
        fontFamily: 'MyriadPro-Regular',
        lineHeight: 18,
    },
    form: {
        width: '100%',
    },
    inputContainer: {
        marginBottom: 16,
        width: '100%',
    },
    label: {
        fontSize: 14,
        fontFamily: 'MyriadPro-Bold',
        color: Colors.light.primary,
        marginBottom: 8,
    },
    input: {
        borderWidth: 1,
        borderColor: Colors.light.primary + '40',
        borderRadius: 8,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 16,
        fontFamily: 'MyriadPro-Regular',
        backgroundColor: Colors.light.background,
        color: Colors.light.text,
    },
    inputError: {
        borderColor: Colors.light.error,
    },
    errorText: {
        color: Colors.light.error,
        fontSize: 14,
        fontFamily: 'MyriadPro-Regular',
        marginTop: 4,
    },

    forgotPassword: {
        alignItems: 'center',
        marginTop: 8,
        padding: 8,
    },
    forgotPasswordText: {
        color: Colors.light.primary,
        fontSize: 14,
        fontFamily: 'MyriadPro-Regular',
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

export default LoginPopup;