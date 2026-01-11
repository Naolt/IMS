import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import RecordSaleForm from './_components/RecordSaleForm';
import SalesCards from './_components/SalesCards';
import { Suspense } from 'react';

export default function SalesPage() {
    return (
        <div className="flex flex-col gap-6">
            <div>
                <h1 className="text-3xl font-bold">Sales</h1>
                <p className="text-muted-foreground">
                    Record new sales and view sales history
                </p>
            </div>

            <Tabs defaultValue="record" className="w-full">
                <TabsList className="grid w-full max-w-[400px] grid-cols-2">
                    <TabsTrigger value="record">Record Sale</TabsTrigger>
                    <TabsTrigger value="history">Sales History</TabsTrigger>
                </TabsList>
                <TabsContent value="record" className="mt-6 data-[state=inactive]:hidden" forceMount>
                    <RecordSaleForm />
                </TabsContent>
                <TabsContent value="history" className="mt-6 data-[state=inactive]:hidden" forceMount>
                    <Suspense fallback={
                        <div className="flex items-center justify-center h-64">
                            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                        </div>
                    }>
                        <SalesCards />
                    </Suspense>
                </TabsContent>
            </Tabs>
        </div>
    );
}
