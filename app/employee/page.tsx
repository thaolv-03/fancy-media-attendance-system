'use client';

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Camera, Clock, User, CheckCircle, XCircle, QrCode } from "lucide-react";
import { AttendanceCamera } from "@/components/employee/attendance-camera";

// Explicit status types for a clear state machine
type AttendanceStatus = "idle" | "starting" | "countdown" | "recognizing" | "success" | "failed_retry" | "failed_terminal" | "qr-mode";

export default function EmployeePage() {
  // State Management
  const [status, setStatus] = useState<AttendanceStatus>("idle");
  const [message, setMessage] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(0);
  const [cameraShouldBeActive, setCameraShouldBeActive] = useState(false);
  const [faceRecognitionAttempts, setFaceRecognitionAttempts] = useState(0);
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [finalUser, setFinalUser] = useState<string | null>(null);

  // Effect for the countdown timer
  useEffect(() => {
    if (status !== "countdown") return;
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setStatus("recognizing"); // Trigger recognition when countdown ends
    }
  }, [status, countdown]);

  // Effect for the automatic retry mechanism
  useEffect(() => {
    if (status !== "failed_retry") return;
    const timer = setTimeout(() => {
      setStatus("countdown"); // Go back to countdown for another attempt
      setCountdown(2);
    }, 2000);
    return () => clearTimeout(timer);
  }, [status]);

  // --- Action Handlers ---

  // Starts the entire process
  const handleStart = () => {
    setStatus("starting");
    setCameraShouldBeActive(true);
    setMessage("Đang khởi động camera...");
  };

  // Called by the camera when the video stream is ready
  const handleCameraReady = () => {
    setStatus("countdown");
    setCountdown(2);
  };

  // Core logic: processes the captured image via API calls
  const handleRecognition = async (imageBlob: Blob) => {
    try {
      // 1. Anti-Spoofing Check
      setMessage("Kiểm tra khuôn mặt thật...");
      const livenessFD = new FormData();
      livenessFD.append("image", imageBlob);
      const livenessResp = await fetch("/api/anti-spoofing/check", { method: "POST", body: livenessFD });
      const liveness = await livenessResp.json();
      if (!liveness.success || !liveness.is_live) {
        handleRecognitionFailure(liveness.reasons?.join(", ") || "Khuôn mặt không hợp lệ");
        return;
      }

      // 2. Face Recognition
      setMessage("Nhận diện khuôn mặt...");
      const recogFD = new FormData();
      recogFD.append("image", imageBlob);
      const recogResp = await fetch("/api/face-recognition/process", { method: "POST", body: recogFD });
      const recog = await recogResp.json();
      if (!recog.success || !recog.recognized) {
        handleRecognitionFailure(recog.error || "Không nhận diện được");
        return;
      }

      // 3. Record Attendance
      setMessage("Ghi nhận chấm công...");
      const attendanceResp = await fetch("/api/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: recog.user_id, method: "FaceID-Controlled-vFinal" }),
      });
      const attendanceResult = await attendanceResp.json();
      if (attendanceResult.success) {
        handleSuccess(recog.user_name, attendanceResult.message);
      } else {
        handleTerminalFailure(recog.user_name, attendanceResult.message || "Lỗi ghi nhận");
      }
    } catch (error) {
      handleTerminalFailure(null, "Lỗi hệ thống.");
    }
  };

  // --- State Transition Functions ---

  const handleSuccess = (userName: string, successMessage: string) => {
    setStatus("success");
    setMessage(successMessage);
    setFinalUser(userName);
    setCameraShouldBeActive(false);
    setFaceRecognitionAttempts(0);
  };

  const handleRecognitionFailure = (errorMessage: string) => {
    const newAttempts = faceRecognitionAttempts + 1;
    setFaceRecognitionAttempts(newAttempts);
    setMessage(errorMessage);
    if (newAttempts >= 3) {
      setStatus("qr-mode");
      setShowQRScanner(true);
      setCameraShouldBeActive(false);
    } else {
      setStatus("failed_retry"); // This triggers the auto-retry effect
    }
  };

  const handleTerminalFailure = (userName: string | null, errorMessage: string) => {
    setStatus("failed_terminal");
    setMessage(errorMessage);
    setFinalUser(userName);
    setCameraShouldBeActive(false);
  };

  const resetForNextUser = () => {
    setStatus("idle");
    setMessage(null);
    setCameraShouldBeActive(false);
    setFaceRecognitionAttempts(0);
    setShowQRScanner(false);
    setFinalUser(null);
  };

  // --- UI Rendering ---

  const renderStatus = () => {
    let icon, text, colorClass, iconColor;
    switch (status) {
      case "success":
        icon = CheckCircle;
        text = "Thành công";
        colorClass = "bg-green-500/10 text-green-700 border-green-500/20";
        iconColor = "text-green-600";
        break;
      case "failed_terminal":
        icon = XCircle;
        text = "Thất bại";
        colorClass = "bg-red-500/10 text-red-700 border-red-500/20";
        iconColor = "text-red-600";
        break;
      case "failed_retry":
        icon = XCircle;
        text = `Thất bại (Lần ${faceRecognitionAttempts}/3)`;
        colorClass = "bg-red-500/10 text-red-700 border-red-500/20";
        iconColor = "text-red-600";
        break;
      case "recognizing":
      case "countdown":
        icon = Camera;
        text = "Đang xử lý...";
        colorClass = "bg-blue-500/10 text-blue-700 border-blue-500/20";
        iconColor = "text-blue-600 animate-pulse";
        break;
      default:
        icon = Clock;
        text = "Sẵn sàng";
        colorClass = "bg-gray-500/10 text-gray-700 border-gray-500/20";
        iconColor = "text-gray-600";
        break;
    }
    const IconComponent = icon;
    return (
      <div className="flex flex-col items-center justify-center space-y-4 p-6">
        <Badge 
          variant="outline"
          className={`px-6 py-3 text-lg font-medium rounded-full border ${colorClass} flex items-center gap-2 transition-all duration-300 hover:shadow-md`}
        >
          <IconComponent className={`h-5 w-5 ${iconColor}`} />
          {text}
        </Badge>
        {finalUser && (
          <div className="flex items-center gap-2 text-xl font-semibold text-gray-800">
            <User className="h-5 w-5 text-blue-600" />
            {finalUser}
          </div>
        )}
        {message && <p className="text-sm text-gray-600 max-w-md text-center">{message}</p>}
        {status === "idle" && (
          <Button 
            onClick={handleStart} 
            className="mt-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium py-3 px-8 rounded-full transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
          >
            Bắt đầu chấm công
          </Button>
        )}
        {(status === "success" || status === "failed_terminal") && (
          <Button 
            onClick={resetForNextUser} 
            className="mt-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium py-3 px-8 rounded-full transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
          >
            Chấm công cho người tiếp theo
          </Button>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex flex-col items-center justify-center p-4 md:p-8">
      <div className="w-full max-w-4xl space-y-8">
        <header className="text-center space-y-3 animate-fade-in-down">
          <img 
            src="/fancy-media-logo.svg" 
            alt="Fancy Media Logo" 
            className="h-8 md:h-12 mx-auto object-contain"
          />
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800">Chấm công bằng khuôn mặt</h2>
        </header>
        
        <Card className="overflow-hidden rounded-3xl shadow-2xl bg-white/90 backdrop-blur-md border border-blue-100/50 transition-all duration-500 hover:shadow-3xl">
          <CardContent className="p-0">
            <div className="grid grid-cols-1 lg:grid-cols-2">
              <div className="p-6 flex items-center justify-center bg-gradient-to-b from-white to-blue-50/50">
                {showQRScanner ? (
                  <div className="text-center space-y-6 w-full max-w-sm">
                    <QrCode className="h-24 w-24 mx-auto text-indigo-600 animate-bounce" />
                    <p className="text-lg font-medium text-gray-700">Chế độ QR sẽ được hỗ trợ sau.</p>
                    <Button 
                      onClick={resetForNextUser}
                      className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium py-3 px-8 rounded-full transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
                    >
                      Quay lại
                    </Button>
                  </div>
                ) : (
                  <div className="w-full aspect-video rounded-2xl overflow-hidden shadow-inner bg-gray-100">
                    <AttendanceCamera
                      isActive={cameraShouldBeActive}
                      status={status}
                      message={message}
                      countdown={countdown}
                      onCameraReady={handleCameraReady}
                      onCapture={handleRecognition}
                      onStart={handleStart}
                    />
                  </div>
                )}
              </div>
              <div className="p-6 flex items-center justify-center bg-gradient-to-b from-blue-50/50 to-white">
                {renderStatus()}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}