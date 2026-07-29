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
 * A plain bordered rectangle — label rendered above by the caller, icon inline — rather than a
 * pill shape, matching the reference product's input style. `multiline` only changes alignment
 * (icon pinned to the top instead of vertically centered) since both variants already share the
 * same grow-with-content rectangle container.
 */
export function TextField({ icon, isPassword, className, multiline, ...inputProps }: TextFieldProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [isSecure, setIsSecure] = useState(isPassword);

  return (
    <View
      className={cn(
        'flex-row gap-base rounded-lg border bg-surface-container-low px-md py-3',
        multiline ? 'items-start' : 'items-center',
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
