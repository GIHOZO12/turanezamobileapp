import { MaterialIcons } from '@expo/vector-icons';
import { useState } from 'react';
import { Linking, Pressable, Text, View } from 'react-native';

import { apiFetch, ApiError } from '@/api/client';
import { Button } from '@/components/ui/button';
import { ChipSelect } from '@/components/ui/chip-select';
import { TextField } from '@/components/ui/text-field';
import { RESOURCE_CONTENT } from '@/content/resources';
import colors from '@/constants/colors';
import {
  Banner,
  ResourceCard,
  ResourceHero,
  ResourceLayout,
  SectionHeader,
  type IconName,
} from '@/screens/resources/resource-layout';

const { contact } = RESOURCE_CONTENT;

type Topic = (typeof contact.topics)[number]['value'];
type ContactFields = { name: string; email: string; topic: Topic; message: string };
const initialFields: ContactFields = { name: '', email: '', topic: contact.topics[0].value, message: '' };

const METHODS: Array<{ icon: IconName; label: string; value: string; url?: string }> = [
  { icon: 'call', label: 'Call us', value: contact.phone, url: `tel:${contact.phone.replace(/\s/g, '')}` },
  { icon: 'mail', label: 'Email', value: contact.email, url: `mailto:${contact.email}` },
  { icon: 'location-on', label: 'Office', value: contact.address, url: `https://maps.google.com/?q=${encodeURIComponent(contact.address)}` },
  { icon: 'schedule', label: 'Hours', value: contact.hours },
];

function MethodTile({ icon, label, value, url }: (typeof METHODS)[number]) {
  return (
    <Pressable
      disabled={!url}
      accessibilityRole={url ? 'link' : undefined}
      onPress={url ? () => Linking.openURL(url) : undefined}
      className="flex-1 gap-sm rounded bg-surface-container-lowest p-sm shadow-investment active:opacity-80">
      <View className="flex-row items-center justify-between">
        <View className="h-10 w-10 items-center justify-center rounded-full bg-primary-fixed">
          <MaterialIcons name={icon} size={20} color={colors['on-primary-fixed-variant']} />
        </View>
        {url ? <MaterialIcons name="north-east" size={16} color={colors.outline} /> : null}
      </View>
      <View className="gap-[2px]">
        <Text className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant">{label}</Text>
        <Text className="font-label-md text-label-md text-on-surface">{value}</Text>
      </View>
    </Pressable>
  );
}

function FieldLabel({ children }: { children: string }) {
  return <Text className="font-label-md text-label-md text-on-surface">{children}</Text>;
}

export default function ContactScreen() {
  const [fields, setFields] = useState(initialFields);
  const [isSending, setIsSending] = useState(false);
  const [feedback, setFeedback] = useState<{ kind: 'success' | 'error'; text: string } | null>(null);

  function updateField<K extends keyof ContactFields>(key: K, value: ContactFields[K]) {
    setFields((previous) => ({ ...previous, [key]: value }));
  }

  async function submit() {
    if (fields.name.trim().length < 2 || !fields.email.includes('@') || fields.message.trim().length < 10) {
      setFeedback({ kind: 'error', text: 'Enter your name, a valid email, and a message of at least 10 characters.' });
      return;
    }
    setIsSending(true);
    setFeedback(null);
    try {
      const response = await apiFetch<{ detail: string }>('/api/v1/super-admin/public/contact/', {
        method: 'POST',
        body: JSON.stringify({ ...fields, name: fields.name.trim(), email: fields.email.trim(), message: fields.message.trim() }),
      });
      setFields(initialFields);
      setFeedback({ kind: 'success', text: response.detail || 'Your message has been submitted successfully.' });
    } catch (error) {
      setFeedback({ kind: 'error', text: error instanceof ApiError ? error.message : 'Could not send your message. Check your connection and try again.' });
    } finally {
      setIsSending(false);
    }
  }

  return (
    <ResourceLayout title="Contact Us">
      <ResourceHero
        icon="support-agent"
        eyebrow="Contact"
        title="Talk to our team"
        body="Reach out to Urban Evolution Group about investing, residency, partnerships, or media.">
        <View className="flex-row items-center gap-xs pt-xs">
          <View className="h-2 w-2 rounded-full bg-secondary-fixed" />
          <Text className="font-label-md text-label-md text-on-primary">{contact.response}</Text>
        </View>
      </ResourceHero>

      <View className="gap-sm">
        <View className="flex-row gap-sm">
          <MethodTile {...METHODS[0]} />
          <MethodTile {...METHODS[1]} />
        </View>
        <View className="flex-row gap-sm">
          <MethodTile {...METHODS[2]} />
          <MethodTile {...METHODS[3]} />
        </View>
      </View>

      <SectionHeader title="Send a message" caption="Fill in the form and we will get back to you by email." />
      <ResourceCard className="gap-md">
        <View className="gap-base">
          <FieldLabel>Full name</FieldLabel>
          <TextField icon="person-outline" placeholder="Your name" value={fields.name} onChangeText={(value) => updateField('name', value)} autoCapitalize="words" accessibilityLabel="Name" />
        </View>
        <View className="gap-base">
          <FieldLabel>Email address</FieldLabel>
          <TextField icon="alternate-email" placeholder="you@example.com" value={fields.email} onChangeText={(value) => updateField('email', value)} keyboardType="email-address" autoCapitalize="none" accessibilityLabel="Email" />
        </View>
        <View className="gap-base">
          <FieldLabel>What is this about?</FieldLabel>
          <ChipSelect options={contact.topics} value={fields.topic} onChange={(value) => updateField('topic', value)} />
        </View>
        <View className="gap-base">
          <FieldLabel>Message</FieldLabel>
          <TextField
            icon="chat-bubble-outline"
            className="min-h-28"
            placeholder="How can we help?"
            value={fields.message}
            onChangeText={(value) => updateField('message', value)}
            multiline
            accessibilityLabel="Message"
          />
        </View>
        {feedback && <Banner kind={feedback.kind} text={feedback.text} />}
        <Button
          label="Send message"
          loading={isSending}
          onPress={submit}
          icon={<MaterialIcons name="send" size={18} color={colors['on-primary']} />}
        />
      </ResourceCard>
    </ResourceLayout>
  );
}
