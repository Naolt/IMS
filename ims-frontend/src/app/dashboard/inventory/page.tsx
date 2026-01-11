import { Button } from '@/components/ui/button';
import InventoryCards from './_components/InventoryCards';
import Link from 'next/link';
import { Suspense } from 'react';

export default function InventoryPage() {
    return (
        <div className="flex flex-col gap-8">
            {/* Top section */}
            <div className="flex justify-between items-center">
                <h1 className="font-semibold">Inventory Management</h1>
                <Link href={'/dashboard/inventory/add'}>
                    <Button>Add New Product</Button>
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
