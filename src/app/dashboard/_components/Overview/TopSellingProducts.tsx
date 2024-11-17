import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function TopSellingProducts() {
    return (
        <Card className="h-full">
            <CardHeader>
                <CardTitle>Top Selling Products</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-6">
                <ProductCard
                    product={{
                        name: 'Product 1',
                        itemsSold: 100
                    }}
                />
                <ProductCard
                    product={{
                        name: 'Product 2',
                        itemsSold: 80
                    }}
                />
                <ProductCard
                    product={{
                        name: 'Product 3',
                        itemsSold: 60
                    }}
                />
                <ProductCard
                    product={{
                        name: 'Product 4',
                        itemsSold: 40
                    }}
                />
                <ProductCard
                    product={{
                        name: 'Product 5',
                        itemsSold: 20
                    }}
                />
                <ProductCard
                    product={{
                        name: 'Product 6',
                        itemsSold: 10
                    }}
                />
                <ProductCard
                    product={{
                        name: 'Product 7',
                        itemsSold: 5
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
        itemsSold: number;
    };
}) {
    return (
        <div className="flex justify-between items-center">
            <h3 className="text-sm">{product.name}</h3>
            <p className="text-xs text-muted-foreground">
                {product.itemsSold} items sold
            </p>
        </div>
    );
}
