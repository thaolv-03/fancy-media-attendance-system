import { type NextRequest, NextResponse } from "next/server"
import { antiSpoofingDetector } from "@/lib/anti-spoofing"

/**
 * Independent Anti-Spoofing API
 * Only detects fake faces using hairymax model
 * Does not interfere with face recognition
 */
export async function POST(request: NextRequest) {
  try {
    console.log("[Anti-Spoofing] Starting independent anti-spoofing check")
    
    const formData = await request.formData()
    const imageFile = formData.get("image") as File

    if (!imageFile) {
      return NextResponse.json({ 
        success: false, 
        error: "No image provided" 
      }, { status: 400 })
    }

    const imageBuffer = Buffer.from(await imageFile.arrayBuffer())
    console.log("[Anti-Spoofing] Image received, size:", imageBuffer.length, "bytes")

    // Run anti-spoofing detection using hairymax model
    const antiSpoofingResult = await antiSpoofingDetector.detectLiveness(imageBuffer)
    
    console.log("[Anti-Spoofing] Detection result:", {
      isLive: antiSpoofingResult.isLive,
      confidence: antiSpoofingResult.confidence,
      processingTime: antiSpoofingResult.details.processingTime
    })

    return NextResponse.json({
      success: true,
      is_live: antiSpoofingResult.isLive,
      confidence: antiSpoofingResult.confidence,
      threshold: antiSpoofingResult.details.threshold,
      reasons: antiSpoofingResult.reasons,
      details: {
        threshold: antiSpoofingResult.details.threshold,
        processingTime: antiSpoofingResult.details.processingTime,
      },
      message: antiSpoofingResult.isLive 
        ? "Khuôn mặt thật được xác nhận" 
        : "Phát hiện khuôn mặt có thể giả"
    })

  } catch (error) {
    console.error("[Anti-Spoofing] Detection failed:", error)
    return NextResponse.json({ 
      success: false, 
      error: "Lỗi phát hiện anti-spoofing" 
    }, { status: 500 })
  }
}
