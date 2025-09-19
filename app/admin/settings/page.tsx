'use client'

import { useSearchParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, AlertCircle, CheckCircle } from 'lucide-react'
import { useFormStatus } from 'react-dom'
import { useActionState } from 'react'
import { changePassword, FormState } from './actions' // Import FormState

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" disabled={pending} className="w-full sm:w-auto">
      {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Đổi mật khẩu
    </Button>
  )
}

// Update the state prop to use the imported FormState type
function FormMessage({ state }: { state: FormState }) {
  if (!state) return null

  return (
    <div 
        className={`flex items-center gap-2 text-sm p-3 rounded-md`}
    >
        {state.type === 'error' ? 
            <AlertCircle className="h-4 w-4 text-red-500" /> : 
            <CheckCircle className="h-4 w-4 text-green-500" />
        }
        <span className={state.type === 'error' ? 'text-red-600' : 'text-green-600'}>
            {state.message}
        </span>
    </div>
  )
}

export default function SettingsPage() {
  const [state, formAction] = useActionState(changePassword, null);

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50">Cài đặt</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Quản lý tài khoản và cấu hình hệ thống.</p>
      </div>

      {/* Content */}
      <form action={formAction}>
        <Card className="max-w-2xl bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800">
          <CardHeader>
            <CardTitle>Thay đổi mật khẩu</CardTitle>
            <CardDescription>Để bảo mật, vui lòng không chia sẻ mật khẩu của bạn với bất kỳ ai.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Mật khẩu hiện tại</Label>
                <Input id="currentPassword" name="currentPassword" type="password" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newPassword">Mật khẩu mới</Label>
                <Input id="newPassword" name="newPassword" type="password" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Xác nhận mật khẩu mới</Label>
                <Input id="confirmPassword" name="confirmPassword" type="password" required />
              </div>
          </CardContent>
          <CardFooter className="flex flex-col items-start gap-4">
             <SubmitButton />
             <FormMessage state={state} />
          </CardFooter>
        </Card>
      </form>
    </div>
  )
}
