import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { Alert, Pressable, Text, useWindowDimensions, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import colors from '@/constants/colors';
import { useAuth } from '@/contexts/auth-context';
import { useDrawer } from '@/contexts/drawer-context';
import { getInitials } from '@/lib/format';

const PANEL_WIDTH_RATIO = 0.8;
const MAX_PANEL_WIDTH = 320;

function DrawerLink({
  icon,
  label,
  onPress,
  destructive,
}: {
  icon: keyof typeof MaterialIcons.glyphMap;
  label: string;
  onPress: () => void;
  destructive?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center gap-4 rounded-lg px-md py-3 active:bg-surface-container-high">
      <MaterialIcons name={icon} size={22} color={destructive ? colors.error : colors.primary} />
      <Text className={`font-label-md text-label-md ${destructive ? 'text-error' : 'text-on-surface'}`}>{label}</Text>
    </Pressable>
  );
}

export function SideDrawer() {
  const { isOpen, close } = useDrawer();
  const { user, signOut } = useAuth();
  const router = useRouter();
  const { width: screenWidth } = useWindowDimensions();
  const panelWidth = Math.min(screenWidth * PANEL_WIDTH_RATIO, MAX_PANEL_WIDTH);

  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withTiming(isOpen ? 1 : 0, { duration: 220 });
  }, [isOpen, progress]);

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: progress.value * 0.5,
  }));

  const panelStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: (progress.value - 1) * panelWidth }],
  }));

  function go(path: '/account-info' | '/submit-plot') {
    close();
    router.push(path);
  }

  function handleSignOut() {
    close();
    Alert.alert('Log Out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log Out', style: 'destructive', onPress: signOut },
    ]);
  }


  return (
    <View className="absolute inset-0" style={{ zIndex: isOpen ? 50 : -1 }} pointerEvents={isOpen ? 'auto' : 'none'}>
      <Animated.View style={backdropStyle} className="absolute inset-0 bg-black">
        <Pressable onPress={close} className="flex-1" />
      </Animated.View>

      <Animated.View
        style={[panelStyle, { width: panelWidth }]}
        className="absolute bottom-0 left-0 top-0 bg-surface-container-lowest shadow-investment">
        <SafeAreaView edges={['top', 'bottom']} className="flex-1">
          <View className="gap-md p-md">
            <View className="h-14 w-14 items-center justify-center rounded-full bg-primary">
              <Text className="font-headline-md text-headline-md text-on-primary">
                {user ? getInitials(user.full_name) : '…'}
              </Text>
            </View>
            <View>
              <Text className="font-headline-md text-headline-md text-on-surface" numberOfLines={1}>
                {user?.full_name ?? 'Loading...'}
              </Text>
              <Text className="font-label-sm text-label-sm text-on-surface-variant" numberOfLines={1}>
                {user?.email}
              </Text>
            </View>
          </View>

          <View className="h-[1px] bg-outline-variant/30" />

          <View className="gap-1 p-sm">
            <DrawerLink icon="person" label="Account Info" onPress={() => go('/account-info')} />
            <DrawerLink icon="add-business" label="Submit a Plot" onPress={() => go('/submit-plot')} />
            <DrawerLink icon="help" label="Help Center" onPress={close} />
          </View>

          <View className="flex-1" />

          <View className="gap-1 p-sm">
            <View className="h-[1px] bg-outline-variant/30" />
            <DrawerLink icon="logout" label="Log Out" onPress={handleSignOut} destructive />
          </View>
        </SafeAreaView>
      </Animated.View>
    </View>
  );
}
