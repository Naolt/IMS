'use client';

import { columns } from './columns';
import { DataTable } from './data-table';
import { useMemo, useEffect, useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { productsApi } from '@/services/api';

export default function InventoryTable() {
    const router = useRouter();
    const searchParams = useSearchParams();

    // Read from URL params
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';
    const brand = searchParams.get('brand') || '';

    // Local state for API data
    const [productsResponse, setProductsResponse] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isFetching, setIsFetching] = useState(false);

    // Fetch products when URL params change
    useEffect(() => {
        console.log('useEffect triggered with page:', page, 'limit:', limit);
        const fetchProducts = async () => {
            setIsFetching(true);
            try {
                const response = await productsApi.getProducts({
                    page,
                    limit,
                    search: search || undefined,
                    category: category || undefined,
                    brand: brand || undefined,
                });
                console.log('API response received for page:', page, 'data:', response);
                setProductsResponse(response);
                setIsLoading(false);
            } catch (error) {
                console.error('Error fetching products:', error);
                setIsLoading(false);
            } finally {
                setIsFetching(false);
            }
        };

        fetchProducts();
    }, [page, limit, search, category, brand]);

    // Helper to update URL params - memoized to prevent recreation
    const updateUrlParams = useCallback((updates: Record<string, string | number>) => {
        const params = new URLSearchParams(searchParams.toString());

        Object.entries(updates).forEach(([key, value]) => {
            if (value) {
                params.set(key, value.toString());
            } else {
                params.delete(key);
            }
        });

        console.log('Updating URL to:', params.toString());
        router.replace(`?${params.toString()}`, { scroll: false });
    }, [router, searchParams]);

    const handlePageChange = useCallback((newPage: number) => {
        console.log('handlePageChange called with:', newPage);
        updateUrlParams({ page: newPage });
    }, [updateUrlParams]);

    const handlePageSizeChange = useCallback((newLimit: number) => {
        updateUrlParams({ limit: newLimit, page: 1 }); // Reset to first page
    }, [updateUrlParams]);

    const handleSearchChange = useCallback((newSearch: string) => {
        updateUrlParams({ search: newSearch, page: 1 }); // Reset to first page
    }, [updateUrlParams]);

    const handleCategoryChange = useCallback((newCategory: string) => {
        updateUrlParams({ category: newCategory, page: 1 }); // Reset to first page
    }, [updateUrlParams]);

    const handleBrandChange = useCallback((newBrand: string) => {
        updateUrlParams({ brand: newBrand, page: 1 }); // Reset to first page
    }, [updateUrlParams]);

    // Flatten products with variants into inventory rows
    const inventoryData = useMemo(() => {
        if (!productsResponse?.data) return [];

        return productsResponse.data.flatMap((product) =>
            product.variants.map((variant) => {
                // Calculate stock status
                const stockStatus =
                    variant.stockQuantity === 0
                        ? ('Out of Stock' as const)
                        : variant.stockQuantity <= variant.minStockQuantity
                        ? ('Low Stock' as const)
                        : ('In Stock' as const);

                return {
                    id: variant.id,
                    productId: product.id,
                    productCode: product.code,
                    productName: product.name,
                    productCategory: product.category,
                    productBrand: product.brand || '',
                    size: variant.size,
                    color: variant.color,
                    stockQuantity: variant.stockQuantity,
                    minStockQuantity: variant.minStockQuantity,
                    buyingPrice: variant.buyingPrice,
                    sellingPrice: variant.sellingPrice,
                    imageUrl: product.imageUrl || '',
                    createdAt: new Date(variant.createdAt).toLocaleDateString(),
                    updatedAt: new Date(variant.updatedAt).toLocaleDateString(),
                    stockStatus,
                };
            })
        );
    }, [productsResponse]);

    // Build pagination object using current state (not from API response)
    // This prevents stale pagination data when using placeholderData
    const pagination = productsResponse?.pagination ? {
        page: page,  // Use current state, not API response
        limit: limit, // Use current state, not API response
        total: productsResponse.pagination.total,
        totalPages: productsResponse.pagination.totalPages,
    } : undefined;

    // Show initial loading state only on first load
    if (isLoading && !productsResponse) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4" />
                    <p className="text-muted-foreground">Loading inventory...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="relative">
            {isFetching && (
                <div className="absolute top-2 right-[100px] z-10">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                </div>
            )}
            <DataTable
                columns={columns}
                data={inventoryData}
                pagination={pagination}
                onPageChange={handlePageChange}
                onPageSizeChange={handlePageSizeChange}
                onSearchChange={handleSearchChange}
                onCategoryChange={handleCategoryChange}
                onBrandChange={handleBrandChange}
            />
        </div>
    );
}
