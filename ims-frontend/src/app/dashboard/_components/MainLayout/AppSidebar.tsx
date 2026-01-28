'use client';
import {
    Home,
    Inbox,
    Settings,
    User,
    BarChart3,
    ShoppingCart,
    Users,
    LogOut,
    UserCircle,
    ChevronUp,
    Loader2,
    Sparkles
} from 'lucide-react';

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import Logo from './Logo';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { UserRole } from '@/types/api';

// Menu items.
const items = [
    {
        title: 'Overview',
        url: '/dashboard',
        icon: Home
    },
    {
        title: 'Inventory',
        url: '/dashboard/inventory',
        icon: Inbox
    },
    {
        title: 'Sales',
        url: '/dashboard/sales',
        icon: ShoppingCart
    },
    {
        title: 'AI Assistant',
        url: '/dashboard/ai-assistant',
        icon: Sparkles
    },
    {
        title: 'Reports',
        url: '/dashboard/reports',
        icon: BarChart3
    },
    {
        title: 'Users',
        url: '/dashboard/users',
        icon: Users,
        adminOnly: true
    },
    {
        title: 'Settings',
        url: '/dashboard/settings',
        icon: Settings,
        adminOnly: true
    }
];

export default function AppSidebar() {
    const path = usePathname();
    const router = useRouter();
    const { user, isLoading, signOut } = useAuth();

    const isActive = (url: string) => {
        if (url === '/dashboard') {
            return path === '/dashboard';
        }
        return path.startsWith(url);
    };

    const handleLogout = () => {
        signOut();
    };

    const handleProfile = () => {
        router.push('/dashboard/profile');
    };

    return (
        <Sidebar>
            <SidebarHeader>
                <Logo />
            </SidebarHeader>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {items
                                .filter(
                                    (item) =>
                                        !item.adminOnly ||
                                        user?.role === UserRole.ADMIN
                                )
                                .map((item) => (
                                    <SidebarMenuItem key={item.title}>
                                        <SidebarMenuButton
                                            asChild
                                            isActive={isActive(item.url)}
                                        >
                                            <a href={item.url}>
                                                <item.icon />
                                                <span>{item.title}</span>
                                            </a>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
            <SidebarFooter>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="ghost"
                            className="w-full flex justify-between items-center h-auto py-2 px-2"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <div className="flex items-center gap-2">
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    <span className="text-sm">Loading...</span>
                                </div>
                            ) : (
                                <>
                                    <div className="flex items-center gap-2">
                                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10">
                                            <User className="h-4 w-4 text-primary" />
                                        </div>
                                        <div className="flex flex-col items-start text-left">
                                            <span className="text-sm font-medium">
                                                {user?.name || 'User'}
                                            </span>
                                            <span className="text-xs text-muted-foreground">
                                                {user?.email || ''}
                                            </span>
                                        </div>
                                    </div>
                                    <ChevronUp className="h-4 w-4 text-muted-foreground" />
                                </>
                            )}
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        align="end"
                        className="w-56"
                        side="top"
                    >
                        <DropdownMenuLabel>My Account</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={handleProfile}>
                            <UserCircle className="mr-2 h-4 w-4" />
                            Profile
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            onClick={handleLogout}
                            className="text-destructive focus:text-destructive focus:bg-destructive/10"
                        >
                            <LogOut className="mr-2 h-4 w-4" />
                            Logout
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </SidebarFooter>
        </Sidebar>
    );
}
