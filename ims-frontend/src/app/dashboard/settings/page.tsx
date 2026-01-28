'use client';

import { useState, useEffect } from 'react';
import { useSettings, useUpdateSetting } from '@/hooks/use-settings';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Save, Settings as SettingsIcon, Sun, Moon, Palette } from 'lucide-react';
import CloudinaryUpload from '@/components/cloudinary-upload';
import { useTheme } from 'next-themes';

type BaseTheme = 'light' | 'dark';
type ColorTheme = 'default' | 'rose' | 'blue' | 'green' | 'orange';

const colorThemes: Array<{ value: ColorTheme; label: string; color: string }> = [
    { value: 'default', label: 'Default', color: 'bg-gray-500 border-gray-600' },
    { value: 'rose', label: 'Rose', color: 'bg-rose-500 border-rose-600' },
    { value: 'blue', label: 'Blue', color: 'bg-blue-500 border-blue-600' },
    { value: 'green', label: 'Green', color: 'bg-green-500 border-green-600' },
    { value: 'orange', label: 'Orange', color: 'bg-orange-500 border-orange-600' },
];

export default function SettingsPage() {
    const { data: settings, isLoading } = useSettings();
    const { mutate: updateSetting, isPending: isUpdating } = useUpdateSetting();
    const { theme, setTheme } = useTheme();

    const [boutiqueName, setBoutiqueName] = useState('');
    const [logoUrl, setLogoUrl] = useState('');
    const [baseTheme, setBaseTheme] = useState<BaseTheme>('dark');
    const [colorTheme, setColorTheme] = useState<ColorTheme>('default');

    // Update form values from settings and apply theme
    useEffect(() => {
        if (settings?.data) {
            setBoutiqueName(settings.data.boutique_name || '');
            setLogoUrl(settings.data.boutique_logo || '');
            const savedBaseTheme = (settings.data.base_theme as BaseTheme) || 'dark';
            const savedColorTheme = (settings.data.color_theme as ColorTheme) || 'default';

            setBaseTheme(savedBaseTheme);
            setColorTheme(savedColorTheme);

            // Apply the combined theme
            const combinedTheme = savedColorTheme === 'default' ? savedBaseTheme : `${savedBaseTheme}-${savedColorTheme}`;
            setTheme(combinedTheme);

            // Update the document classes directly
            const html = document.documentElement;
            html.classList.remove('light', 'dark');
            html.classList.add(savedBaseTheme);

            // Remove all combined theme classes first
            html.classList.remove('light-rose', 'dark-rose', 'light-blue', 'dark-blue', 'light-green', 'dark-green', 'light-orange', 'dark-orange');

            // Add combined theme class if color theme is not default
            if (savedColorTheme !== 'default') {
                html.classList.add(`${savedBaseTheme}-${savedColorTheme}`);
            }
        }
    }, [settings, setTheme]);

    const handleSaveBoutiqueName = () => {
        updateSetting({
            key: 'boutique_name',
            value: boutiqueName,
            description: 'Name of the boutique',
        });
    };

    const handleLogoChange = (url: string) => {
        setLogoUrl(url);
        // Automatically save logo URL to settings
        updateSetting({
            key: 'boutique_logo',
            value: url,
            description: 'Boutique logo image URL',
        });
    };

    const handleLogoRemove = () => {
        setLogoUrl('');
        // Remove logo from settings
        updateSetting({
            key: 'boutique_logo',
            value: '',
            description: 'Boutique logo image URL',
        });
    };

    const handleBaseThemeChange = (newBaseTheme: BaseTheme) => {
        setBaseTheme(newBaseTheme);
        // Combine base theme with color theme
        const combinedTheme = colorTheme === 'default' ? newBaseTheme : `${newBaseTheme}-${colorTheme}`;
        setTheme(combinedTheme);

        // Also update the document classes directly for immediate effect
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

    const handleColorThemeChange = (newColorTheme: ColorTheme) => {
        setColorTheme(newColorTheme);
        // Combine base theme with color theme
        const combinedTheme = newColorTheme === 'default' ? baseTheme : `${baseTheme}-${newColorTheme}`;
        setTheme(combinedTheme);

        // Also update the document classes directly for immediate effect
        const html = document.documentElement;

        if (newColorTheme === 'default') {
            // Remove all combined theme classes
            html.classList.remove('light-rose', 'dark-rose', 'light-blue', 'dark-blue', 'light-green', 'dark-green', 'light-orange', 'dark-orange');
        } else {
            // Remove all combined theme classes first
            html.classList.remove('light-rose', 'dark-rose', 'light-blue', 'dark-blue', 'light-green', 'dark-green', 'light-orange', 'dark-orange');
            // Add the new combined theme class
            html.classList.add(`${baseTheme}-${newColorTheme}`);
        }

        // Save color theme to settings
        updateSetting({
            key: 'color_theme',
            value: newColorTheme,
            description: 'Color accent theme',
        });
    };

    return (
        <div className="h-full flex flex-col gap-4 sm:gap-6">
            {/* Header */}
            <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                    <SettingsIcon className="h-5 w-5 text-primary" />
                </div>
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold">Settings</h1>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                        Configure your boutique settings
                    </p>
                </div>
            </div>

            <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                {/* Boutique Name */}
                <Card>
                    <CardHeader>
                        <CardTitle>Boutique Name</CardTitle>
                        <CardDescription>
                            Set the name of your boutique
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {isLoading ? (
                            <Skeleton className="h-10 w-full" />
                        ) : (
                            <>
                                <div className="space-y-2">
                                    <Label htmlFor="boutique-name">Boutique Name</Label>
                                    <Input
                                        id="boutique-name"
                                        value={boutiqueName}
                                        onChange={(e) => setBoutiqueName(e.target.value)}
                                        placeholder="Enter boutique name"
                                    />
                                </div>
                                <Button
                                    onClick={handleSaveBoutiqueName}
                                    disabled={isUpdating || !boutiqueName}
                                    className="w-full"
                                >
                                    <Save className="h-4 w-4 mr-2" />
                                    Save Name
                                </Button>
                            </>
                        )}
                    </CardContent>
                </Card>

                {/* Logo Upload */}
                <Card>
                    <CardHeader>
                        <CardTitle>Boutique Logo</CardTitle>
                        <CardDescription>
                            Upload your boutique logo (PNG, JPG, SVG)
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <Skeleton className="h-64 w-full" />
                        ) : (
                            <CloudinaryUpload
                                value={logoUrl}
                                onChange={handleLogoChange}
                                onRemove={handleLogoRemove}
                                disabled={isUpdating}
                            />
                        )}
                    </CardContent>
                </Card>

                {/* Base Theme (Light/Dark) */}
                <Card>
                    <CardHeader>
                        <CardTitle>Base Theme</CardTitle>
                        <CardDescription>
                            Choose light or dark mode
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {isLoading ? (
                            <Skeleton className="h-24 w-full" />
                        ) : (
                            <div className="grid grid-cols-2 gap-3">
                                <Button
                                    variant={baseTheme === 'light' ? 'default' : 'outline'}
                                    className="h-20 flex flex-col gap-2"
                                    onClick={() => handleBaseThemeChange('light')}
                                    disabled={isUpdating}
                                >
                                    <Sun className="h-8 w-8" />
                                    <span className="text-sm">Light</span>
                                </Button>
                                <Button
                                    variant={baseTheme === 'dark' ? 'default' : 'outline'}
                                    className="h-20 flex flex-col gap-2"
                                    onClick={() => handleBaseThemeChange('dark')}
                                    disabled={isUpdating}
                                >
                                    <Moon className="h-8 w-8" />
                                    <span className="text-sm">Dark</span>
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Color Theme */}
                <Card>
                    <CardHeader>
                        <CardTitle>Accent Color</CardTitle>
                        <CardDescription>
                            Choose your preferred accent color
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {isLoading ? (
                            <Skeleton className="h-32 w-full" />
                        ) : (
                            <div className="grid grid-cols-2 gap-3">
                                {colorThemes.map((option) => (
                                    <Button
                                        key={option.value}
                                        variant={colorTheme === option.value ? 'default' : 'outline'}
                                        className="h-16 flex items-center gap-3 justify-start px-4"
                                        onClick={() => handleColorThemeChange(option.value)}
                                        disabled={isUpdating}
                                    >
                                        <div className={`w-6 h-6 rounded-full ${option.color}`} />
                                        <span className="text-sm">{option.label}</span>
                                    </Button>
                                ))}
                            </div>
                        )}
                        <p className="text-xs text-muted-foreground">
                            Current: <span className="font-medium capitalize">{baseTheme}</span> + <span className="font-medium capitalize">{colorTheme}</span>
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
