'use client';

import { useState, useEffect, useRef } from 'react';
import { useAIChat, useChatMessages } from '@/hooks/use-ai';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Send, Sparkles, Loader2, History, Plus, MessageSquare, Trash2 } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface Message {
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
}

interface SavedThread {
    id: string;
    title: string;
    lastMessage: string;
    timestamp: Date;
}

export default function AIAssistantPage() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [threadId, setThreadId] = useState<string>('');
    const [isLoadingHistory, setIsLoadingHistory] = useState(true);
    const [savedThreads, setSavedThreads] = useState<SavedThread[]>([]);
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);
    const [threadToDelete, setThreadToDelete] = useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const { mutate: sendMessage, isPending } = useAIChat();

    // Fetch chat history
    const { refetch } = useChatMessages(threadId, !!threadId);

    // Load saved threads from localStorage
    useEffect(() => {
        const loadSavedThreads = () => {
            const threadsData = localStorage.getItem('ai-threads');
            if (threadsData) {
                const threads = JSON.parse(threadsData);
                setSavedThreads(
                    threads.map((t: any) => ({
                        ...t,
                        timestamp: new Date(t.timestamp),
                    }))
                );
            }
        };
        loadSavedThreads();
    }, []);

    // Save thread to localStorage
    const saveThreadToHistory = (id: string, firstMessage: string) => {
        const threadsData = localStorage.getItem('ai-threads');
        const threads: SavedThread[] = threadsData ? JSON.parse(threadsData) : [];

        // Check if thread already exists
        const existingIndex = threads.findIndex((t) => t.id === id);

        const threadData: SavedThread = {
            id,
            title: firstMessage.substring(0, 50) + (firstMessage.length > 50 ? '...' : ''),
            lastMessage: firstMessage,
            timestamp: new Date(),
        };

        if (existingIndex >= 0) {
            threads[existingIndex] = threadData;
        } else {
            threads.unshift(threadData);
        }

        // Keep only last 20 threads
        const trimmedThreads = threads.slice(0, 20);
        localStorage.setItem('ai-threads', JSON.stringify(trimmedThreads));
        setSavedThreads(
            trimmedThreads.map((t) => ({
                ...t,
                timestamp: new Date(t.timestamp),
            }))
        );
    };

    // Delete thread from history
    const deleteThread = (id: string) => {
        const threadsData = localStorage.getItem('ai-threads');
        if (threadsData) {
            const threads = JSON.parse(threadsData);
            const filtered = threads.filter((t: SavedThread) => t.id !== id);
            localStorage.setItem('ai-threads', JSON.stringify(filtered));
            setSavedThreads(
                filtered.map((t: any) => ({
                    ...t,
                    timestamp: new Date(t.timestamp),
                }))
            );

            // If deleting current thread, create new one
            if (id === threadId) {
                handleNewConversation();
            }
        }
        setThreadToDelete(null);
    };

    // Initialize thread ID on mount
    useEffect(() => {
        // Try to get existing thread from localStorage
        const storedThreadId = localStorage.getItem('ai-thread-id');
        if (storedThreadId) {
            setThreadId(storedThreadId);
        } else {
            // Create new thread
            const newThreadId = `user-${uuidv4()}`;
            setThreadId(newThreadId);
            localStorage.setItem('ai-thread-id', newThreadId);
        }
    }, []);

    // Load previous messages when threadId changes
    useEffect(() => {
        if (!threadId) return;

        setIsLoadingHistory(true);
        refetch().then((result) => {
            if (result.data?.data?.messages) {
                const loadedMessages = result.data.data.messages.map((msg) => ({
                    role: msg.role,
                    content: msg.content,
                    timestamp: new Date(msg.timestamp || new Date()),
                }));
                setMessages(loadedMessages);
            }
            setIsLoadingHistory(false);
        });
    }, [threadId, refetch]);

    // Auto-scroll to bottom when messages change
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = () => {
        if (!input.trim() || !threadId || isPending) return;

        const userMessage: Message = {
            role: 'user',
            content: input.trim(),
            timestamp: new Date(),
        };

        // Save thread if it's the first message
        if (messages.length === 0) {
            saveThreadToHistory(threadId, input.trim());
        }

        setMessages((prev) => [...prev, userMessage]);
        setInput('');

        sendMessage(
            { message: input.trim(), threadId },
            {
                onSuccess: (response) => {
                    const assistantMessage: Message = {
                        role: 'assistant',
                        content: response?.data?.message || 'No response',
                        timestamp: new Date(),
                    };
                    setMessages((prev) => [...prev, assistantMessage]);
                },
                onError: () => {
                    // Remove the user message if request failed
                    setMessages((prev) => prev.slice(0, -1));
                },
            }
        );
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleNewConversation = () => {
        const newThreadId = `user-${uuidv4()}`;
        setThreadId(newThreadId);
        localStorage.setItem('ai-thread-id', newThreadId);
        setMessages([]);
        setIsHistoryOpen(false);
    };

    const handleSwitchThread = (id: string) => {
        setThreadId(id);
        localStorage.setItem('ai-thread-id', id);
        setIsHistoryOpen(false);
    };

    const suggestedQuestions = [
        'What products need restocking?',
        'Show me sales trends for this month',
        'Which are my top selling products?',
        'Give me an inventory overview',
    ];

    return (
        <div className="h-[calc(100vh-4rem)] flex flex-col p-8">
            {/* Header - Compact */}
            <div className="flex items-center gap-3 mb-4 flex-shrink-0">
                <div className="p-2 bg-primary/10 rounded-lg">
                    <Sparkles className="h-5 w-5 text-primary" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold">AI Assistant</h1>
                    <p className="text-sm text-muted-foreground">
                        Ask me anything about your inventory
                    </p>
                </div>
            </div>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={!!threadToDelete} onOpenChange={() => setThreadToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Conversation</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete this conversation? This action cannot be
                            undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => threadToDelete && deleteThread(threadToDelete)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Chat Container */}
            <Card className="flex-1 flex flex-col min-h-0">
                <CardHeader className="border-b flex-shrink-0">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">Chat</CardTitle>
                        <div className="flex gap-2">
                            <Sheet open={isHistoryOpen} onOpenChange={setIsHistoryOpen}>
                                <SheetTrigger asChild>
                                    <Button variant="outline" size="sm">
                                        <History className="h-4 w-4 mr-2" />
                                        History
                                    </Button>
                                </SheetTrigger>
                                <SheetContent>
                                    <SheetHeader>
                                        <SheetTitle>Conversation History</SheetTitle>
                                        <SheetDescription>
                                            Switch between your previous conversations
                                        </SheetDescription>
                                    </SheetHeader>
                                    <div className="mt-6">
                                        <Button
                                            onClick={handleNewConversation}
                                            className="w-full mb-4"
                                            variant="default"
                                        >
                                            <Plus className="h-4 w-4 mr-2" />
                                            New Conversation
                                        </Button>
                                        <ScrollArea className="h-[calc(100vh-200px)]">
                                            <div className="space-y-2">
                                                {savedThreads.length === 0 ? (
                                                    <p className="text-sm text-muted-foreground text-center py-8">
                                                        No conversation history yet
                                                    </p>
                                                ) : (
                                                    savedThreads.map((thread) => (
                                                        <div
                                                            key={thread.id}
                                                            className={`p-3 rounded-lg border cursor-pointer hover:bg-accent transition-colors ${
                                                                thread.id === threadId
                                                                    ? 'bg-accent border-primary'
                                                                    : ''
                                                            }`}
                                                        >
                                                            <div className="flex items-start justify-between gap-2">
                                                                <div
                                                                    className="flex-1 min-w-0"
                                                                    onClick={() => handleSwitchThread(thread.id)}
                                                                >
                                                                    <div className="flex items-start gap-2">
                                                                        <MessageSquare className="h-4 w-4 mt-0.5 flex-shrink-0" />
                                                                        <div className="flex-1 min-w-0">
                                                                            <p className="text-sm font-medium truncate">
                                                                                {thread.title}
                                                                            </p>
                                                                            <p className="text-xs text-muted-foreground">
                                                                                {thread.timestamp.toLocaleDateString()}{' '}
                                                                                {thread.timestamp.toLocaleTimeString([], {
                                                                                    hour: '2-digit',
                                                                                    minute: '2-digit',
                                                                                })}
                                                                            </p>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="h-6 w-6 flex-shrink-0"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        setThreadToDelete(thread.id);
                                                                    }}
                                                                >
                                                                    <Trash2 className="h-3 w-3" />
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    ))
                                                )}
                                            </div>
                                        </ScrollArea>
                                    </div>
                                </SheetContent>
                            </Sheet>
                            <Button variant="outline" size="sm" onClick={handleNewConversation}>
                                <Plus className="h-4 w-4 mr-2" />
                                New Chat
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col p-0 min-h-0">
                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-4 min-h-0">
                        {isLoadingHistory ? (
                            <div className="h-full flex items-center justify-center">
                                <div className="flex flex-col items-center gap-3">
                                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                    <p className="text-muted-foreground">Loading chat history...</p>
                                </div>
                            </div>
                        ) : messages.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-center space-y-6">
                                <div className="p-4 bg-primary/10 rounded-full">
                                    <Sparkles className="h-12 w-12 text-primary" />
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-xl font-semibold">
                                        Welcome to AI Assistant
                                    </h3>
                                    <p className="text-muted-foreground max-w-md">
                                        I can help you manage your inventory, analyze sales, and
                                        answer questions about your products.
                                    </p>
                                </div>

                                {/* Suggested Questions */}
                                <div className="space-y-3 w-full max-w-2xl">
                                    <p className="text-sm font-medium text-muted-foreground">
                                        Try asking:
                                    </p>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                        {suggestedQuestions.map((question, idx) => (
                                            <Button
                                                key={idx}
                                                variant="outline"
                                                className="justify-start text-left h-auto py-3"
                                                onClick={() => setInput(question)}
                                            >
                                                {question}
                                            </Button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <>
                                {messages.map((message, idx) => (
                                    <div
                                        key={idx}
                                        className={`flex ${
                                            message.role === 'user'
                                                ? 'justify-end'
                                                : 'justify-start'
                                        }`}
                                    >
                                        <div
                                            className={`max-w-[80%] rounded-lg px-4 py-3 ${
                                                message.role === 'user'
                                                    ? 'bg-primary text-primary-foreground'
                                                    : 'bg-muted text-foreground border border-border'
                                            }`}
                                        >
                                            {message.role === 'user' ? (
                                                <p className="whitespace-pre-wrap">
                                                    {message.content}
                                                </p>
                                            ) : (
                                                <div className="prose prose-sm dark:prose-invert max-w-none [&>*]:text-foreground">
                                                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                                        {message.content}
                                                    </ReactMarkdown>
                                                </div>
                                            )}
                                            <p
                                                className={`text-xs mt-1 ${
                                                    message.role === 'user'
                                                        ? 'text-primary-foreground/70'
                                                        : 'text-muted-foreground'
                                                }`}
                                            >
                                                {message.timestamp.toLocaleTimeString([], {
                                                    hour: '2-digit',
                                                    minute: '2-digit',
                                                })}
                                            </p>
                                        </div>
                                    </div>
                                ))}

                                {/* Loading indicator */}
                                {isPending && (
                                    <div className="flex justify-start">
                                        <div className="bg-muted rounded-lg px-4 py-3 flex items-center gap-2">
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            <p className="text-sm text-muted-foreground">
                                                AI is thinking...
                                            </p>
                                        </div>
                                    </div>
                                )}

                                <div ref={messagesEndRef} />
                            </>
                        )}
                    </div>

                    {/* Input */}
                    <div className="border-t p-4 flex-shrink-0">
                        <div className="flex gap-2 items-end">
                            <Textarea
                                placeholder="Ask me anything about your inventory..."
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                                disabled={isPending || !threadId}
                                className="flex-1 min-h-[44px] resize-none"
                                rows={1}
                            />
                            <Button
                                onClick={handleSend}
                                disabled={!input.trim() || isPending || !threadId}
                                size="icon"
                                className="h-11 w-11"
                            >
                                {isPending ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <Send className="h-4 w-4" />
                                )}
                            </Button>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                            Press Enter to send, Shift+Enter for new line
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
