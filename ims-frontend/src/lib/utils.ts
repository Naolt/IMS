import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format } from 'date-fns';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'ETB'
    }).format(amount);
}

export function formatNumber(amount: number) {
    return new Intl.NumberFormat('en-US').format(amount);
}

export function formatDate(date: string) {
    return format(date, 'MMM do, yyyy');
}

export const calculateStockStatus = (
    stockQuantity: number,
    minStockQuantity: number
) => {
    if (stockQuantity === 0) return 'Out of Stock';
    if (stockQuantity <= minStockQuantity) return 'Low Stock';
    return 'In Stock';
};
