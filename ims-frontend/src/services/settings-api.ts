import apiClient from '@/lib/api-client';
import { ApiResponse } from '@/types/api';

export interface Setting {
    id: string;
    key: string;
    value: string;
    description?: string;
    createdAt: string;
    updatedAt: string;
}

export interface SettingsObject {
    [key: string]: string;
}

export interface BulkSettingsRequest {
    settings: Array<{
        key: string;
        value: string;
        description?: string;
    }>;
}

export const settingsApi = {
    // Get all settings as key-value object
    getAll: async () => {
        const response = await apiClient.get<ApiResponse<SettingsObject>>('/api/settings');
        return response.data;
    },

    // Get a specific setting by key
    getByKey: async (key: string) => {
        const response = await apiClient.get<ApiResponse<Setting>>(`/api/settings/${key}`);
        return response.data;
    },

    // Update a setting
    update: async (key: string, value: string, description?: string) => {
        const response = await apiClient.put<ApiResponse<Setting>>(`/api/settings/${key}`, {
            value,
            description,
        });
        return response.data;
    },

    // Update multiple settings
    updateBulk: async (data: BulkSettingsRequest) => {
        const response = await apiClient.post<ApiResponse<Setting[]>>('/api/settings/bulk', data);
        return response.data;
    },

    // Delete a setting
    delete: async (key: string) => {
        const response = await apiClient.delete<ApiResponse<null>>(`/api/settings/${key}`);
        return response.data;
    },
};
