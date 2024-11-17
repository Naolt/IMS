import { DataTable } from '@/components/data-table';
import { columns } from './columns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency, formatDate } from '@/lib/utils';

const salesData = [
    {
        date: formatDate('2021-09-01'),
        category: 'Electronics',
        quantity: 10,
        sellingPrice: formatCurrency(1000),
        profit: formatCurrency(500)
    },
    {
        date: formatDate('2021-09-02'),
        category: 'Electronics',
        quantity: 10,
        sellingPrice: formatCurrency(1000),
        profit: formatCurrency(500)
    },
    {
        date: formatDate('2021-09-03'),
        category: 'Electronics',
        quantity: 10,
        sellingPrice: formatCurrency(1000),
        profit: formatCurrency(500)
    },
    {
        date: formatDate('2021-09-04'),
        category: 'Electronics',
        quantity: 10,
        sellingPrice: formatCurrency(1000),
        profit: formatCurrency(500)
    },
    {
        date: formatDate('2021-09-05'),
        category: 'Electronics',
        quantity: 10,
        sellingPrice: formatCurrency(1000),
        profit: formatCurrency(500)
    }
];

export default function SalesTable() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Recent Sales Activity</CardTitle>
            </CardHeader>
            <CardContent>
                <DataTable columns={columns} data={salesData} />
            </CardContent>
        </Card>
    );
}
