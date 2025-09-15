
import { NextRequest, NextResponse } from 'next/server';
import { getSession, sessionOptions } from '@/lib/session';
import { db } from '@/lib/database';
import bcrypt from 'bcryptjs';

export async function POST(req: NextRequest) {
    const session = await getSession();
    const { username, password } = await req.json();

    try {
        const stmt = db.prepare('SELECT * FROM admins WHERE username = ?');
        const admin = stmt.get(username) as { id: number; username: string; password: string } | undefined;

        if (!admin) {
            return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
        }

        const isPasswordValid = await bcrypt.compare(password, admin.password);

        if (!isPasswordValid) {
            return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
        }

        session.username = admin.username;
        session.isLoggedIn = true;
        await session.save();

        return NextResponse.json({ message: 'Login successful' }, { status: 200 });

    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}
