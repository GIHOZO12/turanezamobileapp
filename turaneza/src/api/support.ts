import { apiFetch } from '@/api/client';

export type ChatTurn = { role: 'user' | 'model'; text: string };

export function askHelpChat(input: { message: string; history: ChatTurn[] }) {
  return apiFetch<{ reply: string }>('/api/v1/support/chat/', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}
