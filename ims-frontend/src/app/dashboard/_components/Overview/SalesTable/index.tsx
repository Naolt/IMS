'use client';

import { useMemo } from 'react';
import { columns } from './columns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency, formatDate } from '@/lib/utils';
import { BasicTable } from '@/components/basic-table';
import { useSales } from '@/hooks/use-sales';
import { Loader2 } from 'lucide-react';

export default function SalesTable() {
    const { data: salesResponse, isLoading } = useSales({ limit: 10 });

    const salesData = useMemo(() => {
        if (!salesResponse?.data) return [];

        return salesResponse.data.map((sale) => {
            const buyingPrice = sale.variant?.buyingPrice || 0;
            const profit = (sale.sellingPrice - buyingPrice) * sale.quantity;

            return {
                date: formatDate(sale.saleDate),
                product: sale.variant?.product?.name || 'Unknown',
                variant: sale.variant ? `${sale.variant.size}/${sale.variant.color}` : 'N/A',
                quantity: sale.quantity,
                sellingPrice: formatCurrency(sale.totalAmount),
                profit: formatCurrency(profit)
            };
        });
    }, [salesResponse]);

    return (
        <Card>
            <CardHeader>
                <CardTitle>Recent Sales Activity</CardTitle>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                ) : salesData.length === 0 ? (
                    <div className="flex items-center justify-center py-12">
                        <p className="text-sm text-muted-foreground">No recent sales</p>
                    </div>
                ) : (
                    <BasicTable columns={columns} data={salesData} />
                )}
            </CardContent>
        </Card>
    );
}
