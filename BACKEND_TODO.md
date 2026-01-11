# Backend Implementation Plan - IMS (Inventory Management System)

## 📋 Overview
Complete backend implementation checklist for the Inventory Management System to meet job application requirements.

**Timeline:** 10-12 days
**Tech Stack:** NestJS + PostgreSQL + Prisma + JWT + Resend

---

## 🏗️ Phase 1: Project Setup (Day 1-2)

### 1.1 Initialize Project
- [ ] Create new directory: `ims-backend`
- [ ] Initialize NestJS project: `nest new ims-backend`
- [ ] Install core dependencies:
  ```bash
  npm install @nestjs/config @nestjs/jwt @nestjs/passport
  npm install @prisma/client
  npm install passport passport-jwt passport-local
  npm install bcrypt class-validator class-transformer
  npm install --save-dev prisma @types/passport-jwt @types/bcrypt
  ```

### 1.2 Set Up PostgreSQL & Prisma
- [ ] Install Prisma: `npx prisma init`
- [ ] Update `.env` with database URL
- [ ] Configure Prisma schema (`prisma/schema.prisma`)

### 1.3 Environment Configuration
- [ ] Create `.env` file with:
  ```
  DATABASE_URL="postgresql://..."
  JWT_SECRET="your-secret-key"
  JWT_EXPIRES_IN="7d"
  REFRESH_TOKEN_SECRET="refresh-secret"
  REFRESH_TOKEN_EXPIRES_IN="30d"
  EMAIL_API_KEY="resend-api-key"
  FRONTEND_URL="http://localhost:3000"
  ```

---

## 📊 Phase 2: Database Schema Design (Day 2)

### 2.1 Prisma Schema Structure

```prisma
// User Model
model User {
  id            String   @id @default(uuid())
  email         String   @unique
  password      String
  name          String
  phone         String?
  bio           String?
  role          Role     @default(STAFF)
  isVerified    Boolean  @default(false)
  verificationToken String?
  resetPasswordToken String?
  resetPasswordExpires DateTime?
  status        UserStatus @default(ACTIVE)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  sales         Sale[]
}

enum Role {
  ADMIN
  STAFF
}

enum UserStatus {
  ACTIVE
  INACTIVE
}

// Product Model
model Product {
  id          String   @id @default(uuid())
  code        String   @unique
  name        String
  category    String
  brand       String?
  imageUrl    String?
  variants    Variant[]
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

// Variant Model
model Variant {
  id               String   @id @default(uuid())
  productId        String
  product          Product  @relation(fields: [productId], references: [id], onDelete: Cascade)
  size             String
  color            String
  stockQuantity    Int
  minStockQuantity Int
  buyingPrice      Float
  sellingPrice     Float
  sales            Sale[]
  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt

  @@unique([productId, size, color])
}

// Sale Model
model Sale {
  id            String   @id @default(uuid())
  variantId     String
  variant       Variant  @relation(fields: [variantId], references: [id])
  userId        String
  user          User     @relation(fields: [userId], references: [id])
  quantity      Int
  sellingPrice  Float
  totalAmount   Float
  customerName  String?
  notes         String?
  saleDate      DateTime @default(now())
  createdAt     DateTime @default(now())
}
```

### 2.2 Database Migrations
- [ ] Run: `npx prisma migrate dev --name init`
- [ ] Generate Prisma Client: `npx prisma generate`
- [ ] Seed initial admin user (optional)

---

## 🔐 Phase 3: Authentication & Security (Day 3-5)

### 3.1 JWT Strategy Setup
- [ ] Create `src/auth/auth.module.ts`
- [ ] Create `src/auth/strategies/jwt.strategy.ts`
- [ ] Create `src/auth/strategies/local.strategy.ts`
- [ ] Create `src/auth/guards/jwt-auth.guard.ts`
- [ ] Create `src/auth/guards/roles.guard.ts`
- [ ] Create decorators: `@Public()`, `@Roles()`

### 3.2 Authentication Endpoints

