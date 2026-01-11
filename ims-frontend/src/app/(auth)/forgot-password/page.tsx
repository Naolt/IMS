import Image from 'next/image';
import ForgotPasswordForm from './_components/ForgotPasswordForm';

export default function ForgotPassword() {
    return (
        <main className="h-screen w-full flex">
            {/*left image*/}
            <div className="flex-1 hidden md:block">
                <Image
                    className="object-cover w-full h-full"
                    src="/signinBG.svg"
                    alt="Forgot password background"
                    width={180}
                    height={38}
                    priority
                />
            </div>

            {/*Forgot password form*/}
            <div className="flex-1 flex items-center justify-center p-4">
                <ForgotPasswordForm />
            </div>
        </main>
    );
}
