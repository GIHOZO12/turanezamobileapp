import { MaterialIcons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, TextInput, View, type TextInputProps } from 'react-native';

import colors from '@/constants/colors';
import { cn } from '@/lib/cn';

export type TextFieldProps = TextInputProps & {
  icon: keyof typeof MaterialIcons.glyphMap;
  /** Renders a visibility toggle instead of plain secureTextEntry, matching the mockup's eye icon */
  isPassword?: boolean;
};

/**
 * TextInput is RN's only text-entry primitive — there's no separate "type=email/password" markup
 * like HTML. We manage focus state ourselves with useState + onFocus/onBlur to swap border color,
 * since RN has no `:focus` pseudo-class (NativeWind's `focus:` variant works for it, but the icon
 * tint is a `color` prop, not a style, so that half still needs the JS state).
 *
 * `multiline` gets meaningfully different container styling: a pill-shaped, fixed 52px-tall row
 * reads fine for a single line of text but looks wrong (and clips content) for a 3-line text area
 * — that variant uses a regular rounded rectangle that grows with content, with the icon aligned
 * to the top instead of vertically centered.
 */
export function TextField({ icon, isPassword, className, multiline, ...inputProps }: TextFieldProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [isSecure, setIsSecure] = useState(isPassword);

  return (
    <View
      className={cn(
        'flex-row gap-base border bg-surface-container-low px-md',
        multiline ? 'items-start rounded-lg py-3' : 'h-[52px] items-center rounded-full',
        isFocused ? 'border-2 border-primary' : 'border-outline-variant'
      )}>
      <MaterialIcons
        name={icon}
        size={20}
        color={isFocused ? colors.primary : colors.outline}
        style={multiline ? { marginTop: 2 } : undefined}
      />
      <TextInput
        className={cn('flex-1 font-body-md text-body-md text-on-surface', className)}
        placeholderTextColor={`${colors.outline}99`}
        secureTextEntry={isSecure}
        multiline={multiline}
        textAlignVertical={multiline ? 'top' : 'center'}
        onFocus={(e) => {
          setIsFocused(true);
          inputProps.onFocus?.(e);
        }}
        onBlur={(e) => {
          setIsFocused(false);
          inputProps.onBlur?.(e);
        }}
        {...inputProps}
      />
      {isPassword && (
        <Pressable hitSlop={8} onPress={() => setIsSecure((prev) => !prev)}>
          <MaterialIcons name={isSecure ? 'visibility' : 'visibility-off'} size={20} color={colors.outline} />
        </Pressable>
      )}
    </View>
  );
}
