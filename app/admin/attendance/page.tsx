'use client'

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Search, Download, Clock, User, Loader2 } from "lucide-react"
import type { AttendanceRecord } from "@/lib/types"
import { useToast } from "@/components/ui/use-toast"

export default function AttendancePage() {
  const [records, setRecords] = useState<AttendanceRecord[]>([])
  const [filteredRecords, setFilteredRecords] = useState<AttendanceRecord[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)
  const [isExporting, setIsExporting] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchAttendanceRecords()
  }, [])

  useEffect(() => {
    const filtered = records.filter(
      (record) =>
        record.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.method.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.status.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    setFilteredRecords(filtered)
  }, [records, searchTerm])

  const fetchAttendanceRecords = async () => {
    try {
        setLoading(true);
        const response = await fetch("/api/attendance");
        const data = await response.json();
        if (data.success) {
            setRecords(data.data);
            setFilteredRecords(data.data);
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
          
          // Trigger file download
          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;

          // Extract filename from Content-Disposition header
          const disposition = response.headers.get('Content-Disposition');
          let filename = `BaoCaoChamCong_${new Date().toISOString().slice(0,10)}.xlsx`; // Fallback
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

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      "Đúng giờ": "bg-green-100 text-green-800 border-green-200",
      "Đi muộn": "bg-red-100 text-red-800 border-red-200",
      "Về sớm": "bg-yellow-100 text-yellow-800 border-yellow-200",
      "Ngoài giờ": "bg-gray-100 text-gray-800 border-gray-200",
    }

    return (
      <Badge variant="outline" className={statusConfig[status as keyof typeof statusConfig] || "bg-gray-100 text-gray-800"}>
        {status}
      </Badge>
    )
  }

  const getMethodBadge = (method: string) => {
    const methodConfig = {
      "FaceID-WebRTC": "bg-blue-100 text-blue-800 border-blue-200",
      QR: "bg-purple-100 text-purple-800 border-purple-200",
    }

    return (
      <Badge variant="outline" className={methodConfig[method as keyof typeof methodConfig] || "bg-gray-100 text-gray-800"}>
        {method === "FaceID-WebRTC" ? "Face ID" : method}
      </Badge>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Báo cáo chấm công</h1>
          <p className="text-muted-foreground">Lịch sử chấm công của tất cả nhân viên</p>
        </div>
        <Button onClick={handleExport} disabled={isExporting || loading || records.length === 0}>
            {isExporting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Download className="h-4 w-4 mr-2" />}
            Xuất báo cáo
        </Button>
      </div>

      {/* Search */}
      <Card className="bg-card border-border">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Tìm kiếm theo tên, phương thức hoặc trạng thái..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-border rounded-md bg-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
            />
          </div>
        </CardContent>
      </Card>

      {/* Attendance Records */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-card-foreground">Lịch sử chấm công ({filteredRecords.length} bản ghi)</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
             <div className="text-center py-8 flex justify-center items-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                <p className="ml-3 text-muted-foreground">Đang tải lịch sử chấm công...</p>
            </div>
          ) : filteredRecords.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                {searchTerm ? "Không tìm thấy bản ghi nào" : "Chưa có bản ghi chấm công nào."}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredRecords.map((record) => (
                <div
                  key={record.id}
                  className="flex items-center justify-between p-4 bg-muted rounded-lg hover:bg-muted/80 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                      <User className="h-5 w-5 text-primary-foreground" />
                    </div>
                    <div>
                      <h3 className="font-medium text-foreground">{record.user_name}</h3>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {new Date(record.timestamp + 'Z').toLocaleString("vi-VN")}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                      <span className="font-semibold text-sm">{record.check_type}</span>
                      <div className="flex gap-2">
                        {getMethodBadge(record.method)}
                        {getStatusBadge(record.status)}
                      </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
