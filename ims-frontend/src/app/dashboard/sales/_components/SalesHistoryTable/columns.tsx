'use client';

import { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils';
import { ArrowUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';

export type SaleRow = {
    id: string;
    saleDate: Date;
    productName: string;
    productCode: string;
    variant: string;
    size: string;
    color: string;
    quantity: number;
    sellingPrice: number;
    totalAmount: number;
    customerName?: string;
    soldBy: string;
};

export const columns: ColumnDef<SaleRow>[] = [
    {
        accessorKey: 'saleDate',
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() =>
                        column.toggleSorting(column.getIsSorted() === 'asc')
                    }
                >
                    Date
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            );
        },
        cell: ({ row }) => {
            return (
                <div className="text-sm">
                    {format(row.getValue('saleDate'), 'MMM dd, yyyy')}
                    <div className="text-xs text-muted-foreground">
                        {format(row.getValue('saleDate'), 'HH:mm')}
                    </div>
                </div>
            );
        },
    },
    {
        accessorKey: 'productName',
        header: 'Product',
        cell: ({ row }) => {
            return (
                <div>
                    <div className="font-medium">{row.getValue('productName')}</div>
                    <div className="text-xs text-muted-foreground">
                        {row.original.productCode}
                    </div>
                </div>
            );
        },
    },
    {
        accessorKey: 'variant',
        header: 'Variant',
        cell: ({ row }) => {
            return (
                <div className="flex gap-1">
                    <Badge variant="outline" className="text-xs">
                        {row.original.size}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                        {row.original.color}
                    </Badge>
                </div>
            );
        },
    },
    {
        accessorKey: 'quantity',
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() =>
                        column.toggleSorting(column.getIsSorted() === 'asc')
                    }
                >
                    Qty
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            );
        },
        cell: ({ row }) => {
            return <div className="text-center">{row.getValue('quantity')}</div>;
        },
    },
    {
        accessorKey: 'sellingPrice',
        header: 'Unit Price',
        cell: ({ row }) => {
            return (
                <div className="text-sm">
                    {formatCurrency(row.getValue('sellingPrice'))}
                </div>
            );
        },
    },
    {
        accessorKey: 'totalAmount',
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() =>
                        column.toggleSorting(column.getIsSorted() === 'asc')
                    }
                >
                    Total
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            );
        },
        cell: ({ row }) => {
            return (
                <div className="font-semibold">
                    {formatCurrency(row.getValue('totalAmount'))}
                </div>
            );
        },
    },
    {
        accessorKey: 'customerName',
        header: 'Customer',
        cell: ({ row }) => {
            const customer = row.getValue('customerName') as string;
            return customer ? (
                <div className="text-sm">{customer}</div>
            ) : (
                <span className="text-xs text-muted-foreground">-</span>
            );
        },
    },
    {
        accessorKey: 'soldBy',
        header: 'Sold By',
        cell: ({ row }) => {
            return <div className="text-sm">{row.getValue('soldBy')}</div>;
        },
    },
];
