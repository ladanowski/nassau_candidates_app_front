import PushNotification from 'react-native-push-notification';
import PushNotificationIOS from '@react-native-community/push-notification-ios';
import { Platform } from 'react-native';

class NotificationService {
    constructor() {
        this.configure();
    }

    configure = () => {
        PushNotification.configure({
            // Called when Token is generated (iOS and Android)
            onRegister: function (token) {
                console.log('TOKEN:', token);
            },

            // Called when a remote is received or opened/clicked
            onNotification: function (notification) {
                console.log('LOCAL NOTIFICATION ==>', notification);

                // Handle notification tap
                if (notification.userInteraction) {
                    // User tapped on notification
                    console.log('User tapped notification:', notification.data);
                    // You can handle navigation here based on notification.data
                }

                // Required on iOS only (see fetchCompletionHandler docs: https://reactnative.dev/docs/pushnotificationios)
                notification.finish(PushNotificationIOS.FetchResult.NoData);
            },

            // iOS only
            permissions: {
                alert: true,
                badge: true,
                sound: true,
            },

            popInitialNotification: true,
            requestPermissions: Platform.OS === 'ios',
        });

        this.createDefaultChannels();
    };

    createDefaultChannels = () => {
        if (Platform.OS === 'android') {
            PushNotification.createChannel(
                {
                    channelId: 'default-channel-id',
                    channelName: 'Default Channel',
                    channelDescription: 'A default channel for notifications',
                    playSound: true,
                    soundName: 'default',
                    importance: 4,
                    vibrate: true,
                },
                (created) => console.log(`createChannel returned '${created}'`)
            );

            // Create a high priority channel for important notifications
            PushNotification.createChannel(
                {
                    channelId: 'high-priority-channel',
                    channelName: 'High Priority',
                    channelDescription: 'High priority notifications',
                    playSound: true,
                    soundName: 'default',
                    importance: 5,
                    vibrate: true,
                },
                (created) => console.log(`High priority channel created: '${created}'`)
            );
        }
    };

    showNotification = (title, message, data = {}, priority = 'default') => {
        const channelId = priority === 'high' ? 'high-priority-channel' : 'default-channel-id';

        PushNotification.localNotification({
            channelId: channelId,
            title: title,
            message: message,
            smallIcon: 'ic_notification',
            largeIcon: 'ic_launcher',
            bigText: message,
            bigPictureUrl: data.imageUrl || undefined,
            vibrate: true,
            vibration: 300,
            priority: priority,
            playSound: true,
            soundName: 'default',
            groupSummary: true,
            userInteraction: true, // Set to true to indicate that the notification was interacted with
            data: {
                ...data,
            },
        });
    };

    // Method to cancel all notifications
    cancelAllNotifications = () => {
        PushNotification.cancelAllLocalNotifications();
    };

    // Method to cancel notification by ID
    cancelNotification = (id) => {
        PushNotification.cancelLocalNotifications({ id: id });
    };

    // Method to get scheduled notifications
    getScheduledNotifications = (callback) => {
        PushNotification.getScheduledLocalNotifications(callback);
    };

    // Method to clear badge (iOS)
    clearBadge = () => {
        PushNotification.setApplicationIconBadgeNumber(0);
    };
}

export default new NotificationService();