"use client";

import { signIn, signOut } from "next-auth/react";

import { Button } from "@/components/ui/button";

export function GoogleSignInButton() {
  return (
    <Button type="button" size="lg" onClick={() => signIn("google", { callbackUrl: "/" })}>
      Continue with Google
    </Button>
  );
}

export function SignOutButton() {
  return (
    <Button type="button" variant="outline" onClick={() => signOut({ callbackUrl: "/signin" })}>
      Sign out
    </Button>
  );
}
