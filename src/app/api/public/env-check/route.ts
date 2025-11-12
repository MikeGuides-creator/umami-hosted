import { NextResponse } from "next/server";

export async function GET() {
  const dbUrl = process.env.DATABASE_URL || "not set";
  const directUrl = process.env.DIRECT_URL || "not set";

  // just show connection host info, not full secrets
  return NextResponse.json({
    database: dbUrl.split("@")[1]?.split("/")[0],
    direct: directUrl.split("@")[1]?.split("/")[0],
  });
}
