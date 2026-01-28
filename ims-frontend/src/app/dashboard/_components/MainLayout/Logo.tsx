'use client';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import LogoWhite from '../../../../../public/logos/white.svg';
import LogoBlack from '../../../../../public/logos/black.svg';
import { useSettings } from '@/hooks/use-settings';
import { useTheme } from 'next-themes';

export default function Logo() {
    const [mounted, setMounted] = useState(false);
    const { resolvedTheme } = useTheme();
    const { data: settings } = useSettings();

    useEffect(() => {
        setMounted(true);
    }, []);

    const customLogo = settings?.data?.boutique_logo;
    const boutiqueName = settings?.data?.boutique_name;

    // Extract base theme from combined theme (e.g., "dark-rose" → "dark", "light-blue" → "light")
    const baseTheme = resolvedTheme?.startsWith('dark') ? 'dark' : 'light';

    // Show placeholder during hydration to prevent flash
    if (!mounted) {
        return (
            <div className="flex items-center gap-2 h-10 w-[150px]">
                <div className="h-10 w-10 bg-muted/50 rounded animate-pulse" />
            </div>
        );
    }

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
