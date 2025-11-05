import React, { useState, useEffect } from 'react';
import {
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { NavigationProp, RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import AppBar from '../../components/AppBar';
import { globalStyles } from '../../styles/globalStyles';
import { Colors } from '../../constants/colors';
import { getNotifications } from '../../services/api_services/NotificationsService';

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

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      if (loading || !hasMore) return;

      setLoading(true);
      try {
        const limit = 10;
        const response = await getNotifications(page, limit);

        if (response.success) {
          const data = response.data || [];
          if (data.length < limit) setHasMore(false);

          const formattedData: Notification[] = data.map((item: any, index: number) => ({
            id: item.ID.toString(),
            title: item.Subject,
            message: item.Message,
            dateTime: item.dtTimeSent,
            isRead: item.read == null ? false : item.read,
            // type: item.ID % 4 === 0
            //   ? 'info'
            //   : item.id % 4 === 1
            //     ? 'success'
            //     : item.id % 4 === 2
            //       ? 'warning'
            //       : 'error',
          }));

          setNotifications(prev => [...prev, ...formattedData]);
        }
      } catch (error: any) {
        console.error('Failed to fetch notifications:', error);
        navigation.goBack();
        Alert.alert('Notifications', error.message || 'Network error. Please check your connection and try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, [page]);

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      setPage(prev => prev + 1);
    }
  };

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
      case 'success': return '#10B981';
      case 'warning': return '#F59E0B';
      case 'error': return '#EF4444';
      default: return '#3B82F6';
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
    if (!notification.isRead) {
      markAsRead(notification.id);
    }

    navigation.navigate('notificationDetails', { notification });
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
      {!item.isRead && <View style={styles.unreadIndicator} />}
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

  const renderFooter = () => {
    if (!loading) return null;
    return (
      <View style={{ paddingVertical: 16 }}>
        <ActivityIndicator size="large" color={Colors.light.primary} />
      </View>
    );
  };

  return (
    <SafeAreaView style={globalStyles.safeAreaContainer}>
      <AppBar title={title} />
      <FlatList
        data={notifications}
        renderItem={renderNotificationItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.listContainer,
          notifications.length === 0 && { flex: 1, justifyContent: 'center' },
        ]}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={() => {
          if (loading) return null;
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
    shadowOffset: { width: 0, height: 2 },
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
});

export default NotificationsScreen;
