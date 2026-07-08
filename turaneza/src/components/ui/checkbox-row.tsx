import { MaterialIcons } from '@expo/vector-icons';
import { Pressable, Text, View } from 'react-native';

import colors from '@/constants/colors';
import { cn } from '@/lib/cn';

export function CheckboxRow({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean;
  onChange: (next: boolean) => void;
}) {
  return (
    <Pressable onPress={() => onChange(!value)} className="flex-row items-start gap-3 py-1">
      <View
        className={cn(
          'mt-0.5 h-5 w-5 items-center justify-center rounded border',
          value ? 'border-primary bg-primary' : 'border-outline-variant bg-transparent'
        )}>
        {value && <MaterialIcons name="check" size={14} color={colors['on-primary']} />}
      </View>
      <Text className="flex-1 font-body-md text-body-md text-on-surface">{label}</Text>
    </Pressable>
  );
}
