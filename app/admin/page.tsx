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
import { Users, Clock, TrendingUp, UserX, UserPlus, FileText, Loader2, AlertCircle, ArrowUp, ArrowDown } from "lucide-react"
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
    check_type: string;
    method: string;
  }[];
}

const StatCard = ({ icon, title, value, change, changeType, loading }: { icon: React.ReactNode, title: string, value: string | number, change?: string, changeType?: 'increase' | 'decrease', loading: boolean }) => (
    <Card className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 transition hover:shadow-md">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</CardTitle>
            {icon}
        </CardHeader>
        <CardContent>
            {loading ? (
                <div className="h-10 flex items-center">
                  <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
                </div>
            ) : (
                <>
                    <div className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-slate-50">{value}</div>
                    {change && (
                        <p className={cn(
                            "text-xs flex items-center",
                            changeType === 'decrease' ? "text-red-500" : "text-green-500"
                        )}>
                            {changeType === 'increase' ? <ArrowUp className="h-3 w-3 mr-1"/> : <ArrowDown className="h-3 w-3 mr-1"/>}
                            {change}
                        </p>
                    )}
                </> 
            )}
        </CardContent>
    </Card>
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
          const errorData = await response.json().catch(() => ({ message: 'Failed to fetch dashboard data.' }));
          throw new Error(errorData.message || 'Failed to fetch dashboard data.');
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
  
  const getOnTimePercentageChangeText = (change: number) => {
      const absChange = Math.abs(change);
      if (change > 0) return `${absChange}% so với tuần trước`;
      if (change < 0) return `${absChange}% so với tuần trước`;
      return "Không thay đổi so với tuần trước";
  }

  if (error) {
    return (
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center h-full p-6 bg-white dark:bg-slate-900 rounded-xl shadow-md border border-slate-200 dark:border-slate-800">
          <div className="text-center">
            <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
            <h2 className="mt-4 text-xl font-semibold text-slate-900 dark:text-slate-50">Lỗi tải dữ liệu</h2>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{error}</p>
            <Button onClick={() => window.location.reload()} className="mt-6">Thử lại</Button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50">Dashboard</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Tổng quan về hệ thống chấm công của bạn.</p>
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

      {/* Stats Grid */}
      <section>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard 
              title="Tổng nhân viên" 
              value={stats?.totalEmployees ?? 0}
              change={stats ? `+${stats.totalEmployeesFromLastMonth} tháng trước` : undefined}
              changeType="increase"
              icon={<Users className="h-5 w-5 text-slate-500 dark:text-slate-400" />}
              loading={loading}
          />
          <StatCard 
              title="Chấm công hôm nay" 
              value={`${stats?.checkInsTodayPercentage ?? 0}%`}
              change={stats?.checkInsToday}
              icon={<Clock className="h-5 w-5 text-slate-500 dark:text-slate-400" />}
              loading={loading}
          />
          <StatCard 
              title="Tỷ lệ đúng giờ" 
              value={stats ? `${stats.onTimePercentage}%` : '0%'}
              change={stats ? getOnTimePercentageChangeText(stats.onTimePercentageChange) : undefined}
              changeType={stats && stats.onTimePercentageChange >= 0 ? 'increase' : 'decrease'}
              icon={<TrendingUp className="h-5 w-5 text-slate-500 dark:text-slate-400" />}
              loading={loading}
          />
          <StatCard 
              title="Đi muộn hôm nay" 
              value={stats?.lateTodayCount ?? 0}
              change="Nhân viên đi muộn"
              changeType="decrease"
              icon={<UserX className="h-5 w-5 text-slate-500 dark:text-slate-400" />}
              loading={loading}
          />
        </div>
      </section>

      {/* Recent Activity */}
      <section>
          <Card className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800">
              <CardHeader>
                  <CardTitle className="text-lg">Hoạt động gần đây</CardTitle>
                  <CardDescription>5 lần chấm công mới nhất trong hệ thống.</CardDescription>
              </CardHeader>
              <CardContent>
                  {loading && !stats ? (
                      <div className="flex justify-center items-center py-12">
                          <Loader2 className="h-8 w-8 animate-spin text-slate-500" />
                      </div>
                  ) : stats && stats.recentActivity.length > 0 ? (
                    <div className="overflow-x-auto">
                      <Table>
                          <TableHeader>
                              <TableRow>
                                  <TableHead>Nhân viên</TableHead>
                                  <TableHead>Loại</TableHead>
                                  <TableHead>Trạng thái</TableHead>
                                  <TableHead>Phương thức</TableHead>
                                  <TableHead className="text-right">Thời gian</TableHead>
                              </TableRow>
                          </TableHeader>
                          <TableBody>
                          {stats.recentActivity.map((activity, index) => (
                              <TableRow key={index} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                <TableCell className="font-medium text-slate-800 dark:text-slate-200">{activity.name}</TableCell>
                                <TableCell className="text-slate-500 dark:text-slate-400">{activity.check_type}</TableCell>
                                <TableCell>
                                  <Badge 
                                      className={cn("font-normal", {
                                          'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/50 dark:text-green-300 dark:border-green-700/50': activity.status === 'Đúng giờ',
                                          'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/50 dark:text-red-300 dark:border-red-700/50': activity.status === 'Đi muộn',
                                          'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/50 dark:text-yellow-300 dark:border-yellow-700/50': activity.status === 'Về sớm'
                                      })}
                                  >
                                    {activity.status}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  <Badge variant={activity.method.startsWith('FaceID') ? 'default' : 'secondary'}>
                                    {activity.method.startsWith('FaceID') ? 'Khuôn mặt' : 'QR'}
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-right text-slate-500 dark:text-slate-400">{new Date(activity.timestamp + 'Z').toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</TableCell>
                              </TableRow>
                          ))}
                          </TableBody>
                      </Table>
                    </div>
                  ) : (
                      <div className="text-center text-slate-500 py-12">
                          <p>Không có hoạt động nào gần đây.</p>
                      </div>
                  )}
              </CardContent>
          </Card>
      </section>
    </main>
  )
}
