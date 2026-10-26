import { MaterialIcons } from '@expo/vector-icons';
import { Text, View } from 'react-native';
import { WebView } from 'react-native-webview';

import type { RESOURCE_CONTENT } from '@/content/resources';
import colors from '@/constants/colors';
import { Pill } from '@/screens/resources/resource-layout';

type Video = (typeof RESOURCE_CONTENT.videos)[number];

export function VideoCard({ video, badge }: { video: Video; badge?: string }) {
  return (
    <View className="overflow-hidden rounded bg-surface-container-lowest shadow-investment">
      <View style={{ aspectRatio: 16 / 9, backgroundColor: '#101820' }}>
        <WebView
          source={{ uri: `https://www.youtube.com/embed/${video.id}?playsinline=1&rel=0` }}
          style={{ flex: 1, backgroundColor: '#101820' }}
          allowsFullscreenVideo
          mediaPlaybackRequiresUserAction
          javaScriptEnabled
          domStorageEnabled
        />
      </View>
      <View className="gap-sm p-md">
        {badge ? <Pill label={badge} icon="play-circle-outline" /> : null}
        <Text className="font-label-md text-[16px] leading-6 text-on-surface">{video.title}</Text>
        <View className="flex-row items-start gap-xs">
          <MaterialIcons name="info-outline" size={16} color={colors.outline} style={{ marginTop: 3 }} />
          <Text className="flex-1 font-body-md text-label-md text-on-surface-variant">{video.caption}</Text>
        </View>
      </View>
    </View>
  );
}
