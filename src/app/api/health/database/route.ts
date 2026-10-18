import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export async function GET() {
  try {
    const res = await fetch(`${API_BASE}/api/v1/health/database`, {
      cache: "no-store",
    });
    const data = await res.json().catch(() => null);

    if (!res.ok) {
      return NextResponse.json(
        {
          status: "error",
          database: "disconnected",
          message: (data as { error?: string })?.error ?? "API error",
        },
        { status: 503 },
      );
    }

    return NextResponse.json({
      status: data?.status === "ok" ? "ok" : "error",
      database: data?.database === "up" ? "connected" : "disconnected",
      latencyMs: data?.latencyMs,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "API no disponible";
    return NextResponse.json(
      {
        status: "error",
        database: "disconnected",
        message,
      },
      { status: 503 },
    );
  }
}
