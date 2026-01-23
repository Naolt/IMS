import Image from 'next/image';
import { Suspense } from 'react';
import ResetPasswordForm from './_components/ResetPasswordForm';

function ResetPasswordContent() {
    return <ResetPasswordForm />;
}

export default function ResetPassword() {
    return (
        <main className="min-h-screen w-full flex overflow-x-hidden">
            {/*left image*/}
            <div className="flex-1 hidden md:block">
                <Image
                    className="object-cover w-full h-full"
                    src="/signinBG.svg"
                    alt="Reset password background"
                    width={180}
                    height={38}
                    priority
                />
            </div>

            {/*Reset password form*/}
            <div className="flex-1 flex items-center justify-center p-4">
                <Suspense fallback={<div>Loading...</div>}>
                    <ResetPasswordContent />
                </Suspense>
            </div>
        </main>
    );
}
