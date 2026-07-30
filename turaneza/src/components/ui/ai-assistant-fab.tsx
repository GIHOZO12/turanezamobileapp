import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import colors from '@/constants/colors';
import { useAuth } from '@/contexts/auth-context';

/**
 * Global floating "Ask TURANEZA" button — mounted once at the root layout (see _layout.tsx),
 * so it overlays every authenticated screen without each screen wiring it in individually.
 * Opens a real screen route (see ai-assistant-screen.tsx) rather than a Modal — Android's
 * Modal doesn't reliably inherit the app's keyboard-avoidance behavior, which left the text
 * input hidden behind the keyboard on physical devices.
 */
export function AiAssistantFab() {
  const { isSignedIn } = useAuth();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  if (!isSignedIn) return null;

  return (
    <Pressable
      onPress={() => router.push('/assistant')}
      hitSlop={8}
      style={{ bottom: insets.bottom + 88 }}
      className="absolute right-5 h-14 w-14 items-center justify-center rounded-full bg-primary shadow-investment active:opacity-90">
      <MaterialIcons name="smart-toy" size={26} color={colors['on-primary']} />
    </Pressable>
  );
}
