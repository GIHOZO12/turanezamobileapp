import { MaterialIcons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';

import { RESOURCE_CONTENT } from '@/content/resources';
import colors from '@/constants/colors';
import {
  AccordionItem,
  Pill,
  ResourceCard,
  ResourceHeading,
  ResourceHero,
  ResourceLayout,
  SectionHeader,
  type IconName,
} from '@/screens/resources/resource-layout';
import { VideoCard } from '@/screens/resources/video-card';

const SECTION_ICONS: IconName[] = ['rocket-launch', 'route', 'groups', 'trending-up', 'verified-user'];

function matches(query: string, ...fields: string[]) {
  return fields.some((field) => field.toLowerCase().includes(query));
}

export default function HelpCenterScreen() {
  const [query, setQuery] = useState('');
  const [openHelp, setOpenHelp] = useState<string | null>(RESOURCE_CONTENT.helpSections[0].title);
  const [openFaq, setOpenFaq] = useState<string | null>(null);
  const walkthrough = RESOURCE_CONTENT.videos[2];

  const normalized = query.trim().toLowerCase();
  const helpSections = useMemo(
    () =>
      RESOURCE_CONTENT.helpSections
        .map((section, index) => ({ ...section, icon: SECTION_ICONS[index % SECTION_ICONS.length] }))
        .filter((section) => !normalized || matches(normalized, section.title, section.body)),
    [normalized],
  );
  const faqs = useMemo(
    () => RESOURCE_CONTENT.faqs.filter((faq) => !normalized || matches(normalized, faq.question, faq.answer)),
    [normalized],
  );
  const hasResults = helpSections.length > 0 || faqs.length > 0;

  return (
    <ResourceLayout title="Help Center">
      <ResourceHero
        icon="support"
        eyebrow="Help Center"
        title="How can we help?"
        body="Learn how to use TURANEZA, follow your investment journey, and work with your group.">
        <View className="mt-xs flex-row items-center gap-base rounded-full bg-surface-container-lowest px-md py-[10px]">
          <MaterialIcons name="search" size={20} color={colors.outline} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search guides and questions"
            placeholderTextColor={`${colors.outline}99`}
            returnKeyType="search"
            accessibilityLabel="Search help"
            className="flex-1 font-body-md text-body-md text-on-surface"
          />
          {query ? (
            <Pressable hitSlop={8} accessibilityLabel="Clear search" onPress={() => setQuery('')}>
              <MaterialIcons name="close" size={18} color={colors.outline} />
            </Pressable>
          ) : null}
        </View>
      </ResourceHero>

      {!hasResults && (
        <ResourceCard className="items-center py-lg">
          <View className="h-14 w-14 items-center justify-center rounded-full bg-surface-container-low">
            <MaterialIcons name="search-off" size={28} color={colors.primary} />
          </View>
          <ResourceHeading>No matches found</ResourceHeading>
          <Text className="text-center font-body-md text-body-md text-on-surface-variant">
            Try a different word, or send us your question directly.
          </Text>
        </ResourceCard>
      )}

      {helpSections.length > 0 && (
        <>
          <SectionHeader title="Guides" caption="Step-by-step explanations of how the platform works." />
          <ResourceCard className="gap-0 py-xs">
            {helpSections.map((section, index) => (
              <AccordionItem
                key={section.title}
                isFirst={index === 0}
                icon={section.icon}
                title={section.title}
                body={section.body}
                isOpen={openHelp === section.title}
                onToggle={() => setOpenHelp(openHelp === section.title ? null : section.title)}
              />
            ))}
          </ResourceCard>
        </>
      )}

      {faqs.length > 0 && (
        <>
          <SectionHeader title="Frequently asked questions" trailing={<Pill label={`${faqs.length}`} tone="neutral" />} />
          <ResourceCard className="gap-0 py-xs">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={faq.question}
                isFirst={index === 0}
                title={faq.question}
                body={faq.answer}
                isOpen={openFaq === faq.question}
                onToggle={() => setOpenFaq(openFaq === faq.question ? null : faq.question)}
              />
            ))}
          </ResourceCard>
        </>
      )}

      {!normalized && (
        <>
          <SectionHeader title="Watch the walkthrough" caption="See how to navigate the app and use its main features." />
          <VideoCard video={walkthrough} badge="App walkthrough" />
        </>
      )}
    </ResourceLayout>
  );
}
