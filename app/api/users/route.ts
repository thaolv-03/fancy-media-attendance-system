import { type NextRequest, NextResponse } from "next/server"
import { addUser, getUsers } from "@/lib/database"

export async function GET() {
  try {
    const users = getUsers()
    return NextResponse.json({ success: true, data: users })
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to fetch users" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name, embedding, qrCode } = await request.json()

    if (!name || !embedding || !qrCode) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 })
    }

    const result = addUser(name, embedding, qrCode)

    return NextResponse.json({
      success: true,
      data: { id: result.lastInsertRowid, name, qrCode },
    })
  } catch (error: any) {
    if (error.code === "SQLITE_CONSTRAINT_UNIQUE") {
      return NextResponse.json({ success: false, error: "User name already exists" }, { status: 409 })
    }

    return NextResponse.json({ success: false, error: "Failed to create user" }, { status: 500 })
  }
}