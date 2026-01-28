'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useSalesAnalytics } from '@/hooks/use-sales-analytics';
import { Loader2 } from 'lucide-react';

export default function TopSellingProducts() {
    const { data: analytics, isLoading } = useSalesAnalytics();

    if (isLoading) {
        return (
            <Card className="h-full">
                <CardHeader>
                    <CardTitle>Top Selling Products</CardTitle>
                </CardHeader>
                <CardContent className="flex items-center justify-center py-12">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </CardContent>
            </Card>
        );
    }

    const topProducts = analytics?.data?.topSellingProducts?.slice(0, 5) || [];

    return (
        <Card className="h-full">
            <CardHeader>
                <CardTitle>Top Selling Products</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-6">
                {topProducts.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-8">
                        No sales data available
                    </p>
                ) : (
                    topProducts.map((product) => (
                        <ProductCard
                            key={product.variantId}
                            product={{
                                name: `${product.productName} (${product.size}/${product.color})`,
                                itemsSold: product.totalQuantity
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
        itemsSold: number;
    };
}) {
    return (
        <div className="flex justify-between items-center gap-2">
            <h3 className="text-sm">{product.name}</h3>
            <p className="text-xs text-muted-foreground text-right shrink-0">
                {product.itemsSold} sold
            </p>
        </div>
    );
}
