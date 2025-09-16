import { getIronSession, IronSession } from 'iron-session';
import { cookies } from 'next/headers';

// 1. Tùy chọn cho session, không có gì thay đổi ở đây.
export const sessionOptions = {
    password: process.env.SECRET_COOKIE_PASSWORD || 'complex_password_at_least_32_characters_long',
    cookieName: 'admin-session',
    cookieOptions: {
        // Secure: true trong production để cookie chỉ được gửi qua HTTPS
        secure: process.env.NODE_ENV === 'production',
    },
};

// 2. Định nghĩa kiểu dữ liệu cho session
export interface AdminSessionData {
    username?: string;
    isLoggedIn?: boolean;
}

// 3. Hàm getSession - Đây là phần quan trọng nhất
/**
 * Lấy session data từ cookie.
 * Hàm này tuân thủ theo API bất đồng bộ mới của Next.js.
 * `getIronSession` sẽ tự động xử lý Promise trả về từ `cookies()`.
 */
export async function getSession(): Promise<IronSession<AdminSessionData>> {
    // Await the cookies() promise and pass it to getIronSession
    const session = await getIronSession<AdminSessionData>(await cookies(), sessionOptions);
    return session;
}