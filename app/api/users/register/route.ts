import { type NextRequest, NextResponse } from "next/server"
import { addUser } from "@/lib/database"
import { facenetService } from "@/lib/facenet-service"

// All face recognition logic moved to shared module

export async function POST(request: NextRequest) {
  try {
    console.log("[v0] Registration: Starting user registration")
    const formData = await request.formData()
    const name = formData.get("name") as string
    const imageFile = formData.get("image") as File

    if (!name || !imageFile) {
      return NextResponse.json({ success: false, error: "Thiếu thông tin tên hoặc ảnh" }, { status: 400 })
    }

    // Convert image to buffer
    const imageBuffer = Buffer.from(await imageFile.arrayBuffer())
    console.log("[v0] Registration: Processing image for", name)

    // Extract 512-dim embedding using Facenet512
    const facenetResult = await facenetService.extractEmbedding(imageBuffer)
    if (!facenetResult.success || !facenetResult.embedding) {
      return NextResponse.json(
        {
          success: false,
          error: facenetResult.error || "Không phát hiện được khuôn mặt trong ảnh",
        },
        { status: 400 },
      )
    }

    const embedding = facenetResult.embedding

    console.log("[v0] Registration: Face embedding extracted successfully")

    // Generate QR code data
    const qrCode = `QR-${name}-${Date.now()}`

    try {
      const result = addUser(name, embedding, qrCode)
      console.log("[v0] Registration: User registered successfully with ID", result.lastInsertRowid)

      return NextResponse.json({
        success: true,
        data: {
          id: result.lastInsertRowid,
          name,
          qr_code: qrCode,
        },
      })
    } catch (error: any) {
      if (error.code === "SQLITE_CONSTRAINT_UNIQUE") {
        return NextResponse.json({ success: false, error: "Tên nhân viên đã tồn tại" }, { status: 409 })
      }

      throw error
    }
  } catch (error) {
    console.error("[v0] Registration: User registration failed:", error)
    return NextResponse.json({ success: false, error: "Lỗi đăng ký nhân viên" }, { status: 500 })
  }
}
