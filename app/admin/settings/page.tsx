'use client'

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function SettingsPage() {
    return (
        <div className="space-y-4">
            <h1 className="text-2xl font-bold">Cài đặt</h1>
            <Card>
                <CardHeader>
                    <CardTitle>Cài đặt hệ thống</CardTitle>
                    <CardDescription>
                        Quản lý các thông số và cấu hình cho hệ thống chấm công.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="company-name">Tên công ty</Label>
                        <Input id="company-name" placeholder="Tên công ty của bạn" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="recognition-threshold">Ngưỡng nhận diện khuôn mặt</Label>
                        <Input id="recognition-threshold" type="number" placeholder="0.85" step="0.01" />
                        <p className="text-sm text-muted-foreground">
                            Giá trị từ 0 đến 1. Giá trị càng cao, yêu cầu nhận diện càng chính xác.
                        </p>
                    </div>
                </CardContent>
                <CardFooter className="border-t px-6 py-4">
                    <Button>Lưu thay đổi</Button>
                </CardFooter>
            </Card>
        </div>
    );
}
