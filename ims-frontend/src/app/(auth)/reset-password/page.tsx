import Image from 'next/image';
import ResetPasswordForm from './_components/ResetPasswordForm';

export default function ResetPassword() {
    return (
        <main className="h-screen w-full flex">
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
                <ResetPasswordForm />
            </div>
        </main>
    );
}
