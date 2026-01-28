'use client';

import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import {
    Home,
    Package,
    ShoppingCart,
    Sparkles,
    Menu,
    BarChart3,
    Users,
    Settings,
    UserCircle,
    LogOut,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/contexts/auth-context';
import { UserRole } from '@/types/api';

const mainNavItems = [
    { title: 'Overview', url: '/dashboard', icon: Home },
    { title: 'Inventory', url: '/dashboard/inventory', icon: Package },
    { title: 'Sales', url: '/dashboard/sales', icon: ShoppingCart },
    { title: 'AI', url: '/dashboard/ai-assistant', icon: Sparkles },
];

const moreNavItems = [
    { title: 'Reports', url: '/dashboard/reports', icon: BarChart3 },
    { title: 'Users', url: '/dashboard/users', icon: Users, adminOnly: true },
    { title: 'Settings', url: '/dashboard/settings', icon: Settings, adminOnly: true },
];

export default function MobileBottomNav() {
    const pathname = usePathname();
    const router = useRouter();
    const { user, signOut } = useAuth();
    const [isMoreOpen, setIsMoreOpen] = useState(false);

    const isActive = (url: string) => {
        if (url === '/dashboard') {
            return pathname === '/dashboard';
        }
        return pathname.startsWith(url);
    };

    const isMoreActive = moreNavItems.some((item) => isActive(item.url));

    const handleNavigation = (url: string) => {
        router.push(url);
        setIsMoreOpen(false);
    };

    const handleLogout = () => {
        signOut();
        setIsMoreOpen(false);
    };

    const handleProfile = () => {
        router.push('/dashboard/profile');
        setIsMoreOpen(false);
    };

    return (
        <>
            {/* Bottom Navigation Bar */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background border-t safe-area-bottom">
                <div className="flex items-center justify-around h-16">
                    {mainNavItems.map((item) => {
                        const active = isActive(item.url);
                        return (
                            <button
                                key={item.url}
                                onClick={() => handleNavigation(item.url)}
                                className={cn(
                                    'flex flex-col items-center justify-center flex-1 h-full gap-1 transition-colors',
                                    active
                                        ? 'text-primary'
                                        : 'text-muted-foreground hover:text-foreground'
                                )}
                            >
                                <item.icon className={cn('h-5 w-5', active && 'text-primary')} />
                                <span className="text-[10px] font-medium">{item.title}</span>
                            </button>
                        );
                    })}
                    <button
                        onClick={() => setIsMoreOpen(true)}
                        className={cn(
                            'flex flex-col items-center justify-center flex-1 h-full gap-1 transition-colors',
                            isMoreActive
                                ? 'text-primary'
                                : 'text-muted-foreground hover:text-foreground'
                        )}
                    >
                        <Menu className={cn('h-5 w-5', isMoreActive && 'text-primary')} />
                        <span className="text-[10px] font-medium">More</span>
                    </button>
                </div>
            </nav>

            {/* More Sheet */}
            <Sheet open={isMoreOpen} onOpenChange={setIsMoreOpen}>
                <SheetContent side="bottom" className="h-auto rounded-t-xl pb-8">
                    <SheetHeader className="text-left">
                        <SheetTitle>More</SheetTitle>
                    </SheetHeader>
                    <div className="mt-4 space-y-1">
                        {moreNavItems
                            .filter((item) => !item.adminOnly || user?.role === UserRole.ADMIN)
                            .map((item) => {
                                const active = isActive(item.url);
                                return (
                                    <Button
                                        key={item.url}
                                        variant={active ? 'secondary' : 'ghost'}
                                        className="w-full justify-start gap-3 h-12"
                                        onClick={() => handleNavigation(item.url)}
                                    >
                                        <item.icon className="h-5 w-5" />
                                        <span>{item.title}</span>
                                    </Button>
                                );
                            })}

                        <Separator className="my-2" />

                        <Button
                            variant="ghost"
                            className="w-full justify-start gap-3 h-12"
                            onClick={handleProfile}
                        >
                            <UserCircle className="h-5 w-5" />
                            <span>Profile</span>
                        </Button>

                        <Button
                            variant="ghost"
                            className="w-full justify-start gap-3 h-12 text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={handleLogout}
                        >
                            <LogOut className="h-5 w-5" />
                            <span>Logout</span>
                        </Button>
                    </div>
                </SheetContent>
            </Sheet>
        </>
    );
}
