import { MaterialIcons } from '@expo/vector-icons';
import { Image, Text, View } from 'react-native';

import { resolveMediaUrl } from '@/api/client';
import type { Project } from '@/api/projects';
import { Button } from '@/components/ui/button';
import colors from '@/constants/colors';
import { cleanText } from '@/lib/format';

export function ProjectCard({
  project,
  investorsCount,
  onViewDetails,
}: {
  project: Project;
  /** Co-investor count for the project's group — pass group.members_count from the caller. */
  investorsCount?: number;
  onViewDetails?: () => void;
}) {
  const imageUrl = resolveMediaUrl(project.featured_image);

  return (
    <View className="overflow-hidden rounded-lg bg-surface-container-lowest shadow-investment">
      {imageUrl ? (
        <Image source={{ uri: imageUrl }} className="h-40 w-full" resizeMode="cover" />
      ) : (
        <View className="h-40 w-full items-center justify-center bg-surface-container-high">
          <MaterialIcons name="apartment" size={32} color={colors.outline} />
        </View>
      )}

      <View className="gap-md p-5">
        <View className="self-start rounded-full bg-secondary-container px-3 py-1">
          <Text className="font-label-sm uppercase tracking-wider text-label-sm text-on-secondary-container">
            {project.group_name}
          </Text>
        </View>

        <Text className="font-headline-md text-headline-md text-on-surface">{project.name}</Text>
        {project.description ? (
          <Text className="font-body-md text-body-md text-on-surface-variant" numberOfLines={3}>
            {cleanText(project.description)}
          </Text>
        ) : null}

        <View className="gap-2">
          <View className="flex-row items-center justify-between">
            <Text className="font-label-md text-label-sm text-on-surface-variant">Investors</Text>
            <Text className="font-label-md text-label-md text-on-surface">
              {investorsCount != null ? `${investorsCount} co-investor${investorsCount === 1 ? '' : 's'}` : 'Undisclosed'}
            </Text>
          </View>
          <View className="h-[1px] bg-outline-variant/30" />
          <View className="flex-row items-center justify-between">
            <Text className="font-label-md text-label-sm text-on-surface-variant">Investment</Text>
            <Text className="font-label-md text-label-md text-primary">Undisclosed</Text>
          </View>
        </View>

        <Button label="View Details" onPress={onViewDetails} className="w-full" />
      </View>
    </View>
  );
}
