import Image from "next/image";
import SignInForm from "./_components/SignInForm";

export default function SignIn() {
  return (
    <main className="min-h-screen w-full flex overflow-x-hidden">
      {/*left image*/}
      <div className="flex-1 hidden md:block">
        <Image
          className="object-cover w-full h-full"
          src="/signinBG.svg"
          alt="Next.js logo"
          width={180}
          height={38}

          priority
        />
      </div>

      {/*Sign in form*/}
	  <div className="flex-1 flex items-center justify-center p-4">
      <SignInForm />
	  </div>
    </main>
  );
}
