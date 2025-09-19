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
import { Badge } from "@/components/ui/badge"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { Input } from "@/components/ui/input"
import { Search, Plus, Edit, Trash2, Loader2, UserPlus } from "lucide-react"
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
    <Card>
        <CardHeader>
            <div className="flex items-center justify-between">
                <div>
                    <CardTitle>Quản lý nhân viên</CardTitle>
                    <CardDescription>Thêm, sửa, xóa và xem thông tin nhân viên.</CardDescription>
                </div>
                <Button asChild>
                    <Link href="/admin/employees/add">
                        <UserPlus className="h-4 w-4 mr-2" />
                        Thêm nhân viên
                    </Link>
                </Button>
            </div>
        </CardHeader>
        <CardContent>
            <div className="mb-4">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Tìm kiếm theo tên nhân viên..."
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
                            <TableHead className="w-[250px]">Tên nhân viên</TableHead>
                            <TableHead>Mã QR</TableHead>
                            <TableHead className="hidden md:table-cell">Ngày tạo</TableHead>
                            <TableHead className="text-right">Hành động</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                    {loading ? (
                        <TableRow>
                            <TableCell colSpan={5} className="h-24 text-center">
                                <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                            </TableCell>
                        </TableRow>
                    ) : filteredEmployees.length > 0 ? (
                        filteredEmployees.map((employee) => (
                            <TableRow key={employee.id}>
                                <TableCell>
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-muted-foreground/20 rounded-full flex items-center justify-center font-bold text-primary">
                                            {employee.name.charAt(0)}
                                        </div>
                                        <div className="font-medium">{employee.name}</div>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Badge variant="outline">{employee.qr_code}</Badge>
                                </TableCell>
                                <TableCell className="hidden md:table-cell">
                                    {new Date(employee.created_at).toLocaleDateString("vi-VN")}
                                </TableCell>
                                <TableCell className="text-right">
                                    <Button variant="outline" size="sm" asChild className="mr-2">
                                        <Link href={`/admin/employees/edit/${employee.id}`}>
                                            <Edit className="h-4 w-4"/>
                                            <span className="sr-only">Sửa</span>
                                        </Link>
                                    </Button>
                                    <Button variant="destructive" size="sm" onClick={() => handleDeleteClick(employee)} disabled={isDeleting}>
                                        <Trash2 className="h-4 w-4"/>
                                        <span className="sr-only">Xóa</span>
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell colSpan={5} className="h-24 text-center">
                                {searchTerm ? "Không tìm thấy nhân viên nào." : "Chưa có nhân viên nào."}
                            </TableCell>
                        </TableRow>
                    )}
                    </TableBody>
                </Table>
            </div>
        </CardContent>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Bạn có chắc chắn muốn xóa?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Hành động này không thể hoàn tác. Thao tác này sẽ xóa vĩnh viễn nhân viên <span className="font-bold">{selectedEmployee?.name}</span> và tất cả dữ liệu chấm công liên quan.
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
    </Card>
  )
}
