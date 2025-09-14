'use client'

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Download } from "lucide-react";

export default function ExportPage() {

  const handleExport = () => {
    // Trigger the file download by navigating to the API endpoint
    window.location.href = '/api/attendance/export';
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Xuất Báo Cáo</h1>
      <Card>
        <CardHeader>
          <CardTitle>Báo Cáo Chấm Công</CardTitle>
          <CardDescription>
            Nhấn vào nút bên dưới để tải xuống báo cáo chấm công đầy đủ của tất cả nhân viên dưới dạng tệp Excel (.xlsx).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" />
            Tải Xuống Báo Cáo
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
