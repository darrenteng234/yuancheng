import { NextResponse } from "next/server";
import { requireRunner } from "@/lib/auth";

export async function GET() {
  const runner = await requireRunner();
  if (!runner) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  return NextResponse.json({ runnerId: runner.runner.id, status: runner.runner.status });
}
