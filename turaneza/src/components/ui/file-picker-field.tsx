import { MaterialIcons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import { Pressable, Text, View } from 'react-native';

import type { PickedFile } from '@/api/applications';
import colors from '@/constants/colors';

/**
 * A big dashed-border tap zone with a centered upload icon, matching the reference product's
 * upload UI — replaces the earlier small "Choose File" pill + inline filename layout.
 */
export function FilePickerField({
  value,
  onChange,
  helperText,
  accept = ['application/pdf', 'image/*'],
  uploadLabel = 'Upload File',
}: {
  value: PickedFile | null;
  onChange: (file: PickedFile | null) => void;
  helperText?: string;
  /** Mime types passed to the document picker. Defaults to PDF + images. */
  accept?: string[];
  /** Call-to-action text shown inside the drop zone before a file is picked. */
  uploadLabel?: string;
}) {
  async function handlePick() {
    const result = await DocumentPicker.getDocumentAsync({
      type: accept,
      copyToCacheDirectory: true,
    });
    if (result.canceled || result.assets.length === 0) return;
    const asset = result.assets[0];
    onChange({ uri: asset.uri, name: asset.name, mimeType: asset.mimeType });
  }

  return (
    <Pressable
      onPress={handlePick}
      className="items-center gap-2 rounded-lg border-2 border-dashed border-primary/30 bg-primary/5 px-md py-lg active:border-primary">
      <View className="h-12 w-12 items-center justify-center rounded-full bg-primary/10">
        <MaterialIcons name={value ? 'check-circle' : 'cloud-upload'} size={24} color={colors.primary} />
      </View>
      <Text className="max-w-[280px] text-center font-label-md text-label-md text-primary" numberOfLines={2}>
        {value ? value.name : uploadLabel}
      </Text>
      {helperText && (
        <Text className="text-center font-label-sm text-label-sm text-on-surface-variant">{helperText}</Text>
      )}
      {value && (
        <Pressable
          hitSlop={8}
          onPress={(e) => {
            e.stopPropagation();
            onChange(null);
          }}>
          <Text className="font-label-sm text-label-sm text-error">Remove file</Text>
        </Pressable>
      )}
    </Pressable>
  );
}
