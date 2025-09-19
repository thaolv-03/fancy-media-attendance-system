
import { AdminSidebar } from '@/components/admin/admin-sidebar';
import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';
import { sessionOptions, AdminSessionData } from '@/lib/session';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { PanelLeft, Menu } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getIronSession<AdminSessionData>(
    (await cookies()) as any,
    sessionOptions
  );

  const { isLoggedIn } = session;

  // If the user is logged in, show the full admin layout with the sidebar.
  if (isLoggedIn) {
    return (
      <div className="relative min-h-screen w-full bg-slate-50 dark:bg-slate-950">
        <AdminSidebar />
        <div className="lg:pl-60">
          <header className="sticky top-0 z-40 lg:hidden flex h-14 items-center gap-4 border-b bg-white dark:bg-slate-900 px-4 sm:h-16 sm:px-6">
            <Sheet>
              <SheetTrigger asChild>
                <Button size="icon" variant="outline" className="sm:hidden">
                  <Menu className="h-5 w-5"/>
                  <span className="sr-only">Mở menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="sm:max-w-xs p-0">
                <AdminSidebar />
              </SheetContent>
            </Sheet>
             <div className="flex-1">
                 <h1 className="font-semibold text-lg">Admin Dashboard</h1>
             </div>
          </header>
          <main className="p-4 sm:p-6">
            {children}
          </main>
        </div>
      </div>
    );
  }

  // If the user is not logged in, just render the children.
  // The middleware ensures this can only be the login page.
  return <>{children}</>;
}
