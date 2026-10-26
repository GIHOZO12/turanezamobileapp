import { MaterialIcons } from '@expo/vector-icons';
import { Text, View } from 'react-native';

import colors from '@/constants/colors';
import { ResourceCard, ResourceHeading, ResourceHero, ResourceLayout } from '@/screens/resources/resource-layout';

export default function LegalScreen() {
  return (
    <ResourceLayout title="Legal">
      <ResourceHero
        icon="gavel"
        eyebrow="Legal"
        title="Legal information"
        body="The terms, policies, and agreements that govern participation on TURANEZA."
      />

      <ResourceCard className="items-center py-lg">
        <View className="h-16 w-16 items-center justify-center rounded-full bg-tertiary-fixed">
          <MaterialIcons name="description" size={30} color={colors['on-tertiary-fixed-variant']} />
        </View>
        <ResourceHeading>Coming soon</ResourceHeading>
        <Text className="text-center font-body-md text-body-md leading-6 text-on-surface-variant">
          Legal content will be added soon. Until then, our team is happy to answer any question about the platform rules.
        </Text>
      </ResourceCard>
    </ResourceLayout>
  );
}
