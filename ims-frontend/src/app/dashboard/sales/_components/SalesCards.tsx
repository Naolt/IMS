'use client';

import { useState, useCallback, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSales, useSalesAnalytics } from '@/hooks/use-sales';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    ChevronLeft,
    ChevronRight,
    ShoppingCart,
    Search,
    DollarSign,
    TrendingUp,
    Package,
    CalendarIcon,
    X,
} from 'lucide-react';
import { formatCurrency, cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { DateRange } from 'react-day-picker';

export default function SalesCards() {
    const router = useRouter();
    const searchParams = useSearchParams();

    // Read from URL params
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const search = searchParams.get('search') || '';
    const startDate = searchParams.get('startDate') || undefined;
    const endDate = searchParams.get('endDate') || undefined;

    // Local state
    const [searchInput, setSearchInput] = useState(search);
    const [dateRange, setDateRange] = useState<DateRange | undefined>(
        startDate && endDate
            ? {
                  from: new Date(startDate),
                  to: new Date(endDate),
              }
            : undefined
    );
    const [isCalendarOpen, setIsCalendarOpen] = useState(false);

    // Fetch analytics
    const { data: analytics } = useSalesAnalytics({
        startDate,
        endDate,
    });

    // Fetch sales using React Query
    const { data: salesResponse, isLoading } = useSales({
        page,
        limit,
        startDate,
        endDate,
    });

    // Update URL params
    const updateUrlParams = useCallback(
        (updates: Record<string, string | number | undefined>) => {
            const params = new URLSearchParams(searchParams.toString());

            Object.entries(updates).forEach(([key, value]) => {
                if (value !== undefined && value !== '') {
                    params.set(key, value.toString());
                } else {
                    params.delete(key);
                }
            });

            router.replace(`?${params.toString()}`, { scroll: false });
        },
        [router, searchParams]
    );

    // Handle date range changes
    const handleDateRangeChange = useCallback((range: DateRange | undefined) => {
        setDateRange(range);
        if (range?.from && range?.to) {
            updateUrlParams({
                startDate: range.from.toISOString(),
                endDate: range.to.toISOString(),
                page: 1,
            });
            setIsCalendarOpen(false);
        } else if (!range) {
            updateUrlParams({
                startDate: undefined,
                endDate: undefined,
                page: 1,
            });
        }
    }, [updateUrlParams]);

    // Handlers
    const handleSearch = useCallback(() => {
        updateUrlParams({ search: searchInput, page: 1 });
    }, [searchInput, updateUrlParams]);

    const handlePageChange = useCallback(
        (newPage: number) => {
            updateUrlParams({ page: newPage });
        },
        [updateUrlParams]
    );

    const handleResetFilters = useCallback(() => {
        setSearchInput('');
        handleDateRangeChange(undefined);
    }, [handleDateRangeChange]);

    // Transform sales data
    const salesData = useMemo(() => {
        if (!salesResponse?.data) return [];

        let filtered = salesResponse.data;

        // Client-side search filter
        if (search) {
            const searchLower = search.toLowerCase();
            filtered = filtered.filter(
                (sale: any) =>
                    sale.variant?.product?.name
                        ?.toLowerCase()
                        .includes(searchLower) ||
                    sale.variant?.product?.code
                        ?.toLowerCase()
                        .includes(searchLower) ||
                    sale.customerName?.toLowerCase().includes(searchLower)
            );
        }

        return filtered.map((sale: any) => ({
            id: sale.id,
            saleDate: new Date(sale.saleDate),
            productName: sale.variant?.product?.name || 'N/A',
            productCode: sale.variant?.product?.code || 'N/A',
            size: sale.variant?.size || 'N/A',
            color: sale.variant?.color || 'N/A',
            quantity: sale.quantity,
            sellingPrice: sale.sellingPrice,
            totalAmount: sale.totalAmount,
            customerName: sale.customerName,
            soldBy: sale.user?.name || 'Unknown',
        }));
    }, [salesResponse, search]);

    const pagination = salesResponse?.pagination;

    if (isLoading) {
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
                            {analytics?.data?.topSellingProducts &&
                            analytics.data.topSellingProducts.length > 0
                                ? analytics.data.topSellingProducts[0].productName
                                : 'N/A'}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {analytics?.data?.topSellingProducts &&
                            analytics.data.topSellingProducts.length > 0
                                ? `${analytics.data.topSellingProducts[0].totalQuantity} units sold`
                                : 'No sales yet'}
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Search and Filters */}
            <Card>
                <CardContent className="pt-6">
                    <div className="flex flex-col md:flex-row gap-2">
                        <div className="flex gap-2 flex-1">
                            <Input
                                placeholder="Search sales by product or customer..."
                                value={searchInput}
                                onChange={(e) => setSearchInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                className="flex-1"
                            />
                            <Button onClick={handleSearch} size="icon">
                                <Search className="h-4 w-4" />
                            </Button>
                        </div>

                        <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className={cn(
                                        'w-full md:w-auto border-dashed',
                                        dateRange && 'border-primary'
                                    )}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {dateRange?.from ? (
                                        dateRange.to ? (
                                            <>
                                                {format(dateRange.from, 'LLL dd, y')} -{' '}
                                                {format(dateRange.to, 'LLL dd, y')}
                                            </>
                                        ) : (
                                            format(dateRange.from, 'LLL dd, y')
                                        )
                                    ) : (
                                        <span>Date Range</span>
                                    )}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                    mode="range"
                                    selected={dateRange}
                                    onSelect={handleDateRangeChange}
                                    numberOfMonths={2}
                                    disabled={(date) =>
                                        date > new Date() || date < new Date('2000-01-01')
                                    }
                                />
                            </PopoverContent>
                        </Popover>

                        {(searchInput || dateRange) && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleResetFilters}
                            >
                                Reset
                                <X className="ml-2 h-4 w-4" />
                            </Button>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Sales Cards */}
            {salesData.length === 0 ? (
                <Card>
                    <CardContent className="flex flex-col items-center justify-center h-64">
                        <ShoppingCart className="h-12 w-12 text-muted-foreground mb-4" />
                        <p className="text-lg font-medium">No sales found</p>
                        <p className="text-sm text-muted-foreground">
                            Try adjusting your filters
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {salesData.map((sale) => (
                        <Card
                            key={sale.id}
                            className="hover:shadow-lg transition-shadow"
                        >
                            <CardHeader>
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <CardTitle className="text-lg line-clamp-1">
                                            {sale.productName}
                                        </CardTitle>
                                        <p className="text-sm text-muted-foreground">
                                            {sale.productCode}
                                        </p>
                                    </div>
                                    <Badge variant="secondary">
                                        {format(sale.saleDate, 'MMM dd')}
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex gap-2">
                                    <Badge variant="outline">{sale.size}</Badge>
                                    <Badge variant="outline">{sale.color}</Badge>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">
                                            Quantity:
                                        </span>
                                        <span className="font-medium">
                                            {sale.quantity} units
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">
                                            Unit Price:
                                        </span>
                                        <span>
                                            {formatCurrency(sale.sellingPrice)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-sm border-t pt-2">
                                        <span className="text-muted-foreground font-medium">
                                            Total:
                                        </span>
                                        <span className="font-bold text-primary">
                                            {formatCurrency(sale.totalAmount)}
                                        </span>
                                    </div>
                                </div>

                                <div className="space-y-1 pt-2 border-t">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">
                                            Customer:
                                        </span>
                                        <span className="font-medium">
                                            {sale.customerName}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">
                                            Sold by:
                                        </span>
                                        <span>{sale.soldBy}</span>
                                    </div>
                                    <div className="text-xs text-muted-foreground text-right">
                                        {format(sale.saleDate, 'PPp')}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                            <p className="text-sm text-muted-foreground text-center sm:text-left">
                                Showing {(page - 1) * limit + 1} to{' '}
                                {Math.min(page * limit, pagination.total)} of{' '}
                                {pagination.total} sales
                            </p>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handlePageChange(page - 1)}
                                    disabled={page === 1}
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                    <span className="hidden sm:inline ml-1">Previous</span>
                                </Button>
                                <div className="hidden sm:flex items-center gap-1">
                                    {Array.from(
                                        { length: pagination.totalPages },
                                        (_, i) => i + 1
                                    )
                                        .filter(
                                            (p) =>
                                                p === 1 ||
                                                p === pagination.totalPages ||
                                                (p >= page - 1 && p <= page + 1)
                                        )
                                        .map((p, idx, arr) => (
                                            <div key={p} className="flex items-center gap-1">
                                                {idx > 0 && arr[idx - 1] !== p - 1 && (
                                                    <span className="px-2">...</span>
                                                )}
                                                <Button
                                                    variant={
                                                        p === page ? 'default' : 'outline'
                                                    }
                                                    size="sm"
                                                    onClick={() => handlePageChange(p)}
                                                >
                                                    {p}
                                                </Button>
                                            </div>
                                        ))}
                                </div>
                                <span className="sm:hidden text-sm font-medium">
                                    {page} / {pagination.totalPages}
                                </span>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handlePageChange(page + 1)}
                                    disabled={page === pagination.totalPages}
                                >
                                    <span className="hidden sm:inline mr-1">Next</span>
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
