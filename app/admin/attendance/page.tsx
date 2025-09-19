'use client'

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge, badgeVariants } from "@/components/ui/badge" // Assuming badgeVariants is exported
import { Input } from "@/components/ui/input"
import { Search, Download, Loader2 } from "lucide-react"
import type { AttendanceRecord } from "@/lib/types"
import { useToast } from "@/components/ui/use-toast"
import { cn } from "@/lib/utils"

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

          toast({ title: "Thành công", description: "Báo cáo chấm công đã được xuất.", });

      } catch (error) {
          console.error("Export failed:", error);
          toast({ variant: "destructive", title: "Lỗi", description: error instanceof Error ? error.message : "Không thể xuất báo cáo." });
      } finally {
          setIsExporting(false);
      }
  };

  const filteredRecords = records.filter(
    (record) =>
      record.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.status.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <Card>
        <CardHeader>
            <div className="flex items-center justify-between">
                <div>
                    <CardTitle>Báo cáo chấm công</CardTitle>
                    <CardDescription>Lịch sử chấm công của tất cả nhân viên</CardDescription>
                </div>
                <Button onClick={handleExport} disabled={isExporting || loading || records.length === 0}>
                    {isExporting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Download className="h-4 w-4 mr-2" />}
                    Xuất báo cáo
                </Button>
            </div>
        </CardHeader>
        <CardContent>
            <div className="mb-4">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Tìm kiếm theo tên nhân viên hoặc trạng thái..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full max-w-sm pl-9"
                    />
                </div>
            </div>
            <div className="border rounded-lg">
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
                    {loading ? (
                        <TableRow>
                            <TableCell colSpan={5} className="h-24 text-center">
                                <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                            </TableCell>
                        </TableRow>
                    ) : filteredRecords.length > 0 ? (
                        filteredRecords.map((record) => (
                            <TableRow key={record.id}>
                                <TableCell>
                                    <div className="font-medium">{record.user_name}</div>
                                    <div className="text-sm text-muted-foreground md:hidden">
                                        {new Date(record.timestamp + 'Z').toLocaleString("vi-VN")}
                                    </div>
                                </TableCell>
                                <TableCell className="hidden sm:table-cell">
                                    {new Date(record.timestamp + 'Z').toLocaleString("vi-VN")}
                                </TableCell>
                                <TableCell className="hidden md:table-cell">{record.check_type}</TableCell>
                                <TableCell className="hidden md:table-cell">
                                  <Badge variant={record.method === 'QR' ? "secondary" : "default"}>
                                    {record.method === "FaceID-WebRTC" ? "Face ID" : "QR"}
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                    <Badge 
                                        variant={record.status === 'Đi muộn' || record.status === 'Về sớm' ? "destructive" : "outline"}
                                        className={cn({
                                            'bg-green-100 text-green-800 border-green-200': record.status === 'Đúng giờ',
                                            'bg-yellow-100 text-yellow-800 border-yellow-200': record.status === 'Về sớm'
                                        })}
                                    >
                                        {record.status}
                                    </Badge>
                                </TableCell>
                            </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell colSpan={5} className="h-24 text-center">
                                {searchTerm ? "Không tìm thấy bản ghi nào." : "Chưa có dữ liệu chấm công."}
                            </TableCell>
                        </TableRow>
                    )}
                    </TableBody>
                </Table>
            </div>
        </CardContent>
    </Card>
  )
}
