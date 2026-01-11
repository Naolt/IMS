# IMS API Documentation

## Overview
The Inventory Management System (IMS) API provides comprehensive endpoints for managing products, sales, and users in a boutique retail environment.

## Base URL
- **Development**: `http://localhost:3001`
- **Production**: `https://your-production-url.com`

## Interactive API Documentation
Visit **Swagger UI** for interactive API documentation:
- **URL**: `http://localhost:3001/api-docs`
- **JSON Spec**: `http://localhost:3001/api-docs.json`

## Authentication
Most endpoints require authentication using JWT (JSON Web Token).

### How to authenticate:
1. **Sign up**: `POST /api/auth/signup`
2. **Sign in**: `POST /api/auth/signin` - You'll receive a JWT token
3. **Use the token**: Include in the `Authorization` header:
   ```
   Authorization: Bearer YOUR_JWT_TOKEN
   ```

## Quick Start

### 1. Register a new user
```bash
curl -X POST http://localhost:3001/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePassword123!",
    "name": "John Doe",
    "phone": "1234567890"
  }'
```

### 2. Sign in to get token
```bash
curl -X POST http://localhost:3001/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePassword123!"
  }'
```

### 3. Create a product with variants
```bash
curl -X POST http://localhost:3001/api/products \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "code": "DRESS-001",
    "name": "Summer Floral Dress",
    "category": "Dresses",
    "brand": "Fashion House",
    "variants": [
      {
        "size": "S",
        "color": "Blue",
        "stockQuantity": 10,
        "minStockQuantity": 2,
        "buyingPrice": 25.00,
        "sellingPrice": 49.99
      },
      {
        "size": "M",
        "color": "Blue",
        "stockQuantity": 15,
        "minStockQuantity": 2,
        "buyingPrice": 25.00,
        "sellingPrice": 49.99
      }
    ]
  }'
```

### 4. Record a sale
```bash
curl -X POST http://localhost:3001/api/sales \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "variantId": "VARIANT_UUID_HERE",
    "quantity": 2,
    "customerName": "Jane Smith",
    "notes": "Customer paid cash"
  }'
```

## API Endpoints

### Authentication Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/signup` | Register new user | No |
| POST | `/api/auth/signin` | Sign in and get JWT token | No |
| POST | `/api/auth/verify-email` | Verify email address | No |
| POST | `/api/auth/forgot-password` | Request password reset | No |
| POST | `/api/auth/reset-password` | Reset password with token | No |
| GET | `/api/auth/profile` | Get current user profile | Yes |
| PUT | `/api/auth/profile` | Update user profile | Yes |
| POST | `/api/auth/change-password` | Change password | Yes |

### Product Endpoints

| Method | Endpoint | Description | Auth Required | Admin Only |
|--------|----------|-------------|---------------|------------|
| POST | `/api/products` | Create product with variants | Yes | No |
| GET | `/api/products` | Get all products (paginated) | Yes | No |
| GET | `/api/products/low-stock` | Get low stock items | Yes | No |
| GET | `/api/products/:id` | Get product by ID | Yes | No |
| PUT | `/api/products/:id` | Update product | Yes | No |
| DELETE | `/api/products/:id` | Delete product | Yes | Yes |
| POST | `/api/products/:id/variants` | Add variant to product | Yes | No |
| PUT | `/api/products/variants/:variantId` | Update variant | Yes | No |
| DELETE | `/api/products/variants/:variantId` | Delete variant | Yes | Yes |

### Sales Endpoints

| Method | Endpoint | Description | Auth Required | Admin Only |
|--------|----------|-------------|---------------|------------|
| POST | `/api/sales` | Record a sale | Yes | No |
| GET | `/api/sales` | Get all sales (paginated, filtered) | Yes | No |
| GET | `/api/sales/analytics` | Get sales analytics | Yes | No |
| GET | `/api/sales/:id` | Get sale by ID | Yes | No |
| DELETE | `/api/sales/:id` | Delete sale (for corrections) | Yes | Yes |

### User Management Endpoints (Admin Only)

| Method | Endpoint | Description | Auth Required | Admin Only |
|--------|----------|-------------|---------------|------------|
| GET | `/api/users` | Get all users (paginated) | Yes | Yes |
| GET | `/api/users/stats` | Get user statistics | Yes | Yes |
| GET | `/api/users/:id` | Get user by ID | Yes | Yes |
| POST | `/api/users` | Create new user | Yes | Yes |
| PUT | `/api/users/:id` | Update user | Yes | Yes |
| DELETE | `/api/users/:id` | Delete user | Yes | Yes |
| POST | `/api/users/:id/reset-password` | Reset user password | Yes | Yes |

## Query Parameters

### Products List (`GET /api/products`)
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 10)
- `search` (string): Search by name or code
- `category` (string): Filter by category
- `brand` (string): Filter by brand

### Sales List (`GET /api/sales`)
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 10)
- `startDate` (date): Filter sales from this date
- `endDate` (date): Filter sales until this date
- `variantId` (uuid): Filter by variant
- `userId` (uuid): Filter by user

### Sales Analytics (`GET /api/sales/analytics`)
- `startDate` (date): Start date for analytics
- `endDate` (date): End date for analytics

### Users List (`GET /api/users`)
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 10)
- `search` (string): Search by name or email
- `role` (string): Filter by role (ADMIN, STAFF)
- `status` (string): Filter by status (ACTIVE, INACTIVE, SUSPENDED)

## Response Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request (validation error) |
| 401 | Unauthorized (no token or invalid token) |
| 403 | Forbidden (insufficient permissions) |
| 404 | Not Found |
| 500 | Internal Server Error |

## Data Models

### User
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "name": "John Doe",
  "phone": "1234567890",
  "bio": "User bio",
  "role": "STAFF|ADMIN",
  "isVerified": true,
  "status": "ACTIVE|INACTIVE|SUSPENDED",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

### Product
```json
{
  "id": "uuid",
  "code": "DRESS-001",
  "name": "Summer Floral Dress",
  "category": "Dresses",
  "brand": "Fashion House",
  "imageUrl": "https://example.com/image.jpg",
  "variants": [...],
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

### Variant
```json
{
  "id": "uuid",
  "productId": "uuid",
  "size": "M",
  "color": "Blue",
  "stockQuantity": 10,
  "minStockQuantity": 2,
  "buyingPrice": 25.00,
  "sellingPrice": 49.99,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

### Sale
```json
{
  "id": "uuid",
  "variantId": "uuid",
  "userId": "uuid",
  "quantity": 2,
  "sellingPrice": 49.99,
  "totalAmount": 99.98,
  "customerName": "Jane Smith",
  "notes": "Customer paid cash",
  "saleDate": "2024-01-01T00:00:00.000Z",
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

## Features

### 🔐 Authentication & Authorization
- JWT-based authentication
- Role-based access control (Admin, Staff)
- Email verification
- Password reset functionality

### 📦 Product Management
- Create products with multiple variants (size, color)
- Track stock levels per variant
- Low stock alerts
- Product search and filtering

### 💰 Sales Management
- Record sales transactions
- Automatic stock deduction
- Sales analytics and reports
- Filter by date range

### 👥 User Management (Admin)
- Create and manage users
- Assign roles
- View user statistics

## Security Features
- Password hashing with bcrypt
- JWT token authentication
- Rate limiting on all routes
- Role-based authorization
- Input validation

## Rate Limiting
- General: 100 requests per minute
- Auth endpoints: 5 attempts per 15 minutes

## Error Handling
All errors return JSON in this format:
```json
{
  "message": "Error description"
}
```

## Support
For issues or questions, contact: admin@ims.com
