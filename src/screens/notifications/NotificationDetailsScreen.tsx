import React, { useEffect, useState } from 'react';
import {
    SafeAreaView,
    View,
    Text,
    ScrollView,
    StyleSheet,
} from 'react-native';
import { RouteProp, useRoute } from '@react-navigation/native';
import AppBar from '../../components/AppBar';
import { globalStyles } from '../../styles/globalStyles';
import { Colors } from '../../constants/colors';
import StorageService from '../../services/StorageService';
import { StorageKeys } from '../../constants/storage_keys';
import { markNotificationAsRead } from '../../services/api_services/NotificationsService';

interface Notification {
    id: string;
    title: string;
    message: string;
    dateTime: string;
    isRead: boolean;
    type?: 'info' | 'success' | 'warning' | 'error';
}

type NotificationDetailsRouteParams = {
    notificationDetails: {
        notification: Notification;
    };
};

const NotificationDetailsScreen: React.FC = () => {
    const route = useRoute<RouteProp<NotificationDetailsRouteParams, 'notificationDetails'>>();
    const { notification } = route.params;

    const [authToken, setAuthToken] = useState<string | null>(null);

    const formatFullDateTime = (dateTime: string): string => {
  // Automatically handles UTC ("Z") or timezone offsets like "+05:00"
  const date = new Date(dateTime);

  return date.toLocaleString(undefined, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};



    const getTypeInfo = (type: string = 'info') => {
        switch (type) {
            case 'success':
                return {
                    color: '#10B981',
                    backgroundColor: '#ECFDF5',
                    label: 'Success',
                    icon: '✓',
                };
            case 'warning':
                return {
                    color: '#F59E0B',
                    backgroundColor: '#FFFBEB',
                    label: 'Warning',
                    icon: '⚠',
                };
            case 'error':
                return {
                    color: '#EF4444',
                    backgroundColor: '#FEF2F2',
                    label: 'Alert',
                    icon: '!',
                };
            default:
                return {
                    color: '#3B82F6',
                    backgroundColor: '#EFF6FF',
                    label: 'Information',
                    icon: 'i',
                };
        }
    };

    const typeInfo = getTypeInfo(notification.type);

    //   const handleAction = () => {
    //     // Handle notification action (e.g., open URL, navigate to specific screen)
    //     if (notification.actionUrl) {
    //       // Handle URL or deep link
    //       console.log('Navigate to:', notification.actionUrl);
    //     }
    //   };

    useEffect(() => {
        const checkAuthToken = async () => {
            const token = await StorageService.getItem<string>(StorageKeys.authToken);
            setAuthToken(token);
        };

        checkAuthToken();
    }, []);

    useEffect(() => {
        if (!authToken || notification.isRead) return;
        markNotificationAsRead(notification.id);
    }, [authToken, notification.id, notification.isRead]);

    return (
        <SafeAreaView style={globalStyles.safeAreaContainer}>
            <AppBar title="Notification Details" />

            <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
                {/* Header Section */}
                <View style={styles.headerSection}>
                    {/* Type Badge */}
                    <View style={[styles.typeBadge, { backgroundColor: typeInfo.backgroundColor }]}>
                        <Text style={[styles.typeIcon, { color: typeInfo.color }]}>
                            {typeInfo.icon}
                        </Text>
                        <Text style={[styles.typeLabel, { color: typeInfo.color }]}>
                            {typeInfo.label}
                        </Text>
                    </View>

                    {/* Title */}
                    <Text style={styles.title}>{notification.title}</Text>

                    {/* Metadata */}
                    <View style={styles.metadataContainer}>
                        <Text style={styles.dateTime}>
                            {formatFullDateTime(notification.dateTime)}
                        </Text>
                        {/* {notification.sender && (
              <Text style={styles.sender}>From: {notification.sender}</Text>
            )} */}
                        {/* {notification.category && (
              <Text style={styles.category}>Category: {notification.category}</Text>
            )} */}
                    </View>
                </View>

                {/* Content Section */}
                <View style={styles.contentSection}>
                    <Text style={styles.sectionTitle}>Message</Text>
                    <Text style={styles.message}>{notification.message}</Text>

                    {/* {notification.fullContent && (
            <>
              <Text style={styles.sectionTitle}>Details</Text>
              <Text style={styles.fullContent}>{notification.fullContent}</Text>
            </>
          )} */}
                </View>

                {/* Action Section */}
                {/* {notification.actionUrl && (
          <View style={styles.actionSection}>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: typeInfo.color }]}
              onPress={handleAction}
              activeOpacity={0.8}
            >
              <Text style={styles.actionButtonText}>Take Action</Text>
            </TouchableOpacity>
          </View>
        )} */}

                {/* Read Status */}

            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 12,
    },
    headerSection: {
        backgroundColor: Colors.light.readNotificationCard,
        padding: 20,
        marginBottom: 12,
        shadowColor: '#000',
        borderRadius: 12,
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    typeBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        marginBottom: 16,
    },
    typeIcon: {
        fontSize: 14,
        fontWeight: 'bold',
        marginRight: 6,
    },
    typeLabel: {
        fontSize: 12,
        fontFamily: 'MyriadPro-Bold',
        textTransform: 'uppercase',
    },
    title: {
        fontSize: 24,
        fontFamily: 'MyriadPro-Bold',
        color: Colors.light.text,
        lineHeight: 32,
        marginBottom: 16,
    },
    metadataContainer: {
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
        paddingTop: 16,
    },
    dateTime: {
        fontSize: 12,
        color: Colors.light.text,
        opacity: 0.75,
        marginBottom: 4,
    },
    sender: {
        fontSize: 12,
        color: '#6B7280',
        marginBottom: 4,
    },

    contentSection: {
        backgroundColor: Colors.light.readNotificationCard,
        padding: 20,
        marginVertical: 12,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
        borderRadius: 12,
    },
    sectionTitle: {
        fontSize: 16,
        fontFamily: 'MyriadPro-Bold',
        color: Colors.light.text,
        marginBottom: 12,
    },
    message: {
        fontSize: 16,
        color: Colors.light.text,
        fontFamily: 'MyriadPro-Regular',
        lineHeight: 24,
        // marginBottom: 20,
    },
    fullContent: {
        fontSize: 15,
        color: Colors.light.text,
        fontFamily: 'MyriadPro-Regular',
        lineHeight: 22,
    },
    actionSection: {
        backgroundColor: '#FFFFFF',
        padding: 20,
        marginBottom: 12,
    },
    actionButton: {
        paddingVertical: 14,
        paddingHorizontal: 24,
        borderRadius: 8,
        alignItems: 'center',
    },
    actionButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    statusSection: {
        backgroundColor: '#FFFFFF',
        padding: 20,
        marginBottom: 20,
    },
    statusIndicator: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: 8,
    },
    statusText: {
        fontSize: 14,
        color: '#6B7280',
        fontWeight: '500',
    },
});

export default NotificationDetailsScreen;