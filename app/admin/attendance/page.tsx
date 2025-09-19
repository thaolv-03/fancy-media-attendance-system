'use client'

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
import { Input } from "@/components/ui/input"
import { Search, Download, Loader2, CalendarX } from "lucide-react"
import type { AttendanceRecord } from "@/lib/types"
import { useToast } from "@/components/ui/use-toast"
import { cn } from "@/lib/utils"

function EmptyState({ searchTerm }: { searchTerm: string }) {
    return (
        <div className="text-center py-16">
            <CalendarX className="mx-auto h-12 w-12 text-slate-400" />
            <h3 className="mt-4 text-lg font-semibold text-slate-900 dark:text-slate-50">
                {searchTerm ? "Không tìm thấy bản ghi nào" : "Chưa có dữ liệu chấm công"}
            </h3>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                {searchTerm ? "Thử tìm kiếm với từ khóa khác." : "Các bản ghi chấm công sẽ xuất hiện ở đây."}
            </p>
        </div>
    )
}

export default function AttendancePage() {
  const [records, setRecords] = useState<AttendanceRecord[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)
  const [isExporting, setIsExporting] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchAttendanceRecords()
  }, [])

  const fetchAttendanceRecords = async () => {
    try {
        setLoading(true);
        const response = await fetch("/api/attendance");
        const data = await response.json();
        if (data.success) {
            setRecords(data.data);
        } else {
            throw new Error(data.message || "Failed to fetch attendance records.");
        }
    } catch (error) {
        console.error("Failed to fetch attendance records:", error);
        toast({ variant: "destructive", title: "Lỗi", description: error instanceof Error ? error.message : "Không thể tải lịch sử chấm công." });
    } finally {
        setLoading(false);
    }
  }

  const handleExport = async () => {
      setIsExporting(true);
      try {
          const response = await fetch('/api/attendance/export');

          if (!response.ok) {
              const errorData = await response.json().catch(() => ({ message: 'Không thể xuất tệp Excel.' }));
              throw new Error(errorData.message);
          }
          
          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;

          const disposition = response.headers.get('Content-Disposition');
          let filename = `BaoCaoChamCong_${new Date().toISOString().slice(0,10)}.xlsx`;
          if (disposition && disposition.indexOf('attachment') !== -1) {
              const filenameRegex = /filename[^;=\n]*=((['|"])(.*?[^\\])\2|([^;\n]*))/;
              const matches = filenameRegex.exec(disposition);
              if (matches != null && matches[3]) { 
                filename = matches[3].replace(/\\"/g, '\"'); 
              }
          }
          a.download = filename;
          
          document.body.appendChild(a);
          a.click();
          a.remove();
          window.URL.revokeObjectURL(url);

          toast({ title: "Thành công", description: "Báo cáo chấm công đã được xuất." });

      } catch (error) {
          console.error("Export failed:", error);
          toast({ variant: "destructive", title: "Lỗi", description: error instanceof Error ? error.message : "Không thể xuất báo cáo." });
      } finally {
          setIsExporting(false);
      }
  };

 const filteredRecords = useMemo(() => 
      records.filter(
        (record) =>
          record.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          record.status.toLowerCase().includes(searchTerm.toLowerCase()),
    ), [records, searchTerm]);

    const isFaceMethod = (method: string) => method.toLowerCase().includes('face');

  return (
    <div className="space-y-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50">Báo cáo chấm công</h1>
                <p className="text-slate-500 dark:text-slate-400 mt-1">Lịch sử chấm công của tất cả nhân viên.</p>
            </div>
            <Button onClick={handleExport} disabled={isExporting || loading || records.length === 0}>
                {isExporting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Download className="h-4 w-4 mr-2" />}
                Xuất báo cáo
            </Button>
        </div>

        <Card className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800">
            <CardHeader>
                 <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                        placeholder="Tìm kiếm theo tên hoặc trạng thái..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full max-w-sm pl-9"
                    />
                </div>
            </CardHeader>
            <CardContent>
                 {loading ? (
                     <div className="flex justify-center items-center py-16">
                        <Loader2 className="h-8 w-8 animate-spin text-slate-500" />
                    </div>
                ) : filteredRecords.length > 0 ? (
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Nhân viên</TableHead>
                                    <TableHead className="hidden sm:table-cell">Thời gian</TableHead>
                                    <TableHead className="hidden md:table-cell">Loại</TableHead>
                                    <TableHead className="hidden md:table-cell">Phương thức</TableHead>
                                    <TableHead className="text-right">Trạng thái</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredRecords.map((record) => (
                                    <TableRow key={record.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                        <TableCell className="font-medium text-slate-800 dark:text-slate-200">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center font-semibold text-slate-500 dark:text-slate-300">
                                                    {record.user_name.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <span className="font-medium text-slate-800 dark:text-slate-200">{record.user_name}</span>
                                                    <div className="text-sm text-slate-500 dark:text-slate-400 md:hidden">
                                                        {new Date(record.timestamp + 'Z').toLocaleString("vi-VN", { hour: '2-digit', minute: '2-digit' })}
                                                    </div>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="hidden sm:table-cell text-slate-500 dark:text-slate-400">
                                            {new Date(record.timestamp + 'Z').toLocaleString("vi-VN")}
                                        </TableCell>
                                        <TableCell className="hidden md:table-cell text-slate-500 dark:text-slate-400">{record.check_type}</TableCell>
                                        <TableCell className="hidden md:table-cell">
                                          <Badge variant={isFaceMethod(record.method) ? 'default' : 'secondary'}>
                                            {isFaceMethod(record.method) ? 'Khuôn mặt' : 'QR'}
                                          </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                             <Badge 
                                                className={cn("font-normal", {
                                                    'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/50 dark:text-green-300 dark:border-green-700/50': record.status === 'Đúng giờ',
                                                    'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/50 dark:text-red-300 dark:border-red-700/50': record.status === 'Đi muộn',
                                                    'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/50 dark:text-yellow-300 dark:border-yellow-700/50': record.status === 'Về sớm'
                                                })}
                                            >
                                                {record.status}
                                            </Badge>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                ) : (
                    <EmptyState searchTerm={searchTerm}/>
                )}
            </CardContent>
        </Card>
    </div>
  )
}
