import React, {useEffect, useMemo, useState} from 'react';
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  ActivityIndicator,
} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import {useNavigation, NavigationProp, RouteProp, useRoute} from '@react-navigation/native';
import AppBar from '../../components/AppBar';
import Button from '../../components/Button';
import {Colors} from '../../constants/colors';
import {StorageKeys} from '../../constants/storage_keys';
import StorageService from '../../services/StorageService';
import {globalStyles} from '../../styles/globalStyles';

type ContactUsRouteParams = {
  contactUs: {
    title?: string;
  };
};

const ContactUsScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp<any>>();
  const route = useRoute<RouteProp<ContactUsRouteParams, 'contactUs'>>();
  const title = route?.params?.title ?? 'Contact Us';

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [authToken, setAuthToken] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userPhone, setUserPhone] = useState<string | null>(null);
  const [candidateId, setCandidateId] = useState<string | null>(null);

  const [message, setMessage] = useState('');

  const displayName = useMemo(() => (userName ?? '').trim(), [userName]);

  useEffect(() => {
    const load = async () => {
      try {
        const [token, name, email, phoneRaw, cid] = await Promise.all([
          StorageService.getItem<string>(StorageKeys.authToken),
          StorageService.getItem<string>(StorageKeys.userName),
          StorageService.getItem<string>(StorageKeys.userEmail),
          StorageService.getItem<unknown>(StorageKeys.userPhone),
          StorageService.getItem<string>(StorageKeys.candidateId),
        ]);

        setAuthToken(token);
        setUserName(name);
        setUserEmail(email);
        const phoneText =
          phoneRaw === null || phoneRaw === undefined
            ? null
            : String(phoneRaw).trim();
        setUserPhone(phoneText && phoneText.length > 0 ? phoneText : null);
        setCandidateId(cid);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const onSubmit = async () => {
    const trimmed = message.trim();
    if (!trimmed) {
      Alert.alert('Contact Us', 'Please enter a message.');
      return;
    }

    if (!authToken) {
      Alert.alert('Contact Us', 'Please sign in to send a message.');
      return;
    }

    setSubmitting(true);
    try {
      const emailRecipient = 'mfranzese@votenassaufl.gov'; // TODO: change if you want a different recipient
      const emailSubject = 'Contact Us';
      const emailBody =
        `New Contact Us submission\n\n` +
        `Name: ${displayName || ''}\n` +
        `Email: ${userEmail || ''}\n` +
        `Phone: ${userPhone || ''}\n` +
        `CandidateId: ${candidateId || ''}\n\n` +
        `Message:\n${trimmed}\n`;

      await firestore()
        .collection('ContactUs')
        .add({
          name: displayName || '',
          email: userEmail || '',
          phone: userPhone || '',
          message: trimmed,
          candidateId: candidateId || '',
          source: 'mobile',
          createdAt: firestore.FieldValue.serverTimestamp(),
        });

      // Fire-and-forget email notification (don’t block submission on email failures)
      try {
        const base =
          'https://precinctmanagement20230415145526.azurewebsites.net/EmailGraphAuthAPI.aspx';
        const qs =
          `Email=${encodeURIComponent(emailRecipient)}` +
          `&Subject=${encodeURIComponent(emailSubject)}` +
          `&Body=${encodeURIComponent(emailBody)}` +
          `&IsLiveServer=true`;
        await fetch(`${base}?${qs}`, {method: 'GET'});
      } catch (emailErr) {
        console.warn('ContactUs email notification failed:', emailErr);
      }

      setMessage('');
      Alert.alert(
        'Message Sent',
        'Thanks! We received your message and will be in touch.',
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate('Dashboard'),
          },
        ],
      );
    } catch (e: any) {
      console.error('ContactUs Firestore write failed:', e);
      Alert.alert(
        'Contact Us',
        e?.message || 'Failed to send message. Please try again.',
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={globalStyles.safeAreaContainer}>
      <AppBar title={title} />

      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled">
        <Text style={styles.heading}>Send us a Message</Text>
        <Text style={styles.subheading}>
          Have a question? We’re here to help. Send us a message and we’ll be in
          touch.
        </Text>

        {loading ? (
          <View style={styles.loadingWrap}>
            <ActivityIndicator size="large" color={Colors.light.primary} />
          </View>
        ) : (
          <>
            <View style={styles.field}>
              <Text style={styles.label}>Name</Text>
              <TextInput
                style={[styles.input, styles.readonly]}
                value={displayName}
                editable={false}
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={[styles.input, styles.readonly]}
                value={userEmail ?? ''}
                editable={false}
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Phone number</Text>
              <TextInput
                style={[styles.input, styles.readonly]}
                value={userPhone ?? ''}
                editable={false}
                placeholder="Not on file"
                placeholderTextColor={Colors.light.text + '80'}
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Message</Text>
              <TextInput
                style={[styles.input, styles.messageInput]}
                value={message}
                onChangeText={setMessage}
                placeholder="Type your message..."
                placeholderTextColor={Colors.light.text + '80'}
                multiline
                textAlignVertical="top"
                editable={!submitting}
              />
            </View>

            <Button
              title={submitting ? 'Sending...' : 'Send Message'}
              onPress={onSubmit}
            />
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 24,
  },
  heading: {
    fontSize: 22,
    fontFamily: 'MyriadPro-Bold',
    color: Colors.light.primary,
    textAlign: 'center',
    marginBottom: 8,
  },
  subheading: {
    fontSize: 14,
    fontFamily: 'MyriadPro-Regular',
    color: Colors.light.text,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 18,
  },
  loadingWrap: {
    paddingVertical: 24,
  },
  field: {
    marginBottom: 14,
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
  readonly: {
    backgroundColor: Colors.light.primary + '08',
  },
  messageInput: {
    minHeight: 120,
  },
});

export default ContactUsScreen;