
import { NextRequest, NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';
import { sessionOptions, AdminSessionData } from '@/lib/session';

export async function POST(req: NextRequest) {
    // Get the session based on the current cookies
    const session = await getIronSession<AdminSessionData>((await cookies()) as any, sessionOptions);

    // Destroy the session data
    session.destroy();

    // Construct the URL for the login page
    const loginUrl = new URL('/admin/login', req.url);

    // Redirect the user to the login page
    // The browser will receive a 303 See Other response, and the new Set-Cookie header to clear the session.
    return NextResponse.redirect(loginUrl, {
        headers: {
            'Set-Cookie': `admin-session=; Path=/; HttpOnly; Max-Age=0`,
        }
    });
}
