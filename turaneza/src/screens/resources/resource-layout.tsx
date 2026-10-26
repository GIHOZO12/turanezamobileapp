import { MaterialIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import type { PropsWithChildren, ReactNode, Ref } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import colors from '@/constants/colors';
import { cn } from '@/lib/cn';

export type IconName = keyof typeof MaterialIcons.glyphMap;

export function ResourceLayout({
  title,
  children,
  scrollRef,
}: PropsWithChildren<{ title: string; scrollRef?: Ref<ScrollView> }>) {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <View className="flex-row items-center gap-sm px-margin-mobile py-3">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Go back"
          hitSlop={8}
          onPress={() => router.back()}
          className="h-10 w-10 items-center justify-center rounded-full bg-surface-container-low active:bg-surface-container-high">
          <MaterialIcons name="arrow-back" size={22} color={colors.primary} />
        </Pressable>
        <Text className="flex-1 font-label-md text-[18px] leading-6 text-on-surface" numberOfLines={1}>
          {title}
        </Text>
      </View>
      <ScrollView
        ref={scrollRef}
        contentContainerClassName="gap-md px-margin-mobile pt-sm"
        contentContainerStyle={{ paddingBottom: insets.bottom + 96 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        {children}
        <ResourceFooter />
      </ScrollView>
    </SafeAreaView>
  );
}

const RESOURCE_LINKS = [
  { slug: 'help-center', label: 'Help Center', icon: 'help' },
  { slug: 'quiz', label: 'Quiz', icon: 'quiz' },
  { slug: 'legal', label: 'Legal', icon: 'gavel' },
  { slug: 'special-videos', label: 'Videos', icon: 'play-circle-outline' },
  { slug: 'articles', label: 'Articles', icon: 'article' },
  { slug: 'contact', label: 'Contact', icon: 'support-agent' },
] as const satisfies ReadonlyArray<{ slug: string; label: string; icon: IconName }>;

/**
 * Shared closing block for every resource page: a support prompt, links to the other resource
 * pages, and the brand line. The current page is read from the route so screens don't pass it.
 */
function ResourceFooter() {
  const router = useRouter();
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const otherLinks = RESOURCE_LINKS.filter((link) => link.slug !== slug);

  function open(target: (typeof RESOURCE_LINKS)[number]['slug']) {
    router.replace({ pathname: '/resources/[slug]', params: { slug: target } });
  }

  return (
    <View className="gap-md pt-md">
      {slug !== 'contact' && (
        <View className="flex-row items-center gap-sm rounded bg-surface-container-low p-md">
          <View className="h-11 w-11 items-center justify-center rounded-full bg-primary">
            <MaterialIcons name="support-agent" size={22} color={colors['on-primary']} />
          </View>
          <View className="flex-1 gap-[2px]">
            <Text className="font-label-md text-[16px] leading-6 text-on-surface">Still have questions?</Text>
            <Text className="font-body-md text-label-md text-on-surface-variant">Our team replies within one business day.</Text>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Contact us"
            onPress={() => open('contact')}
            className="h-10 w-10 items-center justify-center rounded-full bg-primary-fixed active:opacity-70">
            <MaterialIcons name="arrow-forward" size={20} color={colors['on-primary-fixed-variant']} />
          </Pressable>
        </View>
      )}

      <View className="gap-sm">
        <Text className="font-label-sm text-label-sm uppercase tracking-widest text-on-surface-variant">More resources</Text>
        <View className="flex-row flex-wrap gap-base">
          {otherLinks.map((link) => (
            <Pressable
              key={link.slug}
              accessibilityRole="link"
              onPress={() => open(link.slug)}
              className="flex-row items-center gap-xs rounded-full border border-outline-variant/60 bg-surface-container-lowest px-sm py-[8px] active:bg-surface-container-high">
              <MaterialIcons name={link.icon} size={16} color={colors.primary} />
              <Text className="font-label-md text-label-md text-on-surface">{link.label}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View className="items-center gap-xs border-t border-outline-variant/30 pt-md">
        <Text className="font-brand text-[16px] tracking-widest text-primary">TURANEZA</Text>
        <Text className="text-center font-body-md text-label-sm text-on-surface-variant">
          © {new Date().getFullYear()} Urban Evolution Group · Kigali, Rwanda
        </Text>
      </View>
    </View>
  );
}

/**
 * The blue banner that opens every resource page. The two translucent circles are purely
 * decorative — RN has no CSS gradients without an extra native module, so layered shapes give
 * the banner depth instead.
 */
export function ResourceHero({
  icon,
  eyebrow,
  title,
  body,
  children,
}: PropsWithChildren<{ icon: IconName; eyebrow: string; title: string; body?: string }>) {
  return (
    <View className="overflow-hidden rounded bg-primary p-md shadow-investment">
      <View className="absolute -right-10 -top-12 h-40 w-40 rounded-full bg-on-primary/10" />
      <View className="absolute -bottom-16 right-10 h-32 w-32 rounded-full bg-primary-container/60" />
      <View className="gap-sm">
        <View className="flex-row items-center gap-sm">
          <View className="h-10 w-10 items-center justify-center rounded-sm bg-on-primary/15">
            <MaterialIcons name={icon} size={22} color={colors['on-primary']} />
          </View>
          <Text className="font-label-sm text-label-sm uppercase tracking-widest text-primary-fixed">{eyebrow}</Text>
        </View>
        <Text className="font-headline-md text-headline-md text-on-primary">{title}</Text>
        {body ? <Text className="font-body-md text-body-md text-primary-fixed">{body}</Text> : null}
        {children}
      </View>
    </View>
  );
}

export function ResourceCard({ children, className }: PropsWithChildren<{ className?: string }>) {
  return <View className={cn('gap-sm rounded bg-surface-container-lowest p-md shadow-investment', className)}>{children}</View>;
}

export function ResourceHeading({ children }: PropsWithChildren) {
  return <Text className="font-headline-md text-[20px] leading-7 text-on-surface">{children}</Text>;
}

export function ResourceBody({ children }: PropsWithChildren) {
  return <Text className="font-body-md text-body-md leading-6 text-on-surface-variant">{children}</Text>;
}

export function SectionHeader({ title, caption, trailing }: { title: string; caption?: string; trailing?: ReactNode }) {
  return (
    <View className="flex-row items-end justify-between gap-sm pt-xs">
      <View className="flex-1 gap-xs">
        <ResourceHeading>{title}</ResourceHeading>
        {caption ? <Text className="font-body-md text-label-md text-on-surface-variant">{caption}</Text> : null}
      </View>
      {trailing}
    </View>
  );
}

export function Pill({ label, icon, tone = 'primary' }: { label: string; icon?: IconName; tone?: 'primary' | 'secondary' | 'error' | 'neutral' }) {
  const tones = {
    primary: { box: 'bg-primary-fixed', text: 'text-on-primary-fixed-variant', icon: colors['on-primary-fixed-variant'] },
    secondary: { box: 'bg-secondary-container/60', text: 'text-on-secondary-fixed-variant', icon: colors['on-secondary-fixed-variant'] },
    error: { box: 'bg-error-container', text: 'text-on-error-container', icon: colors['on-error-container'] },
    neutral: { box: 'bg-surface-container-high', text: 'text-on-surface-variant', icon: colors['on-surface-variant'] },
  }[tone];

  return (
    <View className={cn('flex-row items-center gap-xs self-start rounded-full px-sm py-[6px]', tones.box)}>
      {icon ? <MaterialIcons name={icon} size={14} color={tones.icon} /> : null}
      <Text className={cn('font-label-sm text-label-sm', tones.text)}>{label}</Text>
    </View>
  );
}

/** One expandable row. Rows are meant to be stacked inside a single ResourceCard, divided by hairlines. */
export function AccordionItem({
  title,
  body,
  icon,
  isOpen,
  onToggle,
  isFirst,
}: {
  title: string;
  body: string;
  icon?: IconName;
  isOpen: boolean;
  onToggle: () => void;
  isFirst?: boolean;
}) {
  return (
    <View className={cn(!isFirst && 'border-t border-outline-variant/30')}>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ expanded: isOpen }}
        onPress={onToggle}
        className="flex-row items-center gap-sm py-sm active:opacity-70">
        {icon ? (
          <View className={cn('h-9 w-9 items-center justify-center rounded-sm', isOpen ? 'bg-primary' : 'bg-surface-container-low')}>
            <MaterialIcons name={icon} size={20} color={isOpen ? colors['on-primary'] : colors.primary} />
          </View>
        ) : null}
        <Text className={cn('flex-1 font-label-md text-label-md', isOpen ? 'text-primary' : 'text-on-surface')}>{title}</Text>
        <MaterialIcons
          name="expand-more"
          size={22}
          color={isOpen ? colors.primary : colors.outline}
          style={{ transform: [{ rotate: isOpen ? '180deg' : '0deg' }] }}
        />
      </Pressable>
      {isOpen && (
        <Animated.View entering={FadeIn.duration(180)} className={cn('pb-sm', icon && 'pl-[48px]')}>
          <ResourceBody>{body}</ResourceBody>
        </Animated.View>
      )}
    </View>
  );
}

export function Banner({ kind, text }: { kind: 'success' | 'error'; text: string }) {
  const isSuccess = kind === 'success';
  return (
    <View className={cn('flex-row items-start gap-sm rounded-sm px-sm py-sm', isSuccess ? 'bg-secondary-container/40' : 'bg-error-container')}>
      <MaterialIcons
        name={isSuccess ? 'check-circle' : 'error-outline'}
        size={20}
        color={isSuccess ? colors['on-secondary-fixed-variant'] : colors['on-error-container']}
      />
      <Text className={cn('flex-1 font-label-md text-label-md', isSuccess ? 'text-on-secondary-fixed-variant' : 'text-on-error-container')}>{text}</Text>
    </View>
  );
}
