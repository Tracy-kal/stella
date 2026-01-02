import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
    try {
        const { pin } = await request.json()

        const adminPin = process.env.ADMIN_PIN_CODE

        if (!adminPin) {
            return NextResponse.json(
                { success: false, error: "Admin PIN not configured" },
                { status: 500 }
            )
        }

        if (pin === adminPin) {
            return NextResponse.json({ success: true })
        } else {
            return NextResponse.json({ success: false, error: "Invalid PIN" })
        }
    } catch {
        return NextResponse.json(
            { success: false, error: "An error occurred" },
            { status: 500 }
        )
    }
}
