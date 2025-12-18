import React, { useState, useEffect } from 'react';
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
  Dimensions,
} from 'react-native';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import AppBar from '../../components/AppBar';
import { globalStyles } from '../../styles/globalStyles';
import { Colors } from '../../constants/colors';
import firestore from '@react-native-firebase/firestore';
import LoginPopup from '../../components/LoginPopup';
import StorageService from '../../services/StorageService';
import { StorageKeys } from '../../constants/storage_keys';

type CalendarBookingRouteParams = {
  calendarBooking: {
    title: string;
  };
};

const SCREEN_WIDTH = Dimensions.get('window').width;

// Generate time slots with 15-minute intervals (9:00 AM to 5:00 PM)
const generateTimeSlots = (): string[] => {
  const slots: string[] = [];
  const startHour = 9;
  const endHour = 17; // 5 PM
  
  for (let hour = startHour; hour <= endHour; hour++) {
    // Add :00, :15, :30, :45 slots for each hour
    for (let minute = 0; minute < 60; minute += 15) {
      // Skip 5:00 PM if we want to end at 5:00 PM (appointments end at 5:00 PM)
      if (hour === endHour && minute > 0) break;
      
      const hour12 = hour === 12 ? 12 : hour % 12;
      const period = hour >= 12 ? 'PM' : 'AM';
      slots.push(`${hour12}:${minute.toString().padStart(2, '0')} ${period}`);
    }
  }
  
  return slots;
};

// Convert time string (e.g., "9:00 AM") to minutes since midnight
const timeToMinutes = (timeStr: string): number => {
  const [time, period] = timeStr.split(' ');
  const [hours, minutes] = time.split(':').map(Number);
  let hour24 = hours;
  if (period === 'PM' && hours !== 12) hour24 += 12;
  if (period === 'AM' && hours === 12) hour24 = 0;
  return hour24 * 60 + minutes;
};

// Convert minutes since midnight to time string (e.g., "9:00 AM")
const minutesToTime = (minutes: number): string => {
  const hours24 = Math.floor(minutes / 60);
  const mins = minutes % 60;
  const hour12 = hours24 === 12 ? 12 : hours24 === 0 ? 12 : hours24 > 12 ? hours24 - 12 : hours24;
  const period = hours24 >= 12 ? 'PM' : 'AM';
  return `${hour12}:${mins.toString().padStart(2, '0')} ${period}`;
};

// Get all 15-minute slots covered by an appointment
// If appointment starts at "10:00 AM" and is 45 minutes, it covers: 10:00 AM, 10:15 AM, 10:30 AM
const getSlotsCoveredByAppointment = (startTime: string, durationMinutes: number): string[] => {
  const slots: string[] = [];
  const startMinutes = timeToMinutes(startTime);
  const slotInterval = 15; // 15-minute slots
  
  // Add all 15-minute slots that fall within the appointment duration
  for (let offset = 0; offset < durationMinutes; offset += slotInterval) {
    const slotMinutes = startMinutes + offset;
    const slotTime = minutesToTime(slotMinutes);
    slots.push(slotTime);
  }
  
  return slots;
};

// Get day name from date (monday, tuesday, etc.)
// Normalize date to midnight local time to avoid timezone issues
const getDayName = (date: Date): string => {
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  // Create a normalized date at midnight local time to ensure correct day calculation
  const normalizedDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const dayIndex = normalizedDate.getDay();
  const dayName = days[dayIndex];
  console.log('getDayName - Original date:', date.toISOString(), 'Normalized:', normalizedDate.toISOString(), 'Day index:', dayIndex, 'Day name:', dayName);
  return dayName;
};

