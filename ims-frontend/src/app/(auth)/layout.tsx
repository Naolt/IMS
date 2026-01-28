'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
    const { user, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        // Redirect to dashboard if already logged in
        if (!isLoading && user) {
            router.push('/dashboard');
        }
    }, [user, isLoading, router]);

    // Show loading state while checking auth
    if (isLoading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <div className="text-center">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4" />
                    <p className="text-muted-foreground">Loading...</p>
                </div>
            </div>
        );
    }

    // Don't render auth pages if user is logged in
    if (user) {
        return null;
    }

    return (
        <main className="relative min-h-screen w-full flex items-center justify-center p-4 overflow-hidden">
            {/* Background Image */}
            <div
                className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                style={{ backgroundImage: 'url(/background-auth.webp)' }}
            />

            {/* Overlay for better readability */}
            <div className="absolute inset-0 bg-background/85 backdrop-blur-[2px]" />

            {/* Content */}
            <div className="relative z-10 w-full max-w-md">
                {children}
            </div>
        </main>
    );
}
