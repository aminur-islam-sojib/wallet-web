"use client";

import { useActionState, useEffect, useState, useTransition } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

import { signUpWithCredentials, type SignUpState } from "@/app/signin/actions";
import { Button } from "@/components/ui/button";

const initialState: SignUpState = { status: "idle" };

export function CredentialsAuth() {
  const router = useRouter();
  const [signinError, setSigninError] = useState<string | null>(null);
  const [signupValues, setSignupValues] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [signinValues, setSigninValues] = useState({
    email: "",
    password: "",
  });
  const [signupState, signupAction, signupPending] = useActionState(
    signUpWithCredentials,
    initialState
  );
  const [signinPending, startSignin] = useTransition();

  useEffect(() => {
    if (signupState.status !== "success") {
      return;
    }

    startSignin(async () => {
      const result = await signIn("credentials", {
        email: signupValues.email,
        password: signupValues.password,
        redirect: false,
      });

      if (result?.ok) {
        router.push("/");
      }
    });
  }, [router, signupState.status, signupValues.email, signupValues.password, startSignin]);

  const handleSignIn = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSigninError(null);

    startSignin(async () => {
      const result = await signIn("credentials", {
        email: signinValues.email,
        password: signinValues.password,
        redirect: false,
      });

      if (result?.ok) {
        router.push("/");
        return;
      }

      setSigninError("Invalid email or password.");
    });
  };

  return (
    <div className="mt-6 space-y-6">
      <div className="border-t pt-6">
        <h2 className="text-sm font-semibold">Sign in with email</h2>
        <form className="mt-3 space-y-3" onSubmit={handleSignIn}>
          <label className="grid gap-1 text-sm">
            Email
            <input
              className="h-10 rounded-md border border-input bg-background px-3 text-sm shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
              type="email"
              name="email"
              autoComplete="email"
              value={signinValues.email}
              onChange={(event) =>
                setSigninValues((values) => ({ ...values, email: event.target.value }))
              }
              required
            />
          </label>
          <label className="grid gap-1 text-sm">
            Password
            <input
              className="h-10 rounded-md border border-input bg-background px-3 text-sm shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
              type="password"
              name="password"
              autoComplete="current-password"
              value={signinValues.password}
              onChange={(event) =>
                setSigninValues((values) => ({ ...values, password: event.target.value }))
              }
              required
            />
          </label>
          {signinError ? <p className="text-xs text-destructive">{signinError}</p> : null}
          <Button type="submit" size="lg" className="w-full" disabled={signinPending}>
            {signinPending ? "Signing in..." : "Sign in"}
          </Button>
        </form>
      </div>

      <div className="border-t pt-6">
        <h2 className="text-sm font-semibold">Create an account</h2>
        <form className="mt-3 space-y-3" action={signupAction}>
          <label className="grid gap-1 text-sm">
            Name
            <input
              className="h-10 rounded-md border border-input bg-background px-3 text-sm shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
              type="text"
              name="name"
              autoComplete="name"
              value={signupValues.name}
              onChange={(event) =>
                setSignupValues((values) => ({ ...values, name: event.target.value }))
              }
              required
            />
          </label>
          <label className="grid gap-1 text-sm">
            Email
            <input
              className="h-10 rounded-md border border-input bg-background px-3 text-sm shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
              type="email"
              name="email"
              autoComplete="email"
              value={signupValues.email}
              onChange={(event) =>
                setSignupValues((values) => ({ ...values, email: event.target.value }))
              }
              required
            />
          </label>
          <label className="grid gap-1 text-sm">
            Password
            <input
              className="h-10 rounded-md border border-input bg-background px-3 text-sm shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
              type="password"
              name="password"
              autoComplete="new-password"
              value={signupValues.password}
              onChange={(event) =>
                setSignupValues((values) => ({ ...values, password: event.target.value }))
              }
              required
            />
          </label>
          {signupState.status === "error" ? (
            <p className="text-xs text-destructive">{signupState.message}</p>
          ) : null}
          <Button type="submit" size="lg" className="w-full" disabled={signupPending}>
            {signupPending ? "Creating account..." : "Sign up"}
          </Button>
        </form>
      </div>
    </div>
  );
}
