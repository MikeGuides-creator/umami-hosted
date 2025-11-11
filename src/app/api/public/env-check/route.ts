import { NextResponse } from "next/server";

export async function GET() {
  const raw = process.env.DATABASE_URL || "";
  let parsed: any = {};
  try {
    const u = new URL(raw);
    parsed = {
      protocol: u.protocol,
      host: u.hostname,
      port: u.port,
      db: u.pathname,
      query: u.search,
    };
  } catch (e) {
    parsed = { error: "could not parse DATABASE_URL" };
  }

  return NextResponse.json({
    ok: true,
    hasEnv: Boolean(raw),
    parsed,
  });
}
