'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function StatisticsPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Thống kê</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Tổng số nhân viên
            </CardTitle>
            <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                className="h-4 w-4 text-muted-foreground"
            >
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">...</div>
            <p className="text-xs text-muted-foreground">
              Đang tải...
            </p>
          </CardContent>
        </Card>
      </div>
      <p className="text-center text-muted-foreground">Chức năng thống kê chi tiết đang được phát triển.</p>
    </div>
  );
}
