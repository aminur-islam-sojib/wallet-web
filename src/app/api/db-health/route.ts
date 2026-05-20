import type { NextRequest } from "next/server";

import { connectToDatabase } from "@/lib/db";
import { User } from "@/models/user";

type UserDetails = {
  id: string;
  name: string;
  email: string;
  image?: string | null;
};

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const emailParam = url.searchParams.get("email");

  try {
    await connectToDatabase();
  } catch (error) {
    const err = error instanceof Error ? error : new Error("Unknown error");
    const errorDetails = {
      name: err.name,
      message: err.message,
      code: (err as { code?: string | number }).code ?? null,
    };

    return Response.json(
      {
        ok: false,
        db: { connected: false },
        error: "Database connection failed.",
        details: errorDetails,
      },
      { status: 500 }
    );
  }

  if (emailParam && !emailRegex.test(emailParam.trim())) {
    return Response.json(
      {
        ok: false,
        db: { connected: true },
        error: "Invalid email query parameter.",
      },
      { status: 400 }
    );
  }

  let userDetails: UserDetails | null = null;

  if (emailParam) {
    const user = await User.findOne({ email: emailParam.trim().toLowerCase() }).select(
      "_id name email image"
    );

    if (user) {
      userDetails = {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        image: user.image ?? null,
      };
    }
  }

  return Response.json({
    ok: true,
    db: { connected: true },
    user: {
      exists: Boolean(userDetails),
      details: userDetails,
    },
  });
}
