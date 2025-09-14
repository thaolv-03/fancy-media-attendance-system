'use client'

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { Search, Plus, Download, Edit, Trash2, Loader2 } from "lucide-react"
import Link from "next/link"
import type { User } from "@/lib/types"
import { useToast } from "@/components/ui/use-toast"


export default function EmployeesPage() {
  const [employees, setEmployees] = useState<User[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [selectedEmployee, setSelectedEmployee] = useState<User | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    fetchEmployees()
  }, [])

  const fetchEmployees = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/users")
      const data = await response.json()
      if (data.success) {
        setEmployees(data.data)
      } else {
        throw new Error(data.message || "Failed to fetch employees.")
      }
    } catch (error) {
      console.error("Failed to fetch employees:", error)
      toast({ variant: "destructive", title: "Lỗi", description: error instanceof Error ? error.message : "Không thể tải danh sách nhân viên." })
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteClick = (employee: User) => {
    setSelectedEmployee(employee)
    setShowDeleteDialog(true)
  }

  const handleConfirmDelete = async () => {
    if (!selectedEmployee) return

    setIsDeleting(true)
    try {
      const response = await fetch(`/api/users/${selectedEmployee.id}`, {
        method: 'DELETE',
      });
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to delete employee.")
      }

      toast({ title: "Thành công", description: `Đã xóa nhân viên ${selectedEmployee.name}.` })
      setEmployees(employees.filter(emp => emp.id !== selectedEmployee.id))

    } catch (error) {
        console.error("Delete error:", error);
        toast({ variant: "destructive", title: "Lỗi", description: error instanceof Error ? error.message : "Không thể xóa nhân viên." })
    } finally {
      setIsDeleting(false)
      setShowDeleteDialog(false)
      setSelectedEmployee(null)
    }
  }

  const filteredEmployees = employees.filter((employee) =>
    employee.name.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Quản lý nhân viên</h1>
          <p className="text-muted-foreground">Danh sách và thông tin nhân viên</p>
        </div>
        <div className="flex gap-2">
          <Button asChild>
            <Link href="/admin/employees/add">
              <Plus className="h-4 w-4 mr-2" />
              Thêm nhân viên
            </Link>
          </Button>
        </div>
      </div>

      {/* Search */}
      <Card className="bg-card border-border">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Tìm kiếm nhân viên..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-border rounded-md bg-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
            />
          </div>
        </CardContent>
      </Card>

      {/* Employee List */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-card-foreground">Danh sách nhân viên ({filteredEmployees.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 flex justify-center items-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                <p className="ml-3 text-muted-foreground">Đang tải danh sách nhân viên...</p>
            </div>
          ) : filteredEmployees.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                {searchTerm ? "Không tìm thấy nhân viên nào" : "Chưa có nhân viên nào."}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredEmployees.map((employee) => (
                <div
                  key={employee.id}
                  className="flex items-center justify-between p-4 bg-muted rounded-lg hover:bg-muted/80 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                      <span className="text-lg font-medium text-primary-foreground">{employee.name.charAt(0)}</span>
                    </div>
                    <div>
                      <h3 className="font-medium text-foreground">{employee.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        ID: {employee.id} • QR: {employee.qr_code}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Đăng ký: {new Date(employee.created_at).toLocaleDateString("vi-VN")}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" asChild>
                       <Link href={`/admin/employees/edit/${employee.id}`}>
                           <Edit className="h-4 w-4 mr-1"/> Sửa
                       </Link>
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => handleDeleteClick(employee)} disabled={isDeleting}>
                       <Trash2 className="h-4 w-4 mr-1"/> Xóa
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Bạn có chắc chắn muốn xóa?</AlertDialogTitle>
            <AlertDialogDescription>
              Hành động này không thể hoàn tác. Thao tác này sẽ xóa vĩnh viễn nhân viên 
              <span className="font-bold">{selectedEmployee?.name}</span> và tất cả dữ liệu chấm công liên quan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} disabled={isDeleting}>
              {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Tiếp tục
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
