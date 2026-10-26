import { MaterialIcons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { RESOURCE_CONTENT } from '@/content/resources';
import colors from '@/constants/colors';
import { cn } from '@/lib/cn';
import { Pill, ResourceCard, ResourceHero, ResourceLayout } from '@/screens/resources/resource-layout';

const WORDS_PER_MINUTE = 200;

function readingMinutes(paragraphs: readonly string[]) {
  const words = paragraphs.join(' ').split(/\s+/).length;
  return Math.max(1, Math.round(words / WORDS_PER_MINUTE));
}

export default function ArticlesScreen() {
  const [openArticle, setOpenArticle] = useState<string | null>(null);

  return (
    <ResourceLayout title="Articles">
      <ResourceHero
        icon="auto-stories"
        eyebrow="Insights"
        title="Ideas for stronger communities"
        body="Perspectives on vertical housing, affordability, and building ownership together."
      />

      {RESOURCE_CONTENT.articles.map((article, index) => {
        const isOpen = openArticle === article.slug;
        const toggle = () => setOpenArticle(isOpen ? null : article.slug);
        return (
          <ResourceCard key={article.slug} className="gap-0 overflow-hidden p-0">
            <View className={cn('h-1', index % 2 === 0 ? 'bg-primary' : 'bg-secondary')} />
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ expanded: isOpen }}
              onPress={toggle}
              className="gap-sm p-md active:opacity-80">
              <View className="flex-row items-center justify-between">
                <Text className="font-headline-editorial text-[28px] leading-8 text-primary/25">
                  {String(index + 1).padStart(2, '0')}
                </Text>
                <Pill label={`${readingMinutes(article.body)} min read`} icon="schedule" tone="neutral" />
              </View>
              <Text className="font-headline-editorial text-[19px] leading-7 text-on-surface">{article.title}</Text>
              <Text className="font-body-md text-body-md text-on-surface-variant">{article.summary}</Text>
              {!isOpen && (
                <View className="flex-row items-center gap-xs pt-xs">
                  <Text className="font-label-md text-label-md text-primary">Read article</Text>
                  <MaterialIcons name="arrow-forward" size={18} color={colors.primary} />
                </View>
              )}
            </Pressable>

            {isOpen && (
              <Animated.View entering={FadeIn.duration(200)} className="gap-md px-md pb-md">
                <View className="h-[1px] bg-outline-variant/40" />
                {article.body.map((paragraph, paragraphIndex) => (
                  <Text key={`${article.slug}-${paragraphIndex}`} className="font-body-editorial text-body-editorial text-on-surface">
                    {paragraph}
                  </Text>
                ))}
                <Pressable
                  accessibilityRole="button"
                  onPress={toggle}
                  className="flex-row items-center justify-center gap-xs self-start rounded-full border border-outline-variant px-md py-[10px] active:bg-surface-container-high">
                  <MaterialIcons name="expand-less" size={18} color={colors.primary} />
                  <Text className="font-label-md text-label-md text-primary">Close article</Text>
                </Pressable>
              </Animated.View>
            )}
          </ResourceCard>
        );
      })}
    </ResourceLayout>
  );
}
