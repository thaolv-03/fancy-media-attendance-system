
import { Button } from "@/components/ui/button"
import Link from "next/link"
import Image from "next/image"
import { CheckCircle, Clock, ShieldCheck, Users, ArrowRight, BarChart, Settings, Palette } from "lucide-react"

// Component cho các thẻ tính năng
const FeatureCard = ({ icon, title, description, color }: { icon: React.ReactNode, title: string, description: string, color: string }) => (
  <div className="bg-white dark:bg-gray-800/50 p-6 rounded-lg shadow-sm hover:shadow-lg transition-shadow border border-gray-200 dark:border-gray-700/50">
    <div className={`flex h-12 w-12 items-center justify-center rounded-full bg-${color}-100 dark:bg-${color}-900/50 mb-4`}>
        {icon}
    </div>
    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">{title}</h3>
    <p className="text-gray-600 dark:text-gray-400 text-sm">{description}</p>
  </div>
);

export default function ModernHomePage() {
  return (
    <div className="relative min-h-screen w-full bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-950/80 backdrop-blur-lg">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex h-16 items-center justify-between">
                  <div className="flex items-center">
                      <Link href="#" className="flex items-center gap-2 font-bold text-lg">
                          <Image src="/fancy-media-logo.svg" alt="Fancy Media Logo" width={160} height={40} className="dark:invert"/>
                      </Link>
                  </div>
                  <nav className="hidden md:flex items-center space-x-6">
                      <Link href="#features" className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-primary transition-colors">Tính năng</Link>
                      <Link href="#how-it-works" className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-primary transition-colors">Cách hoạt động</Link>
                      <Link href="/admin" className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-primary transition-colors">Quản trị</Link>
                  </nav>
                  <div className="flex items-center">
                      <Button asChild>
                          <Link href="/employee">Chấm công</Link>
                      </Button>
                  </div>
              </div>
          </div>
      </header>

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        {/* Hero Section */}
        <section className="text-center">
          <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight text-gray-900 dark:text-gray-100">
            Hệ thống chấm công thông minh
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-600 dark:text-gray-400">
            Sử dụng công nghệ AI để quản lý thời gian làm việc một cách chính xác, an toàn và hiệu quả.
          </p>
          <div className="mt-8 flex justify-center gap-4">
              <Button asChild size="lg">
                  <Link href="/employee">Bắt đầu chấm công <ArrowRight className="ml-2 h-5 w-5" /></Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                  <Link href="/admin">Trang quản trị</Link>
              </Button>
          </div>
          <div className="mt-12 relative">
              <Image 
                  src="/dashboard.png" 
                  alt="Dashboard preview"
                  width={1000}
                  height={600}
                  className="rounded-lg shadow-2xl mx-auto border border-gray-200 dark:border-gray-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-gray-50 dark:from-gray-950 to-transparent"></div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-24 sm:py-32">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">Chức năng của hệ thống chấm công thông minh</h2>
            <p className="mt-3 text-lg text-gray-600 dark:text-gray-400">Hệ thống ứng dụng nhiều công nghệ hiện đại như nhận diện khuôn mặt, video, và các công cụ phân tích dữ liệu</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<Clock size={24} className="text-blue-500"/>}
              title="Chấm công tức thì"
              description="Nhận diện khuôn mặt chỉ trong vài giây, tự động ghi nhận và lưu trữ kết quả."
              color="blue"
            />
            <FeatureCard 
              icon={<ShieldCheck size={24} className="text-green-500"/>}
              title="Bảo mật & Chống gian lận"
              description="Công nghệ Anti-Spoofing ngăn chặn hành vi gian lận bằng hình ảnh hoặc video."
              color="green"
            />
            <FeatureCard 
              icon={<BarChart size={24} className="text-orange-500"/>}
              title="Báo cáo & Thống kê"
              description="Dashboard cung cấp báo cáo chi tiết, thống kê chuyên cần và quản lý nhân viên."
              color="orange"
            />
            <FeatureCard 
              icon={<Users size={24} className="text-purple-500"/>}
              title="Quản lý nhân viên"
              description="Dễ dàng thêm, sửa đổi hoặc xóa thông tin nhân viên khỏi hệ thống."
              color="purple"
            />
            <FeatureCard 
              icon={<Palette size={24} className="text-pink-500"/>}
              title="Giao diện tinh gọn"
              description="Giao diện được tinh gọn để người dùng có thể dễ dàng sử dụng."
              color="pink"
            />
            <FeatureCard 
              icon={<Settings size={24} className="text-gray-500"/>}
              title="Dễ dàng cấu hình"
              description="Thiết lập và cấu hình hệ thống nhanh chóng."
              color="gray"
            />
          </div>
        </section>

        {/* How it works Section */}
        <section id="how-it-works" className="py-24 sm:py-32 text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">Hoạt động như thế nào?</h2>
            <p className="mt-3 text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">Quy trình 3 bước đơn giản để bắt đầu quản lý chấm công hiệu quả.</p>
            <div className="mt-12 grid md:grid-cols-3 gap-8 text-left">
                <div className="relative p-8 bg-white dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700/50">
                    <div className="absolute top-4 left-4 text-4xl font-black text-gray-100 dark:text-gray-800">01</div>
                    <h3 className="font-semibold text-lg mt-8">Đăng ký</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">Quản trị viên thêm nhân viên mới và đăng ký khuôn mặt của họ bằng webcam hoặc tải lên ảnh.</p>
                </div>
                <div className="relative p-8 bg-white dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700/50">
                    <div className="absolute top-4 left-4 text-4xl font-black text-gray-100 dark:text-gray-800">02</div>
                    <h3 className="font-semibold text-lg mt-8">Chấm công</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">Nhân viên chỉ cần nhìn vào camera để hệ thống nhận diện và ghi lại thời gian vào/ra.</p>
                </div>
                <div className="relative p-8 bg-white dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700/50">
                    <div className="absolute top-4 left-4 text-4xl font-black text-gray-100 dark:text-gray-800">03</div>
                    <h3 className="font-semibold text-lg mt-8">Quản lý</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">Quản trị viên xem báo cáo, theo dõi dữ liệu chấm công và quản lý thông tin nhân viên.</p>
                </div>
            </div>
        </section>
      </main>

      {/* Footer */}
       <footer className="border-t border-gray-200 dark:border-gray-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
                <div className="flex items-center gap-4">
                    <Image src="/fancy-media-logo.svg" alt="Fancy Media Logo" width={140} height={35} className="dark:invert" />
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-4 md:mt-0">
                    &copy; {new Date().getFullYear()} Fancy Media. All rights reserved.
                </p>
            </div>
        </div>
      </footer>
    </div>
  );
}
