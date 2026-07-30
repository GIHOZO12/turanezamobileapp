import { MaterialIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { ApiError } from '@/api/client';
import { fetchInvestGroup } from '@/api/groups';
import { fetchGroupMessages, sendGroupMessage, type GroupMessage } from '@/api/messages';
import colors from '@/constants/colors';
import { useAuth } from '@/contexts/auth-context';

const POLL_INTERVAL_MS = 4000;

export default function GroupChatScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id, name, recipient } = useLocalSearchParams<{ id: string; name?: string; recipient?: string }>();
  const isDirect = recipient != null;
  const { user } = useAuth();
  const [groupName, setGroupName] = useState(name ?? '');
  const [messages, setMessages] = useState<GroupMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [draft, setDraft] = useState('');
  const [isSending, setIsSending] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    if (!name && !isDirect) {
      fetchInvestGroup(id)
        .then((group) => setGroupName(group.name))
        .catch(() => {});
    }
  }, [id, name, isDirect]);

  useEffect(() => {
    let cancelled = false;

    function load(isFirst: boolean) {
      if (isFirst) setIsLoading(true);
      fetchGroupMessages(id, recipient)
        .then((data) => {
          if (cancelled) return;
          setMessages(data);
          setError(null);
        })
        .catch((err) => {
          if (cancelled || !isFirst) return;
          // Only surface load errors on the first fetch — a poll that fails silently keeps
          // showing whatever messages already loaded, rather than replacing the feed with an
          // error banner every few seconds.
          setError(err instanceof ApiError ? err.message : 'Could not reach the server. Check your connection.');
        })
        .finally(() => {
          if (isFirst && !cancelled) setIsLoading(false);
        });
    }

    load(true);
    // No confirmed working WebSocket auth for JWT clients on this backend (session-cookie-only
    // AuthMiddlewareStack) — polling is the reliable baseline while this screen is open.
    const interval = setInterval(() => load(false), POLL_INTERVAL_MS);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [id, recipient]);

  async function handleSend() {
    const body = draft.trim();
    if (!body) return;
    setIsSending(true);
    try {
      const sent = await sendGroupMessage(Number(id), body, recipient != null ? Number(recipient) : undefined);
      setMessages((prev) => [...prev, sent]);
      setDraft('');
      requestAnimationFrame(() => scrollRef.current?.scrollToEnd({ animated: true }));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not send your message.');
    } finally {
      setIsSending(false);
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
        <Text className="flex-1 font-headline-md text-headline-md text-primary" numberOfLines={1}>
          {groupName || 'Group Chat'}
        </Text>
        {!isDirect && (
          <Pressable
            hitSlop={8}
            onPress={() => router.push({ pathname: '/group/[id]/members', params: { id, name: groupName } })}
            className="h-10 w-10 items-center justify-center rounded-full active:bg-surface-container-high">
            <MaterialIcons name="people" size={22} color={colors.primary} />
          </Pressable>
        )}
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
        {isLoading ? (
          <ActivityIndicator className="py-lg" color={colors.primary} />
        ) : (
          <ScrollView
            ref={scrollRef}
            contentContainerClassName="gap-sm px-margin-mobile py-md"
            onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: false })}
            showsVerticalScrollIndicator={false}>
            {messages.length === 0 ? (
              <Text className="py-lg text-center font-body-md text-body-md text-on-surface-variant">
                {isDirect ? `No messages yet — say hello to ${groupName || 'them'}.` : 'No messages yet — say hello to the group.'}
              </Text>
            ) : (
              messages.map((message) => {
                const isMine = message.sender.id === user?.id;
                return (
                  <View key={message.id} className={isMine ? 'items-end' : 'items-start'}>
                    {!isMine && (
                      <Text className="px-1 font-label-sm text-label-sm text-on-surface-variant">
                        {message.sender.full_name}
                      </Text>
                    )}
                    <View
                      className={`max-w-[80%] rounded-lg px-md py-sm ${
                        isMine ? 'bg-primary' : 'bg-surface-container-lowest shadow-investment'
                      }`}>
                      <Text className={`font-body-md text-body-md ${isMine ? 'text-on-primary' : 'text-on-surface'}`}>
                        {message.body}
                      </Text>
                    </View>
                    <Text className="px-1 font-label-sm text-label-sm text-on-surface-variant">
                      {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                  </View>
                );
              })
            )}
          </ScrollView>
        )}

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
            placeholder="Type a message..."
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
