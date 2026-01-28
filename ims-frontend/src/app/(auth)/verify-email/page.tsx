import { Suspense } from 'react';
import VerifyEmailContent from './_components/VerifyEmailContent';

export default function VerifyEmail() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <VerifyEmailContent />
        </Suspense>
    );
}
