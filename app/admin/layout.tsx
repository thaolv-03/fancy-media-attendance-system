
import { AdminSidebar } from '@/components/admin/admin-sidebar'; // Corrected import
import { Button } from '@/components/ui/button';
import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';
import { sessionOptions, AdminSessionData } from '@/lib/session';

// This is an async Server Component
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Fetch the session data on the server.
  // We MUST `await` cookies() and use `as any` to satisfy both the Next.js runtime
  // and the type expected by iron-session.
  const session = await getIronSession<AdminSessionData>(
    (await cookies()) as any,
    sessionOptions
  );

  const { isLoggedIn } = session;

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      <AdminSidebar />
      <main className="flex-1">
        <header className="flex justify-end p-4 border-b dark:border-gray-700">
          {/* Only show the Logout button if the user is logged in */}
          {isLoggedIn && (
            <form action="/api/auth/logout" method="post">
              <Button type="submit" variant="outline">
                Đăng xuất
              </Button>
            </form>
          )}
        </header>
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
