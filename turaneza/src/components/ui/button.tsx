import { ActivityIndicator, Pressable, Text, View } from 'react-native';

import colors from '@/constants/colors';
import { cn } from '@/lib/cn';

export type ButtonProps = {
  label: string;
  onPress?: () => void;
  variant?: 'primary' | 'secondary' | 'container';
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  className?: string;
};

const VARIANT_STYLES = {
  primary: { pressable: 'bg-primary shadow-investment', label: 'text-on-primary' },
  secondary: { pressable: 'border border-outline-variant bg-transparent', label: 'text-on-surface' },
  container: { pressable: 'bg-primary-container', label: 'text-on-primary-container' },
} as const;

const SPINNER_COLOR = {
  primary: colors['on-primary'],
  secondary: colors.primary,
  container: colors['on-primary-container'],
} as const;

/**
 * NativeWind maps Tailwind's `active:` variant to a Pressable's pressed state, so
 * `active:scale-95` reproduces the mockup's press feedback with no manual state or Animated code.
 */
export function Button({ label, onPress, variant = 'primary', loading, disabled, icon, className }: ButtonProps) {
  const isDisabled = disabled || loading;
  const styles = VARIANT_STYLES[variant];

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled }}
      onPress={onPress}
      disabled={isDisabled}
      className={cn(
        'min-h-[52px] items-center justify-center rounded-full py-sm active:scale-95',
        styles.pressable,
        isDisabled && 'opacity-50',
        className
      )}>
      {loading ? (
        <ActivityIndicator color={SPINNER_COLOR[variant]} />
      ) : (
        <View className="flex-row items-center gap-base">
          {icon}
          <Text className={cn('font-label-md text-label-md', styles.label)}>{label}</Text>
        </View>
      )}
    </Pressable>
  );
}
