import { getIronSession, IronSession } from 'iron-session';
import { cookies } from 'next/headers';

export const sessionOptions = {
    password: process.env.SECRET_COOKIE_PASSWORD || 'complex_password_at_least_32_characters_long',
    cookieName: 'admin-session',
    cookieOptions: {
        secure: process.env.NODE_ENV === 'production',
    },
};

export interface AdminSessionData {
    username?: string;
    isLoggedIn?: boolean;
}

/**
 * Lấy session data.
 * Dùng `as any` để workaround lỗi xung đột type của TypeScript trong môi trường.
 * Đây là cách giải quyết tạm thời cho vấn đề về type, không ảnh hưởng đến logic runtime.
 */
export function getSession(): Promise<IronSession<AdminSessionData>> {
    // `cookies()` được truyền trực tiếp, iron-session sẽ xử lý nó.
    // `as any` được dùng để bỏ qua lỗi type không chính xác.
    const session = getIronSession<AdminSessionData>(cookies() as any, sessionOptions);
    return session;
}
