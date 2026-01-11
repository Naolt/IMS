'use client';

import * as React from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { authApi } from '@/services/api';
import { handleApiError } from '@/lib/api-client';

import { Button } from '@/components/ui/button';
import {
    Card,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle
} from '@/components/ui/card';

export default function VerifyEmailContent() {
    const [status, setStatus] = React.useState<
        'loading' | 'success' | 'error'
    >('loading');
    const [errorMessage, setErrorMessage] = React.useState<string>('');
    const searchParams = useSearchParams();
    const token = searchParams.get('token');

    React.useEffect(() => {
        const verifyEmail = async () => {
            if (!token) {
                setStatus('error');
                setErrorMessage('Invalid verification link. Please check your email for the correct link.');
                return;
            }

            try {
                await authApi.verifyEmail(token);
                setStatus('success');
            } catch (error) {
                setStatus('error');
                setErrorMessage(handleApiError(error));
            }
        };

        verifyEmail();
    }, [token]);

    if (status === 'loading') {
        return (
            <Card className="w-full max-w-[400px]">
                <CardHeader className="text-center">
                    <div className="flex justify-center mb-4">
                        <Loader2 className="h-16 w-16 text-primary animate-spin" />
                    </div>
                    <CardTitle className="text-2xl">
                        Verifying Your Email
                    </CardTitle>
                    <CardDescription>
                        Please wait while we verify your email address...
                    </CardDescription>
                </CardHeader>
            </Card>
        );
    }

    if (status === 'success') {
        return (
            <Card className="w-full max-w-[400px]">
                <CardHeader className="text-center">
                    <div className="flex justify-center mb-4">
                        <CheckCircle2 className="h-16 w-16 text-green-500" />
                    </div>
                    <CardTitle className="text-2xl">
                        Email Verified Successfully!
                    </CardTitle>
                    <CardDescription>
                        Your email has been verified. You can now log in to your
                        account.
                    </CardDescription>
                </CardHeader>
                <CardFooter className="flex justify-center">
                    <Link href="/">
                        <Button>Go to Login</Button>
                    </Link>
                </CardFooter>
            </Card>
        );
    }

    return (
        <Card className="w-full max-w-[400px]">
            <CardHeader className="text-center">
                <div className="flex justify-center mb-4">
                    <XCircle className="h-16 w-16 text-red-500" />
                </div>
                <CardTitle className="text-2xl">Verification Failed</CardTitle>
                <CardDescription>
                    {errorMessage || 'This verification link is invalid or has expired. Please request a new verification email.'}
                </CardDescription>
            </CardHeader>
            <CardFooter className="flex justify-center gap-4">
                <Link href="/signup">
                    <Button variant="outline">Sign Up Again</Button>
                </Link>
                <Link href="/">
                    <Button>Go to Login</Button>
                </Link>
            </CardFooter>
        </Card>
    );
}
