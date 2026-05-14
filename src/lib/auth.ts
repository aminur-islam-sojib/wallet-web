import { getServerSession, type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { redirect } from "next/navigation";

import { connectToDatabase } from "@/lib/db";
import { verifyPassword } from "@/lib/passwords";
import { upsertGoogleUser } from "@/lib/users";
import { User } from "@/models/user";

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/signin",
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email?.toLowerCase().trim();
        const password = credentials?.password ?? "";

        if (!email || !password) {
          return null;
        }

        await connectToDatabase();

        const user = await User.findOne({ email }).select(
          "+passwordHash name email image"
        );

        if (!user?.passwordHash) {
          return null;
        }

        const isValid = await verifyPassword(password, user.passwordHash);

        if (!isValid) {
          return null;
        }

        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          image: user.image,
        };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        const dbUser = await upsertGoogleUser({
          googleId: account?.providerAccountId,
          name: user.name,
          email: user.email,
          image: user.image,
        });

        return Boolean(dbUser);
      }

      return Boolean(user);
    },
    async jwt({ token, user, account }) {
      if (account?.provider === "google" && user?.email) {
        const dbUser = await upsertGoogleUser({
          googleId: account?.providerAccountId,
          name: user.name,
          email: user.email,
          image: user.image,
        });

        if (dbUser) {
          token.userId = dbUser._id.toString();
        }

        return token;
      }

      if (user?.id) {
        token.userId = user.id;
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = String(token.userId ?? "");
      }

      return session;
    },
  },
};

export async function getCurrentUser() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id && !session?.user?.email) {
    return null;
  }

  await connectToDatabase();

  let user = null;

  if (session.user?.id) {
    user = await User.findById(session.user.id);
  }

  if (!user && session.user?.email) {
    user = await User.findOne({ email: session.user.email.toLowerCase() });
  }

  return user;
}

export async function requireUser() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/signin");
  }

  return user;
}
