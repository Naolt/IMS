// ========== BACKEND RESPONSE STRUCTURE ==========

// Base API Response
export interface ApiResponse<T = any> {
    success: true;
    message: string;
    data?: T;
    meta: {
        timestamp: string;
        requestId?: string;
    };
}

// Paginated API Response
export interface PaginatedApiResponse<T = any> {
    success: true;
    message: string;
    data: T[];
    pagination: PaginationMeta;
    meta: {
        timestamp: string;
        requestId?: string;
    };
}

// Error Response
export interface ApiErrorResponse {
    success: false;
    message: string;
    error: {
        code: string;
        details?: any;
    };
    meta: {
        timestamp: string;
        requestId?: string;
        path?: string;
    };
}

// Pagination Meta
export interface PaginationMeta {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

// ========== USER TYPES ==========

export enum UserRole {
    ADMIN = 'ADMIN',
    STAFF = 'STAFF',
}

export enum UserStatus {
    ACTIVE = 'ACTIVE',
    INACTIVE = 'INACTIVE',
    SUSPENDED = 'SUSPENDED',
}

export interface User {
    id: string;
    email: string;
    name: string;
    phone?: string;
    bio?: string;
    role: UserRole;
    isVerified: boolean;
    status: UserStatus;
    createdAt: string;
    updatedAt?: string;
}

// ========== PRODUCT & VARIANT TYPES ==========

export interface Variant {
    id: string;
    productId: string;
    size: string;
    color: string;
    stockQuantity: number;
    minStockQuantity: number;
    buyingPrice: number;
    sellingPrice: number;
    createdAt: string;
    updatedAt: string;
    product?: Product;
}

export interface Product {
    id: string;
    code: string;
    name: string;
    category: string;
    brand?: string;
    imageUrl?: string;
    variants: Variant[];
    createdAt: string;
    updatedAt: string;
}

// ========== SALE TYPES ==========

export interface Sale {
    id: string;
    variantId: string;
    userId: string;
    quantity: number;
    sellingPrice: number;
    totalAmount: number;
    customerName?: string;
    notes?: string;
    saleDate: string;
    createdAt: string;
    variant?: Variant;
    user?: User;
}

export interface SalesAnalytics {
    totalSales: number;
    totalRevenue: number;
    totalProfit: number;
    averageOrderValue: number;
    topSellingProducts: {
        productName: string;
        productCode: string;
        variantId: string;
        size: string;
        color: string;
        totalQuantity: number;
        totalRevenue: number;
    }[];
    salesByDate: {
        date: string;
        count: number;
        revenue: number;
        profit: number;
    }[];
}

export interface UserStats {
    totalUsers: number;
    activeUsers: number;
    verifiedUsers: number;
    adminUsers: number;
    staffUsers: number;
}

// ========== AUTH REQUEST/RESPONSE TYPES ==========

export interface SignInRequest {
    email: string;
    password: string;
}

export interface SignInData {
    token: string;
    refreshToken: string;
    user: User;
}

export type SignInResponse = ApiResponse<SignInData>;

export interface SignUpRequest {
    email: string;
    password: string;
    name: string;
    phone?: string;
}

export type SignUpResponse = ApiResponse<User>;

// ========== PRODUCT REQUEST/RESPONSE TYPES ==========

export interface CreateProductRequest {
    code: string;
    name: string;
    category: string;
    brand?: string;
    imageUrl?: string;
    variants?: {
        size: string;
        color: string;
        stockQuantity: number;
        minStockQuantity: number;
        buyingPrice: number;
        sellingPrice: number;
    }[];
}

export type ProductResponse = ApiResponse<Product>;
export type ProductsResponse = PaginatedApiResponse<Product>;

// ========== SALE REQUEST/RESPONSE TYPES ==========

export interface CreateSaleRequest {
    variantId: string;
    quantity: number;
    customerName?: string;
    notes?: string;
    saleDate?: string;
    customPrice?: number;
}

export type SaleResponse = ApiResponse<Sale>;
export type SalesResponse = PaginatedApiResponse<Sale>;
export type SalesAnalyticsResponse = ApiResponse<SalesAnalytics>;

// ========== USER REQUEST/RESPONSE TYPES ==========

export interface CreateUserRequest {
    email: string;
    password: string;
    name: string;
    phone?: string;
    role: UserRole;
}

export interface UpdateUserRequest {
    name?: string;
    phone?: string;
    bio?: string;
    role?: UserRole;
    status?: UserStatus;
}

export type UserResponse = ApiResponse<User>;
export type UsersResponse = PaginatedApiResponse<User>;
export type UserStatsResponse = ApiResponse<UserStats>;

// ========== OTHER RESPONSE TYPES ==========

export type CategoriesResponse = ApiResponse<string[]>;
export type BrandsResponse = ApiResponse<string[]>;
export type SizesResponse = ApiResponse<string[]>;
export type ColorsResponse = ApiResponse<string[]>;
export type VariantsResponse = ApiResponse<Variant[]>;
