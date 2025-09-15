import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getIronSession } from 'iron-session';
import { sessionOptions, AdminSessionData } from '@/lib/session';

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Protect all routes under /admin except for the login page itself
    if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
        const session = await getIronSession<AdminSessionData>(
            request.cookies as any, // Workaround for type incompatibility
            sessionOptions
        );

        const { isLoggedIn } = session;

        if (!isLoggedIn) {
            // Redirect to login page if not logged in
            return NextResponse.redirect(new URL('/admin/login', request.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    // Matcher to specify which routes the middleware should run on
    matcher: '/admin/:path*',
};
