export interface User {
  id: number
  name: string
  embedding: number[]
  qr_code: string
  created_at: string
}

export interface AttendanceRecord {
  id: number
  user_id: number
  user_name: string
  method: "FaceID" | "QR" | "FaceID-WebRTC"
  check_type: "Check-in" | "Check-out"
  status: "Đúng giờ" | "Đi muộn" | "Về sớm" | "Ngoài giờ"
  timestamp: string
}

export interface AttendanceResponse {
  success: boolean
  message: string
  data?: AttendanceRecord
}

export interface FaceRecognitionResult {
  recognized: boolean
  user_id?: number
  user_name?: string
  confidence?: number
  is_live: boolean
}
