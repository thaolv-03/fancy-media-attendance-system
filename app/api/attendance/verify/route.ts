import { type NextRequest, NextResponse } from "next/server"
import { getUsersWithEmbeddings } from "@/lib/database"
import { antiSpoofingDetector } from "@/lib/anti-spoofing"
import { facenetService } from "@/lib/facenet-service"
import { checkImageQuality } from "@/lib/face-recognition"

/**
 * Combined Attendance Verification API
 * Runs face recognition and anti-spoofing in parallel
 * Returns combined results for attendance verification
 */

// All face recognition logic moved to shared module

export async function POST(request: NextRequest) {
  try {
    console.log("[Combined] Starting combined attendance verification")
    const formData = await request.formData()
    const imageFile = formData.get("image") as File

    if (!imageFile) {
      return NextResponse.json({ success: false, error: "No image provided" }, { status: 400 })
    }

    const imageBuffer = Buffer.from(await imageFile.arrayBuffer())
    console.log("[Combined] Image received, size:", imageBuffer.length, "bytes")

    // Optimized sequential flow: Quality → Anti-spoofing → Facenet512
    const startTime = Date.now()
    
    console.log("[Combined] Starting optimized sequential processing...")
    
    // Step 1: Check image quality first (fastest)
    const imageQuality = await checkImageQuality(imageBuffer)
    console.log("[Combined] Image quality check completed:", imageQuality.score)
    
    // Early exit if image quality is poor
    if (imageQuality.score < 0.3) {
      const processingTime = Date.now() - startTime
      console.log("[Combined] Early exit due to poor image quality in", processingTime, "ms")
      return NextResponse.json({
        success: false,
        error: `Chất lượng ảnh quá kém: ${imageQuality.issues.join(", ")}`,
        quality: imageQuality,
        processing_time: processingTime,
        early_exit: true
      })
    }
    
    // Step 2: Anti-spoofing check (medium speed)
    const antiSpoofingResult = await antiSpoofingDetector.detectLiveness(imageBuffer)
    const antiSpoofingTime = Date.now() - startTime
    console.log("[Combined] Anti-spoofing completed in", antiSpoofingTime, "ms")
    console.log("[Combined] Anti-spoofing result:", antiSpoofingResult.isLive)
    
    // Early exit if anti-spoofing fails (saves Facenet512 processing time)
    if (!antiSpoofingResult.isLive) {
      const processingTime = Date.now() - startTime
      console.log("[Combined] Early exit due to anti-spoofing failure in", processingTime, "ms")
      return NextResponse.json({
        success: false,
        error: `Phát hiện giả mạo: ${antiSpoofingResult.reasons.join(", ")}`,
        is_live: false,
        quality: imageQuality,
        anti_spoofing: antiSpoofingResult,
        processing_time: processingTime,
        early_exit: true
      })
    }
    
    // Step 3: Facenet512 processing (slowest, only if anti-spoofing passes)
    console.log("[Combined] Anti-spoofing passed, proceeding with Facenet512...")
    const facenetResult = await facenetService.extractEmbedding(imageBuffer)
    const totalProcessingTime = Date.now() - startTime
    
    console.log("[Combined] Sequential processing completed in", totalProcessingTime, "ms")
    console.log("[Combined] Facenet512 embedding extracted:", !!facenetResult.embedding)

    // Check Facenet512 face detection (only if we reach this point)
    if (!facenetResult.success || !facenetResult.embedding) {
      const processingTime = Date.now() - startTime
      console.log("[Combined] Facenet512 face detection failed in", processingTime, "ms")
      return NextResponse.json({
        success: false,
        error: facenetResult.error || "Không phát hiện được khuôn mặt trong ảnh",
        is_live: true,
        quality: imageQuality,
        anti_spoofing: antiSpoofingResult,
        processing_time: processingTime,
        facenet512_failed: true
      })
    }

    const embedding = facenetResult.embedding

    // Get registered users
    const users = getUsersWithEmbeddings()
    if (users.length === 0) {
      return NextResponse.json({
        success: false,
        error: "Chưa có nhân viên nào được đăng ký",
        is_live: true,
        quality: imageQuality,
        anti_spoofing: antiSpoofingResult,
      })
    }

    console.log("[Combined] Comparing with", users.length, "registered users using Facenet512")

    // Use Facenet512 to compare with all stored embeddings
    const storedEmbeddings = users.map(user => ({
      name: user.name,
      embedding: user.embedding
    }))

    const comparisonResult = await facenetService.compareFaces(imageBuffer, storedEmbeddings)
    
    if (!comparisonResult.success || !comparisonResult.best_match) {
      return NextResponse.json({
        success: false,
        recognized: false,
        error: comparisonResult.error || "Lỗi so sánh khuôn mặt",
        is_live: antiSpoofingResult.isLive,
        anti_spoofing: antiSpoofingResult,
        processing_time: processingTime,
      })
    }

    const matches = comparisonResult.matches || []
    const bestMatch = comparisonResult.best_match
    const secondBest = matches[1]

    console.log("[Combined] === FACENET512 MATCHING RESULTS ===")
    console.log("[Combined] Best match:", bestMatch.name, "- Similarity:", (bestMatch.similarity * 100).toFixed(2) + "%")
    if (secondBest) {
      console.log(
        "[Combined] Second best:",
        secondBest.name,
        "- Similarity:",
        (secondBest.similarity * 100).toFixed(2) + "%",
      )
    }

    // Facenet512 approach: 0.30 threshold (0.25-0.35 range)
    const similarityThreshold = 0.30 // Facenet512 recommended threshold
    const confidenceGap = bestMatch.similarity - (secondBest?.similarity || 0)
    const minConfidenceGap = 0.02 // Reduced for better acceptance

    console.log("[Combined] Confidence gap:", (confidenceGap * 100).toFixed(2) + "%")
    console.log("[Combined] Required similarity:", (similarityThreshold * 100).toFixed(0) + "%")
    console.log("[Combined] Required confidence gap:", (minConfidenceGap * 100).toFixed(0) + "%")

    if (bestMatch.similarity >= similarityThreshold && confidenceGap >= minConfidenceGap) {
      console.log("[Combined] ✅ Facenet512 Recognition SUCCESSFUL")
      
      // Find user ID from name
      const matchedUser = users.find(user => user.name === bestMatch.name)
      
      return NextResponse.json({
        success: true,
        recognized: true,
        user_id: matchedUser?.id,
        user_name: bestMatch.name,
        confidence: bestMatch.similarity,
        similarity: bestMatch.similarity,
        threshold: similarityThreshold,
        confidence_gap: confidenceGap,
        is_live: antiSpoofingResult.isLive,
        quality: imageQuality,
        anti_spoofing: antiSpoofingResult,
        processing_time: totalProcessingTime,
        optimized_flow: true,
        facenet512: {
          embedding_dimension: 512,
          model: "Facenet512",
          detector: "OpenCV"
        }
      })
    } else {
      const reason =
        bestMatch.similarity < similarityThreshold
          ? `độ tương đồng thấp (${(bestMatch.similarity * 100).toFixed(1)}% < ${(similarityThreshold * 100).toFixed(0)}%)`
          : `không đủ độ tin cậy để phân biệt (gap: ${(confidenceGap * 100).toFixed(1)}% < ${(minConfidenceGap * 100).toFixed(0)}%)`

      console.log("[Combined] ❌ Recognition FAILED -", reason)
      return NextResponse.json({
        success: true,
        recognized: false,
        confidence: bestMatch.similarity,
        similarity: bestMatch.similarity,
        threshold: similarityThreshold,
        confidence_gap: confidenceGap,
        is_live: true,
        error: `Không nhận diện được khuôn mặt - ${reason}`,
        quality: imageQuality,
        anti_spoofing: antiSpoofingResult,
        processing_time: totalProcessingTime,
        optimized_flow: true,
        debug: {
          best_match: bestMatch.name,
          all_similarities: matches.map((m) => ({
            name: m.name,
            similarity: (m.similarity * 100).toFixed(1) + "%",
          })),
        },
      })
    }
  } catch (error) {
    console.error("[Combined] Combined verification failed:", error)
    return NextResponse.json({ success: false, error: "Lỗi xử lý xác thực chấm công" }, { status: 500 })
  }
}
