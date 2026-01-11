'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';

interface ProtectedRouteProps {
    children: React.ReactNode;
    requireAdmin?: boolean;
}

export function ProtectedRoute({
    children,
    requireAdmin = false,
}: ProtectedRouteProps) {
    const { user, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading) {
            if (!user) {
                router.push('/');
            } else if (requireAdmin && user.role !== 'ADMIN') {
                router.push('/dashboard');
            }
        }
    }, [user, isLoading, requireAdmin, router]);

    // Show loading state
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

    // Don't render if not authenticated or not authorized
    if (!user || (requireAdmin && user.role !== 'ADMIN')) {
        return null;
    }

    return <>{children}</>;
}
