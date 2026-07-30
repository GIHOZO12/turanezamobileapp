import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { askHelpChat, type ChatTurn } from '@/api/support';
import { ApiError } from '@/api/client';
import colors from '@/constants/colors';

type Message = ChatTurn & { id: string };

export default function AiAssistantScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<ScrollView>(null);

  async function handleSend() {
    const text = draft.trim();
    if (!text) return;

    const userMessage: Message = { id: `${Date.now()}-user`, role: 'user', text };
    const history: ChatTurn[] = messages.map(({ role, text: t }) => ({ role, text: t }));

    setMessages((prev) => [...prev, userMessage]);
    setDraft('');
    setError(null);
    setIsSending(true);
    requestAnimationFrame(() => scrollRef.current?.scrollToEnd({ animated: true }));

    try {
      const { reply } = await askHelpChat({ message: text, history });
      setMessages((prev) => [...prev, { id: `${Date.now()}-model`, role: 'model', text: reply }]);
      requestAnimationFrame(() => scrollRef.current?.scrollToEnd({ animated: true }));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not reach the assistant. Check your connection.');
    } finally {
      setIsSending(false);
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <View className="flex-row items-center gap-3 border-b border-outline-variant/30 px-margin-mobile py-4">
        <View className="h-10 w-10 items-center justify-center rounded-full bg-primary">
          <MaterialIcons name="smart-toy" size={20} color={colors['on-primary']} />
        </View>
        <Text className="flex-1 font-headline-md text-headline-md text-primary">TURANEZA Assistant</Text>
        <Pressable
          hitSlop={8}
          onPress={() => router.back()}
          className="h-10 w-10 items-center justify-center rounded-full active:bg-surface-container-high">
          <MaterialIcons name="close" size={22} color={colors.primary} />
        </Pressable>
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
        <ScrollView
          ref={scrollRef}
          contentContainerClassName="gap-sm px-margin-mobile py-md"
          onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: false })}
          showsVerticalScrollIndicator={false}>
          {messages.length === 0 ? (
            <Text className="py-lg text-center font-body-md text-body-md text-on-surface-variant">
              Ask me anything about plots, groups, payments, or how TURANEZA works.
            </Text>
          ) : (
            messages.map((message) => (
              <View key={message.id} className={message.role === 'user' ? 'items-end' : 'items-start'}>
                <View
                  className={`max-w-[85%] rounded-lg px-md py-sm ${
                    message.role === 'user' ? 'bg-primary' : 'bg-surface-container-lowest shadow-investment'
                  }`}>
                  <Text
                    className={`font-body-md text-body-md ${
                      message.role === 'user' ? 'text-on-primary' : 'text-on-surface'
                    }`}>
                    {message.text}
                  </Text>
                </View>
              </View>
            ))
          )}
          {isSending && (
            <View className="items-start">
              <View className="rounded-lg bg-surface-container-lowest px-md py-sm shadow-investment">
                <ActivityIndicator size="small" color={colors.primary} />
              </View>
            </View>
          )}
        </ScrollView>

        {error && (
          <Text className="mx-margin-mobile mb-2 rounded-lg bg-error-container px-md py-sm text-center font-label-md text-label-md text-on-error-container">
            {error}
          </Text>
        )}

        <View
          className="flex-row items-center gap-3 border-t border-outline-variant/30 px-margin-mobile pt-3"
          style={{ paddingBottom: insets.bottom + 12 }}>
          <TextInput
            className="flex-1 rounded-lg border border-outline-variant bg-surface-container-low px-md py-3 font-body-md text-body-md text-on-surface"
            placeholder="Ask a question..."
            placeholderTextColor={`${colors.outline}99`}
            value={draft}
            onChangeText={setDraft}
            multiline
          />
          <Pressable
            onPress={handleSend}
            disabled={isSending || draft.trim().length === 0}
            className={`h-11 w-11 items-center justify-center rounded-full ${
              draft.trim().length === 0 ? 'bg-primary/40' : 'bg-primary active:opacity-80'
            }`}>
            <MaterialIcons name="send" size={20} color={colors['on-primary']} />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
