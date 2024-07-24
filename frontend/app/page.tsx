import { LoginLink } from "@kinde-oss/kinde-auth-nextjs/components";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-r from-pink-500 to-red-500 p-8">
      <div className="text-center">
        <h1 className="text-5xl font-bold mb-6">Welcome to HAL Systems</h1>
        <p className="text-lg mb-12">Your gateway to seamless and secure access.</p>
        <div className="flex flex-col items-center">
          <LoginLink postLoginRedirectURL="/dashboard">
            <button className="h-12 w-40 mb-4 rounded-lg bg-white text-red-600 text-lg font-semibold hover:bg-gray-100">
              Sign in
            </button>
          </LoginLink>
        </div>
      </div>
    </main>
  );
}
