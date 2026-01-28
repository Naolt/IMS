'use client';

import { useMemo } from 'react';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';
import {
    Package,
    AlertTriangle,
    DollarSign,
    Loader2,
    PackageX,
    Boxes
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
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Pie,
    PieChart,
    XAxis,
    YAxis,
} from 'recharts';
import { useProducts } from '@/hooks/use-products';

const CHART_COLORS = {
    inStock: 'hsl(var(--chart-2))',
    lowStock: 'hsl(var(--chart-3))',
    outOfStock: 'hsl(var(--chart-5))',
};

export default function InventoryAnalysisTab() {
    const { data: productsResponse, isLoading } = useProducts({ limit: 1000 });

    const inventoryStats = useMemo(() => {
        if (!productsResponse?.data) return null;

        let totalItems = 0;
        let lowStockCount = 0;
        let outOfStockCount = 0;
        let totalCostValue = 0;
        let totalRetailValue = 0;

        const categoryData: { [key: string]: { quantity: number; value: number } } = {};
        const topValueProducts: {
            name: string;
            code: string;
            quantity: number;
            value: number;
        }[] = [];

        productsResponse.data.forEach(product => {
            product.variants.forEach(variant => {
                totalItems += variant.stockQuantity;
                totalCostValue += variant.stockQuantity * parseFloat(variant.buyingPrice.toString());
                totalRetailValue += variant.stockQuantity * parseFloat(variant.sellingPrice.toString());

                if (variant.stockQuantity === 0) {
                    outOfStockCount++;
                } else if (variant.stockQuantity <= variant.minStockQuantity) {
                    lowStockCount++;
                }

                if (!categoryData[product.category]) {
                    categoryData[product.category] = { quantity: 0, value: 0 };
                }
                categoryData[product.category].quantity += variant.stockQuantity;
                categoryData[product.category].value +=
                    variant.stockQuantity * parseFloat(variant.sellingPrice.toString());

                topValueProducts.push({
                    name: `${product.name} (${variant.size}/${variant.color})`,
                    code: product.code,
                    quantity: variant.stockQuantity,
                    value: variant.stockQuantity * parseFloat(variant.sellingPrice.toString()),
                });
            });
        });

        const inStockCount = productsResponse.data.flatMap(p => p.variants).length - lowStockCount - outOfStockCount;

        const stockStatusData = [
            { status: 'In Stock', value: inStockCount, fill: CHART_COLORS.inStock },
            { status: 'Low Stock', value: lowStockCount, fill: CHART_COLORS.lowStock },
            { status: 'Out of Stock', value: outOfStockCount, fill: CHART_COLORS.outOfStock }
        ];

        const categoryChartData = Object.entries(categoryData)
            .map(([name, data]) => ({
                category: name.length > 15 ? name.substring(0, 15) + '...' : name,
                quantity: data.quantity,
            }))
            .sort((a, b) => b.quantity - a.quantity)
            .slice(0, 8);

        topValueProducts.sort((a, b) => b.value - a.value);

        return {
            totalItems,
            totalVariants: productsResponse.data.flatMap(p => p.variants).length,
            lowStockCount,
            outOfStockCount,
            inStockCount,
            totalCostValue,
            totalRetailValue,
            potentialProfit: totalRetailValue - totalCostValue,
            stockStatusData,
            categoryChartData,
            topValueProducts: topValueProducts.slice(0, 8),
        };
    }, [productsResponse]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    if (!inventoryStats) {
        return (
            <div className="flex items-center justify-center h-96">
                <p className="text-muted-foreground">No inventory data available</p>
            </div>
        );
    }

    const chartConfig = {
        quantity: {
            label: 'Quantity',
            color: 'hsl(var(--chart-1))',
        },
    } satisfies ChartConfig;

    return (
        <div className="space-y-6">
            {/* Key Metrics */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Items</CardTitle>
                        <Package className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{inventoryStats.totalItems.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground">
                            {inventoryStats.totalVariants} variants
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Inventory Value</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {formatCurrency(inventoryStats.totalRetailValue)}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Cost: {formatCurrency(inventoryStats.totalCostValue)}
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Low Stock</CardTitle>
                        <AlertTriangle className="h-4 w-4 text-orange-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-orange-600">
                            {inventoryStats.lowStockCount}
                        </div>
                        <p className="text-xs text-muted-foreground">Needs attention</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Out of Stock</CardTitle>
                        <PackageX className="h-4 w-4 text-red-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">
                            {inventoryStats.outOfStockCount}
                        </div>
                        <p className="text-xs text-muted-foreground">Needs restocking</p>
                    </CardContent>
                </Card>
            </div>

            {/* Charts Row */}
            <div className="grid gap-6 md:grid-cols-2">
                {/* Stock Status Distribution */}
                <Card className="overflow-hidden">
                    <CardHeader>
                        <CardTitle>Stock Status</CardTitle>
                        <CardDescription>Inventory health by stock levels</CardDescription>
                    </CardHeader>
                    <CardContent className="p-2 sm:p-6">
                        <ChartContainer
                            config={{
                                'In Stock': {
                                    label: 'In Stock',
                                    color: CHART_COLORS.inStock,
                                },
                                'Low Stock': {
                                    label: 'Low Stock',
                                    color: CHART_COLORS.lowStock,
                                },
                                'Out of Stock': {
                                    label: 'Out of Stock',
                                    color: CHART_COLORS.outOfStock,
                                },
                            }}
                            className="h-[280px] sm:h-[300px] w-full mx-auto"
                        >
                            <PieChart>
                                <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                                <Pie
                                    data={inventoryStats.stockStatusData}
                                    dataKey="value"
                                    nameKey="status"
                                    cx="50%"
                                    cy="45%"
                                    innerRadius={50}
                                    outerRadius={80}
                                    paddingAngle={2}
                                >
                                    {inventoryStats.stockStatusData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.fill} />
                                    ))}
                                </Pie>
                                <ChartLegend content={<ChartLegendContent />} />
                            </PieChart>
                        </ChartContainer>
                    </CardContent>
                </Card>

                {/* Inventory by Category */}
                <Card className="overflow-hidden">
                    <CardHeader>
                        <CardTitle>By Category</CardTitle>
                        <CardDescription>Stock distribution across categories</CardDescription>
                    </CardHeader>
                    <CardContent className="p-2 sm:p-6">
                        {inventoryStats.categoryChartData.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-[300px]">
                                <Boxes className="h-12 w-12 text-muted-foreground/50 mb-4" />
                                <p className="text-muted-foreground">No category data available</p>
                            </div>
                        ) : (
                            <ChartContainer config={chartConfig} className="h-[280px] sm:h-[300px] w-full">
                                <BarChart data={inventoryStats.categoryChartData} margin={{ left: -20, right: 10 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis
                                        dataKey="category"
                                        tickLine={false}
                                        axisLine={false}
                                        tickMargin={8}
                                        fontSize={11}
                                        angle={-45}
                                        textAnchor="end"
                                        height={60}
                                        interval={0}
                                    />
                                    <YAxis
                                        tickLine={false}
                                        axisLine={false}
                                        tickMargin={4}
                                        fontSize={11}
                                        width={40}
                                    />
                                    <ChartTooltip content={<ChartTooltipContent />} />
                                    <Bar
                                        dataKey="quantity"
                                        fill="var(--color-quantity)"
                                        radius={[4, 4, 0, 0]}
                                    />
                                </BarChart>
                            </ChartContainer>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Top Value Products */}
            <Card>
                <CardHeader>
                    <CardTitle>Highest Value Inventory</CardTitle>
                    <CardDescription>Products with highest total retail value in stock</CardDescription>
                </CardHeader>
                <CardContent className="p-3 sm:p-6">
                    {inventoryStats.topValueProducts.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12">
                            <Package className="h-12 w-12 text-muted-foreground/50 mb-4" />
                            <p className="text-muted-foreground">No inventory data available</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {inventoryStats.topValueProducts.map((product, index) => (
                                <div
                                    key={index}
                                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 border rounded-lg hover:bg-muted/50 transition-colors gap-3"
                                >
                                    <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                                        <div className="flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-primary/10 text-primary font-semibold text-sm shrink-0">
                                            {index + 1}
                                        </div>
                                        <div className="min-w-0">
                                            <div className="font-medium text-sm sm:text-base truncate">{product.name}</div>
                                            <div className="text-xs sm:text-sm text-muted-foreground">
                                                Code: {product.code}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex gap-4 sm:gap-8 items-center justify-end sm:justify-start pl-10 sm:pl-0">
                                        <div className="text-right">
                                            <div className="text-xs sm:text-sm text-muted-foreground">Qty</div>
                                            <div className="font-semibold text-sm sm:text-base">{product.quantity}</div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-xs sm:text-sm text-muted-foreground">Value</div>
                                            <div className="font-semibold text-sm sm:text-base">
                                                {formatCurrency(product.value)}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Potential Profit */}
            <Card>
                <CardHeader>
                    <CardTitle>Potential Profit Analysis</CardTitle>
                    <CardDescription>
                        Projected profit if all current inventory sells at retail price
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4 md:grid-cols-3">
                        <div className="p-6 border rounded-lg">
                            <div className="text-sm font-medium text-muted-foreground mb-2">
                                Cost Value
                            </div>
                            <div className="text-3xl font-bold">
                                {formatCurrency(inventoryStats.totalCostValue)}
                            </div>
                            <p className="text-xs text-muted-foreground mt-2">
                                Total investment in inventory
                            </p>
                        </div>
                        <div className="p-6 border rounded-lg">
                            <div className="text-sm font-medium text-muted-foreground mb-2">
                                Retail Value
                            </div>
                            <div className="text-3xl font-bold">
                                {formatCurrency(inventoryStats.totalRetailValue)}
                            </div>
                            <p className="text-xs text-muted-foreground mt-2">
                                Total value at selling price
                            </p>
                        </div>
                        <div className="p-6 border rounded-lg bg-primary/5">
                            <div className="text-sm font-medium text-muted-foreground mb-2">
                                Potential Profit
                            </div>
                            <div className="text-3xl font-bold text-primary">
                                {formatCurrency(inventoryStats.potentialProfit)}
                            </div>
                            <p className="text-xs text-muted-foreground mt-2">
                                {((inventoryStats.potentialProfit / inventoryStats.totalCostValue) * 100).toFixed(1)}% profit margin
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
