import { NextResponse } from 'next/server';

export async function GET() {
  const db = process.env.DATABASE_URL ?? 'not set';
  const direct = process.env.DIRECT_URL ?? 'not set';

  // Only show host:port (never full secrets)
  const pretty = (v: string) => (v.includes('@') ? (v.split('@')[1]?.split('/')[0] ?? v) : v);

  return NextResponse.json({
    database: pretty(db),
    direct: pretty(direct),
  });
}
