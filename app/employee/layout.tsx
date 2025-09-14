import type React from "react"

export default function EmployeeLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <div className="employee-theme min-h-screen bg-background">{children}</div>
}
