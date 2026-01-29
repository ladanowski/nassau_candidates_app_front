import React, {useState, useEffect, useRef, useCallback} from 'react';
import {
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Alert,
  RefreshControl,
  Platform,
} from 'react-native';
import messaging from '@react-native-firebase/messaging';
import {
  NavigationProp,
  RouteProp,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import AppBar from '../../components/AppBar';
import {globalStyles} from '../../styles/globalStyles';
import {Colors} from '../../constants/colors';
import {getNotifications} from '../../services/api_services/NotificationsService';
import PushNotificationIOS from '@react-native-community/push-notification-ios';

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
  const route =
    useRoute<RouteProp<NotificationsRouteParams, 'notifications'>>();
  const {title} = route.params;
  const navigation = useNavigation<NavigationProp<any>>();

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const pageRef = useRef(1);
  const isFetchingRef = useRef(false);

  const limit = 10;
  const [nowTick, setNowTick] = useState(() => Date.now());

  // Re-render periodically so "x min ago" updates without refetching.
  useEffect(() => {
    const id = setInterval(() => setNowTick(Date.now()), 60_000);
    return () => clearInterval(id);
  }, []);

  // Initial load - fetch page 1 on component mount
  useEffect(() => {
    const fetchInitialNotifications = async () => {
      setLoading(true);
      try {
        if (Platform.OS === 'ios') {
          PushNotificationIOS.setApplicationIconBadgeNumber(0);
        }

        const response = await getNotifications(1, limit);

        if (response.success) {
          const data = response.data || [];
          if (data.length < limit) setHasMore(false);

          const formattedData: Notification[] = data.map((item: any) => ({
            id: item.ID.toString(),
            title: item.Subject,
            message: item.Message,
            dateTime: item.dtTimeSent,
            isRead: item.read == null ? false : item.read,
          }));

          setNotifications(formattedData);
          pageRef.current = 1;
        }
      } catch (error: any) {
        console.error('Failed to fetch notifications:', error);
        navigation.goBack();
        Alert.alert(
          'Notifications',
          error.message ||
            'Network error. Please check your connection and try again.',
        );
      } finally {
        setLoading(false);
      }
    };

    fetchInitialNotifications();
  }, [navigation]);

  // Fetch for pagination (page > 1)
  const fetchMoreNotifications = async () => {
    if (isFetchingRef.current || !hasMore) return;

    isFetchingRef.current = true;
    setLoading(true);

    try {
      const nextPage = pageRef.current + 1;
      const response = await getNotifications(nextPage, limit);

      if (response.success) {
        const data = response.data || [];
        if (data.length < limit) setHasMore(false);

        const formattedData: Notification[] = data.map((item: any) => ({
          id: item.ID.toString(),
          title: item.Subject,
          message: item.Message,
          dateTime: item.dtTimeSent,
          isRead: item.read == null ? false : item.read,
        }));

        setNotifications(prev => [...prev, ...formattedData]);
        pageRef.current = nextPage;
      }
    } catch (error: any) {
      console.error('Failed to fetch more notifications:', error);
    } finally {
      setLoading(false);
      isFetchingRef.current = false;
    }
  };

  const handleLoadMore = () => {
    if (!loading && !refreshing) fetchMoreNotifications();
  };

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    pageRef.current = 1;
    setNotifications([]);
    setHasMore(true);

    try {
      if (Platform.OS === 'ios') {
        PushNotificationIOS.setApplicationIconBadgeNumber(0);
      }

      const response = await getNotifications(1, limit);

      if (response.success) {
        const data = response.data || [];
        const formattedData: Notification[] = data.map((item: any) => ({
          id: item.ID.toString(),
          title: item.Subject,
          message: item.Message,
          dateTime: item.dtTimeSent,
          isRead: item.read == null ? false : item.read,
        }));

        setNotifications(formattedData);
        setHasMore(data.length === limit);
      }
    } catch (error: any) {
      console.error('Failed to refresh notifications:', error);
      Alert.alert(
        'Refresh Failed',
        error.message || 'Unable to refresh notifications.',
      );
    } finally {
      setRefreshing(false);
    }
  }, []);

  const parseNotificationDate = (dateTime: string): Date => {
    // If the string already includes a timezone (Z or ±HH:MM), parse as-is.
    // If not, treat it as UTC by appending 'Z' to avoid local-time misinterpretation.
    const hasTz = /([zZ]|[+-]\d{2}:\d{2})$/.test(dateTime.trim());
    return new Date(hasTz ? dateTime : `${dateTime}Z`);
  };

  const formatDateTime = (dateTime: string): string => {
    // Expect a timezone-aware timestamp string from the API (e.g. "...Z" or "-05:00").
    const date = parseNotificationDate(dateTime);

    const now = new Date(nowTick);
    const diffInMs = now.getTime() - date.getTime();
    const diffInMinutes = Math.max(0, Math.floor(diffInMs / (1000 * 60)));
    const diffInHours = Math.floor(diffInMinutes / 60);

    if (diffInMinutes < 1) {
      return 'Just now';
    } else if (diffInMinutes < 60) {
      if (diffInMinutes < 15) return `${diffInMinutes} min ago`;
      if (diffInMinutes < 30) return '15 min ago';
      if (diffInMinutes < 45) return '30 min ago';
      return '45 min ago';
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
        hour: '2-digit',
        minute: '2-digit',
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
        notification.id === id ? {...notification, isRead: true} : notification,
      ),
    );
  };

  const handleNotificationPress = (notification: Notification) => {
    if (!notification.isRead) {
      markAsRead(notification.id);
    }

    navigation.navigate('notificationDetails', {notification});
  };

  const renderNotificationItem = ({item}: {item: Notification}) => (
    <TouchableOpacity
      style={[styles.notificationItem, !item.isRead && styles.unreadItem]}
      onPress={() => handleNotificationPress(item)}
      activeOpacity={0.7}>
      {!item.isRead && <View style={styles.unreadIndicator} />}
      <View
        style={[
          styles.typeIndicator,
          {backgroundColor: getTypeColor(item.type)},
        ]}
      />
      <View style={styles.contentContainer}>
        <View style={styles.headerContainer}>
          <Text
            style={[styles.title, !item.isRead && styles.unreadTitle]}
            numberOfLines={1}>
            {item.title}
          </Text>
          <Text style={styles.dateTime}>{formatDateTime(item.dateTime)}</Text>
        </View>
        <Text
          style={[styles.message, !item.isRead && styles.unreadMessage]}
          numberOfLines={2}>
          {item.message}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderFooter = () => {
    if (!loading) return null;
    return (
      <View style={{paddingVertical: 16}}>
        <ActivityIndicator size="large" color={Colors.light.primary} />
      </View>
    );
  };

  useEffect(() => {
    const foregroundNotificationListener = messaging().onMessage(
      async remoteMessage => {
        console.log(
          'Notification received in Notification screen foreground:',
          remoteMessage,
        );

        // Refresh notifications after 3 seconds
        setTimeout(() => {
          handleRefresh();
        }, 2000);
      },
    );

    return () => {
      // This removes the listener — required!
      foregroundNotificationListener();
    };
  }, [handleRefresh]);

  return (
    <SafeAreaView style={globalStyles.safeAreaContainer}>
      <AppBar title={title} />
      <FlatList
        data={notifications}
        renderItem={renderNotificationItem}
        keyExtractor={item => item.id}
        extraData={nowTick}
        contentContainerStyle={[
          styles.listContainer,
          notifications.length === 0 && {flex: 1, justifyContent: 'center'},
        ]}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.3}
        ListFooterComponent={renderFooter}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={Colors.light.primary}
          />
        }
        ListEmptyComponent={() => {
          if (loading || refreshing) return null;
          return (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No notifications available.</Text>
            </View>
          );
        }}
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
    shadowOffset: {width: 0, height: 2},
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

  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.light.text,
    opacity: 0.6,
    fontFamily: 'MyriadPro-Regular',
  },
  floatingAlertTop: {
    position: 'absolute',
    top: 150,
    alignSelf: 'center',
    backgroundColor: Colors.light.primary,
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 25,
    zIndex: 999,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowOffset: {width: 0, height: 2},
    shadowRadius: 4,
  },

  floatingAlertTopText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
});

export default NotificationsScreen;
