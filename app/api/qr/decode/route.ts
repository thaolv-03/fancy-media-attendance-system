import { type NextRequest, NextResponse } from "next/server"
import { getUserById } from "@/lib/database"

export async function POST(request: NextRequest) {
  try {
    const { qrData } = await request.json()

    if (!qrData) {
      return NextResponse.json({ success: false, error: "No QR data provided" }, { status: 400 })
    }

    // Try to parse as user ID
    const userId = Number.parseInt(qrData.toString())
    if (isNaN(userId)) {
      return NextResponse.json({ success: false, error: "Mã QR không hợp lệ" }, { status: 400 })
    }

    // Check if user exists
    const user = getUserById(userId)
    if (!user) {
      return NextResponse.json({ success: false, error: "Không tìm thấy nhân viên với mã QR này" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      user_id: user.id,
      user_name: user.name,
    })
  } catch (error) {
    console.error("QR decode failed:", error)
    return NextResponse.json({ success: false, error: "Lỗi xử lý mã QR" }, { status: 500 })
  }
}
