'use client';

import { ColumnDef } from '@tanstack/react-table';

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
export type Sale = {
    date: string;
    product: string;
    variant: string;
    quantity: number;
    sellingPrice: string;
    profit: string;
};

export const columns: ColumnDef<Sale>[] = [
    {
        accessorKey: 'date',
        header: 'Date'
    },
    {
        accessorKey: 'product',
        header: 'Product'
    },
    {
        accessorKey: 'variant',
        header: 'Variant'
    },
    {
        accessorKey: 'quantity',
        header: 'Quantity'
    },
    {
        accessorKey: 'sellingPrice',
        header: 'Total Amount'
    },
    {
        accessorKey: 'profit',
        header: 'Profit'
    }
];
