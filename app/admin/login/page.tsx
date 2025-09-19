'use client'

import Image from 'next/image'
import { useSearchParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2 } from 'lucide-react'
import { useFormStatus } from 'react-dom'

// A button that shows a loading spinner when the form is submitting
function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Đăng nhập
    </Button>
  )
}

// A component to display any error messages from the server
function ErrorMessage() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')
  if (!error) return null
  return <p className="text-red-500 text-sm text-center">{error}</p>
}

export default function LoginPage() {
  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-slate-100 dark:bg-slate-950">
        <div className="mb-8">
            <Image
                src="/fancy-media-logo.svg"
                alt="Fancy Media"
                width={200}
                height={50}
                className="dark:invert"
            />
        </div>
      <Card className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-slate-200 dark:border-slate-800">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Đăng nhập</CardTitle>
          {/* <CardDescription>Trang quản trị</CardDescription> */}
        </CardHeader>
        <CardContent>
          <form action="/api/auth/login" method="POST" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Tên đăng nhập</Label>
              <Input 
                id="username" 
                name="username" 
                type="text" 
                // placeholder="admin"
                required 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Mật khẩu</Label>
              <Input 
                id="password" 
                name="password" 
                type="password" 
                required 
              />
            </div>
            <ErrorMessage />
            <div className="mt-7">
              <SubmitButton />
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
