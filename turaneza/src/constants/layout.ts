import { Platform } from 'react-native';

/**
 * NativeTabs (expo-router/unstable-native-tabs) doesn't expose its own rendered height, and a
 * tab screen's scroll content isn't automatically inset above it — without this, content renders
 * partially behind the bottom tab bar (confirmed on-device: the trust banner on Home was getting
 * clipped by it). Every screen inside (tabs) needs this added to its scroll content's bottom
 * padding. iOS/Android values differ because their native tab bar chrome differs in height.
 */
export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
