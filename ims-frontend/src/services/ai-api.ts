import apiClient from '@/lib/api-client';
import { ApiResponse } from '@/types/api';

export interface ChatMessage {
    role: 'user' | 'assistant';
    content: string;
    timestamp?: string;
}

export interface ChatRequest {
    message: string;
    threadId: string;
}

export interface ChatResponse {
    message: string;
    threadId: string;
}

export interface ThreadState {
    threadId: string;
    state: {
        values: any;
        next: any[];
        metadata: any;
        createdAt: string;
    };
}

export interface ThreadHistory {
    threadId: string;
    history: Array<{
        values: any;
        next: any[];
        metadata: any;
        createdAt: string;
        checkpointId: string;
    }>;
    count: number;
}

export interface AITool {
    name: string;
    description: string;
    parameters: Record<string, string>;
}

export interface ChatMessagesResponse {
    threadId: string;
    messages: ChatMessage[];
    count: number;
}

export const aiApi = {
    // Send a message to the AI agent
    chat: async (data: ChatRequest) => {
        const response = await apiClient.post<ApiResponse<ChatResponse>>(
            '/api/ai/chat',
            data
        );
        return response.data;
    },

    // Get current conversation state
    getState: async (threadId: string) => {
        const response = await apiClient.get<ApiResponse<ThreadState>>(
            `/api/ai/state/${threadId}`
        );
        return response.data;
    },

    // Get conversation history
    getHistory: async (threadId: string) => {
        const response = await apiClient.get<ApiResponse<ThreadHistory>>(
            `/api/ai/history/${threadId}`
        );
        return response.data;
    },

    // Get formatted chat messages
    getChatMessages: async (threadId: string) => {
        const response = await apiClient.get<ApiResponse<ChatMessagesResponse>>(
            `/api/ai/messages/${threadId}`
        );
        return response.data;
    },

    // Get available tools
    getTools: async () => {
        const response = await apiClient.get<ApiResponse<{ tools: AITool[] }>>(
            '/api/ai/tools'
        );
        return response.data;
    },
};
