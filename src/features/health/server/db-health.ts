import type { NextRequest } from "next/server";

import { connectToDatabase } from "@/lib/db";
import { User } from "@/models/user";
import type { DbHealthResponse, HealthUserDetails } from "@/types/health";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type DbHealthResult = {
  status: number;
  body: DbHealthResponse;
};

export async function getDbHealth(
  request: NextRequest,
): Promise<DbHealthResult> {
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

    return {
      status: 500,
      body: {
        ok: false,
        db: { connected: false },
        error: "Database connection failed.",
        details: errorDetails,
      },
    };
  }

  if (emailParam && !emailRegex.test(emailParam.trim())) {
    return {
      status: 400,
      body: {
        ok: false,
        db: { connected: true },
        error: "Invalid email query parameter.",
      },
    };
  }

  let userDetails: HealthUserDetails | null = null;

  if (emailParam) {
    const user = await User.findOne({
      email: emailParam.trim().toLowerCase(),
    }).select("_id name email image");

    if (user) {
      userDetails = {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        image: user.image ?? null,
      };
    }
  }

  return {
    status: 200,
    body: {
      ok: true,
      db: { connected: true },
      user: {
        exists: Boolean(userDetails),
        details: userDetails,
      },
    },
  };
}
