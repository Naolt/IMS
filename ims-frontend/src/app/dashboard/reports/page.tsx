'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import SalesAnalysisTab from './_components/SalesAnalysisTab';
import InventoryAnalysisTab from './_components/InventoryAnalysisTab';

export default function ReportsPage() {
    return (
        <div className="flex flex-col gap-6">
            <div>
                <h1 className="text-3xl font-bold">Reports & Analytics</h1>
                <p className="text-muted-foreground">
                    Comprehensive business insights and performance analytics
                </p>
            </div>

            <Tabs defaultValue="sales" className="w-full">
                <TabsList className="grid w-full max-w-[400px] grid-cols-2">
                    <TabsTrigger value="sales">Sales Analysis</TabsTrigger>
                    <TabsTrigger value="inventory">Inventory Analysis</TabsTrigger>
                </TabsList>

                <TabsContent value="sales" className="mt-6">
                    <SalesAnalysisTab />
                </TabsContent>

                <TabsContent value="inventory" className="mt-6">
                    <InventoryAnalysisTab />
                </TabsContent>
            </Tabs>
        </div>
    );
}
