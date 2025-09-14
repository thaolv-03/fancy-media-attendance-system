'use client';

import { useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Camera, CameraOff, Shield } from "lucide-react";

type CameraDisplayStatus = "idle" | "starting" | "countdown" | "recognizing" | "success" | "failed_retry" | "failed_terminal" | "qr-mode";

interface AttendanceCameraProps {
  isActive: boolean;
  status: CameraDisplayStatus;
  message: string | null;
  countdown: number;
  onCameraReady: () => void;
  onCapture: (imageBlob: Blob) => void;
  onStart: () => void;
}

export function AttendanceCamera({
  isActive,
  status,
  message,
  countdown,
  onCameraReady,
  onCapture,
  onStart,
}: AttendanceCameraProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (isActive) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => stopCamera();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActive]);

  useEffect(() => {
    if (status === "recognizing") {
      captureAndDrawFrame();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  const startCamera = async () => {
    if (videoRef.current?.srcObject) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 1280, height: 720, facingMode: "user" } });
      const video = videoRef.current;
      if (video) {
        video.srcObject = stream;
        await video.play();
        onCameraReady();
      }
    } catch (err) {
      console.error("Camera access failed:", err);
    }
  };

  const stopCamera = () => {
    const video = videoRef.current;
    if (video?.srcObject) {
      (video.srcObject as MediaStream).getTracks().forEach(track => track.stop());
      video.srcObject = null;
    }
  };

  const captureAndDrawFrame = () => {
    if (!videoRef.current || !canvasRef.current || !videoRef.current.srcObject) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.save();
      ctx.scale(-1, 1);
      ctx.drawImage(video, -canvas.width, 0, canvas.width, canvas.height);
      ctx.restore();
      canvas.toBlob(blob => {
        if (blob) onCapture(blob);
      }, "image/jpeg", 0.95);
    }
  };

  const isSnapshotVisible = ["success", "failed_terminal"].includes(status);
  const isOverlayVisible = isActive || status === 'countdown';

  let overlayMessage = message;
  if (status === 'countdown') {
    overlayMessage = `Sẵn sàng trong ${countdown}...`;
  }
  if (status === 'failed_retry') {
    overlayMessage = `Thất bại, đang thử lại...`;
  }

  return (
    <div className="space-y-4">
      <div className="relative bg-muted rounded-lg overflow-hidden aspect-video">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className={`w-full h-full object-cover transform scale-x-[-1] ${isSnapshotVisible ? "hidden" : ""}`}
        />
        <canvas 
          ref={canvasRef} 
          className={`w-full h-full object-cover ${isSnapshotVisible ? "" : "hidden"}`} 
        />
        
        {isOverlayVisible && overlayMessage && (
            <div className="absolute top-4 left-4 bg-black/60 text-white px-3 py-1.5 rounded-full text-sm font-medium flex items-center gap-2 z-10">
                <Shield className="h-4 w-4 text-green-400" />
                <span>{overlayMessage}</span>
            </div>
        )}

        {status === 'countdown' && countdown > 0 && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/25">
                <div className="text-9xl font-bold text-white" style={{ textShadow: '0 0 15px rgba(0,0,0,0.5)' }}>
                    {countdown}
                </div>
            </div>
        )}

        {status === "idle" && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center space-y-2">
              <CameraOff className="h-12 w-12 text-muted-foreground mx-auto" />
              <p className="text-muted-foreground">Sẵn sàng chấm công</p>
            </div>
          </div>
        )}
      </div>
      <div className="text-center">
        {status === "idle" && (
          <Button onClick={onStart} size="lg">
            <Camera className="h-5 w-5 mr-2" />
            Bắt đầu chấm công
          </Button>
        )}
      </div>
    </div>
  );
}
