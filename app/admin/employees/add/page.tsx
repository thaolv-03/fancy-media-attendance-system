'use client'

import React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Camera, Upload, User, CheckCircle, AlertCircle, ArrowLeft } from "lucide-react"
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
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Thêm nhân viên mới</h1>
          <p className="text-muted-foreground">Đăng ký nhân viên với nhận diện khuôn mặt</p>
        </div>
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Quay lại
        </Button>
      </div>

      {/* Result Alert & QR Code */}
      {result?.success && (
        <Card className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                Đăng ký thành công
            </CardTitle>
            <CardDescription>{result.message}</CardDescription>
          </CardHeader>
          {result.qrCode && (
              <CardContent className="text-center space-y-4 pt-4">
                  <img src={result.qrCode} alt="QR Code" className="mx-auto w-48 h-48 border rounded-lg p-2" />
                  <p className="text-sm text-muted-foreground">Nhân viên có thể dùng mã này để chấm công.</p>
                  <div className="flex gap-2 justify-center">
                      <Button
                          onClick={() => {
                              const link = document.createElement("a")
                              link.href = result.qrCode!
                              link.download = `${name.replace(/\s+/g, '_')}-QR.png`
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
          )}
        </Card>
      )}

      {/* Error Alert */}
      {result && !result.success && (
          <div className="bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-700/50 p-4 rounded-lg flex items-center gap-3">
              <AlertCircle className="h-5 w-5" />
              <div>
                  <p className="font-semibold">Đăng ký thất bại</p>
                  <p className="text-sm">{result.message}</p>
              </div>
          </div>
      )}

      {/* Registration Form */}
      {!result?.success && (
        <form onSubmit={handleSubmit} className="space-y-6">
          <Card className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Thông tin nhân viên
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="name">Tên nhân viên</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nhập tên đầy đủ"
                  required
                />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="h-5 w-5" />
                Ảnh khuôn mặt
              </CardTitle>
              <CardDescription>Chụp hoặc tải ảnh khuôn mặt để đăng ký nhận diện.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {imagePreview ? (
                <div className="space-y-4 text-center">
                  <div className="relative w-full max-w-sm mx-auto">
                    <img
                      src={imagePreview}
                      alt="Xem trước"
                      className="w-full rounded-lg border aspect-square object-cover"
                    />
                  </div>
                  <Button type="button" variant="outline" onClick={() => { setSelectedImage(null); setImagePreview(null); }}>
                    Chọn ảnh khác
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row gap-2 justify-center">
                    <Button type="button" onClick={captureFromCamera} variant="outline" className="w-full sm:w-auto">
                      <Camera className="h-4 w-4 mr-2" />
                      Chụp ảnh
                    </Button>
                    <Button
                      type="button"
                      onClick={() => document.getElementById("file-upload")?.click()}
                      variant="outline"
                       className="w-full sm:w-auto"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Tải ảnh lên
                    </Button>
                  </div>
                  <input id="file-upload" type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                </div>
              )}
              {showCamera && <CameraCapture onCapture={handleCameraCapture} onCancel={() => setShowCamera(false)} />}
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button type="submit" disabled={!name || !selectedImage || isSubmitting}>
              {isSubmitting ? "Đang xử lý..." : "Đăng ký nhân viên"}
            </Button>
          </div>
        </form>
      )}
    </div>
  )
}

function CameraCapture({ onCapture, onCancel }: { onCapture: (imageData: string) => void; onCancel: () => void }) {
  const videoRef = React.useRef<HTMLVideoElement>(null)
  const canvasRef = React.useRef<HTMLCanvasElement>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)

  React.useEffect(() => {
    const startCamera = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true })
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream
        }
        setStream(mediaStream)
      } catch (error) {
        console.error("Camera access failed:", error)
        // Handle camera access error (e.g., show a message to the user)
      }
    }

    startCamera()

    return () => {
      stream?.getTracks().forEach((track) => track.stop())
    }
  }, [])

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current || !stream) return

    const canvas = canvasRef.current
    const video = videoRef.current

    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    const ctx = canvas.getContext("2d")
    if (ctx) {
      ctx.drawImage(video, 0, 0)
      const imageData = canvas.toDataURL("image/jpeg", 0.9)
      onCapture(imageData)
      stream.getTracks().forEach((track) => track.stop())
    }
  }

  return (
    <div className="space-y-4">
      <div className="relative bg-muted rounded-lg overflow-hidden aspect-video max-w-sm mx-auto border">
        <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
        <canvas ref={canvasRef} className="hidden" />
      </div>
      <div className="flex gap-2 justify-center">
        <Button type="button" onClick={capturePhoto} disabled={!stream}>
          Chụp ảnh
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Hủy
        </Button>
      </div>
    </div>
  )
}
