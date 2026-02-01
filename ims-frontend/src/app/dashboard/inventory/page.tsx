import { Button } from '@/components/ui/button';
import InventoryCards from './_components/InventoryCards';
import Link from 'next/link';
import { Suspense } from 'react';

export default function InventoryPage() {
    return (
        <div className="flex flex-col gap-8">
            {/* Top section */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                <h1 className="font-semibold text-lg sm:text-xl">Inventory Management</h1>
                <Link href={'/dashboard/inventory/add'}>
                    <Button size="sm" className="w-full sm:w-auto">Add New Product</Button>
                </Link>
            </div>

            {/* Cards */}
            <Suspense fallback={
                <div className="flex items-center justify-center h-64">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                </div>
            }>
                <InventoryCards />
            </Suspense>
        </div>
    );
}
