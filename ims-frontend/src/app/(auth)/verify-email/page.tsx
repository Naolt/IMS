import Image from 'next/image';
import { Suspense } from 'react';
import VerifyEmailContent from './_components/VerifyEmailContent';

function VerifyEmailWrapper() {
    return <VerifyEmailContent />;
}

export default function VerifyEmail() {
    return (
        <main className="min-h-screen w-full flex overflow-x-hidden">
            {/*left image*/}
            <div className="flex-1 hidden md:block">
                <Image
                    className="object-cover w-full h-full"
                    src="/signinBG.svg"
                    alt="Verify email background"
                    width={180}
                    height={38}
                    priority
                />
            </div>

            {/*Verify email content*/}
            <div className="flex-1 flex items-center justify-center p-4">
                <Suspense fallback={<div>Loading...</div>}>
                    <VerifyEmailWrapper />
                </Suspense>
            </div>
        </main>
    );
}
