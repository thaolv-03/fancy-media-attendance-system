
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getIronSession } from 'iron-session';
import { sessionOptions, AdminSessionData } from '@/lib/session';

// Force the middleware to run on the Node.js runtime.
// This ensures that 'process.env' variables are available, just like in API routes.
export const runtime = 'nodejs';

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Protect all routes under /admin except for the login page itself
    if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
        const session = await getIronSession<AdminSessionData>(
            request.cookies as any, // Re-add 'as any' to fix the type incompatibility
            sessionOptions
        );

        const { isLoggedIn } = session;

        // If the user is not logged in, redirect them to the login page.
        if (!isLoggedIn) {
            return NextResponse.redirect(new URL('/admin/login', request.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    // Matcher to specify which routes the middleware should run on
    matcher: '/admin/:path*',
};
