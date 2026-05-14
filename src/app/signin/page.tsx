import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { GoogleSignInButton } from "@/components/auth-buttons";
import { CredentialsAuth } from "@/components/credentials-auth";
import { authOptions } from "@/lib/auth";

export default async function SignInPage() {
  const session = await getServerSession(authOptions);

  if (session?.user) {
    redirect("/");
  }

  return (
    <main className="grid min-h-screen place-items-center bg-muted/30 px-4">
      <section className="w-full max-w-sm rounded-lg border bg-background p-6 shadow-sm">
        <p className="text-sm text-muted-foreground">Wallet Web</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-normal">Track your money in BDT</h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          Sign in to manage income, costs, categories, and tags in your private transaction
          tracker.
        </p>
        <div className="mt-6">
          <GoogleSignInButton />
        </div>
        <CredentialsAuth />
      </section>
    </main>
  );
}
