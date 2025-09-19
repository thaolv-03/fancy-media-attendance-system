'use client'

import { useSearchParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

function FormMessage() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')
  const success = searchParams.get('success')

  if (error) {
    return <p className="text-sm text-destructive">{error}</p>
  }
  if (success) {
    return <p className="text-sm text-green-600">{success}</p>
  }
  return null
}

export default function SettingsPage() {
  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Cài đặt tài khoản</CardTitle>
          <CardDescription>Thay đổi mật khẩu quản trị viên của bạn.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action="/api/admin/change-password" method="POST" className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Mật khẩu hiện tại</Label>
              <Input
                id="currentPassword"
                name="currentPassword"
                type="password"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPassword">Mật khẩu mới</Label>
              <Input
                id="newPassword"
                name="newPassword"
                type="password"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Xác nhận mật khẩu mới</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
              />
            </div>
            <div className="pt-2">
                <FormMessage />
            </div>
            <Button type="submit" className="w-full sm:w-auto">Đổi mật khẩu</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
