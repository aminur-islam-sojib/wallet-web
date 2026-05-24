"use client";

import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Check,
  Eye,
  EyeOff,
  FileText,
  Lock,
  Mail,
  User,
  X,
} from "lucide-react";
import {
  type ReactNode,
  useActionState,
  useEffect,
  useId,
  useState,
  useTransition,
} from "react";

import {
  signUpWithCredentials,
  type SignUpState,
} from "@/app/(auth)/signin/actions";

const GoogleIcon = () => (
  <svg aria-hidden="true" className="h-6 w-6" viewBox="0 0 24 24">
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
    />
  </svg>
);

type FloatingFieldProps = {
  autoComplete: string;
  icon: ReactNode;
  id: string;
  label: string;
  name: string;
  onChange: (value: string) => void;
  placeholder: string;
  type: string;
  value: string;
  disabled?: boolean;
  trailing?: ReactNode;
};

function FloatingField({
  autoComplete,
  icon,
  id,
  label,
  name,
  onChange,
  placeholder,
  type,
  value,
  disabled,
  trailing,
}: FloatingFieldProps) {
  return (
    <div className="group relative">
      <label
        htmlFor={id}
        className="absolute left-4 top-0 z-10 -translate-y-1/2 bg-white px-2 text-sm font-semibold text-slate-500 transition-colors group-focus-within:text-[#3B66CC]"
      >
        {label}
      </label>
      <div className="relative">
        <span className="pointer-events-none absolute left-4 top-1/2 flex -translate-y-1/2 text-slate-400">
          {icon}
        </span>
        <input
          id={id}
          name={name}
          type={type}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          required
          disabled={disabled}
          className="min-h-14 w-full rounded-[18px] border border-slate-300 bg-white px-5 py-4 pl-12 pr-12 text-base text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#3B66CC] focus:ring-4 focus:ring-[#3B66CC]/15 disabled:cursor-not-allowed disabled:opacity-65"
        />
        {trailing}
      </div>
    </div>
  );
}

