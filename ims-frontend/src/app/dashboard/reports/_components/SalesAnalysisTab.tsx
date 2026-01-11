'use client';

import { useState, useMemo } from 'react';
import { format, subDays, startOfMonth, startOfYear, endOfDay, startOfDay } from 'date-fns';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
    Popover,
    PopoverContent,
    PopoverTrigger
} from '@/components/ui/popover';
import { formatCurrency, cn } from '@/lib/utils';
import {
    TrendingUp,
    DollarSign,
    ShoppingCart,
    CalendarIcon,
    Package,
    Loader2,
    TrendingDown
} from 'lucide-react';
import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    ChartLegend,
    ChartLegendContent,
} from '@/components/ui/chart';
import {
    Area,
    AreaChart,
    Bar,
    BarChart,
    CartesianGrid,
    Line,
    LineChart,
    XAxis,
    YAxis,
} from 'recharts';
import { useSalesAnalytics } from '@/hooks/use-sales';
import { DateRange } from 'react-day-picker';

export default function SalesAnalysisTab() {
    const [dateRange, setDateRange] = useState<DateRange | undefined>({
        from: subDays(new Date(), 30),
        to: new Date(),
    });

    const analyticsParams = useMemo(() => {
        if (!dateRange?.from || !dateRange?.to) return {};
        return {
            startDate: format(startOfDay(dateRange.from), 'yyyy-MM-dd'),
            endDate: format(endOfDay(dateRange.to), 'yyyy-MM-dd'),
        };
    }, [dateRange]);

    const { data: analytics, isLoading } = useSalesAnalytics(analyticsParams);

    const salesTrendData = useMemo(() => {
        if (!analytics?.data?.salesByDate) return [];
        return analytics.data.salesByDate.map(d => ({
            date: format(new Date(d.date), 'MMM dd'),
            revenue: d.revenue,
            profit: d.profit,
        }));
    }, [analytics]);

    const topProductsData = useMemo(() => {
        if (!analytics?.data?.topSellingProducts) return [];
        return analytics.data.topSellingProducts.slice(0, 8).map(p => ({
            name: p.productName.length > 20 ? p.productName.substring(0, 20) + '...' : p.productName,
            revenue: p.totalRevenue,
        }));
    }, [analytics]);

    const chartConfig = {
        revenue: {
            label: 'Revenue',
            color: 'hsl(var(--chart-1))',
        },
        profit: {
            label: 'Profit',
            color: 'hsl(var(--chart-2))',
        },
    } satisfies ChartConfig;

    const handleQuickRange = (range: string) => {
        const now = new Date();
        let from: Date;
        let to: Date = now;

        switch (range) {
            case 'today':
                from = startOfDay(now);
                to = endOfDay(now);
                break;
            case 'yesterday':
                from = startOfDay(subDays(now, 1));
                to = endOfDay(subDays(now, 1));
                break;
            case '7days':
                from = startOfDay(subDays(now, 6)); // Last 7 days including today
                to = endOfDay(now);
                break;
            case '30days':
                from = startOfDay(subDays(now, 29)); // Last 30 days including today
                to = endOfDay(now);
                break;
            case 'thisMonth':
                from = startOfMonth(now);
                to = endOfDay(now); // Up to now, not end of month
                break;
            case 'thisYear':
                from = startOfYear(now);
                to = endOfDay(now);
                break;
            default:
                from = startOfDay(subDays(now, 29));
                to = endOfDay(now);
        }

        setDateRange({ from, to });
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    const profitMargin = analytics?.data?.totalRevenue && analytics?.data?.totalProfit
        ? ((analytics.data.totalProfit / analytics.data.totalRevenue) * 100).toFixed(1)
        : '0';

    return (
        <div className="space-y-6">
            {/* Date Range Selector */}
            <Card>
                <CardHeader>
                    <CardTitle>Date Range</CardTitle>
                    <CardDescription>Select a period to analyze sales performance</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex flex-wrap gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleQuickRange('today')}>
                            Today
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleQuickRange('yesterday')}>
                            Yesterday
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleQuickRange('7days')}>
                            Last 7 Days
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleQuickRange('30days')}>
                            Last 30 Days
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleQuickRange('thisMonth')}>
                            This Month
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleQuickRange('thisYear')}>
                            This Year
                        </Button>
                    </div>

                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant="outline"
                                className={cn(
                                    'w-full justify-start text-left font-normal',
                                    !dateRange && 'text-muted-foreground'
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
                                    <span>Pick a date range</span>
                                )}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                                mode="range"
                                selected={dateRange}
                                onSelect={setDateRange}
                                numberOfMonths={2}
                                disabled={(date) =>
                                    date > new Date() || date < new Date('2000-01-01')
                                }
                            />
                        </PopoverContent>
                    </Popover>
                </CardContent>
            </Card>

            {/* Key Metrics */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {formatCurrency(analytics?.data?.totalRevenue || 0)}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {analytics?.data?.totalSales || 0} transactions
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Profit</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {formatCurrency(analytics?.data?.totalProfit || 0)}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {profitMargin}% profit margin
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Average Order</CardTitle>
                        <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {formatCurrency(analytics?.data?.averageOrderValue || 0)}
                        </div>
                        <p className="text-xs text-muted-foreground">Per transaction</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Transactions</CardTitle>
                        <Package className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{analytics?.data?.totalSales || 0}</div>
                        <p className="text-xs text-muted-foreground">Sales completed</p>
                    </CardContent>
                </Card>
            </div>

            {/* Revenue & Profit Trend */}
            <Card>
                <CardHeader>
                    <CardTitle>Revenue & Profit Trend</CardTitle>
                    <CardDescription>
                        Daily revenue and profit performance over time
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {salesTrendData.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-[350px] text-center">
                            <TrendingDown className="h-12 w-12 text-muted-foreground/50 mb-4" />
                            <p className="text-muted-foreground">No sales data for selected period</p>
                            <p className="text-sm text-muted-foreground mt-1">Try selecting a different date range</p>
                        </div>
                    ) : (
                        <ChartContainer config={chartConfig} className="h-[350px] w-full">
                            <AreaChart data={salesTrendData}>
                                <defs>
                                    <linearGradient id="fillRevenue" x1="0" y1="0" x2="0" y2="1">
                                        <stop
                                            offset="5%"
                                            stopColor="var(--color-revenue)"
                                            stopOpacity={0.8}
                                        />
                                        <stop
                                            offset="95%"
                                            stopColor="var(--color-revenue)"
                                            stopOpacity={0.1}
                                        />
                                    </linearGradient>
                                    <linearGradient id="fillProfit" x1="0" y1="0" x2="0" y2="1">
                                        <stop
                                            offset="5%"
                                            stopColor="var(--color-profit)"
                                            stopOpacity={0.8}
                                        />
                                        <stop
                                            offset="95%"
                                            stopColor="var(--color-profit)"
                                            stopOpacity={0.1}
                                        />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis
                                    dataKey="date"
                                    tickLine={false}
                                    axisLine={false}
                                    tickMargin={8}
                                />
                                <YAxis
                                    tickLine={false}
                                    axisLine={false}
                                    tickMargin={8}
                                    tickFormatter={(value) => `$${value}`}
                                />
                                <ChartTooltip content={<ChartTooltipContent indicator="dot" />} />
                                <ChartLegend content={<ChartLegendContent />} />
                                <Area
                                    type="monotone"
                                    dataKey="revenue"
                                    stroke="var(--color-revenue)"
                                    fill="url(#fillRevenue)"
                                    strokeWidth={2}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="profit"
                                    stroke="var(--color-profit)"
                                    fill="url(#fillProfit)"
                                    strokeWidth={2}
                                />
                            </AreaChart>
                        </ChartContainer>
                    )}
                </CardContent>
            </Card>

            {/* Top Products */}
            <Card>
                <CardHeader>
                    <CardTitle>Top Selling Products</CardTitle>
                    <CardDescription>Products ranked by total revenue generated</CardDescription>
                </CardHeader>
                <CardContent>
                    {topProductsData.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-[350px] text-center">
                            <Package className="h-12 w-12 text-muted-foreground/50 mb-4" />
                            <p className="text-muted-foreground">No product data for selected period</p>
                        </div>
                    ) : (
                        <ChartContainer
                            config={{
                                revenue: {
                                    label: 'Revenue',
                                    color: 'hsl(var(--chart-1))',
                                },
                            }}
                            className="h-[350px] w-full"
                        >
                            <BarChart data={topProductsData} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                                <XAxis type="number" tickFormatter={(value) => `$${value}`} />
                                <YAxis
                                    type="category"
                                    dataKey="name"
                                    width={150}
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                                <Bar
                                    dataKey="revenue"
                                    fill="var(--color-revenue)"
                                    radius={[0, 4, 4, 0]}
                                />
                            </BarChart>
                        </ChartContainer>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
