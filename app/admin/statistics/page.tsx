'use client'

import { Card, CardContent } from "@/components/ui/card";
import { BarChart3 } from "lucide-react";

export default function StatisticsPage() {
  return (
    <div className="space-y-8">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50">Thống kê</h1>
                <p className="text-slate-500 dark:text-slate-400 mt-1">Phân tích và xem dữ liệu chấm công trực quan.</p>
            </div>
        </div>

        {/* Content */}
        <Card className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800">
           <CardContent className="py-16">
                <div className="text-center">
                    <BarChart3 className="mx-auto h-12 w-12 text-slate-400" />
                    <h3 className="mt-4 text-lg font-semibold text-slate-900 dark:text-slate-50">
                        Tính năng đang được phát triển
                    </h3>
                    <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                        Chúng tôi đang làm việc để mang đến cho bạn các báo cáo và thống kê chi tiết. Vui lòng quay lại sau.
                    </p>
                </div>
           </CardContent>
        </Card>
    </div>
  );
}