#### POST /auth/signup
- [ ] Validate email/password with class-validator
- [ ] Check if email already exists
- [ ] Hash password with bcrypt (salt rounds: 10)
- [ ] Generate email verification token
- [ ] Save user to database (isVerified: false)
- [ ] Send verification email
- [ ] Return success message (don't return password!)

#### POST /auth/login
- [ ] Validate credentials
- [ ] Check if user is verified
- [ ] Check if user is active
- [ ] Compare password with bcrypt
- [ ] Generate JWT access token (7 days)
- [ ] Generate refresh token (30 days)
- [ ] Return tokens + user data (without password)

#### POST /auth/verify-email
- [ ] Accept token from query params
- [ ] Find user by verification token
- [ ] Mark user as verified
- [ ] Clear verification token
- [ ] Return success message

#### POST /auth/forgot-password
- [ ] Validate email
- [ ] Find user by email
- [ ] Generate reset token (uuid)
- [ ] Set token expiry (1 hour)
- [ ] Save token to database
- [ ] Send reset email with link
- [ ] Return success message

#### POST /auth/reset-password
- [ ] Accept token and new password
- [ ] Validate password strength
- [ ] Find user by reset token
- [ ] Check token expiry
- [ ] Hash new password
- [ ] Update password
- [ ] Clear reset token
- [ ] Return success message

#### POST /auth/refresh
- [ ] Accept refresh token
- [ ] Verify refresh token
- [ ] Generate new access token
- [ ] Return new access token

### 3.3 Security Features
- [ ] Install rate limiting: `npm install @nestjs/throttler`
- [ ] Configure throttler (10 requests per minute for auth)
- [ ] Add CORS configuration
- [ ] Add helmet for security headers: `npm install helmet`
- [ ] Sanitize user inputs

---

## 📧 Phase 4: Email Service (Day 4)

### 4.1 Setup Email Provider (Resend)
- [ ] Install: `npm install resend`
- [ ] Create `src/email/email.service.ts`
- [ ] Configure Resend API key

### 4.2 Email Templates
- [ ] Verification email template
- [ ] Password reset email template
- [ ] Welcome email (optional)

### 4.3 Email Methods
- [ ] `sendVerificationEmail(email, token)`
- [ ] `sendPasswordResetEmail(email, token)`

---

## 👤 Phase 5: User Management (Day 5-6)

### 5.1 User CRUD Endpoints

#### GET /users (Admin only)
- [ ] Implement pagination (page, limit)
- [ ] Return users without passwords
- [ ] Filter by role/status (optional)

#### GET /users/:id (Admin only)
- [ ] Get user by ID
- [ ] Return user without password

#### POST /users (Admin only)
- [ ] Create new user
- [ ] Validate input
- [ ] Hash password
- [ ] Send welcome email
- [ ] Return created user

#### PATCH /users/:id (Admin only)
- [ ] Update user details
- [ ] Allow role change
- [ ] Allow status change
- [ ] Don't allow password change here

#### DELETE /users/:id (Admin only)
- [ ] Soft delete or status change to INACTIVE
- [ ] Don't allow deleting self

#### GET /users/me
- [ ] Get current logged-in user
- [ ] Return user profile without password

#### PATCH /users/me
- [ ] Update own profile
- [ ] Don't allow role change
- [ ] Return updated user

#### POST /users/change-password
- [ ] Validate current password
- [ ] Validate new password
- [ ] Hash and update password
- [ ] Return success

---

## 📦 Phase 6: Product Management (Day 6-7)

### 6.1 Product CRUD Endpoints

#### GET /products
- [ ] Implement pagination (page, limit)
- [ ] Include variants in response
- [ ] Filter by category/brand (optional)
- [ ] Search by name/code (optional)
- [ ] Calculate stock status per variant

#### GET /products/:id
- [ ] Get product by ID
- [ ] Include all variants
- [ ] Calculate stock status

#### POST /products (Admin/Staff with permission)
- [ ] Validate product data
- [ ] Validate unique product code
- [ ] Validate variants (unique size-color combo)
- [ ] Create product with variants
- [ ] Return created product

#### PATCH /products/:id (Admin/Staff)
- [ ] Update product details
- [ ] Update variants
- [ ] Handle variant add/remove
- [ ] Return updated product

#### DELETE /products/:id (Admin only)
- [ ] Check if product has sales history
- [ ] Delete product (cascade deletes variants)
- [ ] Return success

---

## 💰 Phase 7: Sales Management (Day 7-8)

### 7.1 Sales Endpoints

#### POST /sales
- [ ] Validate sale data
- [ ] Check variant exists
- [ ] Check stock availability
- [ ] Create sale record
- [ ] Deduct stock from variant
- [ ] Return created sale with product details

#### GET /sales
- [ ] Implement pagination
- [ ] Include product and variant details
- [ ] Include user (soldBy) details
- [ ] Filter by date range (optional)
- [ ] Filter by product (optional)
- [ ] Sort by date (newest first)

#### GET /sales/:id
- [ ] Get sale by ID
- [ ] Include all related data
- [ ] Return sale details

#### PATCH /sales/:id (Admin only)
- [ ] Allow editing sale
- [ ] Adjust stock accordingly
- [ ] Log the change
- [ ] Return updated sale

---

## 📊 Phase 8: Analytics & Reports (Day 8-9)

### 8.1 Dashboard Endpoints

#### GET /analytics/overview
- [ ] Calculate total sales (revenue)
- [ ] Calculate total profit
- [ ] Calculate total products
- [ ] Get low stock count
- [ ] Accept date range parameter
- [ ] Return summary stats

#### GET /analytics/sales-trend
- [ ] Group sales by day/week/month
- [ ] Calculate revenue and profit per period
- [ ] Return array of data points for charts

#### GET /analytics/top-products
- [ ] Get top selling products
- [ ] Calculate by quantity or revenue
- [ ] Limit to top 5-10
- [ ] Return with product details

#### GET /analytics/sales-by-category
- [ ] Group sales by product category
- [ ] Calculate total per category
- [ ] Return category breakdown

#### GET /analytics/low-stock-alerts
- [ ] Find variants where stock <= minStock
- [ ] Include product details
- [ ] Return list of low stock items

---

## 🔧 Phase 9: Additional Features (Day 9)

### 9.1 Logging
- [ ] Install Winston: `npm install winston`
- [ ] Configure logger service
- [ ] Log all auth attempts (success/fail)
- [ ] Log CRUD operations
- [ ] Log errors with stack traces
- [ ] Store logs in files/database

### 9.2 Validation & Error Handling
- [ ] Create global exception filter
- [ ] Standardize error responses:
  ```json
  {
    "statusCode": 400,
    "message": "Validation failed",
    "errors": ["email must be a valid email"]
  }
  ```
- [ ] Add validation pipes globally
- [ ] Create custom validation decorators

### 9.3 API Documentation
- [ ] Install Swagger: `npm install @nestjs/swagger`
- [ ] Add Swagger decorators to controllers
- [ ] Configure Swagger UI
- [ ] Document all endpoints
- [ ] Add example requests/responses

---

## 🚀 Phase 10: Deployment (Day 10)

### 10.1 Database Deployment
- [ ] Create PostgreSQL database on Railway/Neon
- [ ] Update DATABASE_URL in production env
- [ ] Run migrations: `npx prisma migrate deploy`

### 10.2 Backend Deployment
- [ ] Choose platform: Railway or Render
- [ ] Create new project
- [ ] Connect GitHub repository
- [ ] Set environment variables
- [ ] Deploy backend
- [ ] Test API endpoints

### 10.3 Frontend Connection
- [ ] Update frontend `.env`:
  ```
  NEXT_PUBLIC_API_URL=https://your-backend.railway.app/api
  ```
- [ ] Update all API calls to use env variable
- [ ] Deploy frontend to Vercel
- [ ] Test full application flow

---

## ✅ Phase 11: Testing & Polish (Day 11-12)

### 11.1 End-to-End Testing
- [ ] Test signup → verify email → login flow
- [ ] Test password reset flow
- [ ] Test product CRUD operations
- [ ] Test sales recording with stock deduction
- [ ] Test role-based access (Admin vs Staff)
- [ ] Test all analytics endpoints
- [ ] Test pagination on all list endpoints

### 11.2 Bug Fixes & Optimization
- [ ] Fix any CORS issues
- [ ] Optimize database queries
- [ ] Add database indexes for performance
- [ ] Handle edge cases
- [ ] Improve error messages

### 11.3 Documentation
- [ ] Update README with setup instructions
- [ ] Document API endpoints (if not using Swagger)
- [ ] Add .env.example file
- [ ] Document deployment process

---

## 📝 Job Application Requirements Checklist

### ✅ Required Features
- [x] **Frontend**: React + ShadCN UI
- [ ] **Backend**: Node.js (NestJS)
- [ ] **Authentication**: Email/password + verification + reset
- [ ] **Security**: Bcrypt password hashing
- [ ] **Security**: Rate limiting on endpoints
- [ ] **API Design**: Proper HTTP status codes and messages
- [ ] **Roles**: Admin and Staff with different access levels
- [ ] **Pagination**: Implemented on list endpoints
- [ ] **Forms**: Validation with class-validator
- [ ] **Forms**: Error states and loading states (already done in frontend)
- [ ] **Logging**: Winston for server-side logging

### 🎯 Deployment Checklist
- [ ] Backend deployed and accessible
- [ ] Database deployed and migrated
- [ ] Frontend deployed and connected
- [ ] HTTPS enabled
- [ ] All features working end-to-end

---

## 🛠️ Recommended File Structure

```
ims-backend/
├── src/
│   ├── auth/
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   ├── auth.module.ts
│   │   ├── dto/
│   │   │   ├── signup.dto.ts
│   │   │   ├── login.dto.ts
│   │   │   └── reset-password.dto.ts
│   │   ├── strategies/
│   │   │   ├── jwt.strategy.ts
│   │   │   └── local.strategy.ts
│   │   └── guards/
│   │       ├── jwt-auth.guard.ts
│   │       └── roles.guard.ts
│   ├── users/
│   │   ├── users.controller.ts
│   │   ├── users.service.ts
│   │   ├── users.module.ts
│   │   └── dto/
│   ├── products/
│   │   ├── products.controller.ts
│   │   ├── products.service.ts
│   │   ├── products.module.ts
│   │   └── dto/
│   ├── sales/
│   │   ├── sales.controller.ts
│   │   ├── sales.service.ts
│   │   ├── sales.module.ts
│   │   └── dto/
│   ├── analytics/
│   │   ├── analytics.controller.ts
│   │   ├── analytics.service.ts
│   │   └── analytics.module.ts
│   ├── email/
│   │   ├── email.service.ts
│   │   └── email.module.ts
│   ├── prisma/
│   │   ├── prisma.service.ts
│   │   └── prisma.module.ts
│   ├── common/
│   │   ├── decorators/
│   │   ├── filters/
│   │   └── interceptors/
│   └── main.ts
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── .env
├── .env.example
├── package.json
└── README.md
```

---

## 📚 Useful Resources

- **NestJS Docs**: https://docs.nestjs.com
- **Prisma Docs**: https://www.prisma.io/docs
- **Resend Docs**: https://resend.com/docs
- **Railway Docs**: https://docs.railway.app
- **JWT Best Practices**: https://jwt.io/introduction

---

## 💡 Tips for Success

1. **Start with authentication** - It's the most critical part
2. **Test each endpoint** as you build it (use Postman/Insomnia)
3. **Commit frequently** to git with clear messages
4. **Deploy early** - Don't wait until everything is perfect
5. **Keep frontend updated** - Connect endpoints as you build them
6. **Use Prisma Studio** for easy database inspection: `npx prisma studio`
7. **Check logs often** - Catch errors early
8. **Ask for help** if stuck - Don't waste time debugging alone

---

Good luck! 🚀 You've got this!
