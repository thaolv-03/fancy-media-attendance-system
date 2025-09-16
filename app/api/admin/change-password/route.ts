
import { NextRequest, NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';
import { db } from '@/lib/database';
import { sessionOptions, AdminSessionData } from '@/lib/session';
import bcrypt from 'bcryptjs';

export async function POST(req: NextRequest) {
    const settingsUrl = new URL('/admin/settings', req.url);

    try {
        const session = await getIronSession<AdminSessionData>(
            (await cookies()) as any,
            sessionOptions
        );

        // 1. Check if the user is logged in
        if (!session.isLoggedIn || !session.username) {
            // Redirect to login if not authenticated
            return NextResponse.redirect(new URL('/admin/login', req.url));
        }

        const formData = await req.formData();
        const currentPassword = formData.get('currentPassword') as string;
        const newPassword = formData.get('newPassword') as string;
        const confirmPassword = formData.get('confirmPassword') as string;

        // 2. Validate input
        if (!currentPassword || !newPassword || !confirmPassword) {
            settingsUrl.searchParams.set('error', 'All fields are required');
            return NextResponse.redirect(settingsUrl);
        }

        if (newPassword !== confirmPassword) {
            settingsUrl.searchParams.set('error', 'New passwords do not match');
            return NextResponse.redirect(settingsUrl);
        }

        // 3. Verify the current password
        const stmt = db.prepare('SELECT password FROM admins WHERE username = ?');
        const admin = stmt.get(session.username) as { password: string } | undefined;

        if (!admin) {
            // This case should theoretically not happen if the session is valid
            session.destroy();
            settingsUrl.searchParams.set('error', 'Authentication error. Please log in again.');
            return NextResponse.redirect(settingsUrl);
        }

        const isPasswordValid = await bcrypt.compare(currentPassword, admin.password);

        if (!isPasswordValid) {
            settingsUrl.searchParams.set('error', 'Incorrect current password');
            return NextResponse.redirect(settingsUrl);
        }

        // 4. Hash and update the new password
        const hashedNewPassword = await bcrypt.hash(newPassword, 10);
        const updateStmt = db.prepare('UPDATE admins SET password = ? WHERE username = ?');
        updateStmt.run(hashedNewPassword, session.username);

        // 5. Redirect with a success message
        settingsUrl.searchParams.set('success', 'Password updated successfully!');
        return NextResponse.redirect(settingsUrl);

    } catch (error) {
        console.error('Change password error:', error);
        settingsUrl.searchParams.set('error', 'An internal server error occurred');
        return NextResponse.redirect(settingsUrl);
    }
}
