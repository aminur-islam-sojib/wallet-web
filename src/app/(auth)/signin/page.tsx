import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { GoogleSignInButton } from "@/components/auth-buttons";

import { authOptions } from "@/lib/auth";
import Signin4 from "@/components/Auth/auth-form";

export default async function SignInPage() {
  const session = await getServerSession(authOptions);

  if (session?.user) {
    redirect("/");
  }

  return (
    <main className="grid min-h-screen place-items-center bg-muted/30 px-4">
      <Signin4 />
    </main>
  );
}
