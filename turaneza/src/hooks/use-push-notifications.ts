import Constants from 'expo-constants';
import * as Device from 'expo-device';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { Platform } from 'react-native';

import { registerDeviceToken } from '@/api/notifications';

// expo-notifications' remote-push functionality was removed from Expo Go on Android as of
// SDK 53 — even just loading the module there throws. Push notifications need a real
// dev-client/production build anyway, so this whole feature no-ops specifically inside Expo
// Go (not a custom dev-client build, where it works fine) — the module is only ever
// dynamically imported below, never at the top level, so Expo Go never touches it at all.
const isExpoGo = Constants.appOwnership === 'expo';

/** Requests permission, registers this device's Expo push token with the backend, and
 * routes the user somewhere sensible when they tap a push. Call once, globally, gated on
 * sign-in — see push-notification-registrar.tsx, mounted at the root layout. */
export function usePushNotifications(isSignedIn: boolean) {
  const router = useRouter();

  useEffect(() => {
    // Simulators/emulators can't produce a real push token — skip rather than error.
    if (!isSignedIn || !Device.isDevice || isExpoGo) return;
    let cancelled = false;

    async function register() {
      const Notifications = await import('expo-notifications');

      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowAlert: true,
          shouldPlaySound: true,
          shouldSetBadge: false,
          shouldShowBanner: true,
          shouldShowList: true,
        }),
      });

      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.DEFAULT,
        });
      }

      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== 'granted' || cancelled) return;

      const projectId = Constants.expoConfig?.extra?.eas?.projectId;
      const { data: token } = await Notifications.getExpoPushTokenAsync({ projectId });
      if (cancelled) return;

      registerDeviceToken({ token, platform: Platform.OS === 'ios' ? 'ios' : 'android' }).catch(() => {
        // Best-effort — a failed registration just means this device won't get pushes until
        // the next app launch retries it, not worth surfacing an error over.
      });
    }

    register();
    return () => {
      cancelled = true;
    };
  }, [isSignedIn]);

  useEffect(() => {
    if (isExpoGo) return;
    let cancelled = false;
    let subscription: { remove: () => void } | undefined;

    import('expo-notifications').then((Notifications) => {
      if (cancelled) return;
      subscription = Notifications.addNotificationResponseReceivedListener((response) => {
        const data = response.notification.request.content.data as Record<string, unknown>;
        if (data?.group_id) {
          router.push({ pathname: '/chat/[id]', params: { id: String(data.group_id) } });
        } else {
          router.push('/notifications');
        }
      });
    });

    return () => {
      cancelled = true;
      subscription?.remove();
    };
  }, [router]);
}
