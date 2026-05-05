import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
        shouldShowBanner: true,
        shouldShowList: true,
    }),
});

export async function registerForPushNotificationsAsync() {
    if (Platform.OS === 'web') return null;

    try {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;

        if (existingStatus !== 'granted') {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
        }

        if (finalStatus !== 'granted') {
            return null;
        }

        if (Platform.OS === 'android') {
            Notifications.setNotificationChannelAsync('default', {
                name: 'default',
                importance: Notifications.AndroidImportance.MAX,
                vibrationPattern: [0, 250, 250, 250],
                lightColor: '#3B82F6',
            });
        }

        return finalStatus;
    } catch (error) {
        console.warn('Could not register for push notifications:', error);
        return null;
    }
}

export async function scheduleReviewReminder(dueCount: number) {
    if (Platform.OS === 'web') return;
    if (dueCount <= 0) return;

    try {
        // Clear existing notifications
        await Notifications.cancelAllScheduledNotificationsAsync();

        const trigger: Notifications.NotificationTriggerInput = Platform.OS === 'android'
            ? {
                type: Notifications.SchedulableTriggerInputTypes.DAILY,
                hour: 9,
                minute: 0,
            } as Notifications.DailyTriggerInput
            : {
                type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
                hour: 9,
                minute: 0,
                repeats: true,
            } as Notifications.CalendarTriggerInput;

        await Notifications.scheduleNotificationAsync({
            content: {
                title: "Time for a Brain Workout! 🧠",
                body: `You have ${dueCount} flashcards due for review today. Keep that streak alive!`,
                data: { url: '/review' },
            },
            trigger,
        });
    } catch (error) {
        console.warn('Could not schedule notifications:', error);
    }
}

export async function cancelAllReminders() {
    if (Platform.OS === 'web') return;
    try {
        await Notifications.cancelAllScheduledNotificationsAsync();
        console.log('🔕 All scheduled notifications cancelled');
    } catch (error) {
        console.warn('Could not cancel notifications:', error);
    }
}
