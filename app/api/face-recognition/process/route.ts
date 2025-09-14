import { type NextRequest, NextResponse } from "next/server"
import { getUsersWithEmbeddings } from "@/lib/database"
import { checkImageQuality } from "@/lib/face-recognition"
import { facenetService } from "@/lib/facenet-service"

export async function POST(request: NextRequest) {
  try {
    console.log("[Face Recognition] Starting independent face recognition process")
    const formData = await request.formData()
    const imageFile = formData.get("image") as File

    if (!imageFile) {
      return NextResponse.json({ success: false, error: "No image provided" }, { status: 400 })
    }

    const imageBuffer = Buffer.from(await imageFile.arrayBuffer())
    console.log("[Face Recognition] Image received, size:", imageBuffer.length, "bytes")

    // Basic image quality check
    const imageQuality = await checkImageQuality(imageBuffer)
    console.log("[Face Recognition] Image quality score:", imageQuality.score)

    if (imageQuality.score < 0.3) {
      return NextResponse.json({
        success: false,
        error: `Chất lượng ảnh quá kém: ${imageQuality.issues.join(", ")}`,
        quality: imageQuality,
      })
    }

    // Get registered users
    const users = getUsersWithEmbeddings()
    if (users.length === 0) {
      return NextResponse.json({
        success: false,
        error: "Chưa có nhân viên nào được đăng ký",
      })
    }

    console.log("[Face Recognition] Comparing with", users.length, "registered users using Facenet512")

    const storedEmbeddings = users.map((user) => ({
      name: user.name,
      embedding: user.embedding,
    }))

    const comparisonResult = await facenetService.compareFaces(imageBuffer, storedEmbeddings)

    if (!comparisonResult.success || !comparisonResult.best_match) {
      return NextResponse.json({
        success: false,
        recognized: false,
        error: comparisonResult.error || "Lỗi so sánh khuôn mặt",
        quality: imageQuality,
      })
    }

    const matches = comparisonResult.matches || []
    const bestMatch = comparisonResult.best_match
    const secondBest = matches[1]

    console.log("[Face Recognition] === MATCHING RESULTS ===")
    console.log("[Face Recognition] Best match:", bestMatch.name, "- Similarity:", (bestMatch.similarity * 100).toFixed(2) + "%")
    if (secondBest) {
      console.log(
        "[Face Recognition] Second best:",
        secondBest.name,
        "- Similarity:",
        (secondBest.similarity * 100).toFixed(2) + "%",
      )
    }

    // Facenet512 approach: 0.30 threshold (0.25-0.35 range)
    const similarityThreshold = 0.30 // DeepFace recommended threshold
    const confidenceGap = bestMatch.similarity - (secondBest?.similarity || 0)
    const minConfidenceGap = 0.02 // Reduced for better acceptance

    console.log("[Face Recognition] Confidence gap:", (confidenceGap * 100).toFixed(2) + "%")
    console.log("[Face Recognition] Required similarity:", (similarityThreshold * 100).toFixed(0) + "%")
    console.log("[Face Recognition] Required confidence gap:", (minConfidenceGap * 100).toFixed(0) + "%")

    if (bestMatch.similarity >= similarityThreshold && confidenceGap >= minConfidenceGap) {
      console.log("[Face Recognition] ✅ Recognition SUCCESSFUL")
      const matchedUser = users.find((u) => u.name === bestMatch.name)
      return NextResponse.json({
        success: true,
        recognized: true,
        user_id: matchedUser?.id,
        user_name: bestMatch.name,
        confidence: bestMatch.similarity,
        similarity: bestMatch.similarity,
        threshold: similarityThreshold,
        confidence_gap: confidenceGap,
        quality: imageQuality,
        facenet512: {
          embedding_dimension: 512,
          model: "Facenet512",
          detector: "OpenCV",
        },
      })
    } else {
      const reason =
        bestMatch.similarity < similarityThreshold
          ? `độ tương đồng thấp (${(bestMatch.similarity * 100).toFixed(1)}% < ${(similarityThreshold * 100).toFixed(0)}%)`
          : `không đủ độ tin cậy để phân biệt (gap: ${(confidenceGap * 100).toFixed(1)}% < ${(minConfidenceGap * 100).toFixed(0)}%)`

      console.log("[Face Recognition] ❌ Recognition FAILED -", reason)
      return NextResponse.json({
        success: true,
        recognized: false,
        confidence: bestMatch.similarity,
        similarity: bestMatch.similarity,
        threshold: similarityThreshold,
        confidence_gap: confidenceGap,
        error: `Không nhận diện được khuôn mặt - ${reason}`,
        quality: imageQuality,
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
    console.error("[Face Recognition] Face recognition processing failed:", error)
    return NextResponse.json({ success: false, error: "Lỗi xử lý nhận diện khuôn mặt" }, { status: 500 })
  }
}