import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function LowStockAlerts() {
    return (
        <Card className="h-full">
            <CardHeader>
                <CardTitle>Low-Stock Alerts</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-6">
                <ProductCard
                    product={{
                        name: 'Product 1',
                        itemsLeft: 100
                    }}
                />
                <ProductCard
                    product={{
                        name: 'Product 2',
                        itemsLeft: 80
                    }}
                />
                <ProductCard
                    product={{
                        name: 'Product 3',
                        itemsLeft: 60
                    }}
                />
                <ProductCard
                    product={{
                        name: 'Product 4',
                        itemsLeft: 40
                    }}
                />
                <ProductCard
                    product={{
                        name: 'Product 5',
                        itemsLeft: 20
                    }}
                />
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
        <div className="flex justify-between items-center">
            <h3 className="text-sm">{product.name}</h3>
            <p className="text-xs text-muted-foreground">
                {product.itemsLeft} Left
            </p>
        </div>
    );
}
