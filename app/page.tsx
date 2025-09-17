
import { Button } from "@/components/ui/button"
import Link from "next/link"
import Image from "next/image"
import { Clock, Shield, Users, ArrowRight } from "lucide-react"

// Component cho các thẻ tính năng
const FeatureCard = ({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) => (
  <div className="flex items-start space-x-4">
    <div className="flex-shrink-0">
      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
        {icon}
      </div>
    </div>
    <div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{title}</h3>
      <p className="mt-1 text-gray-600 dark:text-gray-400">{description}</p>
    </div>
  </div>
);

export default function ModernHomePage() {
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-white dark:bg-gray-950">
      {/* Họa tiết nền */}
      <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] dark:bg-[radial-gradient(#374151_1px,transparent_1px)] [background-size:16px_16px]"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_500px_at_50%_200px,#C9EBFF,transparent)] dark:bg-[radial-gradient(circle_500px_at_50%_200px,#0c2d48,transparent)]"></div>
      </div>

      <div className="grid lg:grid-cols-2 min-h-screen">
        {/* Cột Trái: Hình ảnh và trang trí */}
        <div className="relative hidden lg:flex items-center justify-center bg-primary/5 dark:bg-primary/10 p-8">
            <Image 
              src="/face_recognition.svg"
              alt="Facial Recognition Illustration"
              width={600}
              height={600}
              className="object-contain rounded-lg"
              priority
            />
        </div>

        {/* Cột Phải: Nội dung chính */}
        <div className="flex flex-col justify-center p-8 lg:p-12">
          <div className="mx-auto w-full max-w-md">
            {/* Logo */}
            <div className="mb-8 flex justify-start">
              <Image 
                src="/fancy-media-logo.svg"
                alt="Fancy Media Logo"
                width={220}
                height={50}
                className="dark:invert"
              />
            </div>

            {/* Hero Section */}
            <h1 className="text-4xl leading-14 font-bold tracking-tight text-gray-900 dark:text-gray-100 sm:text-5xl">
              Hệ thống chấm công<span className="text-primary"> thông minh</span>
            </h1>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
              Ứng dụng công nghệ AI nhận diện khuôn mặt để quản lý thời gian làm việc chính xác, an toàn và hiệu quả.
            </p>

            {/* Các tính năng */}
            <div className="mt-10 space-y-8">
              <FeatureCard 
                icon={<Clock size={24}/>}
                title="Chấm công nhanh chóng"
                description="Nhận diện khuôn mặt chỉ trong vài giây, tự động ghi nhận và lưu trữ kết quả."
              />
              <FeatureCard 
                icon={<Shield size={24}/>}
                title="Bảo mật tối đa"
                description="Công nghệ Anti-Spoofing ngăn chặn mọi hành vi gian lận bằng hình ảnh hoặc video."
              />
               <FeatureCard 
                icon={<Users size={24}/>}
                title="Quản lý trực quan"
                description="Dashboard cung cấp báo cáo chi tiết, thống kê chuyên cần và quản lý nhân viên dễ dàng."
              />
            </div>

            {/* Nút CTA */}
            <div className="mt-12 flex flex-col sm:flex-row gap-4">
              <Button asChild size="lg" className="w-full sm:w-auto">
                <Link href="/employee">
                  Chấm công ngay
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="w-full sm:w-auto">
                <Link href="/admin">Đến Trang quản trị</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
