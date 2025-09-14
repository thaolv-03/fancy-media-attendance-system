'use client'

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, Clock, TrendingUp, AlertCircle, Loader2 } from "lucide-react"
import Link from "next/link"

// Define the structure of the stats data
interface AdminStats {
  totalEmployees: number;
  totalEmployeesFromLastMonth: number;
  checkInsToday: string;
  checkInsTodayPercentage: number;
  onTimePercentage: number;
  onTimePercentageChange: number;
  lateTodayCount: number;
  recentActivity: {
    name: string;
    timestamp: string; // Changed from time to timestamp
    status: string;
    type: string;
  }[];
}

// A component to show a loading spinner for card content
const StatCardLoading = () => (
  <div className="flex items-center justify-center pt-2">
    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
  </div>
);

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/admin/stats');
        if (!response.ok) {
          throw new Error('Failed to fetch dashboard data.');
        }
        const data: AdminStats = await response.json();
        setStats(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (error) {
    return (
      <div className="flex items-center justify-center h-full p-6">
        <div className="text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
          <h2 className="mt-4 text-xl font-semibold text-foreground">Error</h2>
          <p className="mt-2 text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">Tổng quan hệ thống chấm công</p>
        </div>
        <div className="flex gap-2">
          <Button asChild>
            <Link href="/admin/employees/add">Thêm nhân viên</Link>
          </Button>
          {/* Note: The report link might need to be adjusted based on the final implementation */}
          <Button variant="outline" asChild>
            <Link href="/admin/attendance">Xem báo cáo</Link>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-card-foreground">Tổng nhân viên</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading || !stats ? (
              <StatCardLoading />
            ) : (
              <>
                <div className="text-2xl font-bold text-card-foreground">{stats.totalEmployees}</div>
                <p className="text-xs text-muted-foreground">+{stats.totalEmployeesFromLastMonth} từ tháng trước</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-card-foreground">Chấm công hôm nay</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading || !stats ? (
              <StatCardLoading />
            ) : (
              <>
                <div className="text-2xl font-bold text-card-foreground">{stats.checkInsToday}</div>
                <p className="text-xs text-muted-foreground">{stats.checkInsTodayPercentage}% đã chấm công</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-card-foreground">Đúng giờ</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading || !stats ? (
              <StatCardLoading />
            ) : (
              <>
                <div className="text-2xl font-bold text-card-foreground">{stats.onTimePercentage}%</div>
                <p className="text-xs text-muted-foreground">+{stats.onTimePercentageChange}% từ tuần trước</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-card-foreground">Đi muộn</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading || !stats ? (
              <StatCardLoading />
            ) : (
              <>
                <div className="text-2xl font-bold text-card-foreground">{stats.lateTodayCount}</div>
                <p className="text-xs text-muted-foreground">Hôm nay</p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-card-foreground">Hoạt động gần đây</CardTitle>
            <CardDescription>5 lần chấm công mới nhất</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading || !stats ? (
              <div className="flex justify-center items-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : stats.recentActivity.length > 0 ? (
              stats.recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                      <span className="text-xs font-medium text-primary-foreground">{activity.name.charAt(0)}</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{activity.name}</p>
                      <p className="text-xs text-muted-foreground">{activity.status}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-foreground">
                      {new Date(activity.timestamp + 'Z').toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', hour12: false })}
                    </p>
                    <p
                      className={`text-xs ${
                        activity.type === "Đúng giờ"
                          ? "text-green-600"
                          : activity.type === "Đi muộn"
                            ? "text-red-600"
                            : "text-yellow-600"
                      }`}
                    >
                      {activity.type}
                    </p>
                  </div>
                </div>
              ))
            ) : (
                <p className="text-center text-muted-foreground py-8">Không có hoạt động nào gần đây.</p>
            )}
          </CardContent>
        </Card>
        {/* Weekly stats card removed for simplification as backend logic is not ready for it */}
      </div>
    </div>
  )
}
