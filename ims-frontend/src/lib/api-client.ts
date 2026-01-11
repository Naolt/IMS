import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { ApiErrorResponse } from '@/types/api';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// Create axios instance
const apiClient: AxiosInstance = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Flag to prevent multiple refresh requests
let isRefreshing = false;
let failedQueue: Array<{
    resolve: (value?: any) => void;
    reject: (reason?: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
    failedQueue.forEach((prom) => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

// Request interceptor - Add token to requests
apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor - Handle errors globally and refresh token
apiClient.interceptors.response.use(
    (response) => response,
    async (error: AxiosError<ApiErrorResponse>) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

        if (error.response) {
            // Handle 401 Unauthorized - Try to refresh token
            if (error.response.status === 401 && !originalRequest._retry) {
                if (isRefreshing) {
                    // If already refreshing, queue this request
                    return new Promise((resolve, reject) => {
                        failedQueue.push({ resolve, reject });
                    })
                        .then((token) => {
                            originalRequest.headers.Authorization = `Bearer ${token}`;
                            return apiClient(originalRequest);
                        })
                        .catch((err) => {
                            return Promise.reject(err);
                        });
                }

                originalRequest._retry = true;
                isRefreshing = true;

                const refreshToken = localStorage.getItem('refreshToken');

                if (!refreshToken) {
                    // No refresh token, redirect to login
                    localStorage.removeItem('token');
                    localStorage.removeItem('refreshToken');
                    localStorage.removeItem('user');
                    window.location.href = '/';
                    return Promise.reject(error);
                }

                try {
                    // Call refresh token endpoint
                    const response = await axios.post(`${API_URL}/api/auth/refresh-token`, {
                        refreshToken,
                    });

                    const { token: newAccessToken, refreshToken: newRefreshToken } = response.data.data;

                    // Update tokens in localStorage
                    localStorage.setItem('token', newAccessToken);
                    localStorage.setItem('refreshToken', newRefreshToken);

                    // Update authorization header
                    apiClient.defaults.headers.common.Authorization = `Bearer ${newAccessToken}`;
                    originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

                    // Process queued requests
                    processQueue(null, newAccessToken);

                    // Retry original request
                    return apiClient(originalRequest);
                } catch (refreshError) {
                    // Refresh failed, redirect to login
                    processQueue(refreshError, null);
                    localStorage.removeItem('token');
                    localStorage.removeItem('refreshToken');
                    localStorage.removeItem('user');
                    window.location.href = '/';
                    return Promise.reject(refreshError);
                } finally {
                    isRefreshing = false;
                }
            }
        }
        return Promise.reject(error);
    }
);

export default apiClient;

// Custom error handler for components
export const handleApiError = (error: unknown): string => {
    if (axios.isAxiosError(error)) {
        const apiError = error.response?.data as ApiErrorResponse | undefined;

        if (apiError && !apiError.success) {
            // New backend error format
            return apiError.message || 'An error occurred';
        }

        // Fallback for other errors
        return error.message || 'An error occurred';
    }
    return 'An unexpected error occurred';
};

// Get error details for debugging
export const getApiErrorDetails = (error: unknown): {
    message: string;
    code?: string;
    details?: any;
    requestId?: string;
} => {
    if (axios.isAxiosError(error)) {
        const apiError = error.response?.data as ApiErrorResponse | undefined;

        if (apiError && !apiError.success) {
            return {
                message: apiError.message,
                code: apiError.error?.code,
                details: apiError.error?.details,
                requestId: apiError.meta?.requestId,
            };
        }
    }

    return {
        message: error instanceof Error ? error.message : 'An unexpected error occurred',
    };
};