export default function Register() {
  const router = useRouter();
  const nameId = useId();
  const emailId = useId();
  const passwordId = useId();
  const termsId = useId();
  const [showPassword, setShowPassword] = useState(false);
  const [termsOpen, setTermsOpen] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [signupError, setSignupError] = useState<string | null>(null);
  const [googlePending, setGooglePending] = useState(false);
  const [signupState, signupAction, signupPending] = useActionState<
    SignUpState,
    FormData
  >(signUpWithCredentials, { status: "idle" });
  const [signinPending, startSignin] = useTransition();

  const busy = signupPending || signinPending || googlePending;

  async function handleGoogleSignin() {
    if (busy) {
      return;
    }

    setSignupError(null);
    setGooglePending(true);

    try {
      await signIn("google", { callbackUrl: "/" });
    } catch {
      setSignupError("Google sign-in failed. Please try again.");
      setGooglePending(false);
    }
  }

  useEffect(() => {
    if (signupState.status !== "success") {
      return;
    }

    startSignin(async () => {
      setSignupError(null);
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.ok) {
        router.push("/");
        return;
      }

      setSignupError("Account created, but sign-in failed. Try logging in.");
    });
  }, [email, password, router, signupState.status, startSignin]);

  return (
    <section className="flex min-h-screen w-full justify-center bg-white sm:bg-slate-100 sm:px-4 sm:py-8">
      <div className="relative flex min-h-screen w-full max-w-107.5 flex-col overflow-hidden bg-white sm:min-h-0 sm:rounded-[32px] sm:shadow-xl">
        <div className="relative h-67 shrink-0 overflow-hidden bg-[linear-gradient(135deg,#9bb1ff_0%,#b6c6ff_52%,#d8e0ff_100%)]">
          <div className="absolute -left-12 -top-12 h-44 w-44 rounded-full bg-[linear-gradient(135deg,#162a63,#2b4c9e)] opacity-95" />
          <div className="absolute -right-10 top-20 h-40 w-40 rounded-full bg-white/40 blur-xs" />
          <div className="absolute left-8 top-12 text-white">
            <p className="text-base font-semibold text-white/80">Wallet Web</p>
            <h1 className="mt-3 max-w-62.5 text-4xl font-bold leading-tight tracking-normal">
              Get Started!
            </h1>
          </div>
          <svg
            aria-hidden="true"
            className="absolute -bottom-px left-0 h-28 w-full"
            fill="none"
            preserveAspectRatio="none"
            viewBox="0 0 400 120"
          >
            <path d="M0 40C120 90 280 20 400 60V120H0V40Z" fill="#ffffff" />
          </svg>
        </div>

        <div className="relative z-10 -mt-10 flex flex-1 flex-col rounded-t-[42px] bg-white px-6 pb-8 pt-8 min-[390px]:px-8">
          <div className="mb-8 text-center">
            <h2 className="text-[34px] font-bold leading-tight tracking-normal text-[#1E4499]">
              Create Account
            </h2>
            <p className="mt-2 text-base font-medium text-slate-500">
              Already have an account?{" "}
              <Link
                href="/login"
                className="font-bold text-[#3B66CC] underline-offset-4 hover:underline"
              >
                Login
              </Link>
            </p>
          </div>

          <form action={signupAction} className="space-y-6">
            <FloatingField
              id={nameId}
              name="name"
              label="Full Name"
              value={fullName}
              onChange={setFullName}
              type="text"
              autoComplete="name"
              placeholder="Enter full name"
              disabled={busy}
              icon={<User aria-hidden="true" className="h-5 w-5" />}
            />

            <FloatingField
              id={emailId}
              name="email"
              label="Email Address"
              value={email}
              onChange={setEmail}
              type="email"
              autoComplete="email"
              placeholder="Enter email address"
              disabled={busy}
              icon={<Mail aria-hidden="true" className="h-5 w-5" />}
            />

            <FloatingField
              id={passwordId}
              name="password"
              label="Password"
              value={password}
              onChange={setPassword}
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              placeholder="Enter password"
              disabled={busy}
              icon={<Lock aria-hidden="true" className="h-5 w-5" />}
              trailing={
                <button
                  type="button"
                  onClick={() => setShowPassword((current) => !current)}
                  disabled={busy}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-2 top-1/2 flex min-h-11 min-w-11 -translate-y-1/2 items-center justify-center rounded-full text-slate-400 transition hover:text-[#3B66CC] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#3B66CC]/20 disabled:cursor-not-allowed disabled:opacity-55"
                >
                  {showPassword ? (
                    <EyeOff aria-hidden="true" className="h-5 w-5" />
                  ) : (
                    <Eye aria-hidden="true" className="h-5 w-5" />
                  )}
                </button>
              }
            />

            <div className="flex items-center gap-3">
              <label
                htmlFor={termsId}
                className="flex min-h-11 min-w-11 cursor-pointer items-center justify-center"
              >
                <input
                  id={termsId}
                  type="checkbox"
                  checked={termsAccepted}
                  onChange={(event) => setTermsAccepted(event.target.checked)}
                  required
                  disabled={busy}
                  className="peer sr-only"
                />
                <span className="flex h-6 w-6 items-center justify-center rounded-md border border-slate-300 bg-white transition peer-checked:border-[#3B66CC] peer-checked:bg-[#EBF1FF]">
                  {termsAccepted ? (
                    <Check
                      aria-hidden="true"
                      className="h-4 w-4 text-[#3B66CC]"
                    />
                  ) : null}
                </span>
              </label>
              <p className="text-sm font-medium leading-5 text-slate-500">
                I agree to{" "}
                <button
                  type="button"
                  onClick={() => setTermsOpen(true)}
                  disabled={busy}
                  className="min-h-11 font-bold text-[#1E4499] underline-offset-4 hover:underline disabled:cursor-not-allowed disabled:opacity-55"
                >
                  Terms and Conditions
                </button>
              </p>
            </div>

            <button
              type="submit"
              disabled={busy}
              className="flex min-h-14 w-full items-center justify-center rounded-[18px] bg-chart-1 px-5 py-4 text-base font-bold text-white shadow-lg shadow-[#3B66CC]/20 transition hover:bg-[#2A52B3] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#3B66CC]/25 disabled:pointer-events-none disabled:opacity-65 motion-safe:active:scale-[0.98]"
            >
              {googlePending
                ? "Signing in..."
                : signupPending || signinPending
                  ? "Creating account..."
                  : "Sign Up"}
            </button>
            {signupState.status === "error" ? (
              <p
                className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600"
                role="alert"
              >
                {signupState.message}
              </p>
            ) : null}
            {signupError ? (
              <p
                className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600"
                role="alert"
              >
                {signupError}
              </p>
            ) : null}
          </form>

          <div className="mt-8">
            <div className="relative mb-6 flex items-center justify-center">
              <span className="absolute h-px w-full bg-slate-200" />
              <span className="relative bg-white px-4 text-sm font-semibold text-slate-400">
                Sign up with
              </span>
            </div>

            <div className="flex justify-center">
              <button
                type="button"
                onClick={handleGoogleSignin}
                disabled={busy}
                aria-label="Sign up with Google"
                className="flex h-14 min-w-14 items-center justify-center gap-3 rounded-full border border-slate-100 bg-white px-4 font-semibold text-slate-600 shadow-sm transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#3B66CC]/20 disabled:cursor-not-allowed disabled:opacity-65 motion-safe:active:scale-95"
              >
                <GoogleIcon />
              </button>
            </div>
          </div>

          <div className="mt-auto flex justify-center pb-1 pt-8">
            <div className="h-1.5 w-36 rounded-full bg-slate-300" />
          </div>
        </div>

        <div
          className={`absolute inset-0 z-40 flex items-end bg-black/50 transition-opacity duration-300 ${
            termsOpen ? "opacity-100" : "pointer-events-none opacity-0"
          }`}
          aria-hidden={!termsOpen}
        >
          <div
            className={`max-h-[80%] w-full overflow-y-auto rounded-t-[32px] bg-white p-8 shadow-2xl transition-transform duration-300 ${
              termsOpen ? "translate-y-0" : "translate-y-full"
            }`}
            role="dialog"
            aria-modal="true"
            aria-labelledby="terms-title"
          >
            <div className="mx-auto mb-6 h-1.5 w-12 rounded-full bg-slate-300" />
            <div className="mb-6 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#EBF1FF] text-[#3B66CC]">
                  <FileText aria-hidden="true" className="h-5 w-5" />
                </span>
                <h3
                  id="terms-title"
                  className="text-xl font-bold text-[#1E4499]"
                >
                  Terms and Conditions
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setTermsOpen(false)}
                disabled={busy}
                aria-label="Close terms"
                className="flex min-h-11 min-w-11 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#3B66CC]/15 disabled:cursor-not-allowed disabled:opacity-55"
              >
                <X aria-hidden="true" className="h-6 w-6" />
              </button>
            </div>
            <div className="space-y-4 text-sm leading-6 text-slate-600">
              <p className="font-semibold text-slate-700">
                Welcome to Wallet Web.
              </p>
              <p>
                By creating an account, you agree to use the app responsibly and
                keep your sign-in details private.
              </p>
              <p>
                Your wallet data is tied to your account so you can track
                income, expenses, limits, categories, and history across
                sessions.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setTermsAccepted(true);
                setTermsOpen(false);
              }}
              disabled={busy}
              className="mt-6 flex min-h-14 w-full items-center justify-center rounded-[18px] bg-[#3B66CC] px-5 py-4 text-base font-bold text-white transition hover:bg-[#2A52B3] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#3B66CC]/25 disabled:cursor-not-allowed disabled:opacity-65"
            >
              I Agree
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
