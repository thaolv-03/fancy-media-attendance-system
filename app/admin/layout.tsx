
'use client';

import type React from "react";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/admin/login');
  };

  return (
    <div className="flex h-screen bg-background">
      <AdminSidebar />
      <main className="flex-1 flex flex-col overflow-y-auto">
        <header className="flex justify-end p-4 border-b">
           <Button onClick={handleLogout} variant="outline">
            Logout
          </Button>
        </header>
        <div className="p-8 flex-1">
           {children}
        </div>
      </main>
    </div>
  );
}
