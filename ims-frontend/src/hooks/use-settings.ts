import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { settingsApi } from '@/services/settings-api';
import { toast } from 'sonner';

export function useSettings() {
    return useQuery({
        queryKey: ['settings'],
        queryFn: () => settingsApi.getAll(),
    });
}

export function useSetting(key: string, enabled = true) {
    return useQuery({
        queryKey: ['setting', key],
        queryFn: () => settingsApi.getByKey(key),
        enabled: enabled && !!key,
    });
}

export function useUpdateSetting() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ key, value, description }: { key: string; value: string; description?: string }) =>
            settingsApi.update(key, value, description),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['settings'] });
            toast.success('Setting updated successfully');
        },
        onError: (error: any) => {
            const errorMessage = error.response?.data?.message || 'Failed to update setting';
            toast.error(errorMessage);
        },
    });
}

export function useUpdateSettings() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: settingsApi.updateBulk,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['settings'] });
            toast.success('Settings updated successfully');
        },
        onError: (error: any) => {
            const errorMessage = error.response?.data?.message || 'Failed to update settings';
            toast.error(errorMessage);
        },
    });
}

export function useUploadLogo() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (file: File) => settingsApi.uploadLogo(file),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['settings'] });
            toast.success('Logo uploaded successfully');
        },
        onError: (error: any) => {
            const errorMessage = error.response?.data?.message || 'Failed to upload logo';
            toast.error(errorMessage);
        },
    });
}

export function useDeleteSetting() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (key: string) => settingsApi.delete(key),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['settings'] });
            toast.success('Setting deleted successfully');
        },
        onError: (error: any) => {
            const errorMessage = error.response?.data?.message || 'Failed to delete setting';
            toast.error(errorMessage);
        },
    });
}
