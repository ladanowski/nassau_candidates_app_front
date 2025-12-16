import React, { useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, View, TextInput, KeyboardAvoidingView, Platform, Alert } from "react-native";
import { NavigationProp, RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import AppBar from '../../components/AppBar';
import { globalStyles } from '../../styles/globalStyles';
import { Colors } from '../../constants/colors';
import Button from '../../components/Button';
import { contactUs } from '../../services/api_services/ContactUsService';


type ContactUsRouteParams = {
    contactUs: {
        title: string;
    };
};
const ContactUsScreen: React.FC = () => {
    const route = useRoute<RouteProp<ContactUsRouteParams, 'contactUs'>>();
    const { title } = route.params;
    const navigation = useNavigation<NavigationProp<any>>();

    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState<{ firstName?: string; lastName?: string; email?: string; phoneNumber?: string; message?: string }>({});

    const validateForm = (): boolean => {
        const newErrors: { firstName?: string; lastName?: string; email?: string; phoneNumber?: string; message?: string } = {};

        if (!firstName.trim()) {
            newErrors.firstName = 'First Name is required';
        }

        if (!lastName.trim()) {
            newErrors.lastName = 'Last Name is required';
        }

        if (!email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(email)) {
            newErrors.email = 'Email is invalid';
        }

        if (!phoneNumber.trim()) {
            newErrors.phoneNumber = 'Phone Number is required';
        }
        // if (!phoneNumber.trim()) {
        //     newErrors.phoneNumber = 'Phone Number is required';
        // } else if (!/^\d{10}$/.test(phoneNumber)) {
        //     newErrors.phoneNumber = 'Phone Number must be 10 digits';
        // }

        if (!message.trim()) {
            newErrors.message = 'Message is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;

        setIsLoading(true);

        try {

            const data = await contactUs({
                firstName,
                lastName,
                email,
                phone: phoneNumber,
                message,
            });

            if (data.success) {
                // Reset form
                resetForm();

                Alert.alert('Success', data.message || 'Message sent successfully!');
                navigation.goBack();
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
        setFirstName('');
        setLastName('');
        setEmail('');
        setPhoneNumber('');
        setMessage('');
        setErrors({});
    };

    return (
        <SafeAreaView style={globalStyles.safeAreaContainer}>
            <AppBar title={title} />

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
                    <Text style={styles.title}>Send us a Message</Text>

                    <Text style={styles.description}>
                        Have a question? We're here to help. Send us a message and we'll be in touch.
                    </Text>

                    {/* Form */}
                    <View style={styles.form}>
                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>First Name</Text>
                            <TextInput
                                style={[
                                    styles.input,
                                    errors.firstName && styles.inputError
                                ]}
                                placeholder="Enter your first name"
                                placeholderTextColor={Colors.light.text + '80'}
                                value={firstName}
                                onChangeText={setFirstName}
                                autoCapitalize="words"
                            />
                            {errors.firstName && (
                                <Text style={styles.errorText}>{errors.firstName}</Text>
                            )}
                        </View>

                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>Last Name</Text>
                            <TextInput
                                style={[
                                    styles.input,
                                    errors.lastName && styles.inputError
                                ]}
                                placeholder="Enter your last name"
                                placeholderTextColor={Colors.light.text + '80'}
                                value={lastName}
                                onChangeText={setLastName}
                                autoCapitalize="words"
                            />
                            {errors.lastName && (
                                <Text style={styles.errorText}>{errors.lastName}</Text>
                            )}
                        </View>

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
                            <Text style={styles.label}>Phone Number</Text>
                            <TextInput
                                style={[
                                    styles.input,
                                    errors.phoneNumber && styles.inputError
                                ]}
                                placeholder="Enter your phone number"
                                placeholderTextColor={Colors.light.text + '80'}
                                value={phoneNumber}
                                onChangeText={setPhoneNumber}
                                keyboardType="phone-pad"
                            />
                            {errors.phoneNumber && (
                                <Text style={styles.errorText}>{errors.phoneNumber}</Text>
                            )}
                        </View>

                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>Message</Text>
                            <TextInput
                                style={[
                                    styles.input,
                                    styles.messageInput,
                                    errors.message && styles.inputError
                                ]}
                                placeholder="Enter your message"
                                placeholderTextColor={Colors.light.text + '80'}
                                value={message}
                                onChangeText={setMessage}
                                maxLength={1500}
                                multiline
                                numberOfLines={5}
                                textAlignVertical="top"
                            />
                            {errors.message && (
                                <Text style={styles.errorText}>{errors.message}</Text>
                            )}
                        </View>

                        <Button title={isLoading ? 'Please wait...' : 'Submit'} onPress={handleSubmit} />

                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
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
    title: {
        fontSize: 22,
        color: Colors.light.primary,
        fontFamily: 'MyriadPro-Bold',
        textAlign: "left",
        marginBottom: 10,
    },
    description: {
        fontSize: 14,
        textAlign: "left",
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
    messageInput: {
        minHeight: 120,
        paddingTop: 12,
    },
    errorText: {
        color: Colors.light.error,
        fontSize: 14,
        fontFamily: 'MyriadPro-Regular',
        marginTop: 4,
    },

});

export default ContactUsScreen;