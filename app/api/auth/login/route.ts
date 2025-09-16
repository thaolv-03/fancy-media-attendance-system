
import { NextRequest, NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';
import { db } from '@/lib/database';
import { sessionOptions, AdminSessionData } from '@/lib/session';
import bcrypt from 'bcryptjs';

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const username = formData.get('username') as string;
  const password = formData.get('password') as string;

  const loginUrl = new URL('/admin/login', req.url);

  try {
    const stmt = db.prepare('SELECT * FROM admins WHERE username = ?');
    const admin = stmt.get(username) as { id: number; username: string; password: string } | undefined;

    if (!admin) {
      loginUrl.searchParams.set('error', 'Tên đăng nhập hoặc mật khẩu không đúng');
      return NextResponse.redirect(loginUrl);
    }

    const isPasswordValid = await bcrypt.compare(password, admin.password);

    if (!isPasswordValid) {
      loginUrl.searchParams.set('error', 'Tên đăng nhập hoặc mật khẩu không đúng');
      return NextResponse.redirect(loginUrl);
    }

    // Get session and set login data
    const session = await getIronSession<AdminSessionData>((await cookies()) as any, sessionOptions);
    session.username = admin.username;
    session.isLoggedIn = true;
    await session.save(); // The session cookie is now set

    // Redirect to the admin page upon successful login
    const adminUrl = new URL('/admin', req.url);
    return NextResponse.redirect(adminUrl);

  } catch (error) {
    console.error('Login error:', error);
    loginUrl.searchParams.set('error', 'An internal error occurred');
    return NextResponse.redirect(loginUrl);
  }
}
