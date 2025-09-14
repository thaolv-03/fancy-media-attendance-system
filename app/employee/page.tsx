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
     let icon, text, color;
    switch (status) {
      case "success": icon = <CheckCircle className="h-6 w-6 text-green-600" />; text = "Thành công"; color = "bg-green-100 text-green-800"; break;
      case "failed_terminal": icon = <XCircle className="h-6 w-6 text-destructive" />; text = "Thất bại"; color = "bg-destructive/10 text-destructive"; break;
      case "failed_retry": icon = <XCircle className="h-6 w-6 text-destructive" />; text = `Thất bại (Lần ${faceRecognitionAttempts}/3)`; color = "bg-destructive/10 text-destructive"; break;
      case "recognizing": case "countdown": icon = <Camera className="h-6 w-6 text-primary animate-pulse" />; text = "Đang xử lý..."; color = "bg-primary/10 text-primary"; break;
      default: icon = <Clock className="h-6 w-6 text-muted-foreground" />; text = "Sẵn sàng"; color = "bg-muted text-muted-foreground"; break;
    }
    return (
      <div className="text-center space-y-4 p-6">
        <div className="flex items-center justify-center gap-3"><Badge className={`${color} px-4 py-2`}>{icon}{text}</Badge></div>
        {finalUser && <div className="font-bold text-lg flex items-center justify-center gap-2 pt-2"><User/> {finalUser}</div>}
        {message && <p className="text-sm text-muted-foreground pt-2">{message}</p>}
        {(status === "success" || status === "failed_terminal") && <Button onClick={resetForNextUser} className="mt-4">Chấm công cho người tiếp theo</Button>}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center"><h1 className="text-4xl font-bold">FANCY MEDIA</h1></div>
        <div className="text-center"><h1 className="text-3xl font-bold">Chấm công bằng khuôn mặt</h1></div>
        <Card>{renderStatus()}</Card>
        <Card>
          <CardContent className="p-6">
            {showQRScanner ? (
              <div className="text-center space-y-4">
                  <QrCode className="h-16 w-16 mx-auto text-primary"/>
                  <p>Chế độ QR sẽ được hỗ trợ sau.</p>
                  <Button onClick={resetForNextUser}>Quay lại</Button>
              </div>
            ) : (
              <AttendanceCamera
                isActive={cameraShouldBeActive}
                status={status}
                message={message}
                countdown={countdown}
                onCameraReady={handleCameraReady}
                onCapture={handleRecognition}
                onStart={handleStart}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
