'use client';

import { useState, useCallback, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { ChevronLeft, ChevronRight, Package, Search, Edit, Eye, Trash2, MoreVertical } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { useCategories, useBrands } from '@/hooks/use-product-options';
import { useProducts, useDeleteProduct, useProduct } from '@/hooks/use-products';
import Image from 'next/image';

export default function InventoryCards() {
    const router = useRouter();
    const searchParams = useSearchParams();

    // Read from URL params
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';
    const brand = searchParams.get('brand') || '';

    // Local state
    const [searchInput, setSearchInput] = useState(search);

    // Fetch filter options
    const { data: categoriesResponse } = useCategories();
    const { data: brandsResponse } = useBrands();

    const categories = categoriesResponse?.data || [];
    const brands = brandsResponse?.data || [];

    // Fetch products using React Query
    const { data: productsResponse, isLoading } = useProducts({
        page,
        limit,
        search: search || undefined,
        category: category || undefined,
        brand: brand || undefined,
    });

    // Update URL params
    const updateUrlParams = useCallback(
        (updates: Record<string, string | number>) => {
            const params = new URLSearchParams(searchParams.toString());

            Object.entries(updates).forEach(([key, value]) => {
                if (value) {
                    params.set(key, value.toString());
                } else {
                    params.delete(key);
                }
            });

            router.replace(`?${params.toString()}`, { scroll: false });
        },
        [router, searchParams]
    );

    // Handlers
    const handleSearch = useCallback(() => {
        updateUrlParams({ search: searchInput, page: 1 });
    }, [searchInput, updateUrlParams]);

    const handleCategoryChange = useCallback(
        (value: string) => {
            updateUrlParams({ category: value === 'all' ? '' : value, page: 1 });
        },
        [updateUrlParams]
    );

    const handleBrandChange = useCallback(
        (value: string) => {
            updateUrlParams({ brand: value === 'all' ? '' : value, page: 1 });
        },
        [updateUrlParams]
    );

    const handlePageChange = useCallback(
        (newPage: number) => {
            updateUrlParams({ page: newPage });
        },
        [updateUrlParams]
    );

    // Transform products with aggregated variant data
    const inventoryItems = useMemo(() => {
        if (!productsResponse?.data) return [];

        return productsResponse.data.map((product: any) => {
            // Calculate aggregated stats from variants
            const totalStock = product.variants.reduce(
                (sum: number, v: any) => sum + v.stockQuantity,
                0
            );
            const prices = product.variants.map((v: any) => Number(v.sellingPrice));
            const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
            const maxPrice = prices.length > 0 ? Math.max(...prices) : 0;

            // Determine overall stock status
            const hasOutOfStock = product.variants.some((v: any) => v.stockQuantity === 0);
            const hasLowStock = product.variants.some(
                (v: any) => v.stockQuantity > 0 && v.stockQuantity <= v.minStockQuantity
            );

            const stockStatus = totalStock === 0
                ? 'Out of Stock'
                : hasOutOfStock || hasLowStock
                ? 'Low Stock'
                : 'In Stock';

            return {
                id: product.id,
                productId: product.id,
                productCode: product.code,
                productName: product.name,
                category: product.category,
                brand: product.brand || 'N/A',
                imageUrl: product.imageUrl,
                variantCount: product.variants.length,
                totalStock,
                minPrice,
                maxPrice,
                stockStatus,
            };
        });
    }, [productsResponse]);

    const pagination = productsResponse?.pagination;

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4" />
                    <p className="text-muted-foreground">Loading inventory...</p>
                </div>
            </div>
        );
    }

    const getStockBadgeVariant = (status: string) => {
        if (status === 'Out of Stock') return 'destructive';
        if (status === 'Low Stock') return 'warning';
        return 'default';
    };

    return (
        <div className="space-y-6">
            {/* Filters */}
            <Card>
                <CardContent className="pt-6">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 flex gap-2">
                            <Input
                                placeholder="Search products..."
                                value={searchInput}
                                onChange={(e) => setSearchInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                className="flex-1"
                            />
                            <Button onClick={handleSearch} size="icon">
                                <Search className="h-4 w-4" />
                            </Button>
                        </div>

                        <Select
                            value={category || 'all'}
                            onValueChange={handleCategoryChange}
                        >
                            <SelectTrigger className="w-full md:w-[180px]">
                                <SelectValue placeholder="All Categories" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Categories</SelectItem>
                                {categories.map((cat) => (
                                    <SelectItem key={cat} value={cat}>
                                        {cat}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Select
                            value={brand || 'all'}
                            onValueChange={handleBrandChange}
                        >
                            <SelectTrigger className="w-full md:w-[180px]">
                                <SelectValue placeholder="All Brands" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Brands</SelectItem>
                                {brands.map((b) => (
                                    <SelectItem key={b} value={b}>
                                        {b}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* Cards Grid */}
            {inventoryItems.length === 0 ? (
                <Card>
                    <CardContent className="flex flex-col items-center justify-center h-64">
                        <Package className="h-12 w-12 text-muted-foreground mb-4" />
                        <p className="text-lg font-medium">No products found</p>
                        <p className="text-sm text-muted-foreground">
                            Try adjusting your filters
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {inventoryItems.map((item) => (
                        <ProductCard
                            key={item.id}
                            item={item}
                            getStockBadgeVariant={getStockBadgeVariant}
                        />
                    ))}
                </div>
            )}

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <p className="text-sm text-muted-foreground">
                                Showing {(page - 1) * limit + 1} to{' '}
                                {Math.min(page * limit, pagination.total)} of{' '}
                                {pagination.total} items
                            </p>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handlePageChange(page - 1)}
                                    disabled={page === 1}
                                >
                                    <ChevronLeft className="h-4 w-4 mr-1" />
                                    Previous
                                </Button>
                                <div className="flex items-center gap-1">
                                    {Array.from(
                                        { length: pagination.totalPages },
                                        (_, i) => i + 1
                                    )
                                        .filter(
                                            (p) =>
                                                p === 1 ||
                                                p === pagination.totalPages ||
                                                (p >= page - 1 && p <= page + 1)
                                        )
                                        .map((p, idx, arr) => (
                                            <div key={p} className="flex items-center gap-1">
                                                {idx > 0 && arr[idx - 1] !== p - 1 && (
                                                    <span className="px-2">...</span>
                                                )}
                                                <Button
                                                    variant={
                                                        p === page ? 'default' : 'outline'
                                                    }
                                                    size="sm"
                                                    onClick={() => handlePageChange(p)}
                                                >
                                                    {p}
                                                </Button>
                                            </div>
                                        ))}
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handlePageChange(page + 1)}
                                    disabled={page === pagination.totalPages}
                                >
                                    Next
                                    <ChevronRight className="h-4 w-4 ml-1" />
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}

interface ProductCardProps {
    item: {
        id: string;
        productId: string;
        productCode: string;
        productName: string;
        category: string;
        brand: string;
        imageUrl?: string;
        variantCount: number;
        totalStock: number;
        minPrice: number;
        maxPrice: number;
        stockStatus: string;
    };
    getStockBadgeVariant: (status: string) => 'destructive' | 'warning' | 'default';
}

function ProductCard({ item, getStockBadgeVariant }: ProductCardProps) {
    const router = useRouter();
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [showViewDialog, setShowViewDialog] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const { mutate: deleteProduct, isPending } = useDeleteProduct();

    const handleEdit = () => {
        setDropdownOpen(false);
        router.push(`/dashboard/inventory/edit/${item.productId}`);
    };

    const handleView = () => {
        setDropdownOpen(false);
        setShowViewDialog(true);
    };

    const handleDeleteConfirm = () => {
        deleteProduct(item.productId, {
            onSuccess: () => {
                setShowDeleteDialog(false);
            },
        });
    };

    return (
        <>
            <Card className="overflow-hidden hover:shadow-lg transition-shadow relative">
                <CardHeader className="p-0">
                    <div className="aspect-square bg-muted relative">
                        {item.imageUrl ? (
                            <img
                                src={item.imageUrl}
                                alt={item.productName}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center">
                                <Package className="h-16 w-16 text-muted-foreground" />
                            </div>
                        )}
                        <Badge
                            className="absolute top-2 left-2"
                            variant={getStockBadgeVariant(item.stockStatus)}
                        >
                            {item.stockStatus}
                        </Badge>

                        {/* Action Menu */}
                        <div className="absolute top-2 right-2">
                            <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        variant="secondary"
                                        size="icon"
                                        className="h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background shadow-sm"
                                    >
                                        <MoreVertical className="h-4 w-4" />
                                        <span className="sr-only">Open menu</span>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-48">
                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                    <DropdownMenuItem onClick={handleView}>
                                        <Eye className="mr-2 h-4 w-4" />
                                        View Details
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={handleEdit}>
                                        <Edit className="mr-2 h-4 w-4" />
                                        Edit Product
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                        onClick={() => {
                                            setDropdownOpen(false);
                                            setShowDeleteDialog(true);
                                        }}
                                        className="text-red-600 focus:text-red-600"
                                    >
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Delete Product
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-4">
                    <div className="space-y-2">
                        <div>
                            <h3 className="font-semibold text-lg line-clamp-1">
                                {item.productName}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                                {item.productCode}
                            </p>
                        </div>

                        <div className="flex gap-2">
                            <Badge variant="secondary" className="text-xs">
                                {item.variantCount} {item.variantCount === 1 ? 'Variant' : 'Variants'}
                            </Badge>
                        </div>

                        <div className="pt-2 space-y-1">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Total Stock:</span>
                                <span className="font-medium">
                                    {item.totalStock} units
                                </span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Price Range:</span>
                                <span className="font-semibold text-primary">
                                    {item.minPrice === item.maxPrice
                                        ? formatCurrency(item.minPrice)
                                        : `${formatCurrency(item.minPrice)} - ${formatCurrency(item.maxPrice)}`
                                    }
                                </span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Category:</span>
                                <span>{item.category}</span>
                            </div>
                            {item.brand !== 'N/A' && (
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Brand:</span>
                                    <span>{item.brand}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>

            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the
                            product "{item.productName}" (Code: {item.productCode}) and all {item.variantCount} of its {item.variantCount === 1 ? 'variant' : 'variants'}.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteConfirm}
                            disabled={isPending}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            {isPending ? 'Deleting...' : 'Delete'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <ProductDetailsDialog
                productId={item.productId}
                open={showViewDialog}
                onOpenChange={setShowViewDialog}
            />
        </>
    );
}

interface ProductDetailsDialogProps {
    productId: string;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

function ProductDetailsDialog({ productId, open, onOpenChange }: ProductDetailsDialogProps) {
    const { data: productResponse, isLoading } = useProduct(productId);
    const product = productResponse?.data;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto w-[95vw] sm:w-full">
                <DialogHeader>
                    <DialogTitle>Product Details</DialogTitle>
                </DialogHeader>

                {isLoading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                    </div>
                ) : product ? (
                    <div className="space-y-6">
                        {/* Product Image and Basic Info */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Image */}
                            <div className="space-y-4">
                                <div className="aspect-square bg-muted rounded-lg overflow-hidden relative">
                                    {product.imageUrl ? (
                                        <Image
                                            src={product.imageUrl}
                                            alt={product.name}
                                            fill
                                            className="object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <Package className="h-24 w-24 text-muted-foreground" />
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Basic Info */}
                            <div className="space-y-4">
                                <div>
                                    <h3 className="text-xl md:text-2xl font-bold">{product.name}</h3>
                                    <p className="text-sm text-muted-foreground">Code: {product.code}</p>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Category:</span>
                                        <Badge variant="outline">{product.category}</Badge>
                                    </div>
                                    {product.brand && (
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Brand:</span>
                                            <Badge variant="outline">{product.brand}</Badge>
                                        </div>
                                    )}
                                </div>

                                <div className="pt-4">
                                    <h4 className="font-semibold mb-2">Quick Stats</h4>
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">Total Variants:</span>
                                            <span className="font-medium">{product.variants?.length || 0}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">Total Stock:</span>
                                            <span className="font-medium">
                                                {product.variants?.reduce((sum: number, v: any) => sum + v.stockQuantity, 0) || 0} units
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Variants Table */}
                        <div>
                            <h4 className="font-semibold mb-3">Variants</h4>
                            <div className="border rounded-lg overflow-x-auto">
                                <table className="w-full min-w-[600px]">
                                    <thead className="bg-muted">
                                        <tr>
                                            <th className="text-left p-3 text-sm font-medium">Size</th>
                                            <th className="text-left p-3 text-sm font-medium">Color</th>
                                            <th className="text-right p-3 text-sm font-medium">Stock</th>
                                            <th className="text-right p-3 text-sm font-medium">Buying Price</th>
                                            <th className="text-right p-3 text-sm font-medium">Selling Price</th>
                                            <th className="text-center p-3 text-sm font-medium">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {product.variants?.map((variant: any) => {
                                            const stockStatus =
                                                variant.stockQuantity === 0
                                                    ? 'Out of Stock'
                                                    : variant.stockQuantity <= variant.minStockQuantity
                                                    ? 'Low Stock'
                                                    : 'In Stock';

                                            const statusVariant =
                                                stockStatus === 'Out of Stock'
                                                    ? 'destructive'
                                                    : stockStatus === 'Low Stock'
                                                    ? 'warning'
                                                    : 'default';

                                            return (
                                                <tr key={variant.id} className="border-t">
                                                    <td className="p-3 text-sm">{variant.size}</td>
                                                    <td className="p-3 text-sm">{variant.color}</td>
                                                    <td className="p-3 text-sm text-right">
                                                        {variant.stockQuantity} / {variant.minStockQuantity}
                                                    </td>
                                                    <td className="p-3 text-sm text-right">
                                                        {formatCurrency(variant.buyingPrice)}
                                                    </td>
                                                    <td className="p-3 text-sm text-right font-medium">
                                                        {formatCurrency(variant.sellingPrice)}
                                                    </td>
                                                    <td className="p-3 text-sm text-center">
                                                        <Badge variant={statusVariant} className="text-xs">
                                                            {stockStatus}
                                                        </Badge>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-12 text-muted-foreground">
                        Product not found
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
