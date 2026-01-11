'use client';
import Image from 'next/image';
import LogoWhite from '../../../../../public/logos/white.svg';
import LogoBlack from '../../../../../public/logos/black.svg';
import { useSettings } from '@/hooks/use-settings';
import { useTheme } from 'next-themes';

export default function Logo() {
    const { theme } = useTheme();
    const { data: settings } = useSettings();

    const customLogo = settings?.data?.boutique_logo;
    const boutiqueName = settings?.data?.boutique_name;

    // Extract base theme from combined theme (e.g., "dark-rose" → "dark", "light-blue" → "light")
    const baseTheme = theme?.startsWith('dark') ? 'dark' : 'light';

    // If custom logo exists, use it; otherwise fallback to default
    if (customLogo) {
        return (
            <div className="flex items-center gap-2">
                <Image
                    src={customLogo}
                    alt={boutiqueName || 'Logo'}
                    width={40}
                    height={40}
                    className={`object-contain ${baseTheme === 'dark' ? 'invert' : ''}`}
                />
                {boutiqueName && (
                    <span className="font-semibold text-lg">{boutiqueName}</span>
                )}
            </div>
        );
    }

    // Default logo
    return (
        <>
            <Image
                src={baseTheme === 'dark' ? LogoWhite : LogoBlack}
                alt="Logo"
                width={150}
                height={40}
            />
        </>
    );
}
