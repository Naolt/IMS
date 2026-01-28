import { SidebarProvider } from '@/components/ui/sidebar';
import AppSidebar from './_components/MainLayout/AppSidebar';
import Header from './_components/MainLayout/Header';
import MobileBottomNav from './_components/MainLayout/MobileBottomNav';
import { Separator } from '@/components/ui/separator';
import { ProtectedRoute } from '@/components/protected-route';

export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <ProtectedRoute>
            <SidebarProvider>
                <AppSidebar />
                <main className="w-full h-screen overflow-y-auto overflow-x-hidden">
                    <Header />
                    <Separator />
                    <div className="w-full p-4 md:p-8 pb-20 md:pb-8">{children}</div>
                </main>
                <MobileBottomNav />
            </SidebarProvider>
        </ProtectedRoute>
    );
}