// Get days in month organized by weeks (each week is an array of 7 dates, index = day of week)
const getDaysInMonth = (year: number, month: number): Date[][] => {
  const weeks: Date[][] = [];
  
  // Get first day of month and normalize to midnight
  const firstDay = new Date(year, month, 1);
  firstDay.setHours(0, 0, 0, 0);
  const firstDayOfWeek = firstDay.getDay(); // 0 = Sunday, 1 = Monday, etc.
  
  // Get last day of month
  const lastDay = new Date(year, month + 1, 0);
  lastDay.setHours(0, 0, 0, 0);
  const daysInMonth = lastDay.getDate();
  
  // Build first week - initialize with 7 slots
  let currentWeek: (Date | null)[] = new Array(7).fill(null);
  
  // Add days from previous month to fill first week (positions 0 to firstDayOfWeek-1)
  for (let i = 0; i < firstDayOfWeek; i++) {
    const daysToSubtract = firstDayOfWeek - i;
    const date = new Date(year, month, 1 - daysToSubtract);
    date.setHours(0, 0, 0, 0);
    currentWeek[i] = date; // Place in correct position (i = day of week)
  }
  
  // Add all days of current month
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    date.setHours(0, 0, 0, 0);
    const dayOfWeek = date.getDay(); // 0 = Sunday, 1 = Monday, etc.
    
    // If this is Sunday (dayOfWeek = 0) and currentWeek already has dates, 
    // we've completed the previous week, so save it and start a new week
    if (dayOfWeek === 0 && day > 1 && currentWeek.some(d => d !== null)) {
      weeks.push(currentWeek.map(d => d!));
      currentWeek = new Array(7).fill(null);
    }
    
    // Place date in correct position in current week
    currentWeek[dayOfWeek] = date;
  }
  
  // Fill remaining days of last week with next month's days
  if (currentWeek.some(d => d !== null)) {
    let nextMonthDay = 1;
    for (let i = 0; i < 7; i++) {
      if (currentWeek[i] === null) {
        const date = new Date(year, month + 1, nextMonthDay);
        date.setHours(0, 0, 0, 0);
        currentWeek[i] = date;
        nextMonthDay++;
      }
    }
    weeks.push(currentWeek.map(d => d!));
  }
  
  return weeks;
};

// Check if date is in the past
const isPastDate = (date: Date): boolean => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const compareDate = new Date(date);
  compareDate.setHours(0, 0, 0, 0);
  return compareDate < today;
};

// Check if date is today
const isToday = (date: Date): boolean => {
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
};

