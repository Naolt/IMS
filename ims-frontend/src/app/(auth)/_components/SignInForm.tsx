'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Link from 'next/link';
import { useAuth } from '@/contexts/auth-context';
import { toast } from 'sonner';
import { authApi } from '@/services/api';
import apiClient from '@/lib/api-client';

import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { AlertCircle, Database, Loader2 } from 'lucide-react';

const signInSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters')
});

type SignInFormData = z.infer<typeof signInSchema>;

export default function SignInForm() {
    const [isLoading, setIsLoading] = React.useState(false);
    const [isResending, setIsResending] = React.useState(false);
    const [isSeeding, setIsSeeding] = React.useState(false);
    const [isCheckingDb, setIsCheckingDb] = React.useState(true);
    const [needsSeed, setNeedsSeed] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);
    const [showResendOption, setShowResendOption] = React.useState(false);
    const [lastEmail, setLastEmail] = React.useState<string>('');
    const [seedResult, setSeedResult] = React.useState<{
        admin: { email: string; password: string };
        staff: { email: string; password: string };
    } | null>(null);
    const { signIn } = useAuth();

    const {
        register,
        handleSubmit,
        formState: { errors },
        getValues,
        setValue
    } = useForm<SignInFormData>({
        resolver: zodResolver(signInSchema)
    });

    // Check if database needs seeding on mount
    React.useEffect(() => {
        const checkDatabase = async () => {
            try {
                // Try a lightweight request to check if db has data
                // We'll attempt to seed and check the response
                const response = await apiClient.post('/api/seed');
                // If we get here, the seed was successful - db was empty
                if (response.data.success) {
                    setSeedResult(response.data.data.credentials);
                    setValue('email', response.data.data.credentials.admin.email);
                    setValue('password', response.data.data.credentials.admin.password);
                    toast.success('Database seeded automatically!');
                }
                setNeedsSeed(false);
            } catch (err: any) {
                // If 400, database is already seeded
                if (err.response?.status === 400) {
                    setNeedsSeed(false);
                } else {
                    // Other error - show seed button as fallback
                    setNeedsSeed(true);
                }
            } finally {
                setIsCheckingDb(false);
            }
        };

        checkDatabase();
    }, [setValue]);

    const onSubmit = async (data: SignInFormData) => {
        setIsLoading(true);
        setError(null);
        setShowResendOption(false);

        try {
            await signIn(data);
            toast.success('Signed in successfully!');
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to sign in';
            setError(errorMessage);
            toast.error(errorMessage);

            // Check if error is about email not verified
            if (errorMessage.toLowerCase().includes('not verified') ||
                errorMessage.toLowerCase().includes('verify your email')) {
                setShowResendOption(true);
                setLastEmail(data.email);
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleResendVerification = async () => {
        const email = lastEmail || getValues('email');
        if (!email) {
            toast.error('Please enter your email address');
            return;
        }

        setIsResending(true);
        try {
            await authApi.resendVerificationEmail(email);
            toast.success('Verification email sent! Please check your inbox.');
            setShowResendOption(false);
        } catch (err) {
            toast.error('Failed to send verification email. Please try again.');
        } finally {
            setIsResending(false);
        }
    };

    const handleSeedDatabase = async () => {
        setIsSeeding(true);
        setSeedResult(null);
        try {
            const response = await apiClient.post('/api/seed');
            if (response.data.success) {
                toast.success('Database seeded successfully!');
                setSeedResult(response.data.data.credentials);
                setNeedsSeed(false);
                // Pre-fill admin credentials
                setValue('email', response.data.data.credentials.admin.email);
                setValue('password', response.data.data.credentials.admin.password);
            }
        } catch (err: any) {
            const message = err.response?.data?.message || 'Failed to seed database';
            toast.error(message);
            if (err.response?.status === 400) {
                setNeedsSeed(false);
            }
        } finally {
            setIsSeeding(false);
        }
    };

    return (
        <Card className="w-full max-w-[400px]">
            <CardHeader>
                <CardTitle className="text-center text-2xl">Login</CardTitle>
                <CardDescription className="text-center">
                    Enter your email and password to sign in to your account
                </CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit(onSubmit)}>
                <CardContent>
                    {error && (
                        <Alert variant="destructive" className="mb-4">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>
                                <span>{error}</span>
                                {showResendOption && (
                                    <Button
                                        type="button"
                                        variant="link"
                                        className="p-0 h-auto ml-1 text-destructive-foreground underline"
                                        onClick={handleResendVerification}
                                        disabled={isResending}
                                    >
                                        {isResending ? 'Sending...' : 'Resend verification email'}
                                    </Button>
                                )}
                            </AlertDescription>
                        </Alert>
                    )}
                    {seedResult && (
                        <Alert className="mb-4">
                            <Database className="h-4 w-4" />
                            <AlertDescription>
                                <p className="font-medium mb-1">Database seeded! Use these credentials:</p>
                                <p className="text-xs">Admin: {seedResult.admin.email} / {seedResult.admin.password}</p>
                                <p className="text-xs">Staff: {seedResult.staff.email} / {seedResult.staff.password}</p>
                            </AlertDescription>
                        </Alert>
                    )}
                    <div className="grid w-full items-center gap-4">
                        <div className="flex flex-col space-y-1.5">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="Enter your email address"
                                {...register('email')}
                                disabled={isLoading}
                            />
                            {errors.email && (
                                <p className="text-sm text-red-500">
                                    {errors.email.message}
                                </p>
                            )}
                        </div>
                        <div className="flex flex-col space-y-1.5">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="password">Password</Label>
                                <Link
                                    href="/forgot-password"
                                    className="text-sm text-primary hover:underline"
                                >
                                    Forgot password?
                                </Link>
                            </div>
                            <Input
                                id="password"
                                type="password"
                                placeholder="Enter your password"
                                {...register('password')}
                                disabled={isLoading}
                            />
                            {errors.password && (
                                <p className="text-sm text-red-500">
                                    {errors.password.message}
                                </p>
                            )}
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="flex flex-col gap-4">
                    <Button type="submit" className="w-full" disabled={isLoading || isCheckingDb}>
                        {isLoading ? 'Signing in...' : 'Login'}
                    </Button>
                    <p className="text-sm text-center text-muted-foreground">
                        Don&apos;t have an account?{' '}
                        <Link
                            href="/signup"
                            className="text-primary hover:underline"
                        >
                            Sign up
                        </Link>
                    </p>

                    {/* Seed Database Option - Only show if database needs seeding */}
                    {needsSeed && !isCheckingDb && (
                        <div className="w-full pt-4 border-t">
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        className="w-full"
                                        disabled={isSeeding}
                                    >
                                        {isSeeding ? (
                                            <>
                                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                Seeding...
                                            </>
                                        ) : (
                                            <>
                                                <Database className="h-4 w-4 mr-2" />
                                                Seed Demo Data
                                            </>
                                        )}
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Seed Database</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            This will populate the database with sample data including:
                                            <ul className="list-disc list-inside mt-2 space-y-1">
                                                <li>Admin and Staff user accounts</li>
                                                <li>Sample products with variants</li>
                                                <li>Sample sales records</li>
                                            </ul>
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction onClick={handleSeedDatabase}>
                                            Seed Database
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                            <p className="text-xs text-center text-muted-foreground mt-2">
                                For demo purposes - creates sample data
                            </p>
                        </div>
                    )}
                </CardFooter>
            </form>
        </Card>
    );
}
