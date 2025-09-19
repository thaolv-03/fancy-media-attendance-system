'use client'

import { useEffect, useState } from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Users, Clock, TrendingUp, AlertTriangle, UserPlus, FileText, Loader2, AlertCircle } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"

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
    timestamp: string;
    status: string;
    type: string;
  }[];
}

const StatCard = ({ title, value, subtext, icon, loading }: { title: string, value: string | number, subtext: string, icon: React.ReactNode, loading: boolean }) => (
    <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{title}</CardTitle>
            {icon}
        </CardHeader>
        <CardContent>
            {loading ? (
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground mt-1" />
            ) : (
                <>
                    <div className="text-2xl font-bold">{value}</div>
                    <p className="text-xs text-muted-foreground">{subtext}</p>
                </>
            )}
        </CardContent>
    </Card>
)

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
        <Card className="w-full max-w-md">
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><AlertCircle className="text-destructive"/> Lỗi</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground">{error}</p>
            </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Tổng quan về hệ thống chấm công của bạn.</p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link href="/admin/employees/add"><UserPlus className="mr-2 h-4 w-4" />Thêm nhân viên</Link>
          </Button>
          <Button asChild>
            <Link href="/admin/attendance"><FileText className="mr-2 h-4 w-4" />Xem báo cáo</Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Main content: Stats and Recent Activity */}
          <div className="lg:col-span-2 space-y-6">
              {/* Stats Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <StatCard 
                      title="Tổng nhân viên" 
                      value={stats?.totalEmployees ?? 0}
                      subtext={stats ? `+${stats.totalEmployeesFromLastMonth} từ tháng trước` : ""}
                      icon={<Users className="h-4 w-4 text-muted-foreground" />}
                      loading={loading}
                  />
                  <StatCard 
                      title="Chấm công hôm nay" 
                      value={stats?.checkInsToday ?? '0'}
                      subtext={stats ? `${stats.checkInsTodayPercentage}% đã chấm công` : ""}
                      icon={<Clock className="h-4 w-4 text-muted-foreground" />}
                      loading={loading}
                  />
                  <StatCard 
                      title="Tỷ lệ đúng giờ" 
                      value={stats ? `${stats.onTimePercentage}%` : '0%'}
                      subtext={stats ? `${stats.onTimePercentageChange >= 0 ? '+' : ''}${stats.onTimePercentageChange}% so với tuần trước` : ""}
                      icon={<TrendingUp className="h-4 w-4 text-muted-foreground" />}
                      loading={loading}
                  />
                  <StatCard 
                      title="Đi muộn hôm nay" 
                      value={stats?.lateTodayCount ?? 0}
                      subtext="Số lượng nhân viên đi muộn" 
                      icon={<AlertTriangle className="h-4 w-4 text-muted-foreground" />}
                      loading={loading}
                  />
              </div>
          </div>

          {/* Side content: Recent Activity */}
          <div className="lg:col-span-1">
              <Card>
                  <CardHeader>
                      <CardTitle>Hoạt động gần đây</CardTitle>
                      <CardDescription>5 lần chấm công mới nhất trong hệ thống.</CardDescription>
                  </CardHeader>
                  <CardContent>
                      {loading && !stats ? (
                          <div className="flex justify-center items-center py-8">
                              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                          </div>
                      ) : stats && stats.recentActivity.length > 0 ? (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Nhân viên</TableHead>
                                    <TableHead className="text-right">Thời gian</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                            {stats.recentActivity.map((activity, index) => (
                                <TableRow key={index}>
                                <TableCell>
                                    <div className="font-medium">{activity.name}</div>
                                    <div className="text-sm text-muted-foreground hidden sm:block">{activity.status}</div>
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="font-medium">{new Date(activity.timestamp + 'Z').toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</div>
                                    <Badge 
                                        variant={activity.type === 'Đi muộn' || activity.type === 'Về sớm' ? "destructive" : "outline"}
                                        className={cn("text-xs", {
                                            'bg-green-100 text-green-800 border-green-200': activity.type === 'Đúng giờ'
                                        })}
                                    >
                                    {activity.type}
                                    </Badge>
                                </TableCell>
                                </TableRow>
                            ))}
                            </TableBody>
                        </Table>
                      ) : (
                          <div className="text-center text-muted-foreground py-12">
                              <p>Không có hoạt động nào gần đây.</p>
                          </div>
                      )}
                  </CardContent>
              </Card>
          </div>
      </div>
    </div>
  )
}
