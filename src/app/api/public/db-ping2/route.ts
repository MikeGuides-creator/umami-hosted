import { NextResponse } from "next/server";

const tail = (v?: string) =>
  v && v.includes("@") ? v.split("@")[1]?.split("/")[0] : v || "not set";

export async function GET() {
  try {
    // Force TLS relax *before* prisma loads
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

    const { default: prisma } = await import("@/lib/prisma");

    // Simple probe
    await prisma.client.$queryRaw`SELECT 1 as ok`;

    const user = await prisma.client.user.findFirst({
      select: { id: true, username: true },
    });

    return NextResponse.json({
      ok: true,
      userFound: !!user,
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
        tlsEnv: process.env.NODE_TLS_REJECT_UNAUTHORIZED ?? "unset",
      },
      { status: 500 }
    );
  }
}
