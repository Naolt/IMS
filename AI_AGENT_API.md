# AI Agent API Documentation

## Overview

The AI Agent API provides intelligent inventory management assistance using LangGraph and Google's Gemini AI. It features a chat-based interface with tool-calling capabilities for querying inventory data, analyzing sales, and getting actionable insights.

## Architecture

### Tech Stack
- **LangGraph**: Agent orchestration and workflow management
- **Google Gemini 1.5 Flash**: LLM for natural language understanding
- **PostgreSQL Checkpointer**: Persistent conversation state storage
- **TypeORM**: Database integration for tool data access

### Key Components

1. **AI Agent Service** (`src/services/ai-agent.service.ts`)
   - LangGraph workflow with tool nodes
   - PostgreSQL checkpointer for conversation persistence
   - 5 specialized tools for inventory operations

2. **Controller** (`src/controllers/ai.controller.ts`)
   - Chat endpoint for user interactions
   - State and history retrieval endpoints
   - Tool documentation endpoint

3. **Routes** (`src/routes/ai.routes.ts`)
   - RESTful API endpoints
   - Authentication middleware
   - Swagger documentation

## Available Tools

### 1. `get_low_stock_products`
Get products running low on stock or out of stock.

**Parameters:**
- `minStockOnly` (boolean, optional): If true, exclude out-of-stock items

**Example Use Cases:**
- "What needs restocking?"
- "Show me low stock items"
- "Which products are out of stock?"

### 2. `get_product_info`
Get detailed information about a specific product.

**Parameters:**
- `productCode` (string, optional): Unique product code
- `productName` (string, optional): Product name (partial match)

**Example Use Cases:**
- "Tell me about product IP14PRO"
- "Show details for iPhone 14"
- "What variants does the Galaxy have?"

### 3. `get_sales_analytics`
Get sales analytics for a specific time period.

**Parameters:**
- `days` (number, optional): Days to look back (default: 30)
- `groupBy` (string, optional): Set to "product" for top sellers

**Example Use Cases:**
- "Show me sales for the last 7 days"
- "What are my top selling products this month?"
- "Total revenue last week?"

### 4. `get_inventory_summary`
Get summary statistics of inventory.

**Parameters:**
- `category` (string, optional): Filter by category
- `brand` (string, optional): Filter by brand

**Example Use Cases:**
- "Give me an inventory overview"
- "How many products do I have?"
- "Show me electronics inventory"

### 5. `search_products`
Search for products by various criteria.

**Parameters:**
- `query` (string, optional): Search term for name/code
- `category` (string, optional): Filter by category
- `brand` (string, optional): Filter by brand
- `inStockOnly` (boolean, optional): Only in-stock products

**Example Use Cases:**
- "Find all Samsung products"
- "Search for laptops"
- "Show me in-stock electronics"

## API Endpoints

### POST `/api/ai/chat`
Send a message to the AI agent.

**Request Body:**
```json
{
  "message": "What products need restocking?",
  "threadId": "user-123-session-1"
}
```

**Response:**
```json
{
  "success": true,
  "message": "AI response generated successfully",
  "data": {
    "message": "Based on current inventory, 5 products need restocking...",
    "threadId": "user-123-session-1"
  },
  "meta": {
    "timestamp": "2026-01-04T12:00:00.000Z"
  }
}
```

### GET `/api/ai/state/:threadId`
Get current conversation state.

**Response:**
```json
{
  "success": true,
  "message": "Thread state retrieved successfully",
  "data": {
    "threadId": "user-123-session-1",
    "state": {
      "values": { ... },
      "next": [],
      "metadata": { ... },
      "createdAt": "2026-01-04T12:00:00.000Z"
    }
  }
}
```

### GET `/api/ai/history/:threadId`
Get full conversation history with all checkpoints.

**Response:**
```json
{
  "success": true,
  "message": "Thread history retrieved successfully",
  "data": {
    "threadId": "user-123-session-1",
    "history": [
      {
        "values": { ... },
        "next": [],
        "metadata": { ... },
        "createdAt": "2026-01-04T12:00:00.000Z",
        "checkpointId": "abc-123"
      }
    ],
    "count": 10
  }
}
```

