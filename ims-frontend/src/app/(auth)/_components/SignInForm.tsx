'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Link from 'next/link';
import { useAuth } from '@/contexts/auth-context';
import { toast } from 'sonner';
import { authApi } from '@/services/api';

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
import { AlertCircle } from 'lucide-react';

const signInSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters')
});

type SignInFormData = z.infer<typeof signInSchema>;

export default function SignInForm() {
    const [isLoading, setIsLoading] = React.useState(false);
    const [isResending, setIsResending] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);
    const [showResendOption, setShowResendOption] = React.useState(false);
    const [lastEmail, setLastEmail] = React.useState<string>('');
    const { signIn } = useAuth();

    const {
        register,
        handleSubmit,
        formState: { errors },
        getValues
    } = useForm<SignInFormData>({
        resolver: zodResolver(signInSchema)
    });

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
                    <Button type="submit" className="w-full" disabled={isLoading}>
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
                </CardFooter>
            </form>
        </Card>
    );
}
