'use client'

import { useState, useEffect, useMemo } from "react"
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
import { Search, Edit, Trash2, Loader2, UserPlus, Users } from "lucide-react"
import Link from "next/link"
import type { User } from "@/lib/types"
import { useToast } from "@/components/ui/use-toast"

function EmptyState({ searchTerm }: { searchTerm: string }) {
    return (
        <div className="text-center py-16">
            <Users className="mx-auto h-12 w-12 text-slate-400" />
            <h3 className="mt-4 text-lg font-semibold text-slate-900 dark:text-slate-50">
                {searchTerm ? "Không tìm thấy nhân viên" : "Chưa có nhân viên nào"}
            </h3>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                {searchTerm ? "Thử tìm kiếm với từ khóa khác." : "Bắt đầu bằng cách thêm một nhân viên mới."}
            </p>
            {!searchTerm && (
                <Button asChild className="mt-6">
                    <Link href="/admin/employees/add">
                        <UserPlus className="h-4 w-4 mr-2" />
                        Thêm nhân viên
                    </Link>
                </Button>
            )}
        </div>
    )
}

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

  const filteredEmployees = useMemo(() => 
      employees.filter((employee) =>
        employee.name.toLowerCase().includes(searchTerm.toLowerCase()),
    ), [employees, searchTerm]);

  return (
    <div className="space-y-8">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50">Quản lý nhân viên</h1>
                <p className="text-slate-500 dark:text-slate-400 mt-1">Thêm, sửa, xóa và xem thông tin nhân viên.</p>
            </div>
            <Button asChild>
                <Link href="/admin/employees/add">
                    <UserPlus className="h-4 w-4 mr-2" />
                    Thêm nhân viên
                </Link>
            </Button>
        </div>

        {/* Content */}
        <Card className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800">
            <CardHeader>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                        placeholder="Tìm kiếm theo tên nhân viên..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full max-w-sm pl-9"
                    />
                </div>
            </CardHeader>
            <CardContent>
                {loading ? (
                     <div className="flex justify-center items-center py-16">
                        <Loader2 className="h-8 w-8 animate-spin text-slate-500" />
                    </div>
                ) : filteredEmployees.length > 0 ? (
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[300px]">Tên nhân viên</TableHead>
                                    <TableHead>Mã QR</TableHead>
                                    <TableHead className="hidden md:table-cell">Ngày tạo</TableHead>
                                    <TableHead className="text-right pr-6">Hành động</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredEmployees.map((employee) => (
                                    <TableRow key={employee.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center font-semibold text-slate-500 dark:text-slate-300">
                                                    {employee.name.charAt(0).toUpperCase()}
                                                </div>
                                                <span className="font-medium text-slate-800 dark:text-slate-200">{employee.name}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline">{employee.qr_code}</Badge>
                                        </TableCell>
                                        <TableCell className="hidden md:table-cell text-slate-500 dark:text-slate-400">
                                            {new Date(employee.created_at).toLocaleDateString("vi-VN")}
                                        </TableCell>
                                        <TableCell className="text-right pr-6">
                                            <Button variant="ghost" size="icon" asChild className="mr-2">
                                                <Link href={`/admin/employees/edit/${employee.id}`}>
                                                    <Edit className="h-4 w-4 text-slate-500"/>
                                                    <span className="sr-only">Sửa</span>
                                                </Link>
                                            </Button>
                                            <Button variant="ghost" size="icon" onClick={() => handleDeleteClick(employee)} disabled={isDeleting}>
                                                <Trash2 className="h-4 w-4 text-slate-500"/>
                                                <span className="sr-only">Xóa</span>
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                ) : (
                    <EmptyState searchTerm={searchTerm} />
                )}
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
    </div>
  )
}
