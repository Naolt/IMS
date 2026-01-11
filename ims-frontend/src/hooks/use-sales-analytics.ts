import { useQuery } from '@tanstack/react-query';
import { salesApi } from '@/services/api';

export function useSalesAnalytics(params?: {
    startDate?: string;
    endDate?: string;
}) {
    return useQuery({
        queryKey: ['sales-analytics', params],
        queryFn: () => salesApi.getAnalytics(params),
    });
}
