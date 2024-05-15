import {
  RegisterLink,
  LoginLink,
} from "@kinde-oss/kinde-auth-nextjs/components";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between bg-[#E05767] p-24">
      <div className="m-auto text-center text-white">
        <div className="m-auto mt-8 w-32">
          <button className="h-10 w-32 rounded bg-white text-[#E05767]">
            <LoginLink postLoginRedirectURL="/dashboard">Sign in</LoginLink>
          </button>
          {/* <button className="mt-2 h-10 w-32 rounded border-2 bg-none text-white">
            <RegisterLink postLoginRedirectURL="/redirect">
              Sign up
            </RegisterLink>
          </button> */}
        </div>
      </div>
    </main>
  );
}
