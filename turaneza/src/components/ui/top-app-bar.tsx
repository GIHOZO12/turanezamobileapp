import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { LayoutChangeEvent, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { fetchNotifications } from '@/api/notifications';
import colors from '@/constants/colors';
import { useDrawer } from '@/contexts/drawer-context';
import { cn } from '@/lib/cn';

export type TopAppBarProps = {
  onMenuPress?: () => void;
  onNotificationPress?: () => void;
  hasNotification?: boolean;
 
  translucent?: boolean;
  onHeightChange?: (height: number) => void;
};


export function TopAppBar({ onMenuPress, onNotificationPress, hasNotification, translucent, onHeightChange }: TopAppBarProps) {
  const [showBadge, setShowBadge] = useState(hasNotification ?? false);
  const drawer = useDrawer();
  const router = useRouter();

  useEffect(() => {
    if (hasNotification != null) return;
    fetchNotifications()
      .then((data) => setShowBadge(data.results.some((n) => !n.is_read)))
      .catch(() => {});
  }, [hasNotification]);

  function handleLayout(event: LayoutChangeEvent) {
    onHeightChange?.(event.nativeEvent.layout.height);
  }

  return (
    <SafeAreaView
      edges={['top']}
      onLayout={handleLayout}
      className={cn('absolute left-0 right-0 top-0 z-10', translucent ? 'bg-background/90' : 'bg-background')}>
      <View className="flex-row items-center justify-between px-margin-mobile py-4">
        <View className="flex-row items-center gap-4">
          <Pressable
            hitSlop={8}
            onPress={onMenuPress ?? drawer.open}
            className="rounded-full p-2 active:bg-surface-container-high">
            <MaterialIcons name="menu" size={24} color={colors.primary} />
          </Pressable>
          <Text className="font-headline-md text-headline-md text-primary">TURANEZA</Text>
        </View>
        <Pressable
          hitSlop={8}
          onPress={() => {
            setShowBadge(false);
            if (onNotificationPress) {
              onNotificationPress();
            } else {
              router.push('/notifications');
            }
          }}
          className="rounded-full p-2 active:bg-surface-container-high">
          <MaterialIcons name="notifications" size={24} color={colors.primary} />
          {showBadge && <View className="absolute right-2 top-2 h-2 w-2 rounded-full bg-error" />}
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
