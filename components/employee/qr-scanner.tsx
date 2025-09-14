"use client"

import type React from "react"

import { useRef, useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Camera, Upload, CameraOff } from "lucide-react"
import jsQR from "jsqr"

interface QRScannerProps {
  onSuccess: (userName: string, message: string) => void
  onError: (error: string) => void
}

export function QRScanner({ onSuccess, onError }: QRScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isScanning, setIsScanning] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const scanIntervalRef = useRef<NodeJS.Timeout | null>(null)

  const startScanning = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment", // Use back camera if available
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      })

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        setIsScanning(true)

        videoRef.current.onloadedmetadata = () => {
          startQRDetection()
        }
      }
    } catch (error) {
      console.error("Camera access failed:", error)
      onError("Không thể truy cập camera")
    }
  }

  const stopScanning = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream
      stream.getTracks().forEach((track) => track.stop())
      videoRef.current.srcObject = null
    }
    setIsScanning(false)
    stopQRDetection()
  }

  const startQRDetection = () => {
    if (scanIntervalRef.current) return

    scanIntervalRef.current = setInterval(() => {
      if (!isProcessing) {
        scanQRCode()
      }
    }, 500) // Scan every 500ms
  }

  const stopQRDetection = () => {
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current)
      scanIntervalRef.current = null
    }
  }

  const scanQRCode = () => {
    if (!videoRef.current || !canvasRef.current || isProcessing) return

    const canvas = canvasRef.current
    const video = videoRef.current
    const ctx = canvas.getContext("2d")

    if (!ctx) return

    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const code = jsQR(imageData.data, imageData.width, imageData.height)

    if (code) {
      processQRCode(code.data)
    }
  }

  const processQRCode = async (qrData: string) => {
    if (isProcessing) return

    setIsProcessing(true)

    try {
      const decodeResponse = await fetch("/api/qr/decode", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ qrData }),
      })

      const decodeResult = await decodeResponse.json()

      if (!decodeResult.success) {
        onError(decodeResult.error || "Mã QR không hợp lệ")
        return
      }

      const attendanceResponse = await fetch("/api/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: decodeResult.user_id,
          method: "QR",
        }),
      })

      const attendanceResult = await attendanceResponse.json()

      if (attendanceResult.success) {
        onSuccess(decodeResult.user_name, attendanceResult.message)
        stopScanning() // Auto-stop scanning on success
      } else {
        const msg: string = attendanceResult.message || ""
        if (msg.startsWith("Đã hoàn thành")) {
          onSuccess(decodeResult.user_name, `${decodeResult.user_name} - đã hoàn thành chấm công trong buổi này`)
          stopScanning()
        } else {
          onError(attendanceResult.message || "Lỗi khi ghi nhận chấm công")
        }
      }
    } catch (error) {
      console.error("QR processing failed:", error)
      onError("Lỗi xử lý mã QR")
    } finally {
      setIsProcessing(false)
    }
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        if (!canvasRef.current) return

        const canvas = canvasRef.current
        const ctx = canvas.getContext("2d")
        if (!ctx) return

        canvas.width = img.width
        canvas.height = img.height
        ctx.drawImage(img, 0, 0)

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
        const code = jsQR(imageData.data, imageData.width, imageData.height)

        if (code) {
          processQRCode(code.data)
        } else {
          onError("Không tìm thấy mã QR trong ảnh")
        }
      }
      img.src = e.target?.result as string
    }
    reader.readAsDataURL(file)
  }

  useEffect(() => {
    return () => {
      stopScanning()
    }
  }, [])

  return (
    <div className="space-y-4">
      <div className="relative bg-muted rounded-lg overflow-hidden aspect-video">
        {/* Always render the video and canvas so refs are available when starting */}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className={`w-full h-full object-cover ${isScanning ? "" : "hidden"}`}
        />
        <canvas ref={canvasRef} className="hidden" />

        {isScanning ? (
          <>
            {/* QR scanning overlay */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-48 h-48 border-2 border-primary rounded-lg opacity-75">
                <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-primary"></div>
                <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-primary"></div>
                <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-primary"></div>
                <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-primary"></div>
              </div>
            </div>

            {/* Processing overlay */}
            {isProcessing && (
              <div className="absolute top-4 left-4 bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm">
                Đang xử lý QR...
              </div>
            )}
          </>
        ) : (
          <div className="absolute inset-0 w-full h-full flex items-center justify-center">
            <div className="text-center space-y-4">
              <CameraOff className="h-16 w-16 text-muted-foreground mx-auto" />
              <p className="text-muted-foreground">Chưa bật camera quét QR</p>
            </div>
          </div>
        )}
      </div>

      <div className="flex gap-2 justify-center">
        {!isScanning ? (
          <Button
            onClick={startScanning}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
            disabled={isProcessing}
          >
            <Camera className="h-4 w-4 mr-2" />
            Bật camera quét QR
          </Button>
        ) : (
          <Button
            onClick={stopScanning}
            variant="outline"
            className="border-border text-foreground hover:bg-muted bg-transparent"
            disabled={isProcessing}
          >
            <CameraOff className="h-4 w-4 mr-2" />
            Tắt camera
          </Button>
        )}

        <Button
          onClick={() => fileInputRef.current?.click()}
          variant="outline"
          className="border-border text-foreground hover:bg-muted"
          disabled={isProcessing}
        >
          <Upload className="h-4 w-4 mr-2" />
          Tải ảnh QR
        </Button>
      </div>

      <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
    </div>
  )
}
