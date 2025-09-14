import { type NextRequest, NextResponse } from "next/server"
import { addAttendance, getAttendanceRecords, decideActionAndStatus, getUserById } from "@/lib/database"

export async function GET() {
  try {
    const records = getAttendanceRecords()
    return NextResponse.json({ success: true, data: records })
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to fetch attendance records" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId, method } = await request.json()

    if (!userId || !method) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 })
    }

    // The server's time is already Vietnam time, no need to adjust.
    const now = new Date();

    // Decide action and status using the correct local time.
    const { action, status } = decideActionAndStatus(userId, now)

    if (!action) {
      return NextResponse.json({
        success: false,
        message: status, // E.g., "Đã hoàn thành chấm công..."
      })
    }

    // Add the attendance record. The timestamp will be converted to UTC string inside this function.
    const result = addAttendance(userId, method, action, status, now)
    const user = getUserById(userId)

    // Return the response
    return NextResponse.json({
      success: true,
      message: `${action} - ${status}`,
      data: {
        id: result.lastInsertRowid,
        user_id: userId,
        user_name: user?.name,
        method,
        check_type: action,
        status,
        // Return a clean UTC string, the client will handle local time conversion.
        timestamp: now.toISOString().slice(0, 19).replace('T', ' '),
      },
    })
  } catch (error) {
    console.error("[API Attendance POST Error]:", error)
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    return NextResponse.json({ success: false, error: `Failed to record attendance: ${errorMessage}` }, { status: 500 })
  }
}
