import { useMutation, useQuery } from '@tanstack/react-query';
import { aiApi } from '@/services/ai-api';
import { toast } from 'sonner';

export function useAIChat() {
    return useMutation({
        mutationFn: aiApi.chat,
        onError: (error: any) => {
            const errorMessage = error.response?.data?.message || 'Failed to send message';
            toast.error(errorMessage);
        },
    });
}

export function useThreadState(threadId: string, enabled = false) {
    return useQuery({
        queryKey: ['ai-thread-state', threadId],
        queryFn: () => aiApi.getState(threadId),
        enabled: enabled && !!threadId,
    });
}

export function useThreadHistory(threadId: string, enabled = false) {
    return useQuery({
        queryKey: ['ai-thread-history', threadId],
        queryFn: () => aiApi.getHistory(threadId),
        enabled: enabled && !!threadId,
    });
}

export function useChatMessages(threadId: string, enabled = true) {
    return useQuery({
        queryKey: ['ai-chat-messages', threadId],
        queryFn: () => aiApi.getChatMessages(threadId),
        enabled: enabled && !!threadId,
        staleTime: 0, // Always fetch fresh data
    });
}

export function useAITools() {
    return useQuery({
        queryKey: ['ai-tools'],
        queryFn: () => aiApi.getTools(),
    });
}
