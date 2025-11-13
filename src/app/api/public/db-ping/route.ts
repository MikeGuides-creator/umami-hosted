import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

const parse = (u?: string) => {
  try {
    if (!u) return { user: "unset", host: "unset" };
    const url = new URL(u);
    return {
      user: decodeURIComponent(url.username || "none"),
      host: `${url.hostname}:${url.port || "5432"}`,
    };
  } catch {
    return { user: "parse-error", host: "parse-error" };
  }
};

export async function GET() {
  const db = parse(process.env.DATABASE_URL);
  const direct = parse(process.env.DIRECT_URL);

  try {
    await prisma.client.$queryRaw`select 1`;
    return NextResponse.json({ ok: true, hosts: { db, direct } });
  } catch (e: any) {
    return NextResponse.json(
      {
        ok: false,
        name: e?.name,
        code: e?.code,
        message: e?.message,
        hosts: { db, direct },
        tlsEnv: process.env.NODE_TLS_REJECT_UNAUTHORIZED ?? "unset",
      },
      { status: 500 }
    );
  }
}
