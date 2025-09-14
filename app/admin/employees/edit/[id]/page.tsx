'use client'

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { ArrowLeft, Loader2 } from "lucide-react"
import Link from "next/link"
import type { User } from "@/lib/types"

export default function EditEmployeePage() {
  const [employee, setEmployee] = useState<User | null>(null)
  const [name, setName] = useState("")
  const [qrCode, setQrCode] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const id = params.id as string

  useEffect(() => {
    if (!id) return

    const fetchEmployee = async () => {
      try {
        setIsLoading(true)
        const response = await fetch(`/api/users/${id}`)
        const data = await response.json()

        if (data.success) {
          setEmployee(data.data)
          setName(data.data.name)
          setQrCode(data.data.qr_code)
        } else {
          throw new Error(data.message || "Failed to fetch employee details.")
        }
      } catch (error) {
        console.error("Fetch error:", error)
        toast({
          variant: "destructive",
          title: "Lỗi",
          description: error instanceof Error ? error.message : "Không thể tải thông tin nhân viên.",
        })
        router.push("/admin/employees") // Redirect if employee not found
      } finally {
        setIsLoading(false)
      }
    }

    fetchEmployee()
  }, [id, router, toast])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    const updatedData: { name?: string; qrCode?: string } = {}
    if (name !== employee?.name) {
        updatedData.name = name;
    }
    if (qrCode !== employee?.qr_code) {
        updatedData.qrCode = qrCode;
    }

    if (Object.keys(updatedData).length === 0) {
        toast({
            title: "Không có gì thay đổi",
            description: "Thông tin nhân viên vẫn như cũ.",
        })
        setIsSaving(false);
        return;
    }

    try {
      const response = await fetch(`/api/users/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedData),
      })

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.message || "Failed to update employee.")
      }

      toast({
        title: "Thành công!",
        description: `Đã cập nhật thông tin cho nhân viên ${name}.`,
      })
      router.push("/admin/employees")

    } catch (error) {
      console.error("Update error:", error)
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: error instanceof Error ? error.message : "Không thể cập nhật nhân viên.",
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="p-6 space-y-6 max-w-2xl mx-auto">
        <div className="flex items-center gap-4">
             <Button variant="outline" size="icon" asChild>
                 <Link href="/admin/employees">
                     <ArrowLeft className="h-4 w-4" />
                 </Link>
             </Button>
             <div>
                 <h1 className="text-3xl font-bold text-foreground">Chỉnh sửa thông tin nhân viên</h1>
                 <p className="text-muted-foreground">Cập nhật chi tiết cho nhân viên trong hệ thống.</p>
             </div>
        </div>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-card-foreground">Chi tiết nhân viên</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              <p className="ml-3 text-muted-foreground">Đang tải dữ liệu...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="id">ID Nhân viên</Label>
                <Input id="id" value={employee?.id || ""} disabled className="bg-muted/50" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">Tên nhân viên</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="bg-input"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="qrCode">Mã QR</Label>
                <Input
                  id="qrCode"
                  value={qrCode}
                  onChange={(e) => setQrCode(e.target.value)}
                  required
                  className="bg-input"
                />
              </div>
                <div className="space-y-2">
                    <Label>Ngày tạo</Label>
                    <Input value={employee ? new Date(employee.created_at).toLocaleString("vi-VN") : ""} disabled className="bg-muted/50"/>
                </div>
              <div className="flex justify-end pt-4">
                <Button type="submit" disabled={isSaving || isLoading}>
                  {isSaving ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Đang lưu...</>
                  ) : (
                    "Lưu thay đổi"
                  )}
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