### GET `/api/ai/tools`
Get list of available tools with documentation.

## Environment Variables

Add to `.env`:

```env
# AI Agent (Google Gemini)
GEMINI_API_KEY=your_gemini_api_key_here
```

## Conversation Persistence

The AI agent uses **PostgreSQL checkpointer** for conversation state:

- **Thread-based conversations**: Each `threadId` maintains separate conversation history
- **Automatic checkpointing**: State saved at every step
- **Time travel**: Access any previous checkpoint
- **Fault tolerance**: Resume from last successful checkpoint on errors

### Database Setup

The checkpointer automatically creates required tables on initialization:
- `checkpoints`: Stores conversation state snapshots
- `writes`: Stores pending writes from tool executions

## Example Usage

### Basic Chat Flow

```typescript
// 1. Start a conversation
POST /api/ai/chat
{
  "message": "What products are low on stock?",
  "threadId": "user-123"
}

// AI will call get_low_stock_products tool
// Response: "5 products need restocking: iPhone 14 Pro (2 left)..."

// 2. Follow-up question (same thread)
POST /api/ai/chat
{
  "message": "Show me sales trends for the iPhone",
  "threadId": "user-123"
}

// AI remembers context and calls get_sales_analytics
```

### Retrieving History

```typescript
// Get all conversation checkpoints
GET /api/ai/history/user-123

// Response includes all previous messages and tool calls
```

## Error Handling

The AI agent handles errors gracefully:

- **Missing API key**: Returns 500 with clear error message
- **Invalid threadId**: Returns 400 validation error
- **Database errors**: Logged and returned as 500
- **Tool execution errors**: Caught and reported to user

## Best Practices

### Frontend Integration

1. **Generate unique threadId**: Use `userId-timestamp` or UUID
2. **Persist threadId**: Store in localStorage for conversation continuity
3. **Handle streaming** (future): Prepare UI for real-time responses
4. **Show tool calls**: Display when AI is fetching data

### Thread Management

1. **One thread per conversation**: Don't reuse threadId across different topics
2. **Clean old threads**: Implement cleanup for inactive threads
3. **User-specific threads**: Prefix threadId with userId

### Security

1. **Authentication required**: All endpoints require valid JWT
2. **Rate limiting**: Applied to prevent abuse
3. **Input validation**: All inputs validated before processing

## Future Enhancements

Potential additions:
- [ ] Streaming responses for real-time feedback
- [ ] Multi-turn planning for complex tasks
- [ ] Human-in-the-loop approvals for actions
- [ ] Custom tool creation via UI
- [ ] Conversation export/import
- [ ] Analytics dashboard for AI usage

## Troubleshooting

### "GEMINI_API_KEY is not configured"
- Add `GEMINI_API_KEY` to `.env` file
- Restart backend server

### "DATABASE_URL is not configured"
- Ensure `DATABASE_URL` is set in `.env`
- Check PostgreSQL connection

### Checkpointer setup fails
- Verify database permissions
- Check if tables already exist
- Review database logs

### Tool execution errors
- Check database connectivity
- Verify entity relationships
- Review tool implementation in `ai-agent.service.ts`

## Development

### Adding New Tools

1. Define tool in `ai-agent.service.ts`:
```typescript
const myNewTool = tool(
    async ({ param }) => {
        // Tool logic
        return JSON.stringify(result);
    },
    {
        name: 'my_new_tool',
        description: 'What this tool does',
        schema: z.object({ ... })
    }
);
```

2. Add to tools array:
```typescript
const tools = [
    getLowStockProducts,
    getProductInfo,
    // ... other tools
    myNewTool
];
```

3. Update `/api/ai/tools` endpoint documentation

### Testing

```bash
# Test chat endpoint
curl -X POST http://localhost:3001/api/ai/chat \
  -H "Authorization: Bearer YOUR_JWT" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "What needs restocking?",
    "threadId": "test-123"
  }'

# Get conversation history
curl -X GET http://localhost:3001/api/ai/history/test-123 \
  -H "Authorization: Bearer YOUR_JWT"
```

## Support

For issues or questions:
- Check backend logs for detailed error messages
- Review Swagger docs at `/api-docs`
- Inspect checkpoint tables in database
- Enable debug logging in development
