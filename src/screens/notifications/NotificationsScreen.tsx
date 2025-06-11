import React, { useState } from 'react';
import { FlatList, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { NavigationProp, RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import AppBar from '../../components/AppBar';
import { globalStyles } from '../../styles/globalStyles';
import { Colors } from '../../constants/colors';

type NotificationsRouteParams = {
  notifications: {
    title: string;
  };
};

interface Notification {
  id: string;
  title: string;
  message: string;
  dateTime: string;
  isRead: boolean;
  type?: 'info' | 'success' | 'warning' | 'error';
}

const NotificationsScreen: React.FC = () => {
  const route = useRoute<RouteProp<NotificationsRouteParams, 'notifications'>>();
  const { title } = route.params;
  const navigation = useNavigation<NavigationProp<any>>();

  // Sample notification data
  const [notifications, setNotifications] = useState<Notification[]>([
    // Test "Just now" (within 1 hour - 10 minutes ago)
    {
      id: '1',
      title: 'Message Sent Successfully',
      message: 'Your message has been delivered to all recipients.',
      dateTime: '2025-06-11T14:26:00Z', // 10 minutes ago
      isRead: false,
      type: 'success',
    },
    // Test "Just now" (30 minutes ago)
    {
      id: '2',
      title: 'New Comment on Your Post',
      message: 'Sarah liked your recent photo and left a comment.',
      dateTime: '2025-06-11T14:06:00Z', // 30 minutes ago
      isRead: false,
      type: 'info',
    },
    // Test "2h ago" (2 hours ago)
    {
      id: '3',
      title: 'Reminder: Meeting in 1 hour',
      message: 'Don\'t forget about your scheduled meeting with the design team.',
      dateTime: '2025-06-11T12:36:00Z', // 2 hours ago
      isRead: true,
      type: 'warning',
    },
    // Test "5h ago" (5 hours ago)
    {
      id: '4',
      title: 'Weekly Report Ready',
      message: 'Your weekly analytics report is now available for download.',
      dateTime: '2025-06-11T09:36:00Z', // 5 hours ago
      isRead: false,
      type: 'info',
    },
    // Test "Yesterday" (25 hours ago - June 10)
    {
      id: '5',
      title: 'System Maintenance Complete',
      message: 'Scheduled maintenance has been completed. All services are now running normally.',
      dateTime: '2025-06-10T13:36:00Z', // 25 hours ago (yesterday)
      isRead: false,
      type: 'success',
    },
    // Test "Yesterday" (30 hours ago - June 10)
    {
      id: '6',
      title: 'Security Update Installed',
      message: 'Latest security patches have been applied to your account.',
      dateTime: '2025-06-10T08:36:00Z', // 30 hours ago (yesterday)
      isRead: false,
      type: 'success',
    },
    // Test date format (3 days ago - June 8)
    {
      id: '7',
      title: 'Payment Received',
      message: 'We have received your payment of $49.99. Thank you!',
      dateTime: '2025-06-08T14:36:00Z', // 3 days ago
      isRead: true,
      type: 'success',
    },
    // Test date format (1 week ago - June 4)
    {
      id: '8',
      title: 'Welcome to Premium!',
      message: 'Congratulations! You now have access to all premium features.',
      dateTime: '2025-06-04T10:00:00Z', // 1 week ago
      isRead: true,
      type: 'success',
    },
    // Test date format with different year (1 year ago - June 2024)
    {
      id: '9',
      title: 'Anniversary Celebration',
      message: 'It\'s been one year since you joined us! Thanks for being part of our community.',
      dateTime: '2024-06-11T14:36:00Z', // 1 year ago (different year)
      isRead: true,
      type: 'info',
    },
    // Test date format with different year (2 years ago - March 2023)
    {
      id: '10',
      title: 'Welcome to Candidate App of Vote Nassau! 🗳️',
      message: 'Thanks for joining us! Stay tuned for real-time updates, candidate info, and all things Election Day. Let’s make informed voting easy!',
      dateTime: '2023-03-15T09:00:00Z', // 2+ years ago (different year)
      isRead: false,
      type: 'success',
    },
    {
      id: '11',
      title: 'Account Created',
      message: 'Welcome! Your account has been successfully created.',
      dateTime: '2023-03-15T09:00:00Z', // 2+ years ago (different year)
      isRead: true,
      type: 'success',
    },
  ]);

  const formatDateTime = (dateTime: string): string => {
    const date = new Date(dateTime);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
      });
    }
  };

  const getTypeColor = (type: string = 'info'): string => {
    switch (type) {
      case 'success':
        return '#10B981';
      case 'warning':
        return '#F59E0B';
      case 'error':
        return '#EF4444';
      default:
        return '#3B82F6';
    }
  };

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === id
          ? { ...notification, isRead: true }
          : notification
      )
    );
  };

  const handleNotificationPress = (notification: Notification) => {
    // Mark as read if it's unread
    if (!notification.isRead) {
      markAsRead(notification.id);
    }

    navigation.navigate('notificationDetails', {
      notification,
    });

  };

  const renderNotificationItem = ({ item }: { item: Notification }) => (
    <TouchableOpacity
      style={[
        styles.notificationItem,
        !item.isRead && styles.unreadItem,
      ]}
      onPress={() => handleNotificationPress(item)}
      activeOpacity={0.7}
    >
      {/* Unread indicator */}
      {!item.isRead && <View style={styles.unreadIndicator} />}

      {/* Type indicator */}
      <View style={[styles.typeIndicator, { backgroundColor: getTypeColor(item.type) }]} />

      <View style={styles.contentContainer}>
        <View style={styles.headerContainer}>
          <Text style={[styles.title, !item.isRead && styles.unreadTitle]} numberOfLines={1}>
            {item.title}
          </Text>
          <Text style={styles.dateTime}>{formatDateTime(item.dateTime)}</Text>
        </View>

        <Text style={[styles.message, !item.isRead && styles.unreadMessage]} numberOfLines={2}>
          {item.message}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={globalStyles.safeAreaContainer}>
      <AppBar title={title} />

      <FlatList
        data={notifications}
        renderItem={renderNotificationItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  listContainer: {
    paddingVertical: 8,
  },
  notificationItem: {
    flexDirection: 'row',
    backgroundColor: Colors.light.readNotificationCard,
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginHorizontal: 16,
    marginVertical: 4,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    position: 'relative',
  },
  unreadItem: {
    backgroundColor: Colors.light.unreadNotificationCard,
    borderLeftWidth: 3,
    borderLeftColor: Colors.light.primary,
  },
  unreadIndicator: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.light.primary,
  },
  typeIndicator: {
    width: 4,
    height: '100%',
    borderRadius: 2,
    marginRight: 12,
  },
  contentContainer: {
    flex: 1,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  title: {
    fontSize: 16,
    fontFamily: 'MyriadPro-Regular',
    color: Colors.light.text,
    flex: 1,
    marginRight: 8,
  },
  unreadTitle: {
    fontFamily: 'MyriadPro-Bold',
    color: Colors.light.text,
  },
  dateTime: {
    fontSize: 12,
    color: Colors.light.text,
    fontFamily: 'MyriadPro-Regular',
    opacity: 0.5,
  },
  message: {
    fontSize: 14,
    color: Colors.light.text,
    fontFamily: 'MyriadPro-Regular',
    lineHeight: 20,
  },
  unreadMessage: {
    color: Colors.light.text,
    fontFamily: 'MyriadPro-Regular',
  },
  separator: {
    height: 8,
  },
});

export default NotificationsScreen;