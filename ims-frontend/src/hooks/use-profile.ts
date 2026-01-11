import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { authApi } from '@/services/api';
import { toast } from 'sonner';

export function useProfile() {
    return useQuery({
        queryKey: ['profile'],
        queryFn: () => authApi.getProfile(),
    });
}

export function useUpdateProfile() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: authApi.updateProfile,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['profile'] });
            toast.success('Profile updated successfully!');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to update profile');
        },
    });
}

export function useChangePassword() {
    return useMutation({
        mutationFn: authApi.changePassword,
        onSuccess: () => {
            toast.success('Password changed successfully!');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to change password');
        },
    });
}
