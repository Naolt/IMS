'use client';
import { useTheme } from 'next-themes';
import Image from 'next/image';
import LogoWhite from '../../../../../public/logos/white.svg';
import LogoBlack from '../../../../../public/logos/black.svg';

export default function Logo() {
    const { theme } = useTheme();

    return (
        <Image
            src={theme === 'dark' ? LogoWhite : LogoBlack}
            alt="Logo"
            width={150}
            height={40}
        />
    );
}
