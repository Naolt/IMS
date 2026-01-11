import { useQuery } from '@tanstack/react-query';
import { productsApi } from '@/services/api';

export function useCategories() {
    return useQuery({
        queryKey: ['categories'],
        queryFn: productsApi.getCategories,
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
}

export function useBrands() {
    return useQuery({
        queryKey: ['brands'],
        queryFn: productsApi.getBrands,
        staleTime: 5 * 60 * 1000,
    });
}

export function useSizes() {
    return useQuery({
        queryKey: ['sizes'],
        queryFn: productsApi.getSizes,
        staleTime: 5 * 60 * 1000,
    });
}

export function useColors() {
    return useQuery({
        queryKey: ['colors'],
        queryFn: productsApi.getColors,
        staleTime: 5 * 60 * 1000,
    });
}
