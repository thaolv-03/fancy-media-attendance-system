'use client';

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Camera, Clock, User, CheckCircle, XCircle, QrCode, Loader2, Home, CameraOff } from "lucide-react";
import { AttendanceCamera } from "@/components/employee/attendance-camera";
import Link from "next/link";
import Image from "next/image";

type AttendanceStatus = "idle" | "starting" | "countdown" | "recognizing" | "success" | "failed_retry" | "failed_terminal" | "qr-mode";

export default function EmployeeAttendancePage() {
  const [status, setStatus] = useState<AttendanceStatus>("idle");
  const [message, setMessage] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(0);
  const [cameraActive, setCameraActive] = useState(false);
  const [recognitionAttempts, setRecognitionAttempts] = useState(0);
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [finalUser, setFinalUser] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (status !== "countdown" || countdown <= 0) return;
    const timer = setTimeout(() => setCountdown(prev => prev - 1), 1000);
    return () => clearTimeout(timer);
  }, [status, countdown]);

  useEffect(() => {
    if (status !== "failed_retry") return;
    const timer = setTimeout(() => {
      setStatus("countdown");
      setCountdown(2);
    }, 2000);
    return () => clearTimeout(timer);
  }, [status]);

  useEffect(() => {
      if (status === "countdown" && countdown === 0) {
          setStatus("recognizing");
      }
  }, [status, countdown]);

  const handleStart = () => {
    setStatus("starting");
    setCameraActive(true);
    setMessage("Đang khởi động camera...");
  };

  const handleCameraReady = () => {
    setStatus("countdown");
    setCountdown(2);
  };

  const handleRecognition = async (imageBlob: Blob) => {
    try {
      setMessage("Kiểm tra khuôn mặt thật...");
      const livenessFD = new FormData();
      livenessFD.append("image", imageBlob);
      const livenessResp = await fetch("/api/anti-spoofing/check", { method: "POST", body: livenessFD });
      const liveness = await livenessResp.json();
      if (!liveness.success || !liveness.is_live) {
        handleRecognitionFailure(liveness.reasons?.join(", ") || "Khuôn mặt không hợp lệ.");
        return;
      }

      setMessage("Đang nhận diện...");
      const recogFD = new FormData();
      recogFD.append("image", imageBlob);
      const recogResp = await fetch("/api/face-recognition/process", { method: "POST", body: recogFD });
      const recog = await recogResp.json();
      if (!recog.success || !recog.recognized) {
        handleRecognitionFailure(recog.error || "Không nhận diện được khuôn mặt.");
        return;
      }

      setMessage("Đang ghi nhận chấm công...");
      const attendanceResp = await fetch("/api/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: recog.user_id, method: "Face Recognition" }),
      });
      const attendanceResult = await attendanceResp.json();
      if (attendanceResult.success) {
        handleSuccess(recog.user_name, attendanceResult.message);
      } else {
        handleTerminalFailure(recog.user_name, attendanceResult.message || "Lỗi khi ghi nhận chấm công.");
      }
    } catch (error) {
      handleTerminalFailure(null, "Đã xảy ra lỗi hệ thống. Vui lòng thử lại.");
    }
  };

  const handleSuccess = (userName: string, successMessage: string) => {
    setStatus("success");
    setMessage(successMessage);
    setFinalUser(userName);
    setCameraActive(false);
    setRecognitionAttempts(0);
    toast({ title: "Chấm công thành công!", description: `${userName}: ${successMessage}` });
  };

  const handleRecognitionFailure = (errorMessage: string) => {
    const newAttempts = recognitionAttempts + 1;
    setRecognitionAttempts(newAttempts);
    setMessage(errorMessage);
    if (newAttempts >= 3) {
      setStatus("qr-mode");
      setShowQRScanner(true);
      setCameraActive(false);
      toast({ variant: "destructive", title: "Nhận diện thất bại", description: "Chuyển sang chế độ quét mã QR." });
    } else {
      setStatus("failed_retry");
      toast({ variant: "destructive", title: `Nhận diện thất bại (Lần ${newAttempts})`, description: errorMessage });
    }
  };

  const handleTerminalFailure = (userName: string | null, errorMessage: string) => {
    setStatus("failed_terminal");
    setMessage(errorMessage);
    setFinalUser(userName);
    setCameraActive(false);
    toast({ variant: "destructive", title: "Chấm công thất bại", description: `${userName ? userName + ": " : ""}${errorMessage}` });
  };

  const resetState = () => {
    setStatus("idle");
    setMessage(null);
    setCameraActive(false);
    setRecognitionAttempts(0);
    setShowQRScanner(false);
    setFinalUser(null);
  };

  const renderStatusInfo = () => {
    let icon, text, colorClass;
    switch (status) {
      case "success":
        icon = <CheckCircle className="h-6 w-6 text-green-500" />;
        text = "Chấm công thành công";
        colorClass = "text-green-600";
        break;
      case "failed_terminal":
      case "failed_retry":
        icon = <XCircle className="h-6 w-6 text-red-500" />;
        text = "Chấm công thất bại";
        colorClass = "text-red-600";
        break;
      case "qr-mode":
        icon = <QrCode className="h-6 w-6 text-blue-500" />;
        text = "Sử dụng mã QR";
        colorClass = "text-blue-600";
        break;
      case "recognizing":
      case "countdown":
      case "starting":
        icon = <Loader2 className="h-6 w-6 animate-spin text-blue-500" />;
        text = "Đang xử lý...";
        colorClass = "text-blue-500";
        break;
      default:
        icon = <Clock className="h-6 w-6 text-gray-500" />;
        text = "Sẵn sàng chấm công";
        colorClass = "text-gray-600";
        break;
    }
    return (
      <div className="text-center space-y-4">
        <div className={`flex items-center justify-center gap-3 text-2xl font-semibold ${colorClass}`}>
          {icon}
          <span>{text}</span>
        </div>
        {finalUser && (
          <p className="text-lg font-medium text-gray-800 dark:text-gray-200">Nhân viên: {finalUser}</p>
        )}
        {message && <p className="text-muted-foreground max-w-sm mx-auto">{message}</p>}
      </div>
    );
  };

  return (
    <div className="min-h-screen w-full bg-gray-50 dark:bg-gray-950 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md mx-auto space-y-6">
            <div className="flex justify-center mb-6">
                 <Link href="/">
                    <Image src="/fancy-media-logo.svg" alt="Fancy Media Logo" width={200} height={50} className="dark:invert"/>
                 </Link>
            </div>
            
            <Card className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
                <CardContent className="p-6 flex flex-col items-center justify-center space-y-4">
                    <div className="w-full aspect-video rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 flex items-center justify-center">
                        {showQRScanner ? (
                            <div className="text-center p-4">
                                <QrCode className="h-16 w-16 mx-auto text-muted-foreground" />
                                <p className="mt-4 text-muted-foreground">Chức năng quét mã QR sẽ sớm được cập nhật.</p>
                            </div>
                        ) : status === 'idle' ? (
                            <div className="text-center text-muted-foreground flex flex-col items-center justify-center gap-2 h-full">
                                <CameraOff size={48} />
                                <p className="font-medium">Sẵn sàng chấm công</p>
                            </div>
                        ) : (
                            <AttendanceCamera
                                isActive={cameraActive}
                                status={status}
                                message={message}
                                countdown={countdown}
                                onCameraReady={handleCameraReady}
                                onCapture={handleRecognition}
                                onStart={handleStart}
                            />
                        )}
                    </div>
                </CardContent>
                <div className="border-t border-slate-200 dark:border-slate-800 p-6 flex flex-col items-center justify-center space-y-6 min-h-[160px]">
                    {renderStatusInfo()}
                    <div className="flex flex-col sm:flex-row gap-3 w-full max-w-xs">
                        {status === 'idle' && (
                             <Button onClick={handleStart} size="lg" className="w-full">
                                <Camera className="mr-2 h-4 w-4" />
                                Bắt đầu chấm công
                            </Button>
                        )}
                        {(status === "success" || status === "failed_terminal" || status === "qr-mode") && (
                            <Button onClick={resetState} size="lg" className="w-full">Chấm công tiếp</Button>
                        )}
                        {status !== 'idle' && status !== 'success' && status !== 'failed_terminal' && status !== 'qr-mode' && (
                            <Button onClick={resetState} size="lg" variant="outline" className="w-full">Hủy</Button>
                        )}
                    </div>
                </div>
            </Card>

             <div className="text-center mt-6">
                <Button variant="ghost" asChild>
                    <Link href="/">
                        <Home className="mr-2 h-4 w-4" />
                        Quay lại trang chủ
                    </Link>
                </Button>
            </div>
        </div>
    </div>
  );
}
