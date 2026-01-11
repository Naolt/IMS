import { Request, Response } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import { sendSuccess } from '../utils/response';
import { ValidationError } from '../utils/errors';
import { createAIAgent, initializeCheckpointer } from '../services/ai-agent.service';
import { PostgresSaver } from '@langchain/langgraph-checkpoint-postgres';
import { SqliteSaver } from '@langchain/langgraph-checkpoint-sqlite';

// Initialize checkpointer on module load
let checkpointer: PostgresSaver | SqliteSaver | null = null;

const getCheckpointer = async () => {
    if (!checkpointer) {
        // DATABASE_URL is optional for local development (uses SQLite)
        const dbUrl = process.env.DATABASE_URL;
        checkpointer = await initializeCheckpointer(dbUrl);
    }
    return checkpointer;
};

/**
 * Chat with AI agent
 * POST /api/ai/chat
 */
export const chat = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { message, threadId } = req.body;

    // Validate input
    if (!message || typeof message !== 'string') {
        throw new ValidationError('Message is required and must be a string');
    }

    if (!threadId || typeof threadId !== 'string') {
        throw new ValidationError('Thread ID is required');
    }

    // Get API key from environment
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        throw new Error('GEMINI_API_KEY is not configured');
    }

    // Get checkpointer
    const cp = await getCheckpointer();

    // Create AI agent
    const agent = createAIAgent(apiKey, cp);

    // Get response from agent
    const response = await agent.chat(message, threadId);

    // Extract response content
    const responseContent = response.content;

    sendSuccess(res, 'AI response generated successfully', {
        message: responseContent,
        threadId
    });
});

/**
 * Get conversation state
 * GET /api/ai/state/:threadId
 */
export const getState = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { threadId } = req.params;

    if (!threadId) {
        throw new ValidationError('Thread ID is required');
    }

    // Get API key from environment
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        throw new Error('GEMINI_API_KEY is not configured');
    }

    // Get checkpointer
    const cp = await getCheckpointer();

    // Create AI agent
    const agent = createAIAgent(apiKey, cp);

    // Get state
    const state = await agent.getState(threadId);

    sendSuccess(res, 'Thread state retrieved successfully', {
        threadId,
        state: {
            values: state.values,
            next: state.next,
            metadata: state.metadata,
            createdAt: state.createdAt
        }
    });
});

/**
 * Get conversation history
 * GET /api/ai/history/:threadId
 */
export const getHistory = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { threadId } = req.params;

    if (!threadId) {
        throw new ValidationError('Thread ID is required');
    }

    // Get API key from environment
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        throw new Error('GEMINI_API_KEY is not configured');
    }

    // Get checkpointer
    const cp = await getCheckpointer();

    // Create AI agent
    const agent = createAIAgent(apiKey, cp);

    // Get history
    const history = await agent.getHistory(threadId);

    const formattedHistory = history.map(state => ({
        values: state.values,
        next: state.next,
        metadata: state.metadata,
        createdAt: state.createdAt,
        checkpointId: state.config.configurable?.checkpoint_id
    }));

    sendSuccess(res, 'Thread history retrieved successfully', {
        threadId,
        history: formattedHistory,
        count: formattedHistory.length
    });
});

/**
 * Get chat messages for a thread
 * GET /api/ai/messages/:threadId
 */
export const getChatMessages = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { threadId } = req.params;

    if (!threadId) {
        throw new ValidationError('Thread ID is required');
    }

    // Get API key from environment
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        throw new Error('GEMINI_API_KEY is not configured');
    }

    // Get checkpointer
    const cp = await getCheckpointer();

    // Create AI agent
    const agent = createAIAgent(apiKey, cp);

    // Get chat messages
    const messages = await agent.getChatMessages(threadId);

    sendSuccess(res, 'Chat messages retrieved successfully', {
        threadId,
        messages,
        count: messages.length
    });
});

/**
 * Get available tools
 * GET /api/ai/tools
 */
export const getTools = asyncHandler(async (_req: Request, res: Response): Promise<void> => {
    const tools = [
        {
            name: 'get_low_stock_products',
            description: 'Get products that are running low on stock or out of stock',
            parameters: {
                minStockOnly: 'boolean (optional) - If true, only return low stock items'
            }
        },
        {
            name: 'get_product_info',
            description: 'Get detailed information about a specific product',
            parameters: {
                productCode: 'string (optional) - The unique product code',
                productName: 'string (optional) - The product name'
            }
        },
        {
            name: 'get_sales_analytics',
            description: 'Get sales analytics for a specific time period',
            parameters: {
                days: 'number (optional) - Number of days to look back',
                groupBy: 'string (optional) - Group by "product" to see top sellers'
            }
        },
        {
            name: 'get_inventory_summary',
            description: 'Get a summary of inventory statistics',
            parameters: {
                category: 'string (optional) - Filter by category',
                brand: 'string (optional) - Filter by brand'
            }
        },
        {
            name: 'search_products',
            description: 'Search for products by name, code, category, or brand',
            parameters: {
                query: 'string (optional) - Search query',
                category: 'string (optional) - Filter by category',
                brand: 'string (optional) - Filter by brand',
                inStockOnly: 'boolean (optional) - Only show in-stock products'
            }
        },
        {
            name: 'get_recent_sales',
            description: 'Get recent sales transactions',
            parameters: {
                limit: 'number (optional) - Number of sales to return (max 50)',
                productCode: 'string (optional) - Filter by product code'
            }
        },
        {
            name: 'get_sales_by_date_range',
            description: 'Get sales data for a specific date range',
            parameters: {
                startDate: 'string - Start date (YYYY-MM-DD)',
                endDate: 'string - End date (YYYY-MM-DD)',
                groupBy: 'string (optional) - Group by "product" or "day"'
            }
        },
        {
            name: 'get_top_selling_products',
            description: 'Get top selling products ranked by revenue',
            parameters: {
                days: 'number (optional) - Number of days to look back',
                limit: 'number (optional) - Number of products to return (max 20)'
            }
        },
        {
            name: 'get_sales_by_customer',
            description: 'Get sales transactions for a specific customer',
            parameters: {
                customerName: 'string - Customer name (partial match supported)',
                days: 'number (optional) - Number of days to look back'
            }
        }
    ];

    sendSuccess(res, 'Available tools retrieved successfully', { tools });
});
