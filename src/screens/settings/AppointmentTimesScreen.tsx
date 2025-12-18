import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AppBar from '../../components/AppBar';
import { globalStyles } from '../../styles/globalStyles';
import { Colors } from '../../constants/colors';
import firestore from '@react-native-firebase/firestore';

type DayRestriction = {
  day: string;
  begin: string;
  end: string;
};

const daysOfWeek = [
  { key: 'monday', label: 'Monday' },
  { key: 'tuesday', label: 'Tuesday' },
  { key: 'wednesday', label: 'Wednesday' },
  { key: 'thursday', label: 'Thursday' },
  { key: 'friday', label: 'Friday' },
];

const AppointmentTimesScreen: React.FC = () => {
  const navigation = useNavigation();

  const [restrictions, setRestrictions] = useState<Record<string, DayRestriction>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [docIds, setDocIds] = useState<Record<string, string>>({});

  useEffect(() => {
    loadRestrictions();
  }, []);

  const loadRestrictions = async () => {
    try {
      setLoading(true);
      const snapshot = await firestore().collection('appointmenttimeselect').get();
      
      const loadedRestrictions: Record<string, DayRestriction> = {};
      const loadedDocIds: Record<string, string> = {};

      snapshot.docs.forEach(doc => {
        const data = doc.data();
        const day = data.day?.toLowerCase();
        if (day) {
          loadedRestrictions[day] = {
            day: day,
            begin: data.begin || '9:00 AM',
            end: data.end || '5:00 PM',
          };
          loadedDocIds[day] = doc.id;
        }
      });

      // Initialize with defaults for days that don't exist
      daysOfWeek.forEach(({ key }) => {
        if (!loadedRestrictions[key]) {
          loadedRestrictions[key] = {
            day: key,
            begin: '9:00 AM',
            end: '5:00 PM',
          };
        }
      });

      setRestrictions(loadedRestrictions);
      setDocIds(loadedDocIds);
    } catch (error: any) {
      console.error('Failed to load restrictions:', error);
      Alert.alert('Error', 'Failed to load appointment times. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const updateRestriction = (day: string, field: 'begin' | 'end', value: string) => {
    setRestrictions(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [field]: value,
      },
    }));
  };

  const saveRestrictions = async () => {
    try {
      setSaving(true);
      const batch = firestore().batch();
      const collectionRef = firestore().collection('appointmenttimeselect');

      for (const { key } of daysOfWeek) {
        const restriction = restrictions[key];
        if (!restriction) continue;

        const docId = docIds[key];
        const data = {
          day: key,
          begin: restriction.begin.trim(),
          end: restriction.end.trim(),
          updatedAt: firestore.FieldValue.serverTimestamp(),
        };

        if (docId) {
          // Update existing document
          batch.update(collectionRef.doc(docId), data);
        } else {
          // Create new document
          const newDocRef = collectionRef.doc();
          batch.set(newDocRef, {
            ...data,
            createdAt: firestore.FieldValue.serverTimestamp(),
          });
          setDocIds(prev => ({ ...prev, [key]: newDocRef.id }));
        }
      }

      await batch.commit();
      Alert.alert('Success', 'Appointment times have been saved successfully!');
    } catch (error: any) {
      console.error('Failed to save restrictions:', error);
      Alert.alert('Error', `Failed to save appointment times: ${error.message || 'Unknown error'}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={globalStyles.safeAreaContainer}>
        <AppBar title="Appointment Times" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.light.primary} />
          <Text style={styles.loadingText}>Loading appointment times...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={globalStyles.safeAreaContainer}>
      <AppBar title="Appointment Times" />
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.description}>
          Set the available appointment times for each day of the week. Times should be in 12-hour format (e.g., "9:00 AM", "5:00 PM").
        </Text>

        {daysOfWeek.map(({ key, label }) => {
          const restriction = restrictions[key];
          if (!restriction) return null;

          return (
            <View key={key} style={styles.dayContainer}>
              <Text style={styles.dayLabel}>{label}</Text>
              
              <View style={styles.timeRow}>
                <View style={styles.timeInputContainer}>
                  <Text style={styles.timeLabel}>Start Time</Text>
                  <TextInput
                    style={styles.timeInput}
                    value={restriction.begin}
                    onChangeText={(value) => updateRestriction(key, 'begin', value)}
                    placeholder="9:00 AM"
                    placeholderTextColor={Colors.light.text + '80'}
                  />
                </View>

                <View style={styles.timeInputContainer}>
                  <Text style={styles.timeLabel}>End Time</Text>
                  <TextInput
                    style={styles.timeInput}
                    value={restriction.end}
                    onChangeText={(value) => updateRestriction(key, 'end', value)}
                    placeholder="5:00 PM"
                    placeholderTextColor={Colors.light.text + '80'}
                  />
                </View>
              </View>
            </View>
          );
        })}

        <TouchableOpacity
          style={[styles.saveButton, saving && styles.saveButtonDisabled]}
          onPress={saveRestrictions}
          disabled={saving}
          activeOpacity={0.7}
        >
          {saving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.saveButtonText}>Save Appointment Times</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: Colors.light.text,
    fontFamily: 'MyriadPro-Regular',
  },
  description: {
    fontSize: 14,
    fontFamily: 'MyriadPro-Regular',
    color: Colors.light.text,
    marginBottom: 24,
    lineHeight: 20,
  },
  dayContainer: {
    backgroundColor: Colors.light.primary + '10',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  dayLabel: {
    fontSize: 16,
    fontFamily: 'MyriadPro-Bold',
    color: Colors.light.primary,
    marginBottom: 12,
  },
  timeRow: {
    flexDirection: 'row',
    gap: 12,
  },
  timeInputContainer: {
    flex: 1,
  },
  timeLabel: {
    fontSize: 12,
    fontFamily: 'MyriadPro-Regular',
    color: Colors.light.text,
    marginBottom: 6,
  },
  timeInput: {
    borderWidth: 1,
    borderColor: Colors.light.primary + '40',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    fontFamily: 'MyriadPro-Regular',
    backgroundColor: Colors.light.background,
    color: Colors.light.text,
  },
  saveButton: {
    backgroundColor: Colors.light.primary,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    fontSize: 16,
    fontFamily: 'MyriadPro-Bold',
    color: '#fff',
  },
});

export default AppointmentTimesScreen;

