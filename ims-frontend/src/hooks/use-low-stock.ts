import { useQuery } from '@tanstack/react-query';
import { productsApi } from '@/services/api';

export function useLowStock() {
    return useQuery({
        queryKey: ['low-stock'],
        queryFn: () => productsApi.getLowStock(),
        refetchInterval: 60000, // Refetch every minute
    });
}
