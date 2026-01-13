import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { StateGraph, MessagesAnnotation } from '@langchain/langgraph';
import { ToolNode } from '@langchain/langgraph/prebuilt';
import { AIMessage, HumanMessage, SystemMessage } from '@langchain/core/messages';
import { PostgresSaver } from '@langchain/langgraph-checkpoint-postgres';
import { SqliteSaver } from '@langchain/langgraph-checkpoint-sqlite';
import { Pool } from 'pg';
import { tools } from './ai-tools';
import { config } from '../config/env';

// System prompt for the AI agent
const SYSTEM_PROMPT = `You are an AI assistant for an Inventory Management System. Your role is to help users manage and understand their inventory, sales, and product data.

**Available Tools:**
- Get information about products and their variants (sizes, colors, stock levels, prices)
- Search for products by name, code, category, or brand
- Check for low stock or out-of-stock items
- View recent sales transactions
- Analyze sales data by date range with grouping options
- Get top selling products by revenue
- Track customer purchase history
- Provide inventory summaries and statistics
- Generate sales analytics and trends

**Response Guidelines:**
- Be concise and professional in your responses
- Always use the available tools to provide accurate, data-driven answers
- When providing numbers or statistics, format them clearly (e.g., use thousand separators, currency symbols)
- If a user asks about specific products, use the search or product info tools
- For analytical questions, use the sales analytics or inventory summary tools
- If you don't have enough information, ask clarifying questions
- Suggest actionable insights when appropriate (e.g., "You have 5 products running low on stock")

**Tone:**
- Friendly yet professional
- Clear and direct - avoid unnecessary jargon
- Helpful and proactive - offer suggestions when relevant
- Empathetic to business needs and challenges

**Output Constraints:**
- Keep responses concise (2-4 paragraphs maximum for explanations)
- Use bullet points or numbered lists for multiple items
- Format numbers clearly: currency with symbols ($, Birr), quantities with units
- Always cite specific data when making recommendations
- If listing products, limit to top 5-10 unless specifically asked for more
- Use tables or structured format for comparative data

Remember: You are helping business owners make informed decisions about their inventory. Be their trusted advisor.`;

// Create LangGraph agent
export class AIAgent {
    private model: ChatGoogleGenerativeAI;
    private graph: any;
    private checkpointer: PostgresSaver | SqliteSaver;

    constructor(apiKey: string, checkpointer: PostgresSaver | SqliteSaver) {
        this.model = new ChatGoogleGenerativeAI({
            model: 'gemini-2.5-flash',
            apiKey,
            temperature: 0.7,
        });

        this.checkpointer = checkpointer;
        this.graph = this.createGraph();
    }

    private createGraph() {
        const toolNode = new ToolNode(tools);

        // Define the function that calls the model
        const callModel = async (state: typeof MessagesAnnotation.State) => {
            const boundModel = this.model.bindTools(tools);
            const response = await boundModel.invoke([
                new SystemMessage(SYSTEM_PROMPT),
                ...state.messages
            ]);
            return { messages: [response] };
        };

        // Define conditional edge logic
        const shouldContinue = (state: typeof MessagesAnnotation.State) => {
            const messages = state.messages;
            const lastMessage = messages[messages.length - 1] as AIMessage;

            if (lastMessage.tool_calls && lastMessage.tool_calls.length > 0) {
                return 'tools';
            }
            return '__end__';
        };

        // Build the graph with checkpointer
        const workflow = new StateGraph(MessagesAnnotation)
            .addNode('agent', callModel)
            .addNode('tools', toolNode)
            .addEdge('__start__', 'agent')
            .addConditionalEdges('agent', shouldContinue)
            .addEdge('tools', 'agent');

        return workflow.compile({ checkpointer: this.checkpointer });
    }

    async chat(message: string, threadId: string) {
        const config = {
            configurable: {
                thread_id: threadId
            }
        };

        const result = await this.graph.invoke(
            {
                messages: [new HumanMessage(message)]
            },
            config
        );

        return result.messages[result.messages.length - 1];
    }

    async getState(threadId: string) {
        const config = {
            configurable: {
                thread_id: threadId
            }
        };

        return await this.graph.getState(config);
    }

    async getHistory(threadId: string) {
        const config = {
            configurable: {
                thread_id: threadId
            }
        };

        const history = [];
        for await (const state of this.graph.getStateHistory(config)) {
            history.push(state);
        }

        return history;
    }

    async getChatMessages(threadId: string) {
        const config = {
            configurable: {
                thread_id: threadId
            }
        };

        const state = await this.graph.getState(config);

        if (!state.values || !state.values.messages) {
            return [];
        }

        // Filter out system messages and tool call messages, format the messages
        const messages = state.values.messages
            .filter((msg: any) => {
                const type = msg._getType();
                // Only include human and AI messages with actual text content
                if (type === 'system' || type === 'tool') return false;
                if (type === 'ai' && (!msg.content || msg.content === '')) return false;
                return true;
            })
            .map((msg: any) => {
                const type = msg._getType();
                let content = msg.content;

                // Handle content that might be an array
                if (Array.isArray(content)) {
                    content = content
                        .filter((c: any) => typeof c === 'string' || c.type === 'text')
                        .map((c: any) => (typeof c === 'string' ? c : c.text))
                        .join('');
                }

                return {
                    role: type === 'human' ? 'user' : 'assistant',
                    content: content || '',
                    timestamp: msg.additional_kwargs?.timestamp || new Date()
                };
            });

        return messages;
    }
}

// Singleton checkpointer instance
let checkpointerInstance: PostgresSaver | SqliteSaver | null = null;

// Initialize checkpointer based on DATABASE_TYPE environment variable
// - sqlite: Use SQLite (default, works for both development and production)
// - postgres: Use PostgreSQL (requires DATABASE_URL to be set)
export const initializeCheckpointer = async (connectionString?: string) => {
    if (!checkpointerInstance) {
        if (config.databaseType === 'postgres' && connectionString) {
            // Use PostgreSQL when DATABASE_TYPE is set to "postgres"
            const pool = new Pool({
                connectionString,
                ssl: {
                    rejectUnauthorized: false // Required for Render and most cloud PostgreSQL providers
                }
            });

            checkpointerInstance = new PostgresSaver(pool);
            await checkpointerInstance.setup();
        } else {
            // Use SQLite (creates data/checkpoints.db)
            // This works for both local development and production deployment
            checkpointerInstance = SqliteSaver.fromConnString('data/checkpoints.db');
        }
    }
    return checkpointerInstance;
};

// Export a function to create agent instance
export const createAIAgent = (apiKey: string, checkpointer: PostgresSaver | SqliteSaver) => {
    return new AIAgent(apiKey, checkpointer);
};
