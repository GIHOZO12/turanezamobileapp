import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ApiError } from '@/api/client';
import {
  fetchNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  type AppNotification,
  type NotificationCategory,
} from '@/api/notifications';
import colors from '@/constants/colors';

const CATEGORY_ICONS: Record<NotificationCategory, keyof typeof MaterialIcons.glyphMap> = {
  general: 'notifications',
  payment: 'payments',
  project: 'apartment',
  compliance: 'verified-user',
  governance: 'gavel',
  support: 'support-agent',
};

function timeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString();
}

export default function NotificationsScreen() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchNotifications()
      .then((data) => setNotifications(data.results))
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Could not reach the server. Check your connection.'))
      .finally(() => setIsLoading(false));
  }, []);

  const hasUnread = notifications.some((n) => !n.is_read);

  function handlePress(notification: AppNotification) {
    if (!notification.is_read) {
      setNotifications((prev) => prev.map((n) => (n.id === notification.id ? { ...n, is_read: true } : n)));
      markNotificationRead(notification.id).catch(() => {

      });
    }
    navigateForNotification(notification);
  }

  function navigateForNotification(notification: AppNotification) {
    const data = notification.data;
    const groupId = data.group_id;
    const senderId = data.sender_id;
    const plotId = data.plot_id;


    if (typeof groupId === 'number' && typeof senderId === 'number') {
      router.push({ pathname: '/chat/[id]', params: { id: String(groupId), recipient: String(senderId) } });
    } else if (typeof groupId === 'number') {
      router.push({ pathname: '/group/[id]', params: { id: String(groupId) } });
    } else if (typeof plotId === 'number') {
      // No per-plot detail screen exists yet — the Plots tab is the closest available context.
      router.push('/plots');
    }
  }

  function handleMarkAllRead() {
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    markAllNotificationsRead().catch(() => {});
  }

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <View className="flex-row items-center gap-4 px-margin-mobile py-4">
        <Pressable
          hitSlop={8}
          onPress={() => router.back()}
          className="h-10 w-10 items-center justify-center rounded-full active:bg-surface-container-high">
          <MaterialIcons name="arrow-back" size={24} color={colors.primary} />
        </Pressable>
        <Text className="flex-1 font-headline-md text-headline-md text-primary">Notifications</Text>
        {hasUnread && (
          <Pressable hitSlop={8} onPress={handleMarkAllRead}>
            <Text className="font-label-sm text-label-sm text-primary">Mark all read</Text>
          </Pressable>
        )}
      </View>

      {isLoading ? (
        <ActivityIndicator className="py-lg" color={colors.primary} />
      ) : error ? (
        <Text className="mx-margin-mobile rounded-lg bg-error-container px-md py-sm text-center font-label-md text-label-md text-on-error-container">
          {error}
        </Text>
      ) : notifications.length === 0 ? (
        <View className="flex-1 items-center justify-center gap-md px-margin-mobile">
          <MaterialIcons name="notifications-none" size={40} color={colors.outline} />
          <Text className="text-center font-headline-md text-headline-md text-on-surface">No notifications yet</Text>
          <Text className="text-center font-body-md text-body-md text-on-surface-variant">
            Updates about your applications, payments, and groups will show up here.
          </Text>
        </View>
      ) : (
        <ScrollView contentContainerClassName="gap-sm px-margin-mobile pb-lg" showsVerticalScrollIndicator={false}>
          {notifications.map((notification) => (
            <Pressable
              key={notification.id}
              onPress={() => handlePress(notification)}
              className={`flex-row items-start gap-4 rounded-lg p-md shadow-investment active:opacity-90 ${
                notification.is_read ? 'bg-surface-container-lowest' : 'bg-primary-container/10'
              }`}>
              <View className="h-11 w-11 items-center justify-center rounded-full bg-primary/10">
                <MaterialIcons name={CATEGORY_ICONS[notification.category]} size={20} color={colors.primary} />
              </View>
              <View className="flex-1 gap-1">
                <View className="flex-row items-center gap-2">
                  <Text
                    className={`flex-1 font-label-md text-label-md text-on-surface ${
                      notification.is_read ? '' : 'font-headline-md'
                    }`}
                    numberOfLines={1}>
                    {notification.title}
                  </Text>
                  {!notification.is_read && <View className="h-2 w-2 rounded-full bg-error" />}
                </View>
                <Text className="font-body-md text-body-md text-on-surface-variant" numberOfLines={2}>
                  {notification.body}
                </Text>
                <Text className="font-label-sm text-label-sm text-on-surface-variant">{timeAgo(notification.created_at)}</Text>
              </View>
            </Pressable>
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
