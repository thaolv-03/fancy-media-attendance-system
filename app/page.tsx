import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { Users, Clock, Shield } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-card-foreground">FANCY MEDIA - Hệ thống chấm công</h1>
            <div className="flex gap-2">
              <Button asChild variant="outline">
                <Link href="/employee">Nhân viên chấm công</Link>
              </Button>
              <Button asChild>
                <Link href="/admin">Admin - Quản lý hệ thống</Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-foreground mb-4">Chấm công thông minh với Face ID</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Hệ thống chấm công hiện đại sử dụng công nghệ nhận diện khuôn mặt và QR code
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          <Card className="bg-card border-border">
            <CardHeader>
              <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center mb-4">
                <Clock className="h-6 w-6 text-primary-foreground" />
              </div>
              <CardTitle className="text-card-foreground">Chấm công nhanh</CardTitle>
              <CardDescription>Nhận diện khuôn mặt trong vài giây, tự động lưu kết quả</CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader>
              <div className="w-12 h-12 bg-secondary rounded-lg flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 text-secondary-foreground" />
              </div>
              <CardTitle className="text-card-foreground">Bảo mật cao</CardTitle>
              <CardDescription>Công nghệ Face Anti-spoofing ngăn chặn gian lận bằng ảnh giả</CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader>
              <div className="w-12 h-12 bg-accent rounded-lg flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-accent-foreground" />
              </div>
              <CardTitle className="text-card-foreground">Quản lý dễ dàng</CardTitle>
              <CardDescription>Dashboard Admin với báo cáo chi tiết và thống kê</CardDescription>
            </CardHeader>
          </Card>
        </div>

        <div className="text-center">
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-primary text-primary-foreground">
              <Link href="/employee">
                <Clock className="h-5 w-5 mr-2" />
                Chấm công ngay
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/admin">
                <Shield className="h-5 w-5 mr-2" />
                Quản lý hệ thống
              </Link>
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}
