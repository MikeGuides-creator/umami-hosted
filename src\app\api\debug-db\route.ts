$new = @'
import { NextResponse } from "next/server";
import prisma from "../../../lib/prisma";

export async function GET() {
  try {
    const one = await prisma.user.findFirst({
      select: { username: true, role: true },
    });
    return NextResponse.json({ ok: true, one });
  } catch (err) {
    return new NextResponse(
      JSON.stringify({
        ok: false,
        name: err?.name,
        code: err?.code,
        message: err?.message,
        meta: err?.meta,
      }),
      { status: 500, headers: { "content-type": "application/json" } }
    );
  }
}
'@
ni -Force -ItemType File .\src\app\api\debug-db\route.ts -Value $new
git add .\src\app\api\debug-db\route.ts
git commit -m "chore: add debug-db endpoint"
git push origin master
