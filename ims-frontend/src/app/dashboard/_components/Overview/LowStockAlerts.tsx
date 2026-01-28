'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLowStock } from '@/hooks/use-low-stock';
import { Loader2 } from 'lucide-react';

export default function LowStockAlerts() {
    const { data: variants, isLoading } = useLowStock();

    if (isLoading) {
        return (
            <Card className="h-full">
                <CardHeader>
                    <CardTitle>Low-Stock Alerts</CardTitle>
                </CardHeader>
                <CardContent className="flex items-center justify-center py-12">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </CardContent>
            </Card>
        );
    }

    const lowStockItems = variants?.data?.slice(0, 5) || [];

    return (
        <Card className="h-full">
            <CardHeader>
                <CardTitle>Low-Stock Alerts</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-6">
                {lowStockItems.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-8">
                        No low stock items
                    </p>
                ) : (
                    lowStockItems.map((variant) => (
                        <ProductCard
                            key={variant.id}
                            product={{
                                name: `${variant.product?.name || 'Unknown'} (${variant.size}/${variant.color})`,
                                itemsLeft: variant.stockQuantity
                            }}
                        />
                    ))
                )}
            </CardContent>
        </Card>
    );
}

function ProductCard({
    product
}: {
    product: {
        name: string;
        itemsLeft: number;
    };
}) {
    return (
        <div className="flex justify-between items-center gap-2">
            <h3 className="text-sm">{product.name}</h3>
            <p className="text-xs text-muted-foreground text-right shrink-0">
                {product.itemsLeft} left
            </p>
        </div>
    );
}
