import { MaterialIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  Pressable,
  ScrollView,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ApiError, resolveMediaUrl } from '@/api/client';
import { fetchProject, fetchProjectDesigns, type Project } from '@/api/projects';
import colors from '@/constants/colors';
import { cleanText } from '@/lib/format';

export default function ProjectDetailScreen() {
  const router = useRouter();
  const { width: screenWidth } = useWindowDimensions();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [images, setImages] = useState<string[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const heroScrollRef = useRef<ScrollView>(null);

  function goToImage(index: number) {
    setSelectedIndex(index);
    heroScrollRef.current?.scrollTo({ x: index * screenWidth, animated: true });
  }

  function handleHeroScrollEnd(event: NativeSyntheticEvent<NativeScrollEvent>) {
    setSelectedIndex(Math.round(event.nativeEvent.contentOffset.x / screenWidth));
  }

  useEffect(() => {
    setIsLoading(true);
    setError(null);
    setSelectedIndex(0);

    fetchProject(id)
      .then((data) => {
        setProject(data);
        const featured = resolveMediaUrl(data.featured_image);
        setImages(featured ? [featured] : []);
      })
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Could not reach the server. Check your connection.'))
      .finally(() => setIsLoading(false));

    fetchProjectDesigns(id)
      .then((data) => {
        const galleryUrls = data
          .filter((asset) => asset.media_type === 'image')
          .map((asset) => resolveMediaUrl(asset.image))
          .filter((url): url is string => url != null);
        if (galleryUrls.length > 0) {
          setImages((prev) => [...new Set([...prev, ...galleryUrls])]);
        }
      })
      .catch(() => {});
  }, [id]);

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <View className="flex-row items-center gap-4 px-margin-mobile py-4">
        <Pressable
          hitSlop={8}
          onPress={() => router.back()}
          className="h-10 w-10 items-center justify-center rounded-full active:bg-surface-container-high">
          <MaterialIcons name="arrow-back" size={24} color={colors.primary} />
        </Pressable>
        <Text className="font-headline-md text-headline-md text-primary" numberOfLines={1}>
          Project Details
        </Text>
      </View>

      {isLoading ? (
        <ActivityIndicator className="py-lg" color={colors.primary} />
      ) : error || !project ? (
        <Text className="mx-margin-mobile rounded-lg bg-error-container px-md py-sm text-center font-label-md text-label-md text-on-error-container">
          {error ?? 'Project not found.'}
        </Text>
      ) : (
        <ScrollView className="flex-1" contentContainerClassName="gap-xl pb-lg" showsVerticalScrollIndicator={false}>

          {images.length > 0 ? (
            <View className="gap-sm">
              <ScrollView
                ref={heroScrollRef}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onMomentumScrollEnd={handleHeroScrollEnd}>
                {images.map((url) => (
                  <Image key={url} source={{ uri: url }} style={{ width: screenWidth, height: 256 }} resizeMode="cover" />
                ))}
              </ScrollView>
              {images.length > 1 ? (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerClassName="gap-sm px-margin-mobile">
                  {images.map((url, index) => (
                    <Pressable key={url} onPress={() => goToImage(index)}>
                      <Image
                        source={{ uri: url }}
                        className="h-16 w-16 rounded-lg"
                        style={{
                          borderWidth: index === selectedIndex ? 2 : 0,
                          borderColor: colors.primary,
                        }}
                        resizeMode="cover"
                      />
                    </Pressable>
                  ))}
                </ScrollView>
              ) : null}
            </View>
          ) : (
            <View className="h-64 w-full items-center justify-center bg-surface-container-high">
              <MaterialIcons name="apartment" size={40} color={colors.outline} />
            </View>
          )}

          <View className="gap-xl px-margin-mobile">
            <View className="gap-1">
              <Text className="font-label-sm uppercase tracking-wider text-label-sm text-primary">
                {project.group_name}
              </Text>
              <Text className="font-headline-lg text-headline-lg text-on-background">{project.name}</Text>
              {project.location ? (
                <View className="flex-row items-center gap-1">
                  <MaterialIcons name="location-on" size={16} color={colors['on-surface-variant']} />
                  <Text className="font-label-sm text-label-sm text-on-surface-variant">{project.location}</Text>
                </View>
              ) : null}
            </View>

            <View className="gap-md rounded-lg bg-surface-container-lowest p-md shadow-investment">
              <Text className="font-headline-md text-headline-md text-on-surface">Project Details</Text>
              <Text className="font-body-md text-body-md text-on-surface-variant">
                {cleanText(project.description || project.summary || 'No description provided yet.')}
              </Text>
            </View>

            {project.amenities.length > 0 ? (
              <View className="gap-md rounded-lg bg-surface-container-lowest p-md shadow-investment">
                <Text className="font-headline-md text-headline-md text-on-surface">Highlights</Text>
                <View className="gap-sm">
                  {project.amenities.map((amenity) => (
                    <View key={amenity} className="flex-row items-start gap-2">
                      <MaterialIcons name="check-circle" size={16} color={colors.secondary} style={{ marginTop: 2 }} />
                      <Text className="flex-1 font-body-md text-body-md text-on-surface-variant">
                        {cleanText(amenity)}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            ) : null}
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
