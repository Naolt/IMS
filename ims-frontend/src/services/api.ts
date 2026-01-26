import apiClient from '@/lib/api-client';
import {
    SignInRequest,
    SignInResponse,
    SignUpRequest,
    SignUpResponse,
    User,
    ProductsResponse,
    ProductResponse,
    SalesResponse,
    SaleResponse,
    SalesAnalyticsResponse,
    UsersResponse,
    UserResponse,
    UserStatsResponse,
    Variant,
    CategoriesResponse,
    BrandsResponse,
    SizesResponse,
    ColorsResponse,
    ApiResponse,
    CreateProductRequest,
    CreateSaleRequest,
    CreateUserRequest,
    UpdateUserRequest,
} from '@/types/api';

// ========== AUTH API ==========
export const authApi = {
    signIn: async (data: SignInRequest) => {
        const response = await apiClient.post<SignInResponse>(
            '/api/auth/signin',
            data
        );
        return response.data;
    },

    signUp: async (data: SignUpRequest) => {
        const response = await apiClient.post<SignUpResponse>(
            '/api/auth/signup',
            data
        );
        return response.data;
    },

    getProfile: async () => {
        const response = await apiClient.get<ApiResponse<User>>(
            '/api/auth/profile'
        );
        return response.data;
    },

    updateProfile: async (data: Partial<User>) => {
        const response = await apiClient.put<ApiResponse<User>>(
            '/api/auth/profile',
            data
        );
        return response.data;
    },

    changePassword: async (data: {
        currentPassword: string;
        newPassword: string;
    }) => {
        const response = await apiClient.post<ApiResponse>(
            '/api/auth/change-password',
            data
        );
        return response.data;
    },

    forgotPassword: async (email: string) => {
        const response = await apiClient.post<ApiResponse>(
            '/api/auth/forgot-password',
            { email }
        );
        return response.data;
    },

    resetPassword: async (data: { token: string; newPassword: string }) => {
        const response = await apiClient.post<ApiResponse>(
            '/api/auth/reset-password',
            data
        );
        return response.data;
    },

    verifyEmail: async (token: string) => {
        const response = await apiClient.post<ApiResponse>(
            '/api/auth/verify-email',
            { token }
        );
        return response.data;
    },

    resendVerificationEmail: async (email: string) => {
        const response = await apiClient.post<ApiResponse>(
            '/api/auth/resend-verification',
            { email }
        );
        return response.data;
    },
};

// ========== PRODUCTS API ==========
export const productsApi = {
    getProducts: async (params?: {
        page?: number;
        limit?: number;
        search?: string;
        category?: string;
        brand?: string;
    }) => {
        const response = await apiClient.get<ProductsResponse>('/api/products', {
            params,
        });
        return response.data;
    },

    getProductById: async (id: string) => {
        const response = await apiClient.get<ProductResponse>(
            `/api/products/${id}`
        );
        return response.data;
    },

    createProduct: async (data: CreateProductRequest) => {
        const response = await apiClient.post<ProductResponse>(
            '/api/products',
            data
        );
        return response.data;
    },

    updateProduct: async (
        id: string,
        data: {
            code?: string;
            name?: string;
            category?: string;
            brand?: string;
            imageUrl?: string;
        }
    ) => {
        const response = await apiClient.put<ProductResponse>(
            `/api/products/${id}`,
            data
        );
        return response.data;
    },

    deleteProduct: async (id: string) => {
        const response = await apiClient.delete<ApiResponse>(
            `/api/products/${id}`
        );
        return response.data;
    },

    getLowStock: async () => {
        const response = await apiClient.get<ApiResponse<Variant[]>>(
            '/api/products/low-stock'
        );
        return response.data;
    },

    addVariant: async (
        productId: string,
        data: Omit<Variant, 'id' | 'productId' | 'createdAt' | 'updatedAt' | 'product'>
    ) => {
        const response = await apiClient.post<ApiResponse<Variant>>(
            `/api/products/${productId}/variants`,
            data
        );
        return response.data;
    },

    updateVariant: async (
        variantId: string,
        data: Partial<Omit<Variant, 'id' | 'productId' | 'createdAt' | 'updatedAt' | 'product'>>
    ) => {
        const response = await apiClient.put<ApiResponse<Variant>>(
            `/api/products/variants/${variantId}`,
            data
        );
        return response.data;
    },

    deleteVariant: async (variantId: string) => {
        const response = await apiClient.delete<ApiResponse>(
            `/api/products/variants/${variantId}`
        );
        return response.data;
    },

    getCategories: async () => {
        const response = await apiClient.get<CategoriesResponse>(
            '/api/products/categories'
        );
        return response.data;
    },

    getBrands: async () => {
        const response = await apiClient.get<BrandsResponse>(
            '/api/products/brands'
        );
        return response.data;
    },

    getSizes: async () => {
        const response = await apiClient.get<SizesResponse>(
            '/api/products/sizes'
        );
        return response.data;
    },

    getColors: async () => {
        const response = await apiClient.get<ColorsResponse>(
            '/api/products/colors'
        );
        return response.data;
    },
};

// ========== SALES API ==========
export const salesApi = {
    getSales: async (params?: {
        page?: number;
        limit?: number;
        startDate?: string;
        endDate?: string;
        variantId?: string;
        userId?: string;
    }) => {
        const response = await apiClient.get<SalesResponse>('/api/sales', {
            params,
        });
        return response.data;
    },

    getSaleById: async (id: string) => {
        const response = await apiClient.get<SaleResponse>(`/api/sales/${id}`);
        return response.data;
    },

    createSale: async (data: CreateSaleRequest) => {
        const response = await apiClient.post<SaleResponse>(
            '/api/sales',
            data
        );
        return response.data;
    },

    deleteSale: async (id: string) => {
        const response = await apiClient.delete<ApiResponse>(`/api/sales/${id}`);
        return response.data;
    },

    getAnalytics: async (params?: {
        startDate?: string;
        endDate?: string;
    }) => {
        const response = await apiClient.get<SalesAnalyticsResponse>(
            '/api/sales/analytics',
            { params }
        );
        return response.data;
    },
};

// ========== USERS API (Admin only) ==========
export const usersApi = {
    getUsers: async (params?: {
        page?: number;
        limit?: number;
        search?: string;
        role?: string;
        status?: string;
    }) => {
        const response = await apiClient.get<UsersResponse>('/api/users', {
            params,
        });
        return response.data;
    },

    getUserById: async (id: string) => {
        const response = await apiClient.get<UserResponse>(`/api/users/${id}`);
        return response.data;
    },

    createUser: async (data: CreateUserRequest) => {
        const response = await apiClient.post<UserResponse>(
            '/api/users',
            data
        );
        return response.data;
    },

    updateUser: async (id: string, data: UpdateUserRequest) => {
        const response = await apiClient.put<UserResponse>(
            `/api/users/${id}`,
            data
        );
        return response.data;
    },

    deleteUser: async (id: string) => {
        const response = await apiClient.delete<ApiResponse>(
            `/api/users/${id}`
        );
        return response.data;
    },

    resetUserPassword: async (id: string, newPassword: string) => {
        const response = await apiClient.post<ApiResponse>(
            `/api/users/${id}/reset-password`,
            { newPassword }
        );
        return response.data;
    },

    getStats: async () => {
        const response = await apiClient.get<UserStatsResponse>(
            '/api/users/stats'
        );
        return response.data;
    },
};
