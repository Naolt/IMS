'use client';

import { ColumnDef } from '@tanstack/react-table';

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
export type Sale = {
    date: string;
    category: string;
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
        accessorKey: 'category',
        header: 'Category'
    },
    {
        accessorKey: 'quantity',
        header: 'Quantity'
    },
    {
        accessorKey: 'sellingPrice',
        header: 'Selling Price'
    },
    {
        accessorKey: 'profit',
        header: 'Profit'
    }
];
