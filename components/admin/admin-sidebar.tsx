'use client'

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { Home, Users, Calendar, BarChart2, Settings, LogOut } from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
  { href: "/admin", icon: Home, label: "Dashboard" },
  { href: "/admin/employees", icon: Users, label: "Nhân viên" },
  { href: "/admin/attendance", icon: Calendar, label: "Chấm công" },
  { href: "/admin/statistics", icon: BarChart2, label: "Thống kê" },
  { href: "/admin/settings", icon: Settings, label: "Cài đặt" },
]

export function AdminSidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-60 flex-col fixed inset-y-0 z-50 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hidden lg:flex">
      <div className="p-4 flex items-center justify-between border-b border-slate-200 dark:border-slate-800">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/fancy-media-logo.svg" alt="Fancy Media Logo" width={160} height={40} className="dark:invert ml-5 mt-2"/>
        </Link>
      </div>
      <nav className="flex flex-col ml-0.5 p-2 flex-grow">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-slate-600 dark:text-slate-300 text-sm font-medium transition-colors",
              pathname === item.href
                ? "bg-slate-100 dark:bg-slate-800 text-primary dark:text-slate-50"
                : "hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-50"
            )}
          >
            <item.icon className="h-4 w-4" />
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>
      <div className="p-2 border-t border-slate-200 dark:border-slate-800">
        <form action="/api/auth/logout" method="post">
            <button
                type="submit"
                className="flex items-center gap-3 rounded-md px-3 py-2 text-slate-600 dark:text-slate-300 text-sm font-medium transition-colors w-full hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-50"
            >
                <LogOut className="h-4 w-4"/>
                <span>Đăng xuất</span>
            </button>
        </form>
      </div>
    </aside>
  )
}
