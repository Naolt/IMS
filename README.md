# IMS - Inventory Management System

A full-stack inventory management system built with Next.js and Express, featuring AI-powered insights, real-time analytics, and a modern responsive UI.

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![Express](https://img.shields.io/badge/Express-5-000000?logo=express)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql)

## Features

### Inventory Management
- Product catalog with variants (sizes, colors)
- Stock level tracking and low-stock alerts
- Category and brand organization
- Image upload via Cloudinary

### Sales Tracking
- Record and manage sales transactions
- Sales history with filtering and search
- Revenue analytics and trends
- Top-selling products insights

### AI Assistant
- Natural language queries about inventory and sales
- Powered by Google Gemini via LangChain/LangGraph
- Conversation history with memory
- Actionable business insights

### Reports & Analytics
- Sales trend visualization
- Inventory value analysis
- Stock status breakdown
- Category-wise distribution

### User Management
- Role-based access (Admin/Staff)
- Email verification
- Password reset flow
- Profile management

## Tech Stack

### Frontend
- **Framework:** Next.js 16 with App Router
- **Styling:** Tailwind CSS
- **Components:** shadcn/ui (Radix UI)
- **State:** React Query (TanStack Query)
- **Forms:** React Hook Form + Zod
- **Charts:** Recharts

### Backend
- **Runtime:** Node.js with Express 5
- **Database:** PostgreSQL with TypeORM
- **AI:** LangChain + LangGraph + Google Gemini
- **Auth:** JWT with refresh tokens
- **Email:** Resend
- **Docs:** Swagger/OpenAPI

## Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL database
- Cloudinary account (for image uploads)
- Google AI API key (for AI features)
- Resend API key (for emails)

### Environment Setup

1. Clone the repository:
```bash
git clone https://github.com/Naolt/IMS.git
cd IMS
```

2. Set up the backend:
```bash
cd ims-backend
cp .env.example .env
# Edit .env with your configuration
npm install
npm run dev
```

3. Set up the frontend:
```bash
cd ims-frontend
cp .env.example .env.local
# Edit .env.local with your configuration
npm install
npm run dev
```

4. Access the application:
- Frontend: http://localhost:3000
- Backend API: http://localhost:4000/api
- API Docs: http://localhost:4000/api-docs

### Demo Credentials

The application can be seeded with demo data from the login page:
- **Admin:** admin@ims.com / Admin@123
- **Staff:** staff@ims.com / Staff@123

## Project Structure

```
ims/
├── ims-frontend/          # Next.js frontend application
│   ├── src/
│   │   ├── app/           # App router pages
│   │   ├── components/    # Reusable UI components
│   │   ├── contexts/      # React contexts
│   │   ├── hooks/         # Custom hooks
│   │   ├── lib/           # Utilities
│   │   ├── services/      # API service layer
│   │   └── types/         # TypeScript types
│   └── public/            # Static assets
│
└── ims-backend/           # Express backend API
    ├── src/
    │   ├── config/        # Configuration files
    │   ├── controllers/   # Route controllers
    │   ├── entities/      # TypeORM entities
    │   ├── middleware/    # Express middleware
    │   ├── routes/        # API routes
    │   ├── services/      # Business logic
    │   └── utils/         # Utilities
    └── build/             # Compiled JavaScript
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register new user |
| POST | /api/auth/login | User login |
| GET | /api/products | List all products |
| POST | /api/products | Create product |
| GET | /api/sales | List sales |
| POST | /api/sales | Record sale |
| POST | /api/ai/chat | AI assistant query |
| GET | /api/users | List users (admin) |

Full API documentation available at `/api-docs` when running the backend.

## Deployment

### Frontend (Vercel)
```bash
cd ims-frontend
vercel deploy
```

### Backend (Render/Railway)
```bash
cd ims-backend
npm run build
npm start
```

## License

MIT

## Author

Naol Tamrat - [GitHub](https://github.com/Naolt)
