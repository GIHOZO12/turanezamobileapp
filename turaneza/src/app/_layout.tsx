import '@/global.css';

import { Merriweather_400Regular, Merriweather_700Bold } from '@expo-google-fonts/merriweather';
import {
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
  Poppins_800ExtraBold,
} from '@expo-google-fonts/poppins';
import { useFonts } from 'expo-font';
import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useColorScheme } from 'react-native';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { PushNotificationRegistrar } from '@/components/push-notification-registrar';
import { AiAssistantFab } from '@/components/ui/ai-assistant-fab';
import { SideDrawer } from '@/components/ui/side-drawer';
import { AuthProvider, useAuth } from '@/contexts/auth-context';
import { DrawerProvider } from '@/contexts/drawer-context';

SplashScreen.preventAutoHideAsync();

function RootNavigator() {
  const { isSignedIn, isBootstrapping } = useAuth();

  // Wait for the GET /me/ bootstrap check (see auth-context.tsx) before picking a stack —
  // otherwise a returning, already-logged-in user would flash the sign-in screen for a frame.
  if (isBootstrapping) return null;

  // Stack.Protected mounts one screen group or the other based on `guard` — it's how
  // expo-router does auth gating natively, no manual `router.replace()` redirects needed.
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={!isSignedIn}>
        <Stack.Screen name="(auth)" />
      </Stack.Protected>
      <Stack.Protected guard={isSignedIn}>
        <Stack.Screen name="(tabs)" />
        {/* Pushed over the tab bar from Home or Plots — reachable from either, so it lives
            outside both, rather than being duplicated inside each tab's own stack. */}
        <Stack.Screen name="group/[id]" />
        <Stack.Screen name="group/[id]/apply" />
        <Stack.Screen name="group/[id]/members" />
        <Stack.Screen name="project/[id]" />
        <Stack.Screen name="chat/[id]" />
        <Stack.Screen name="applications/[id]/pay-commitment-fee" />
        {/* Reachable from Home and the Plots tab, same reasoning as group/[id] above */}
        <Stack.Screen name="submit-plot" />
        <Stack.Screen name="account-info" />
        <Stack.Screen name="notifications" />
        <Stack.Screen name="assistant" />
        <Stack.Screen name="resources/[slug]" />
      </Stack.Protected>
    </Stack>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
    Poppins_800ExtraBold,
    Merriweather_400Regular,
    Merriweather_700Bold,
  });

  // Keep the native splash screen up until fonts are ready, so text never
  // flashes in a fallback font before swapping to Poppins/Merriweather.
  if (!fontsLoaded) return null;

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <AnimatedSplashOverlay />
      <AuthProvider>
        <DrawerProvider>
          <RootNavigator />
          <SideDrawer />
          <AiAssistantFab />
          <PushNotificationRegistrar />
        </DrawerProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
