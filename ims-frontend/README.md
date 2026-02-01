# IMS Frontend

The frontend application for the Inventory Management System, built with Next.js 16 and modern React patterns.

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Components:** shadcn/ui (Radix UI primitives)
- **State Management:** React Query (TanStack Query)
- **Forms:** React Hook Form + Zod validation
- **Charts:** Recharts
- **Icons:** Lucide React
- **Image Upload:** Cloudinary (next-cloudinary)

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
npm install
```

### Environment Variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_API_URL=http://localhost:4000/api
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your_upload_preset
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build

```bash
npm run build
npm start
```

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/             # Authentication pages
│   │   ├── page.tsx        # Sign in
│   │   ├── signup/         # Sign up
│   │   ├── forgot-password/
│   │   ├── reset-password/
│   │   └── verify-email/
│   │
│   └── dashboard/          # Protected dashboard
│       ├── page.tsx        # Overview
│       ├── inventory/      # Product management
│       ├── sales/          # Sales tracking
│       ├── reports/        # Analytics
│       ├── ai-assistant/   # AI chat interface
│       ├── users/          # User management (admin)
│       ├── settings/       # App settings
│       └── profile/        # User profile
│
├── components/
│   ├── ui/                 # shadcn/ui components
│   └── *.tsx               # Custom components
│
├── contexts/
│   └── auth-context.tsx    # Authentication context
│
├── hooks/
│   ├── use-products.ts     # Product queries
│   ├── use-sales.ts        # Sales queries
│   └── use-users.ts        # User queries
│
├── lib/
│   ├── api-client.ts       # Axios instance with interceptors
│   └── utils.ts            # Utility functions
│
├── services/
│   └── api.ts              # API service functions
│
└── types/
    └── *.ts                # TypeScript type definitions
```

## Features

### Authentication
- JWT-based authentication with refresh tokens
- Email verification flow
- Password reset via email
- Protected routes with middleware

### Dashboard Overview
- Key metrics (total products, sales, revenue)
- Low stock alerts
- Recent sales table
- Top selling products
- Sales trend chart

### Inventory Management
- Product listing with search and filters
- Create/edit products with variants
- Image upload to Cloudinary
- Stock level management
- Category and brand filtering

### Sales
- Record new sales
- Sales history with pagination
- Filter by date range
- Customer information tracking

### AI Assistant
- Natural language chat interface
- Markdown response rendering
- Conversation history
- Session management

### Reports
- Sales analysis with charts
- Inventory value breakdown
- Stock status distribution
- Category-wise analytics

### User Management (Admin)
- View all users
- Role assignment (Admin/Staff)
- Account status management

### Settings
- Low stock threshold configuration
- System preferences

## UI Components

Built on [shadcn/ui](https://ui.shadcn.com/), the following components are included:

- Alert, AlertDialog
- Button, Card
- Checkbox, Input, Label
- Dialog, Sheet
- Dropdown Menu, Select
- Table, Tabs
- Toast (Sonner)
- Tooltip
- And more...

## Responsive Design

- Mobile-first approach
- Bottom navigation bar on mobile
- Responsive sidebar
- Adaptive layouts for all screen sizes

## Scripts

```bash
npm run dev       # Start development server
npm run build     # Build for production
npm run start     # Start production server
npm run lint      # Run ESLint
```

## Environment Support

- Development: Hot reload, source maps
- Production: Optimized builds, static exports

## Deployment

### Vercel (Recommended)

```bash
vercel deploy
```

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
