'use server'

import { getIronSession } from 'iron-session'
import { cookies } from 'next/headers'
import { sessionOptions, AdminSessionData } from '@/lib/session'
import { z } from 'zod'
import bcrypt from 'bcryptjs'
import { db } from '@/lib/database'

export type FormState = {
    message: string;
    type: 'error' | 'success';
} | null;

const passwordSchema = z.object({
    currentPassword: z.string().min(1, "Mật khẩu hiện tại là bắt buộc."),
    newPassword: z.string().min(6, "Mật khẩu mới phải có ít nhất 6 ký tự."),
    confirmPassword: z.string(),
}).refine(data => data.newPassword === data.confirmPassword, {
    message: "Mật khẩu mới không khớp.",
    path: ["confirmPassword"],
});

export async function changePassword(
    prevState: FormState,
    formData: FormData
): Promise<FormState> {
    try {
        const session = await getIronSession<AdminSessionData>(
            (await cookies()) as any,
            sessionOptions
        );

        if (!session.isLoggedIn || !session.username) {
            return { message: "Người dùng không được xác thực. Vui lòng đăng nhập lại.", type: 'error' };
        }

        const validatedFields = passwordSchema.safeParse(Object.fromEntries(formData.entries()));
        if (!validatedFields.success) {
            const firstError = validatedFields.error.errors[0];
            return { message: firstError.message, type: 'error' };
        }

        const { currentPassword, newPassword } = validatedFields.data;

        // Fetch user from DB
        const userStmt = db.prepare('SELECT * FROM admins WHERE username = ?');
        const adminUser = userStmt.get(session.username) as { id: number; username: string; password: string } | undefined;

        if (!adminUser) {
            return { message: "Người dùng không được xác thực.", type: 'error' };
        }

        // Verify current password
        const isPasswordCorrect = await bcrypt.compare(currentPassword, adminUser.password);
        if (!isPasswordCorrect) {
            return { message: "Mật khẩu hiện tại không chính xác.", type: 'error' };
        }

        // Hash the new password
        const newPasswordHash = await bcrypt.hash(newPassword, 10);

        // Update the password in the database
        const updateStmt = db.prepare('UPDATE admins SET password = ? WHERE username = ?');
        updateStmt.run(newPasswordHash, session.username);

        return { message: "Mật khẩu đã được thay đổi thành công.", type: 'success' };

    } catch (error) {
        console.error("Change password error:", error);
        return { message: "Đã xảy ra lỗi không mong muốn khi thay đổi mật khẩu.", type: 'error' };
    }
}
