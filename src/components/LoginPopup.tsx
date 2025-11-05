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
    Image,
} from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { Colors } from '../constants/colors';
import { globalStyles } from '../styles/globalStyles';
import Button from './Button';
import { images, svgs } from '../constants/images';
import { loginCandidate } from '../services/api_services/AuthService';
import StorageService from '../services/StorageService';
import { StorageKeys } from '../constants/storage_keys';
import { FORGOT_PASSWORD_URL } from '../config/api';

const { width } = Dimensions.get("window");

interface LoginPopupProps {
    visible: boolean;
    onClose: () => void;
    onLoginSuccess?: (data: {
        email: string;
        user?: any;
        token?: string;
    }) => void;
}

const LoginPopup: React.FC<LoginPopupProps> = ({ visible, onClose, onLoginSuccess }) => {
    const navigation = useNavigation<NavigationProp<any>>();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
    const [showPassword, setShowPassword] = useState(false);

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
            const fcmToken = await StorageService.getItem<string>(StorageKeys.fcmToken);

            const data = await loginCandidate(email.trim(), password, fcmToken);

            if (data.success && data.token) {
                // Call the onLoginSuccess callback with the API response data
                if (onLoginSuccess) {
                    onLoginSuccess({
                        email,
                        user: data.user,
                        token: data.token
                    });
                }

                // Reset form
                resetForm();

                Alert.alert('Success', 'Login successful!');
                onClose();
            } else {
                Alert.alert('Error', data.message || 'Login failed. Please check your credentials.');
            }
        } catch (error: any) {
            console.error('Login API error:', error);
            Alert.alert('Login', error.message || 'Network error. Please check your connection and try again.');
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
                                    <Image source={images.logo} style={{ width: 100, height: 100 }} />
                                    <TouchableOpacity
                                        activeOpacity={0.7}
                                        style={[styles.closeButton, { position: 'absolute', right: 0, top: 0 }]}
                                        onPress={handleClose}
                                    >
                                        <Text style={styles.closeButtonText}>×</Text>
                                    </TouchableOpacity>
                                </View>

                                <Text style={styles.title}>Login</Text>

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
                                        <View style={styles.passwordInputWrapper}>
                                            <TextInput
                                                style={[
                                                    styles.input,
                                                    errors.password && styles.inputError
                                                ]}
                                                placeholder="Enter your password"
                                                placeholderTextColor={Colors.light.text + '80'}
                                                value={password}
                                                onChangeText={setPassword}
                                                secureTextEntry={!showPassword}
                                                autoCapitalize="none"
                                                autoCorrect={false}
                                            />
                                            <TouchableOpacity
                                                activeOpacity={0.7}
                                                onPress={() => setShowPassword(prev => !prev)}
                                                style={styles.eyeToggle}
                                            >
                                                {showPassword ? <svgs.eye width={20} height={20} color={Colors.light.text} /> : <svgs.eyeOff width={20} height={20} color={Colors.light.text} />}
                                            </TouchableOpacity>
                                        </View>
                                        {errors.password && (
                                            <Text style={styles.errorText}>{errors.password}</Text>
                                        )}
                                    </View>


                                    <Button title={isLoading ? 'Signing In...' : 'Sign In'} onPress={handleLogin} />

                                    <TouchableOpacity
                                        activeOpacity={0.7}
                                        style={styles.forgotPassword}
                                        onPress={() => {
                                            //Route to forgot password URL
                                            handleClose();
                                            navigation.navigate('webView', {
                                                title: 'Forgot Password',
                                                link: FORGOT_PASSWORD_URL,
                                            });
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
        justifyContent: 'center',
        alignItems: 'flex-start',
        width: '100%',
        marginBottom: 10,
        position: 'relative',
    },
    title: {
        fontSize: 22,
        color: Colors.light.primary,
        fontFamily: 'MyriadPro-Bold',
        textAlign: "center",
        marginBottom: 10,
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
    passwordInputWrapper: {
        position: 'relative',
        justifyContent: 'center',
    },
    eyeToggle: {
        position: 'absolute',
        right: 12,
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        paddingLeft: 8,
    },
});

export default LoginPopup;