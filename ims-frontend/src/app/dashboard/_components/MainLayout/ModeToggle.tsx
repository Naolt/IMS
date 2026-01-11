'use client';

import * as React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useSettings, useUpdateSetting } from '@/hooks/use-settings';

import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';

type BaseTheme = 'light' | 'dark';
type ColorTheme = 'default' | 'rose' | 'blue' | 'green' | 'orange';

export function ModeToggle() {
    const { theme, setTheme } = useTheme();
    const { data: settings } = useSettings();
    const { mutate: updateSetting } = useUpdateSetting();

    // Extract current color theme from settings
    const colorTheme = (settings?.data?.color_theme as ColorTheme) || 'default';

    const handleThemeChange = (newBaseTheme: BaseTheme) => {
        // Combine base theme with current color theme
        const combinedTheme = colorTheme === 'default' ? newBaseTheme : `${newBaseTheme}-${colorTheme}`;
        setTheme(combinedTheme);

        // Update the document classes directly for immediate effect
        const html = document.documentElement;
        html.classList.remove('light', 'dark');
        html.classList.add(newBaseTheme);

        if (colorTheme !== 'default') {
            html.classList.remove('light-rose', 'dark-rose', 'light-blue', 'dark-blue', 'light-green', 'dark-green', 'light-orange', 'dark-orange');
            html.classList.add(`${newBaseTheme}-${colorTheme}`);
        }

        // Save base theme to settings
        updateSetting({
            key: 'base_theme',
            value: newBaseTheme,
            description: 'Base theme (light/dark)',
        });
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                    <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                    <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                    <span className="sr-only">Toggle theme</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleThemeChange('light')}>
                    Light
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleThemeChange('dark')}>
                    Dark
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
