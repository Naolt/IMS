import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { salesApi } from '@/services/api';
import { toast } from 'sonner';

export function useSales(params?: {
    page?: number;
    limit?: number;
    startDate?: string;
    endDate?: string;
    variantId?: string;
    userId?: string;
}) {
    return useQuery({
        queryKey: ['sales', params],
        queryFn: () => salesApi.getSales(params),
    });
}

export function useSalesAnalytics(params?: {
    startDate?: string;
    endDate?: string;
}) {
    return useQuery({
        queryKey: ['sales-analytics', params],
        queryFn: () => salesApi.getAnalytics(params),
    });
}

export function useSale(id: string) {
    return useQuery({
        queryKey: ['sale', id],
        queryFn: () => salesApi.getSaleById(id),
        enabled: !!id,
    });
}

export function useCreateSale() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: salesApi.createSale,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['sales'] });
            queryClient.invalidateQueries({ queryKey: ['sales-analytics'] });
            queryClient.invalidateQueries({ queryKey: ['products'] });
            toast.success('Sale recorded successfully!');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to record sale');
        },
    });
}

export function useDeleteSale() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: salesApi.deleteSale,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['sales'] });
            queryClient.invalidateQueries({ queryKey: ['sales-analytics'] });
            toast.success('Sale deleted successfully!');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to delete sale');
        },
    });
}
