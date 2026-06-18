import { NextResponse } from "next/server"
import { getUnreadCount } from "@/actions/notifications"

export async function GET() {
  try {
    const count = await getUnreadCount()
    return NextResponse.json({ count })
  } catch {
    return NextResponse.json({ count: 0 })
  }
}
