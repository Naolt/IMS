import { Calendar, Home, Inbox, Search, Settings, User } from 'lucide-react';

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem
} from '@/components/ui/sidebar';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import Logo from './Logo';

// Menu items.
const items = [
    {
        title: 'Overview',
        url: '#',
        icon: Home
    },
    {
        title: 'Inventory',
        url: '#',
        icon: Inbox
    },
    {
        title: 'Sales',
        url: '#',
        icon: Calendar
    },
    {
        title: 'Report',
        url: '#',
        icon: Search
    },
    {
        title: 'Feedback',
        url: '#',
        icon: Settings
    }
];

export default function AppSidebar() {
    return (
        <Sidebar>
            <SidebarHeader>
                <Logo />
            </SidebarHeader>
            <SidebarContent>
                <SidebarGroup>
                    {/*<SidebarGroupLabel>Application</SidebarGroupLabel>*/}
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {items.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton asChild>
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
            <SidebarFooter className="flex">
                <Button className="flex justify-start gap-2" variant={'ghost'}>
                    <User />
                    <div className="flex flex-col gap-1 items-start">
                        <span>John Doe</span>
                        <span className="text-gray-500">example@gmail.com</span>
                    </div>
                </Button>
            </SidebarFooter>
        </Sidebar>
    );
}
