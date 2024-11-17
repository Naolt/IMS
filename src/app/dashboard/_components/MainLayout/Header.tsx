import { SidebarTrigger } from '@/components/ui/sidebar';
import { ModeToggle } from './ModeToggle';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Header() {
    return (
        <div className="flex justify-between w-full px-8 py-4 items-center">
            <SidebarTrigger />
            {/* theme and notification */}
            <div className="flex gap-1">
                <ModeToggle />
                <Button size={'icon'} variant={'ghost'}>
                    <Bell className="w-6 h-6" />
                </Button>
            </div>
        </div>
    );
}
