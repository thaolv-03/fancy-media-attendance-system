'use client'

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Users, Calendar, BarChart2, FileText, Settings } from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
  { href: "/admin", icon: Home, label: "Trang chủ" },
  { href: "/admin/employees", icon: Users, label: "Nhân viên" },
  { href: "/admin/attendance", icon: Calendar, label: "Chấm công" },
  { href: "/admin/statistics", icon: BarChart2, label: "Thống kê" },
  { href: "/admin/export", icon: FileText, label: "Xuất báo cáo" },
  { href: "/admin/settings", icon: Settings, label: "Cài đặt" },
]

export function AdminSidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-64 border-r bg-background">
      <div className="p-4">
        <h2 className="text-xl font-bold">Admin</h2>
      </div>
      <nav className="flex flex-col p-2">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center rounded-md px-3 py-2 text-sm font-medium",
              pathname === item.href
                ? "bg-primary text-primary-foreground"
                : "hover:bg-accent hover:text-accent-foreground"
            )}
          >
            <item.icon className="mr-2 h-4 w-4" />
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>
    </aside>
  )
}
