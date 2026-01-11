'use client';

import { useMemo, useEffect, useState, useCallback } from 'react';
import { columns } from './columns';
import { DataTable } from './data-table';
import { useSalesAnalytics } from '@/hooks/use-sales';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';
import { DollarSign, ShoppingCart, TrendingUp, Package } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { salesApi } from '@/services/api';

export default function SalesHistoryTable() {
    const router = useRouter();
    const searchParams = useSearchParams();

    // Read from URL params
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const startDate = searchParams.get('startDate') || undefined;
    const endDate = searchParams.get('endDate') || undefined;

    // Local state for API data
    const [salesResponse, setSalesResponse] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isFetching, setIsFetching] = useState(false);

    // Fetch sales when URL params change
    useEffect(() => {
        const fetchSales = async () => {
            setIsFetching(true);
            try {
                const response = await salesApi.getSales({
                    page,
                    limit,
                    startDate,
                    endDate,
                });
                setSalesResponse(response);
                setIsLoading(false);
            } catch (error) {
                console.error('Error fetching sales:', error);
                setIsLoading(false);
            } finally {
                setIsFetching(false);
            }
        };

        fetchSales();
    }, [page, limit, startDate, endDate]);

    // Helper to update URL params - memoized to prevent recreation
    const updateUrlParams = useCallback((updates: Record<string, string | number | undefined>) => {
        const params = new URLSearchParams(searchParams.toString());

        Object.entries(updates).forEach(([key, value]) => {
            if (value !== undefined && value !== '') {
                params.set(key, value.toString());
            } else {
                params.delete(key);
            }
        });

        router.replace(`?${params.toString()}`, { scroll: false });
    }, [router, searchParams]);

    const { data: analytics } = useSalesAnalytics({
        startDate,
        endDate,
    });

    // Transform sales data for the table
    const salesData = useMemo(() => {
        if (!salesResponse?.data) return [];

        let filtered = salesResponse.data;

        // Client-side search filter (since backend doesn't support it yet)
        if (search) {
            const searchLower = search.toLowerCase();
            filtered = filtered.filter(
                (sale) =>
                    sale.variant?.product?.name
                        ?.toLowerCase()
                        .includes(searchLower) ||
                    sale.variant?.product?.code
                        ?.toLowerCase()
                        .includes(searchLower) ||
                    sale.customerName?.toLowerCase().includes(searchLower)
            );
        }

        return filtered.map((sale) => ({
            id: sale.id,
            saleDate: new Date(sale.saleDate),
            productName: sale.variant?.product?.name || 'N/A',
            productCode: sale.variant?.product?.code || 'N/A',
            variant: sale.variant
                ? `${sale.variant.size} - ${sale.variant.color}`
                : 'N/A',
            size: sale.variant?.size || 'N/A',
            color: sale.variant?.color || 'N/A',
            quantity: sale.quantity,
            sellingPrice: sale.sellingPrice,
            totalAmount: sale.totalAmount,
            customerName: sale.customerName,
            soldBy: sale.user?.name || 'Unknown',
        }));
    }, [salesResponse, search]);

    // Build pagination object using current state (not from API response)
    // This prevents stale pagination data when using placeholderData
    const pagination = salesResponse?.pagination ? {
        page: page,  // Use current state, not API response
        limit: limit, // Use current state, not API response
        total: salesResponse.pagination.total,
        totalPages: salesResponse.pagination.totalPages,
    } : undefined;

    const handlePageChange = useCallback((newPage: number) => {
        updateUrlParams({ page: newPage });
    }, [updateUrlParams]);

    const handlePageSizeChange = useCallback((newLimit: number) => {
        updateUrlParams({ limit: newLimit, page: 1 }); // Reset to first page
    }, [updateUrlParams]);

    const handleSearchChange = useCallback((searchValue: string) => {
        updateUrlParams({ search: searchValue, page: 1 }); // Reset to first page
    }, [updateUrlParams]);

    const handleDateRangeChange = useCallback((start?: string, end?: string) => {
        updateUrlParams({
            startDate: start,
            endDate: end,
            page: 1
        }); // Reset to first page when filters change
    }, [updateUrlParams]);

    // Show initial loading state only on first load
    if (isLoading && !salesResponse) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4" />
                    <p className="text-muted-foreground">Loading sales history...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Analytics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Total Revenue
                        </CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {formatCurrency(analytics?.data?.totalRevenue || 0)}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {startDate && endDate ? 'For selected period' : 'All time'}
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Total Transactions
                        </CardTitle>
                        <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {analytics?.data?.totalSales || 0}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {startDate && endDate ? 'For selected period' : 'All time'}
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Average Sale Value
                        </CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {formatCurrency(analytics?.data?.averageOrderValue || 0)}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Per transaction
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Top Selling Product
                        </CardTitle>
                        <Package className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-lg font-bold truncate">
                            {analytics?.data?.topSellingProducts && analytics.data.topSellingProducts.length > 0
                                ? analytics.data.topSellingProducts[0].productName
                                : 'N/A'}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {analytics?.data?.topSellingProducts && analytics.data.topSellingProducts.length > 0
                                ? `${analytics.data.topSellingProducts[0].totalQuantity} units sold`
                                : 'No sales yet'}
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Sales Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Sales History</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="relative">
                        {isFetching && (
                            <div className="absolute top-2 right-2 z-10">
                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                            </div>
                        )}
                        <DataTable
                            columns={columns}
                            data={salesData}
                            pagination={pagination}
                            onPageChange={handlePageChange}
                            onPageSizeChange={handlePageSizeChange}
                            onSearchChange={handleSearchChange}
                            onDateRangeChange={handleDateRangeChange}
                        />
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
