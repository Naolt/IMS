import { DollarSign, TrendingUp, ShoppingCart, Package } from 'lucide-react';
import StatCard from './_components/Overview/StatCards';
import { SalesTrendChart } from './_components/Overview/SalesTrendChart';
import TopSellingProducts from './_components/Overview/TopSellingProducts';
import { DataTable } from '@/components/data-table';
import SalesTable from './_components/Overview/SalesTable';
import LowStockAlerts from './_components/Overview/LowStockAlerts';

const statCards = [
    {
        title: 'Total Sales',
        value: '$50,000',
        icon: <DollarSign />,
        color: 'green' as const
    },
    {
        title: 'Total Profit',
        value: '$20,000',
        icon: <TrendingUp />,
        color: 'blue' as const
    },
    {
        title: 'Total Expenses',
        value: '$100,000',
        icon: <ShoppingCart />,
        color: 'yellow' as const
    },
    {
        title: 'Total Products',
        value: '200',
        icon: <Package />,
        color: 'red' as const
    }
];

export default function Dashboard() {
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
