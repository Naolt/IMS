'use client';

import { DollarSign, TrendingUp, ShoppingCart, Package } from 'lucide-react';
import StatCard from './_components/Overview/StatCards';
import { SalesTrendChart } from './_components/Overview/SalesTrendChart';
import TopSellingProducts from './_components/Overview/TopSellingProducts';
import { DataTable } from '@/components/data-table';
import SalesTable from './_components/Overview/SalesTable';
import LowStockAlerts from './_components/Overview/LowStockAlerts';
import { useSalesAnalytics } from '@/hooks/use-sales-analytics';

export default function Dashboard() {
    const { data: analytics, isLoading } = useSalesAnalytics();

    const statCards = [
        {
            title: 'Total Revenue',
            value: isLoading
                ? '...'
                : `$${analytics?.data?.totalRevenue?.toLocaleString() || '0'}`,
            icon: <DollarSign />,
            color: 'green' as const,
        },
        {
            title: 'Total Profit',
            value: isLoading
                ? '...'
                : `$${analytics?.data?.totalProfit?.toLocaleString() || '0'}`,
            icon: <TrendingUp />,
            color: 'blue' as const,
        },
        {
            title: 'Average Order',
            value: isLoading
                ? '...'
                : `$${analytics?.data?.averageOrderValue?.toFixed(2) || '0'}`,
            icon: <ShoppingCart />,
            color: 'yellow' as const,
        },
        {
            title: 'Total Sales',
            value: isLoading ? '...' : `${analytics?.data?.totalSales || '0'}`,
            icon: <Package />,
            color: 'red' as const,
        },
    ];

    return (
        <div className="grid grid-cols-4 gap-7">
            <div className="col-span-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {statCards.map((card) => (
                    <StatCard key={card.title} {...card} />
                ))}
            </div>
            <div className="col-span-4 order-1 md:col-span-3">
                <SalesTrendChart />
            </div>
            <div className="col-span-4 order-1 sm:col-span-2 md:col-span-1">
                <TopSellingProducts />
            </div>

            <div className="col-span-4 order-2 md:col-span-3 md:order-1">
                <SalesTable />
            </div>
            <div className="col-span-4 order-1 sm:col-span-2 md:col-span-1">
                <LowStockAlerts />
            </div>
        </div>
    );
}
