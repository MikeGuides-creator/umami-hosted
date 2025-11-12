import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

const tail = (v?: string) =>
  v && v.includes("@") ? v.split("@")[1]?.split("/")[0] : v || "not set";

export async function GET() {
  try {
    // sanity probe: does the client connect at all?
    await prisma.client.$queryRaw`SELECT 1 as ok`;

    // try your real query
    const one = await prisma.client.user.findFirst({
      select: { id: true, username: true },
    });

    return NextResponse.json({
      ok: true,
      userFound: Boolean(one),
      hosts: {
        database: tail(process.env.DATABASE_URL),
        direct: tail(process.env.DIRECT_URL),
      },
    });
  } catch (e: any) {
    return NextResponse.json(
      {
        ok: false,
        name: e?.name,
        code: e?.code,
        message: e?.message,
        hosts: {
          database: tail(process.env.DATABASE_URL),
          direct: tail(process.env.DIRECT_URL),
        },
      },
      { status: 500 }
    );
  }
}
