import { SidebarTrigger } from '@/components/ui/sidebar';
import { ModeToggle } from './ModeToggle';

export default function Header() {
    return (
        <div className="flex justify-between w-full px-8 py-4 items-center">
            <SidebarTrigger />
            <ModeToggle />
        </div>
    );
}
