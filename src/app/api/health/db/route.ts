import type { NextRequest } from "next/server";

import { getDbHealth } from "@/features/health/server/db-health";

export async function GET(request: NextRequest) {
  const { status, body } = await getDbHealth(request);

  return Response.json(body, { status });
}
