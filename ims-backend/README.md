# IMS Backend

RESTful API backend for the Inventory Management System, built with Express 5 and TypeORM.

## Tech Stack

- **Runtime:** Node.js
- **Framework:** Express 5
- **Language:** TypeScript
- **Database:** PostgreSQL
- **ORM:** TypeORM
- **AI:** LangChain + LangGraph + Google Gemini
- **Authentication:** JWT (access + refresh tokens)
- **Email:** Resend
- **Documentation:** Swagger/OpenAPI
- **Logging:** Winston

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL 14+
- npm or yarn

### Installation

```bash
npm install
```

### Environment Variables

Create a `.env` file in the root directory:

```env
# Server
PORT=4000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/ims

# JWT
JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_refresh_secret
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Email (Resend)
RESEND_API_KEY=your_resend_api_key

# AI (Google Gemini)
GOOGLE_API_KEY=your_google_api_key
```

### Development

```bash
npm run dev
```

Server runs at [http://localhost:4000](http://localhost:4000)

### Production Build

```bash
npm run build
npm start
```

### Database Seeding

```bash
npm run seed
```

Or via API: `POST /api/seed` (for production/demo environments)

## Project Structure

```
src/
├── config/
│   ├── database.ts         # TypeORM configuration
│   ├── env.ts              # Environment variables
│   ├── logger.ts           # Winston logger setup
│   └── swagger.ts          # Swagger/OpenAPI config
│
├── controllers/
│   ├── auth.controller.ts  # Authentication logic
│   ├── product.controller.ts
│   ├── sale.controller.ts
│   ├── user.controller.ts
│   ├── ai.controller.ts
│   └── settings.controller.ts
│
├── entities/
│   ├── User.ts             # User entity
│   ├── Product.ts          # Product entity
│   ├── Variant.ts          # Product variant entity
│   ├── Sale.ts             # Sale entity
│   └── Settings.ts         # App settings entity
│
├── middleware/
│   ├── auth.ts             # JWT authentication
│   ├── errorHandler.ts     # Global error handling
│   ├── logger.ts           # Request logging
│   ├── rateLimiter.ts      # Rate limiting
│   └── requestContext.ts   # Request ID tracking
│
├── routes/
│   ├── auth.routes.ts
│   ├── product.routes.ts
│   ├── sale.routes.ts
│   ├── user.routes.ts
│   ├── ai.routes.ts
│   ├── settings.routes.ts
│   └── seed.routes.ts
│
├── services/
│   ├── ai-agent.service.ts # LangGraph AI agent
│   ├── ai-tools.ts         # AI tool definitions
│   ├── email.ts            # Email service
│   └── settings.service.ts
│
├── utils/
│   ├── auth.ts             # Token utilities
│   ├── errors.ts           # Custom error classes
│   └── response.ts         # Response helpers
│
├── seed.ts                 # Database seeder
└── index.ts                # Application entry point
```

## API Endpoints

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register new user |
| POST | /api/auth/login | Login user |
| POST | /api/auth/refresh | Refresh access token |
| POST | /api/auth/logout | Logout user |
| POST | /api/auth/forgot-password | Request password reset |
| POST | /api/auth/reset-password | Reset password |
| POST | /api/auth/verify-email | Verify email address |
| POST | /api/auth/resend-verification | Resend verification email |

### Products

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/products | List all products |
| GET | /api/products/:id | Get product by ID |
| POST | /api/products | Create product |
| PUT | /api/products/:id | Update product |
| DELETE | /api/products/:id | Delete product |
| GET | /api/products/stats/summary | Get inventory summary |

### Sales

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/sales | List all sales |
| GET | /api/sales/:id | Get sale by ID |
| POST | /api/sales | Record new sale |
| GET | /api/sales/stats/summary | Get sales summary |
| GET | /api/sales/stats/trend | Get sales trend data |

### Users (Admin Only)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/users | List all users |
| GET | /api/users/:id | Get user by ID |
| PUT | /api/users/:id | Update user |
| DELETE | /api/users/:id | Delete user |

### AI Assistant

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/ai/chat | Send message to AI |
| GET | /api/ai/history | Get conversation history |
| DELETE | /api/ai/history/:threadId | Delete conversation |

### Settings

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/settings | Get all settings |
| PUT | /api/settings | Update settings |

### Utility

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /health | Health check |
| POST | /api/seed | Seed demo data |
| GET | /api-docs | Swagger documentation |

## Database Schema

### Users
- id (UUID)
- email (unique)
- password (hashed)
- name
- role (admin/staff)
- isVerified
- verificationToken
- resetPasswordToken
- createdAt, updatedAt

### Products
- id (UUID)
- code (unique)
- name
- category
- brand
- imageUrl
- variants[] (one-to-many)
- createdAt, updatedAt

### Variants
- id (UUID)
- productId (FK)
- size
- color
- quantity
- price
- createdAt, updatedAt

### Sales
- id (UUID)
- variantId (FK)
- quantity
- unitPrice
- totalPrice
- customerName
- customerPhone
- soldBy (FK to User)
- saleDate
- createdAt

### Settings
- id (UUID)
- key (unique)
- value
- updatedAt

## AI Agent

The AI assistant uses LangGraph with Google Gemini to provide natural language queries:

### Available Tools
- `getProductInfo` - Get product details
- `searchProducts` - Search products by name/code/category
- `getLowStockProducts` - Check low stock items
- `getRecentSales` - View recent transactions
- `getSalesAnalytics` - Analyze sales data
- `getTopSellingProducts` - Get best sellers
- `getInventorySummary` - Inventory statistics

### Conversation Memory
- Conversations are persisted in PostgreSQL
- Each user has their own thread history
- Supports multi-turn conversations

## Middleware

### Authentication
- JWT verification for protected routes
- Admin-only route protection
- Token refresh mechanism

### Rate Limiting
- General API rate limiting
- Stricter limits on auth endpoints

### Error Handling
- Centralized error handling
- Custom error classes
- Structured error responses

### Logging
- HTTP request logging
- Error logging with stack traces
- Request ID tracking

## Scripts

```bash
npm run dev       # Start development server with hot reload
npm run build     # Compile TypeScript to JavaScript
npm run start     # Start production server
npm run seed      # Seed database with demo data
```

## Deployment

### Environment Setup

Ensure these environment variables are set in production:
- `NODE_ENV=production`
- `DATABASE_URL` with SSL mode
- Strong JWT secrets
- API keys for external services

### Build & Run

```bash
npm run build
npm start
```

### Platforms

**Render:**
- Build Command: `npm install && npm run build`
- Start Command: `npm start`

**Railway:**
- Build Command: `npm run build`
- Start Command: `npm start`

**Docker:**
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY build ./build
EXPOSE 4000
CMD ["node", "build/index.js"]
```

## Error Codes

| Code | Description |
|------|-------------|
| 400 | Bad Request - Invalid input |
| 401 | Unauthorized - Invalid/missing token |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource doesn't exist |
| 409 | Conflict - Duplicate resource |
| 429 | Too Many Requests - Rate limited |
| 500 | Internal Server Error |

## Security

- Password hashing with bcrypt
- JWT with short-lived access tokens
- Refresh token rotation
- Rate limiting on all endpoints
- Input validation with express-validator
- CORS configuration
- SQL injection protection via TypeORM
