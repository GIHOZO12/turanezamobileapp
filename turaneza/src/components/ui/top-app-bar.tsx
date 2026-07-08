import { MaterialIcons } from '@expo/vector-icons';
import { useState } from 'react';
import { LayoutChangeEvent, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import colors from '@/constants/colors';
import { cn } from '@/lib/cn';

export type TopAppBarProps = {
  onMenuPress?: () => void;
  onNotificationPress?: () => void;
  hasNotification?: boolean;
  /** Home's header sits over a hero image/gradient so it's translucent; other screens are opaque. */
  translucent?: boolean;
  onHeightChange?: (height: number) => void;
};

/**
 * Floats (position: absolute) over whatever scrolls beneath it — same on every screen that uses
 * it — which is exactly why this got extracted the moment a second screen needed it: the header's
 * real height has to be measured via onLayout and fed back to the caller's ScrollView padding
 * (see home-screen.tsx), and hand-copying that wiring into every screen is how it drifts out of
 * sync and overlaps content, which is what happened the first time around.
 */
export function TopAppBar({ onMenuPress, onNotificationPress, hasNotification, translucent, onHeightChange }: TopAppBarProps) {
  const [showBadge, setShowBadge] = useState(hasNotification ?? true);

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
          <Pressable hitSlop={8} onPress={onMenuPress} className="rounded-full p-2 active:bg-surface-container-high">
            <MaterialIcons name="menu" size={24} color={colors.primary} />
          </Pressable>
          <Text className="font-headline-md text-headline-md text-primary">TURANEZA</Text>
        </View>
        <Pressable
          hitSlop={8}
          onPress={() => {
            setShowBadge(false);
            onNotificationPress?.();
          }}
          className="rounded-full p-2 active:bg-surface-container-high">
          <MaterialIcons name="notifications" size={24} color={colors.primary} />
          {showBadge && <View className="absolute right-2 top-2 h-2 w-2 rounded-full bg-error" />}
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
