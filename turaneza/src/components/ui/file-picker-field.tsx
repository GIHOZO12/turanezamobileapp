import { MaterialIcons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import { Pressable, Text, View } from 'react-native';

import type { PickedFile } from '@/api/applications';
import colors from '@/constants/colors';

export function FilePickerField({
  value,
  onChange,
  helperText,
}: {
  value: PickedFile | null;
  onChange: (file: PickedFile | null) => void;
  helperText?: string;
}) {
  async function handlePick() {
    const result = await DocumentPicker.getDocumentAsync({
      type: ['application/pdf', 'image/*'],
      copyToCacheDirectory: true,
    });
    if (result.canceled || result.assets.length === 0) return;
    const asset = result.assets[0];
    onChange({ uri: asset.uri, name: asset.name, mimeType: asset.mimeType });
  }

  return (
    <View className="gap-xs">
      <View className="flex-row items-center gap-3">
        <Pressable
          onPress={handlePick}
          className="rounded-full border border-outline-variant bg-surface-container-low px-4 py-2 active:bg-surface-container-high">
          <Text className="font-label-md text-label-md text-on-surface">Choose File</Text>
        </Pressable>
        <Text className="flex-1 font-body-md text-body-md text-on-surface-variant" numberOfLines={1}>
          {value ? value.name : 'No file chosen'}
        </Text>
        {value && (
          <Pressable hitSlop={8} onPress={() => onChange(null)}>
            <MaterialIcons name="close" size={18} color={colors.outline} />
          </Pressable>
        )}
      </View>
      {helperText && <Text className="text-[12px] text-on-surface-variant">{helperText}</Text>}
    </View>
  );
}
