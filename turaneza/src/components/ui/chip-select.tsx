import { Pressable, Text, View } from 'react-native';

import { cn } from '@/lib/cn';

export function ChipSelect<T extends string>({
  options,
  value,
  onChange,
}: {
  options: readonly { value: T; label: string }[];
  value: T;
  onChange: (next: T) => void;
}) {
  return (
    <View className="flex-row flex-wrap gap-2">
      {options.map((option) => {
        const isActive = option.value === value;
        return (
          <Pressable
            key={option.value}
            onPress={() => onChange(option.value)}
            className={cn(
              'rounded-full px-4 py-2',
              isActive ? 'bg-primary' : 'border border-outline-variant bg-transparent'
            )}>
            <Text className={cn('font-label-md text-label-md', isActive ? 'text-on-primary' : 'text-on-surface-variant')}>
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
