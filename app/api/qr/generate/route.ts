import { type NextRequest, NextResponse } from "next/server"
import QRCode from "qrcode"

export async function POST(request: NextRequest) {
  try {
    const { userId, userName } = await request.json()

    if (!userId || !userName) {
      return NextResponse.json({ success: false, error: "Missing userId or userName" }, { status: 400 })
    }

    // Generate QR code as data URL
    const qrDataURL = await QRCode.toDataURL(userId.toString(), {
      width: 256,
      margin: 2,
      color: {
        dark: "#000000",
        light: "#FFFFFF",
      },
    })

    return NextResponse.json({
      success: true,
      qrCode: qrDataURL,
      data: userId.toString(),
    })
  } catch (error) {
    console.error("QR generation failed:", error)
    return NextResponse.json({ success: false, error: "Failed to generate QR code" }, { status: 500 })
  }
}