const CalendarBookingScreen: React.FC = () => {
  const route = useRoute<RouteProp<CalendarBookingRouteParams, 'calendarBooking'>>();
  const navigation = useNavigation();
  const { title } = route.params;

  // Calendar state - start with current month
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1); // First day of current month
  });
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  
  // Authentication state
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [showLoginPopup, setShowLoginPopup] = useState(false);
  
  // Form state
  const [notes, setNotes] = useState('');
  const [userId, setUserId] = useState<number | null>(null);
  
  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{
    date?: string;
    time?: string;
  }>({});

  // Time restrictions from Firestore
  const [timeRestrictions, setTimeRestrictions] = useState<Record<string, { begin: string; end: string }>>({});
  const [loadingTimeRestrictions, setLoadingTimeRestrictions] = useState(true);
  
  // Existing appointments for the selected date
  const [existingAppointments, setExistingAppointments] = useState<Set<string>>(new Set());
  const [loadingAppointments, setLoadingAppointments] = useState(false);

  const allTimeSlots = generateTimeSlots();
  const weeksInMonth = getDaysInMonth(currentMonth.getFullYear(), currentMonth.getMonth());

  // Check authentication on mount
  useEffect(() => {
    const checkAuth = async () => {
      setIsCheckingAuth(true);
      const token = await StorageService.getItem<string>(StorageKeys.authToken);
      setAuthToken(token);
      
      if (token) {
        // Load user ID if authenticated
        const candidateId = await StorageService.getItem<number>(StorageKeys.candidateId);
        if (candidateId) setUserId(candidateId);
      } else {
        // Show login popup if not authenticated
        setShowLoginPopup(true);
      }
      setIsCheckingAuth(false);
    };
    
    checkAuth();
  }, []);

  // Fetch time restrictions from Firestore
  useEffect(() => {
    const unsubscribe = firestore()
      .collection('appointmenttimeselect')
      .onSnapshot(
        snapshot => {
          const restrictions: Record<string, { begin: string; end: string }> = {};
          
          snapshot.docs.forEach(doc => {
            const data = doc.data();
            const day = data.day?.toLowerCase()?.trim(); // monday, tuesday, etc.
            const begin = data.begin?.trim(); // e.g., "9:00 AM"
            const end = data.end?.trim(); // e.g., "5:00 PM"
            
            console.log('Processing restriction document:', { day, begin, end, rawDay: data.day });
            
            if (day && begin && end) {
              restrictions[day] = { begin, end };
              console.log(`  Added restriction: ${day} = ${begin} - ${end}`);
            } else {
              console.warn(`  Skipped invalid restriction: day=${day}, begin=${begin}, end=${end}`);
            }
          });
          
          setTimeRestrictions(restrictions);
          setLoadingTimeRestrictions(false);
          console.log('Time restrictions loaded:', restrictions);
          console.log('Time restrictions keys:', Object.keys(restrictions));
          Object.entries(restrictions).forEach(([day, times]) => {
            console.log(`  ${day}: ${times.begin} - ${times.end}`);
          });
        },
        error => {
          console.error('Failed to load time restrictions:', error);
          setLoadingTimeRestrictions(false);
        }
      );

    return () => unsubscribe();
  }, []);

  // Fetch existing appointments for selected date
  useEffect(() => {
    if (!selectedDate) {
      setExistingAppointments(new Set());
      return;
    }

    const fetchAppointments = async () => {
      try {
        setLoadingAppointments(true);
        // Create date range for the selected date (start and end of day)
        const selectedDateStart = new Date(selectedDate);
        selectedDateStart.setHours(0, 0, 0, 0);
        const selectedDateEnd = new Date(selectedDate);
        selectedDateEnd.setHours(23, 59, 59, 999);

        const startTimestamp = firestore.Timestamp.fromDate(selectedDateStart);
        const endTimestamp = firestore.Timestamp.fromDate(selectedDateEnd);

        // Query appointments for the selected date
        const snapshot = await firestore()
          .collection('appointments')
          .where('selectedDate', '>=', startTimestamp)
          .where('selectedDate', '<=', endTimestamp)
          .where('status', '==', 'scheduled')
          .get();

        const bookedTimes = new Set<string>();
        snapshot.docs.forEach(doc => {
          const data = doc.data();
          const appointmentTime = data.selectedTime; // e.g., "10:00 AM"
          const duration = data.duration || 45; // Default to 45 minutes if not specified
          
          if (appointmentTime) {
            // Get all 15-minute slots covered by this appointment
            const coveredSlots = getSlotsCoveredByAppointment(appointmentTime, duration);
            coveredSlots.forEach(slot => {
              bookedTimes.add(slot);
            });
            console.log(`Appointment at ${appointmentTime} (${duration} min) blocks slots:`, coveredSlots);
          }
        });

        setExistingAppointments(bookedTimes);
        console.log('All blocked time slots for selected date:', Array.from(bookedTimes).sort());
      } catch (error) {
        console.error('Failed to fetch existing appointments:', error);
        setExistingAppointments(new Set());
      } finally {
        setLoadingAppointments(false);
      }
    };

    fetchAppointments();
  }, [selectedDate]);

  // Filter time slots based on selected date, restrictions, and existing appointments
  const getAvailableTimeSlots = (): { slot: string; isBooked: boolean }[] => {
    if (!selectedDate) {
      // Show all slots if no date selected (mark none as booked)
      return allTimeSlots.map(slot => ({ slot, isBooked: false }));
    }

    const dayName = getDayName(selectedDate);
    const restriction = timeRestrictions[dayName];

    console.log('Selected date:', selectedDate);
    console.log('Day name:', dayName);
    console.log('Restriction for', dayName, ':', restriction);
    console.log('All time restrictions:', timeRestrictions);

    let filteredSlots = allTimeSlots;

    // Apply time restrictions if they exist
    if (restriction) {
      const beginMinutes = timeToMinutes(restriction.begin);
      const endMinutes = timeToMinutes(restriction.end);
      const appointmentDuration = 45; // 45-minute appointments

      console.log(`Filtering slots for ${dayName}:`, {
        begin: restriction.begin,
        end: restriction.end,
        beginMinutes,
        endMinutes,
        totalSlotsBefore: allTimeSlots.length,
      });

      filteredSlots = allTimeSlots.filter(slot => {
        const slotMinutes = timeToMinutes(slot);
        const appointmentEndMinutes = slotMinutes + appointmentDuration;
        // Include slots where:
        // 1. Slot starts at or after begin time
        // 2. Appointment ends before or at end time (appointment is 45 minutes)
        const isValid = slotMinutes >= beginMinutes && appointmentEndMinutes <= endMinutes;
        return isValid;
      });

      console.log(`Filtered slots for ${dayName}:`, filteredSlots.length, 'slots');
      console.log(`First slot: ${filteredSlots[0]}, Last slot: ${filteredSlots[filteredSlots.length - 1]}`);
    } else {
      console.log(`No restriction found for ${dayName}, showing all slots`);
    }

    // Mark slots as booked if they exist in existingAppointments
    return filteredSlots.map(slot => ({
      slot,
      isBooked: existingAppointments.has(slot),
    }));
  };

  const timeSlotsWithStatus = getAvailableTimeSlots();
  const timeSlots = timeSlotsWithStatus.map(t => t.slot);

  const validateForm = (): boolean => {
    const newErrors: typeof errors = {};

    if (!selectedDate) {
      newErrors.date = 'Please select a date';
    } else if (isPastDate(selectedDate)) {
      newErrors.date = 'Cannot select a past date';
    }

    if (!selectedTime) {
      newErrors.time = 'Please select a time';
    } else {
      // Check if any of the slots that would be covered by this appointment are already booked
      const appointmentDuration = 45; // 45-minute appointments
      const slotsThatWouldBeCovered = getSlotsCoveredByAppointment(selectedTime, appointmentDuration);
      const conflictingSlots = slotsThatWouldBeCovered.filter(slot => existingAppointments.has(slot));
      
      if (conflictingSlots.length > 0) {
        newErrors.time = `This time slot conflicts with an existing appointment. The following slots are already booked: ${conflictingSlots.join(', ')}. Please select another time.`;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFinalizeBooking = async () => {
    if (!validateForm()) {
      Alert.alert('Validation Error', 'Please fill in all required fields correctly.');
      return;
    }

    setIsLoading(true);

    try {
      // Create Timestamp from selected date
      // Combine date and time for accurate timestamp
      const appointmentDateTime = new Date(selectedDate!);
      const [timeStr, period] = selectedTime!.split(' ');
      const [hours, minutes] = timeStr.split(':').map(Number);
      let hour24 = hours;
      if (period === 'PM' && hours !== 12) hour24 += 12;
      if (period === 'AM' && hours === 12) hour24 = 0;
      appointmentDateTime.setHours(hour24, minutes, 0, 0);

      // Create Timestamp using Firestore API
      // React Native Firebase pattern: firestore.Timestamp.fromDate()
      if (!firestore.Timestamp || typeof firestore.Timestamp.fromDate !== 'function') {
        throw new Error('Firestore Timestamp API not available. Please check Firebase configuration.');
      }
      const selectedDateTimestamp = firestore.Timestamp.fromDate(appointmentDateTime);

      // Get user name and email from storage for the appointment
      const userName = await StorageService.getItem<string>(StorageKeys.userName);
      const userEmail = await StorageService.getItem<string>(StorageKeys.userEmail);

      // Create appointment data
      const appointmentData: any = {
        userId: userId,
        name: userName || '',
        email: userEmail || '',
        appointmentType: 'Candidate Pre-Qualifying / Qualifying',
        duration: 45,
        location: 'Candidate Conference Room',
        address: '96135 Nassau Place, Suite 3, Yulee, FL 32097',
        selectedDate: selectedDateTimestamp,
        selectedDateString: selectedDate!.toISOString().split('T')[0], // Store as string for easy querying
        selectedTime: selectedTime!,
        timeZone: 'Eastern Time - US & Canada',
        notes: notes.trim(),
        createdAt: firestore.FieldValue.serverTimestamp(),
        status: 'scheduled',
      };

      console.log('Saving appointment data:', {
        ...appointmentData,
        selectedDate: appointmentData.selectedDate.toString(),
        createdAt: 'serverTimestamp',
      });

      // Save to Firebase Firestore
      const docRef = await firestore().collection('appointments').add(appointmentData);
      
      console.log('Appointment saved successfully with ID:', docRef.id);

      // Add the booked time to existing appointments to immediately reflect in UI
      setExistingAppointments(prev => new Set([...prev, selectedTime!]));

      // Verify the document was created by reading it back
      const savedDoc = await docRef.get();
      if (savedDoc.exists()) {
        // Format the date for display
        const monthNames = [
          'January', 'February', 'March', 'April', 'May', 'June',
          'July', 'August', 'September', 'October', 'November', 'December'
        ];
        const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const appointmentDate = new Date(selectedDate!);
        const formattedDate = `${dayNames[appointmentDate.getDay()]}, ${monthNames[appointmentDate.getMonth()]} ${appointmentDate.getDate()}, ${appointmentDate.getFullYear()}`;
        const formattedTime = selectedTime!;
        
        Alert.alert(
          'Success',
          `Your appointment has been scheduled:\n\n${formattedDate}\n${formattedTime}`,
          [
            {
              text: 'OK',
              onPress: () => navigation.goBack(),
            },
          ]
        );
      } else {
        throw new Error('Document was not created in Firestore');
      }
    } catch (error: any) {
      console.error('Error saving appointment:', error);
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        stack: error.stack,
      });
      Alert.alert(
        'Error',
        `Failed to schedule appointment: ${error.message || 'Unknown error'}. Please try again.`,
        [{ text: 'OK' }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleDateSelect = (date: Date) => {
    if (isPastDate(date)) {
      return; // Don't allow selecting past dates
    }
    // Normalize selected date to midnight to ensure consistent day calculation
    const normalizedDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    normalizedDate.setHours(0, 0, 0, 0);
    console.log('Date selected:', date.toISOString(), 'Normalized:', normalizedDate.toISOString());
    console.log('Selected date day of week:', normalizedDate.getDay(), 'Day name:', getDayName(normalizedDate));
    setSelectedDate(normalizedDate);
    setSelectedTime(null); // Clear time when date changes (available slots may differ)
    setErrors(prev => ({ ...prev, date: undefined, time: undefined }));
  };

  const handleTimeSelect = (time: string) => {
    // Check if any of the slots that would be covered by this appointment are already booked
    const appointmentDuration = 45; // 45-minute appointments
    const slotsThatWouldBeCovered = getSlotsCoveredByAppointment(time, appointmentDuration);
    const conflictingSlots = slotsThatWouldBeCovered.filter(slot => existingAppointments.has(slot));
    
    if (conflictingSlots.length > 0) {
      Alert.alert(
        'Time Unavailable', 
        `This time slot conflicts with an existing appointment. The following slots are already booked: ${conflictingSlots.join(', ')}. Please select another time.`
      );
      return;
    }
    setSelectedTime(time);
    setErrors(prev => ({ ...prev, time: undefined }));
  };

  const handlePreviousMonth = () => {
    setCurrentMonth(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() - 1);
      return newDate;
    });
    // Clear selected date when changing months
    setSelectedDate(null);
  };

  const handleNextMonth = () => {
    setCurrentMonth(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + 1);
      return newDate;
    });
    // Clear selected date when changing months
    setSelectedDate(null);
  };

  const getMonthYearString = (date: Date): string => {
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
  };

  const renderCalendar = () => {
    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const currentMonthValue = currentMonth.getMonth();
    const currentYearValue = currentMonth.getFullYear();

    return (
      <View style={styles.calendarContainer}>
        <View style={styles.calendarHeader}>
          <TouchableOpacity
            style={styles.monthNavButton}
            onPress={handlePreviousMonth}
            activeOpacity={0.7}
          >
            <Text style={styles.monthNavButtonText}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.monthYearText}>{getMonthYearString(currentMonth)}</Text>
          <TouchableOpacity
            style={styles.monthNavButton}
            onPress={handleNextMonth}
            activeOpacity={0.7}
          >
            <Text style={styles.monthNavButtonText}>›</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.weekDaysRow}>
          {weekDays.map(day => (
            <View key={day} style={styles.weekDayHeader}>
              <Text style={styles.weekDayText}>{day}</Text>
            </View>
          ))}
        </View>
        <View style={styles.calendarGrid}>
          {weeksInMonth.map((week, weekIndex) => (
            <View key={weekIndex} style={styles.calendarWeek}>
              {week.map((day, dayIndex) => {
                const isPast = isPastDate(day);
                const isSelected = selectedDate && 
                  day.getDate() === selectedDate.getDate() &&
                  day.getMonth() === selectedDate.getMonth() &&
                  day.getFullYear() === selectedDate.getFullYear();
                const isCurrentMonth = day.getMonth() === currentMonthValue && day.getFullYear() === currentYearValue;
                const isTodayDate = isToday(day);

                return (
                  <TouchableOpacity
                    key={`${weekIndex}-${dayIndex}`}
                    style={[
                      styles.calendarDay,
                      !isCurrentMonth && styles.calendarDayOtherMonth,
                      isSelected && styles.calendarDaySelected,
                      isPast && styles.calendarDayPast,
                    ]}
                    onPress={() => handleDateSelect(day)}
                    disabled={isPast}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.calendarDayText,
                        !isCurrentMonth && styles.calendarDayTextOtherMonth,
                        isSelected && styles.calendarDayTextSelected,
                        isPast && styles.calendarDayTextPast,
                        isTodayDate && !isSelected && styles.calendarDayTextToday,
                      ]}
                    >
                      {day.getDate()}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          ))}
        </View>
        {errors.date && <Text style={styles.errorText}>{errors.date}</Text>}
      </View>
    );
  };

  const renderTimeSlots = () => {
    if (loadingTimeRestrictions || loadingAppointments) {
      return (
        <View style={styles.timeSlotsContainer}>
          <Text style={styles.sectionTitle}>Select a Time</Text>
          <ActivityIndicator size="small" color={Colors.light.primary} style={{ marginVertical: 20 }} />
          <Text style={styles.loadingText}>Loading available times...</Text>
        </View>
      );
    }

    if (!selectedDate) {
      return (
        <View style={styles.timeSlotsContainer}>
          <Text style={styles.sectionTitle}>Select a Time</Text>
          <Text style={styles.infoText}>Please select a date first to see available times</Text>
        </View>
      );
    }

    if (timeSlotsWithStatus.length === 0) {
      return (
        <View style={styles.timeSlotsContainer}>
          <Text style={styles.sectionTitle}>Select a Time</Text>
          <Text style={styles.infoText}>
            No available times for {getDayName(selectedDate)}. Please select a different date.
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.timeSlotsContainer}>
        <Text style={styles.sectionTitle}>Select a Time</Text>
        <View style={styles.timeSlotsGrid}>
          {timeSlotsWithStatus.map(({ slot, isBooked }, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.timeSlot,
                selectedTime === slot && styles.timeSlotSelected,
                isBooked && styles.timeSlotBooked,
              ]}
              onPress={() => !isBooked && handleTimeSelect(slot)}
              disabled={isBooked}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.timeSlotText,
                  selectedTime === slot && styles.timeSlotTextSelected,
                  isBooked && styles.timeSlotTextBooked,
                ]}
              >
                {slot}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        {errors.time && <Text style={styles.errorText}>{errors.time}</Text>}
      </View>
    );
  };

  // Show loading state while checking authentication
  if (isCheckingAuth) {
    return (
      <SafeAreaView style={globalStyles.safeAreaContainer}>
        <AppBar title={title} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.light.primary} />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Don't show form if not authenticated (login popup will be shown)
  if (!authToken) {
    return (
      <SafeAreaView style={globalStyles.safeAreaContainer}>
        <AppBar title={title} />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Please sign in to continue</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={globalStyles.safeAreaContainer}>
      <AppBar title={title} />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Appointment Details */}
        <View style={styles.appointmentDetailsContainer}>
          <Text style={styles.appointmentTitle}>James McMahon</Text>
          <Text style={styles.appointmentSubtitle}>Candidate Pre-Qualifying / Qualifying</Text>
          <Text style={styles.appointmentDetail}>45 min</Text>
          <Text style={styles.appointmentDetail}>Candidate Conference Room</Text>
          <Text style={styles.appointmentDetail}>96135 Nassau Place, Suite 3</Text>
          <Text style={styles.appointmentDetail}>Yulee, FL 32097</Text>
        </View>

        {/* Time Zone */}
        <View style={styles.timeZoneContainer}>
          <Text style={styles.timeZoneText}>Time zone</Text>
          <Text style={styles.timeZoneValue}>Eastern Time - US & Canada</Text>
        </View>

        {/* Calendar */}
        {renderCalendar()}

        {/* Time Slots */}
        {renderTimeSlots()}

        {/* Notes Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Please share anything that will help prepare for our meeting.
          </Text>
          <TextInput
            style={[styles.input, styles.notesInput]}
            placeholder="Enter notes (optional)"
            placeholderTextColor={Colors.light.text + '80'}
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        {/* Finalize Booking Button */}
        <TouchableOpacity
          style={[styles.finalizeButton, isLoading && styles.finalizeButtonDisabled]}
          onPress={handleFinalizeBooking}
          disabled={isLoading}
          activeOpacity={0.7}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.finalizeButtonText}>Finalize Booking</Text>
          )}
        </TouchableOpacity>
      </ScrollView>

      <LoginPopup
        visible={showLoginPopup}
        onClose={() => {
          setShowLoginPopup(false);
          // Navigate back if user closes login without logging in
          if (!authToken) {
            navigation.goBack();
          }
        }}
        onLoginSuccess={async (data) => {
          console.log('Login response:', data);
          if (data.token) {
            // Store the actual token from API response
            await StorageService.saveItem(StorageKeys.authToken, data.token);
            await StorageService.saveItem(StorageKeys.candidateId, data.user?.id);
            // Store user name and email
            if (data.user?.name) {
              await StorageService.saveItem(StorageKeys.userName, data.user.name);
            }
            if (data.user?.email) {
              await StorageService.saveItem(StorageKeys.userEmail, data.user.email);
            }
            await StorageService.saveItem(
              StorageKeys.userPhone,
              data.user?.phone || data.user?.phoneNumber || data.user?.mobile || ''
            );
            // Store user ID
            if (data.user?.id) {
              await StorageService.saveItem(StorageKeys.candidateId, data.user.id);
              setUserId(data.user.id);
            }
            setAuthToken(data.token);
            setShowLoginPopup(false);
          }
        }}
      />
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
    padding: 20,
  },
  loadingText: {
    fontSize: 16,
    fontFamily: 'MyriadPro-Regular',
    color: Colors.light.text,
    marginTop: 12,
    textAlign: 'center',
  },
  appointmentDetailsContainer: {
    backgroundColor: Colors.light.primary + '10',
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
  },
  appointmentTitle: {
    fontSize: 20,
    fontFamily: 'MyriadPro-Bold',
    color: Colors.light.primary,
    marginBottom: 8,
  },
  appointmentSubtitle: {
    fontSize: 16,
    fontFamily: 'MyriadPro-Regular',
    color: Colors.light.text,
    marginBottom: 4,
  },
  appointmentDetail: {
    fontSize: 14,
    fontFamily: 'MyriadPro-Regular',
    color: Colors.light.text,
    marginBottom: 2,
  },
  timeZoneContainer: {
    marginBottom: 20,
  },
  timeZoneText: {
    fontSize: 14,
    fontFamily: 'MyriadPro-Regular',
    color: Colors.light.text,
    marginBottom: 4,
  },
  timeZoneValue: {
    fontSize: 16,
    fontFamily: 'MyriadPro-Bold',
    color: Colors.light.primary,
  },
  calendarContainer: {
    marginBottom: 24,
  },
  calendarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingHorizontal: 8,
  },
  monthYearText: {
    fontSize: 18,
    fontFamily: 'MyriadPro-Bold',
    color: Colors.light.primary,
    flex: 1,
    textAlign: 'center',
  },
  monthNavButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    backgroundColor: Colors.light.primary + '20',
  },
  monthNavButtonText: {
    fontSize: 24,
    fontFamily: 'MyriadPro-Bold',
    color: Colors.light.primary,
    lineHeight: 28,
  },
  weekDaysRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  weekDayHeader: {
    width: (SCREEN_WIDTH - 32) / 7, // Fixed width to match calendar days
    alignItems: 'center',
  },
  weekDayText: {
    fontSize: 12,
    fontFamily: 'MyriadPro-Bold',
    color: Colors.light.text,
  },
  calendarGrid: {
    // Container for all weeks
  },
  calendarWeek: {
    flexDirection: 'row',
    width: SCREEN_WIDTH - 32, // Match the container width
  },
  calendarDay: {
    width: (SCREEN_WIDTH - 32) / 7, // Fixed width to match header exactly
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 0, // No margin to ensure perfect alignment
    borderRadius: 4,
  },
  calendarDayOtherMonth: {
    opacity: 0.3,
  },
  calendarDaySelected: {
    backgroundColor: Colors.light.primary,
  },
  calendarDayPast: {
    opacity: 0.5,
  },
  calendarDayText: {
    fontSize: 14,
    fontFamily: 'MyriadPro-Regular',
    color: Colors.light.text,
  },
  calendarDayTextOtherMonth: {
    color: Colors.light.text + '80',
  },
  calendarDayTextSelected: {
    color: '#fff',
    fontFamily: 'MyriadPro-Bold',
  },
  calendarDayTextPast: {
    textDecorationLine: 'line-through',
    color: Colors.light.text + '60',
  },
  calendarDayTextToday: {
    fontFamily: 'MyriadPro-Bold',
    color: Colors.light.primary,
  },
  timeSlotsContainer: {
    marginBottom: 24,
  },
  loadingText: {
    fontSize: 14,
    fontFamily: 'MyriadPro-Regular',
    color: Colors.light.text,
    textAlign: 'center',
    marginTop: 8,
  },
  infoText: {
    fontSize: 14,
    fontFamily: 'MyriadPro-Regular',
    color: Colors.light.text + '80',
    textAlign: 'center',
    marginTop: 12,
    paddingHorizontal: 16,
    fontStyle: 'italic',
  },
  timeSlotsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 12,
  },
  timeSlot: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    margin: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.light.primary + '40',
    backgroundColor: Colors.light.background,
    minWidth: 100,
    alignItems: 'center',
  },
  timeSlotSelected: {
    backgroundColor: Colors.light.primary,
    borderColor: Colors.light.primary,
  },
  timeSlotBooked: {
    opacity: 0.5,
    borderColor: Colors.light.text + '40',
    backgroundColor: Colors.light.background + '80',
  },
  timeSlotText: {
    fontSize: 14,
    fontFamily: 'MyriadPro-Regular',
    color: Colors.light.text,
  },
  timeSlotTextSelected: {
    color: '#fff',
    fontFamily: 'MyriadPro-Bold',
  },
  timeSlotTextBooked: {
    textDecorationLine: 'line-through',
    color: Colors.light.text + '60',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'MyriadPro-Bold',
    color: Colors.light.primary,
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    fontFamily: 'MyriadPro-Regular',
    color: Colors.light.text + 'CC',
    marginBottom: 16,
    fontStyle: 'italic',
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontFamily: 'MyriadPro-Bold',
    color: Colors.light.primary,
    marginBottom: 8,
  },
  required: {
    color: Colors.light.secondary,
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
  inputReadOnly: {
    backgroundColor: Colors.light.background + '80',
    color: Colors.light.text + 'CC',
  },
  errorText: {
    color: Colors.light.error,
    fontSize: 12,
    fontFamily: 'MyriadPro-Regular',
    marginTop: 4,
  },
  notesInput: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  finalizeButton: {
    backgroundColor: Colors.light.primary,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  finalizeButtonDisabled: {
    opacity: 0.6,
  },
  finalizeButtonText: {
    fontSize: 16,
    fontFamily: 'MyriadPro-Bold',
    color: '#fff',
  },
});

export default CalendarBookingScreen;

