'use client';

import { formatCurrency } from '@/lib/utils';
import { ColumnDef } from '@tanstack/react-table';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useDeleteProduct } from '@/hooks/use-products';

import { MoreHorizontal, Edit, Trash2, Eye } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
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
import { Checkbox } from '@/components/ui/checkbox';
import { DataTableColumnHeader } from './data-table-column-header';

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.

export type Inventory = {
    id: string; // Unique identifier for the variant
    productId: string; // Product ID for edit/delete operations
    productCode: string; // Unique code for the product variant
    productName?: string; // Optional name for more context (e.g., "Summer Dress")
    productCategory: string; // Category of the product (e.g., "Clothing", "Footwear")
    productBrand: string; // Brand of the product
    size: string; // Size of the product (e.g., "M", "L", "One Size")
    color: string; // Color of the product (e.g., "Red", "Black")
    stockQuantity: number; // Current stock level
    minStockQuantity: number; // Minimum stock level to trigger low-stock alert
    buyingPrice: number; // Cost of purchasing the product
    sellingPrice: number; // Price at which the product is sold
    imageUrl?: string; // Optional image URL for product representation
    createdAt: string; // Date the product was added to inventory
    updatedAt: string; // Last modification date of the product details
};

// let create derived type with additional column for stock status
export type InventoryWithStockStatus = Inventory & {
    stockStatus: 'In Stock' | 'Low Stock' | 'Out of Stock';
};

export const columns: ColumnDef<InventoryWithStockStatus>[] = [
    {
        id: 'select',
        header: ({ table }) => (
            <Checkbox
                checked={
                    table.getIsAllPageRowsSelected() ||
                    (table.getIsSomePageRowsSelected() && 'indeterminate')
                }
                onCheckedChange={(value) =>
                    table.toggleAllPageRowsSelected(!!value)
                }
                aria-label="Select all"
                className="translate-y-[2px]"
            />
        ),
        cell: ({ row }) => (
            <Checkbox
                checked={row.getIsSelected()}
                onCheckedChange={(value) => row.toggleSelected(!!value)}
                aria-label="Select row"
                className="translate-y-[2px]"
            />
        ),
        enableSorting: false,
        enableHiding: false
    },
    {
        accessorKey: 'productCode',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Product Code" />
        )
    },
    {
        accessorKey: 'productName',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Product Name" />
        )
    },
    {
        accessorKey: 'size',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Size" />
        ),
        filterFn: (row, columnId, value: string[]) => {
            return value.includes(row.getValue(columnId));
        }
    },
    {
        accessorKey: 'color',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Color" />
        ),
        filterFn: (row, columnId, value: string[]) => {
            return value.includes(row.getValue(columnId));
        }
    },
    {
        accessorKey: 'productCategory',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Category" />
        )
    },
    {
        accessorKey: 'productBrand',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Brand" />
        )
    },
    {
        accessorKey: 'stockQuantity',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Quantity" />
        )
    },
    {
        accessorKey: 'minStockQuantity',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Min Quantity" />
        )
    },
    {
        accessorKey: 'stockStatus',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Stock Status" />
        ),
        cell: ({ row }) => {
            const status = row.getValue('stockStatus') as string;
            const statusColors = {
                'In Stock': 'text-green-600 bg-green-50',
                'Low Stock': 'text-yellow-600 bg-yellow-50',
                'Out of Stock': 'text-red-600 bg-red-50',
            };
            return (
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[status as keyof typeof statusColors] || ''}`}>
                    {status}
                </span>
            );
        },
        filterFn: (row, columnId, value: string[]) => {
            return value.includes(row.getValue(columnId));
        }
    },
    {
        accessorKey: 'buyingPrice',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Price" />
        ),
        cell: ({ row }) => formatCurrency(row.original.buyingPrice),
        filterFn: (row, id, value: [number, number]) => {
            const buyingPrice: number = row.getValue('buyingPrice');
            return value[0] <= buyingPrice && buyingPrice <= value[1];
        }
    },

    {
        id: 'actions',
        cell: ({ row }) => {
            const product = row.original;

            return <ActionCell product={product} />;
        }
    }
];

function ActionCell({ product }: { product: InventoryWithStockStatus }) {
    const router = useRouter();
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const { mutate: deleteProduct, isPending } = useDeleteProduct();

    const handleEdit = () => {
        router.push(`/dashboard/inventory/edit/${product.productId}`);
    };

    const handleDeleteConfirm = () => {
        deleteProduct(product.productId, {
            onSuccess: () => {
                setShowDeleteDialog(false);
            },
        });
    };

    const handleView = () => {
        // TODO: Implement view details
        console.log('View product:', product.productId);
    };

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
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
                        onClick={() => setShowDeleteDialog(true)}
                        className="text-red-600 focus:text-red-600"
                    >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete Product
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the product
                            "{product.productName}" (Code: {product.productCode}) and all its variants.
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
        </>
    );
}
