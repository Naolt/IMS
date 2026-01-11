import Image from 'next/image';
import VerifyEmailContent from './_components/VerifyEmailContent';

export default function VerifyEmail() {
    return (
        <main className="h-screen w-full flex">
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
                <VerifyEmailContent />
            </div>
        </main>
    );
}
