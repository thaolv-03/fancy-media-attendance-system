
import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';

export async function POST(req: NextRequest) {
    const session = await getSession();
    session.destroy();
    return NextResponse.json({ message: 'Logged out' });
}
