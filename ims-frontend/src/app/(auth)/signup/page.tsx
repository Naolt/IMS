import Image from 'next/image';
import SignUpForm from './_components/SignUpForm';

export default function SignUp() {
    return (
        <main className="min-h-screen w-full flex overflow-x-hidden">
            {/*left image*/}
            <div className="flex-1 hidden md:block">
                <Image
                    className="object-cover w-full h-full"
                    src="/signinBG.svg"
                    alt="Sign up background"
                    width={180}
                    height={38}
                    priority
                />
            </div>

            {/*Sign up form*/}
            <div className="flex-1 flex items-center justify-center p-4">
                <SignUpForm />
            </div>
        </main>
    );
}
