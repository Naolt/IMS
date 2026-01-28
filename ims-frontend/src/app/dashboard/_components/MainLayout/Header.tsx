import { SidebarTrigger } from '@/components/ui/sidebar';
import { ModeToggle } from './ModeToggle';
import Logo from './Logo';

export default function Header() {
    return (
        <div className="flex justify-between w-full px-4 md:px-8 py-4 items-center">
            {/* Show logo on mobile, sidebar trigger on larger screens */}
            <div className="md:hidden">
                <Logo />
            </div>
            <div className="hidden md:block">
                <SidebarTrigger />
            </div>
            <ModeToggle />
        </div>
    );
}
