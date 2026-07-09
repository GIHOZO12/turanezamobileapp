import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { PickedFile } from '@/api/applications';
import { ApiError } from '@/api/client';
import { submitPlot } from '@/api/plots';
import { Button } from '@/components/ui/button';
import { FilePickerField } from '@/components/ui/file-picker-field';
import { TextField } from '@/components/ui/text-field';
import colors from '@/constants/colors';

const STEPS = [
  'Submit plot details and ownership documents.',
  'Legal and site verification by our regional experts.',
  'Plot listing goes live for community co-investment.',
];

export default function SubmitPlotScreen() {
  const router = useRouter();
  const [description, setDescription] = useState('');
  const [plotSize, setPlotSize] = useState('');
  const [landTitleNumber, setLandTitleNumber] = useState('');
  const [location, setLocation] = useState('');
  const [ownershipProof, setOwnershipProof] = useState<PickedFile | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const canSubmit =
    location.trim().length > 0 && plotSize.trim().length > 0 && landTitleNumber.trim().length > 0 && ownershipProof != null;

  async function handleSubmit() {
    if (!ownershipProof) return;
    setError(null);
    setIsSubmitting(true);
    try {
      await submitPlot(
        {
          description: description.trim() || undefined,
          plot_location: location.trim(),
          plot_size_sqm: Number(plotSize),
          land_title_number: landTitleNumber.trim(),
        },
        ownershipProof
      );
      setIsSubmitted(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not reach the server. Check your connection.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <View className="flex-row items-center gap-4 px-margin-mobile py-4">
        <Pressable
          hitSlop={8}
          onPress={() => router.back()}
          className="h-10 w-10 items-center justify-center rounded-full active:bg-surface-container-high">
          <MaterialIcons name="arrow-back" size={24} color={colors.primary} />
        </Pressable>
        <Text className="font-headline-md text-headline-md text-primary">Submit a Plot</Text>
      </View>

      {isSubmitted ? (
        <View className="flex-1 items-center justify-center gap-md px-margin-mobile">
          <View className="h-16 w-16 items-center justify-center rounded-full bg-secondary-container">
            <MaterialIcons name="check-circle" size={32} color={colors['on-secondary-container']} />
          </View>
          <Text className="text-center font-headline-md text-headline-md text-on-surface">
            Verification initiated
          </Text>
          <Text className="max-w-[320px] text-center font-body-md text-body-md text-on-surface-variant">
            Our team will verify the ownership and zoning status, typically within 48 hours. You&apos;ll be notified
            once your plot is live.
          </Text>
          <Button label="Back to Plots" onPress={() => router.back()} className="mt-base w-full" />
        </View>
      ) : (
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} className="flex-1">
          <ScrollView contentContainerClassName="gap-lg px-margin-mobile pb-lg" keyboardShouldPersistTaps="handled">
            <Text className="font-body-md text-body-md text-on-surface-variant">
              Provide the details below to list your land for institutional co-investment. Our team will verify the
              ownership and zoning status.
            </Text>

            <View className="gap-md rounded-lg bg-surface-container-lowest p-md shadow-investment">
              <View className="gap-xs">
                <Text className="font-label-md text-label-md text-on-surface-variant">Plot Description (optional)</Text>
                <TextField
                  icon="description"
                  multiline
                  numberOfLines={4}
                  placeholder="Describe the land features, topography, and surrounding neighborhood..."
                  value={description}
                  onChangeText={setDescription}
                />
              </View>

              <View className="gap-xs">
                <Text className="font-label-md text-label-md text-on-surface-variant">Size (sqm)</Text>
                <TextField
                  icon="straighten"
                  placeholder="e.g. 500"
                  keyboardType="decimal-pad"
                  value={plotSize}
                  onChangeText={(v) => setPlotSize(v.replace(/[^0-9.]/g, ''))}
                />
              </View>

              <View className="gap-xs">
                <Text className="font-label-md text-label-md text-on-surface-variant">UPI Number</Text>
                <TextField
                  icon="badge"
                  placeholder="1/01/01/01/1234"
                  value={landTitleNumber}
                  onChangeText={setLandTitleNumber}
                />
              </View>

              <View className="gap-xs">
                <Text className="font-label-md text-label-md text-on-surface-variant">Location</Text>
                <TextField
                  icon="location-on"
                  placeholder="District, Sector, Cell..."
                  value={location}
                  onChangeText={setLocation}
                />
              </View>
            </View>

            <View className="gap-md rounded-lg bg-surface-container-lowest p-md shadow-investment">
              <View className="gap-xs">
                <Text className="font-label-md text-label-md text-on-surface-variant">
                  Ownership Proof — Upload Land Title (UPI Certificate)
                </Text>
                <FilePickerField
                  value={ownershipProof}
                  onChange={setOwnershipProof}
                  helperText="PDF, JPG, or PNG (Max 10MB)."
                />
              </View>
            </View>

            {error && (
              <Text className="rounded-lg bg-error-container px-md py-sm font-label-md text-label-md text-on-error-container">
                {error}
              </Text>
            )}

            <View className="flex-row gap-md">
              {/* <Button label="Cancel" variant="secondary" onPress={() => router.back()} className="flex-1" /> */}
              <Button
                label="Submit plot to register"
                onPress={handleSubmit}
                loading={isSubmitting}
                disabled={!canSubmit}
                className="flex-1 mt-md"
              />
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      )}
    </SafeAreaView>
  );
}
