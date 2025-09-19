"use client"

import React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
// Removed unused UI component imports
import { Camera, Upload, User, CheckCircle, AlertCircle } from "lucide-react"
import { useRouter } from "next/navigation"

export default function AddEmployeePage() {
  const [name, setName] = useState("")
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string; qrCode?: string } | null>(null)
  const [showCamera, setShowCamera] = useState(false)
  const router = useRouter()

  const handleImageSelect = (file: File) => {
    setSelectedImage(file)
    const reader = new FileReader()
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string)
    }
    reader.readAsDataURL(file)
    setShowCamera(false)
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      handleImageSelect(file)
    }
  }

  const captureFromCamera = () => {
    setShowCamera(true)
  }

  const handleCameraCapture = (imageData: string) => {
    // Convert data URL to File
    fetch(imageData)
      .then((res) => res.blob())
      .then((blob) => {
        const file = new File([blob], "camera-capture.jpg", { type: "image/jpeg" })
        handleImageSelect(file)
      })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !selectedImage) return

    setIsSubmitting(true)
    setResult(null)

    try {
      const formData = new FormData()
      formData.append("name", name)
      formData.append("image", selectedImage)

      const response = await fetch("/api/users/register", {
        method: "POST",
        body: formData,
      })

      const data = await response.json()

      if (data.success) {
        // Generate QR code
        const qrResponse = await fetch("/api/qr/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: data.data.id,
            userName: data.data.name,
          }),
        })

        const qrData = await qrResponse.json()

        setResult({
          success: true,
          message: `Đăng ký thành công nhân viên: ${data.data.name}`,
          qrCode: qrData.success ? qrData.qrCode : undefined,
        })

        // Reset form
        setName("")
        setSelectedImage(null)
        setImagePreview(null)
      } else {
        setResult({
          success: false,
          message: data.error || "Đăng ký thất bại",
        })
      }
    } catch (error) {
      setResult({
        success: false,
        message: "Lỗi kết nối, vui lòng thử lại",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetForm = () => {
    setResult(null)
    setName("")
    setSelectedImage(null)
    setImagePreview(null)
    setShowCamera(false)
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Thêm nhân viên mới</h1>
          <p className="text-muted-foreground">Đăng ký nhân viên với nhận diện khuôn mặt</p>
        </div>
        <Button variant="outline" onClick={() => router.back()}>
          Quay lại
        </Button>
      </div>

      {/* Result Alert */}
      {result && (
        <div className={`p-4 rounded-lg border ${
          result.success 
            ? "border-green-500 bg-green-50 text-green-800" 
            : "border-red-500 bg-red-50 text-red-800"
        }`}>
          <div className="flex items-center gap-2">
            {result.success ? (
              <CheckCircle className="h-4 w-4 text-green-600" />
            ) : (
              <AlertCircle className="h-4 w-4 text-red-600" />
            )}
            <span>{result.message}</span>
          </div>
        </div>
      )}

      {/* QR Code Display */}
      {result?.success && result.qrCode && (
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-card-foreground">Mã QR cá nhân</CardTitle>
            <CardDescription>Nhân viên có thể sử dụng mã QR này để chấm công</CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <img src={result.qrCode || "/placeholder.svg"} alt="QR Code" className="mx-auto w-48 h-48" />
            <div className="flex gap-2 justify-center">
              <Button
                onClick={() => {
                  const link = document.createElement("a")
                  link.href = result.qrCode!
                  link.download = `${name}-qr-code.png`
                  link.click()
                }}
              >
                Tải xuống QR
              </Button>
              <Button variant="outline" onClick={resetForm}>
                Thêm nhân viên khác
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Registration Form */}
      {!result?.success && (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Employee Name */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-card-foreground flex items-center gap-2">
                <User className="h-5 w-5" />
                Thông tin nhân viên
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium text-card-foreground">
                  Tên nhân viên
                </label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nhập tên đầy đủ"
                  required
                  className="w-full px-3 py-2 border border-border rounded-md bg-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                />
              </div>
            </CardContent>
          </Card>

          {/* Face Photo */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-card-foreground flex items-center gap-2">
                <Camera className="h-5 w-5" />
                Ảnh khuôn mặt
              </CardTitle>
              <CardDescription>Chụp hoặc tải ảnh khuôn mặt để đăng ký nhận diện</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {imagePreview ? (
                <div className="space-y-4">
                  <div className="relative">
                    <img
                      src={imagePreview || "/placeholder.svg"}
                      alt="Preview"
                      className="w-full max-w-md mx-auto rounded-lg border border-border"
                    />
                  </div>
                  <div className="flex gap-2 justify-center">
                    <Button type="button" variant="outline" onClick={() => setImagePreview(null)}>
                      Chọn ảnh khác
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex gap-2 justify-center">
                    <Button type="button" onClick={captureFromCamera} variant="outline">
                      <Camera className="h-4 w-4 mr-2" />
                      Chụp ảnh
                    </Button>
                    <Button
                      type="button"
                      onClick={() => document.getElementById("file-upload")?.click()}
                      variant="outline"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Tải ảnh lên
                    </Button>
                  </div>
                  <input id="file-upload" type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                </div>
              )}

              {showCamera && (
                <div className="space-y-4">
                  <CameraCapture onCapture={handleCameraCapture} onCancel={() => setShowCamera(false)} />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex justify-end">
            <Button type="submit" disabled={!name || !selectedImage || isSubmitting} className="min-w-32">
              {isSubmitting ? "Đang xử lý..." : "Đăng ký nhân viên"}
            </Button>
          </div>
        </form>
      )}
    </div>
  )
}

// Simple camera capture component
function CameraCapture({ onCapture, onCancel }: { onCapture: (imageData: string) => void; onCancel: () => void }) {
  const videoRef = React.useRef<HTMLVideoElement>(null)
  const canvasRef = React.useRef<HTMLCanvasElement>(null)
  const [isStreaming, setIsStreaming] = useState(false)

  React.useEffect(() => {
    startCamera()
    return () => stopCamera()
  }, [])

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        setIsStreaming(true)
      }
    } catch (error) {
      console.error("Camera access failed:", error)
    }
  }

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream
      stream.getTracks().forEach((track) => track.stop())
    }
    setIsStreaming(false)
  }

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return

    const canvas = canvasRef.current
    const video = videoRef.current

    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    const ctx = canvas.getContext("2d")
    if (ctx) {
      ctx.drawImage(video, 0, 0)
      const imageData = canvas.toDataURL("image/jpeg", 0.8)
      onCapture(imageData)
      stopCamera()
    }
  }

  return (
    <div className="space-y-4">
      <div className="relative bg-muted rounded-lg overflow-hidden aspect-video">
        <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
        <canvas ref={canvasRef} className="hidden" />
      </div>
      <div className="flex gap-2 justify-center">
        <Button type="button" onClick={capturePhoto} disabled={!isStreaming}>
          Chụp ảnh
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Hủy
        </Button>
      </div>
    </div>
  )
}