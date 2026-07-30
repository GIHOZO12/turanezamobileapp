import { useAuth } from '@/contexts/auth-context';
import { usePushNotifications } from '@/hooks/use-push-notifications';

/** Renders nothing — just runs the push-notification registration/tap-routing side effects
 * once, globally. Mounted at the root layout alongside SideDrawer/AiAssistantFab. */
export function PushNotificationRegistrar() {
  const { isSignedIn } = useAuth();
  usePushNotifications(isSignedIn);
  return null;
}
