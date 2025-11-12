import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const one = await prisma.client.user.findFirst({
      select: { id: true, username: true },
    });
    return NextResponse.json({
      ok: true,
      userFound: Boolean(one),
      hint: 'If false, try logging in with admin / ChangeMe123!',
    });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, code: e?.code, name: e?.name, message: e?.message },
      { status: 500 },
    );
  }
}
