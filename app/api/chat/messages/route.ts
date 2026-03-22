import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { clientIp, rateLimit } from "@/lib/rate-limit"

const sendMessageSchema = z.object({
    roomId: z.string().optional(),
    motherId: z.string(),
    doctorId: z.string(),
    senderId: z.string(),
    content: z.string().min(1).max(2000),
})

export async function GET(req: NextRequest) {
    const ip = clientIp(req)
    const rl = await rateLimit(`chat-messages-get:${ip}`, 120, 60_000)
    if (!rl.allowed) {
        return NextResponse.json({ error: "Too many requests" }, { status: 429 })
    }

    const { searchParams } = new URL(req.url)
    const roomId = searchParams.get("roomId")
    const motherId = searchParams.get("motherId")
    const doctorId = searchParams.get("doctorId")

    if (!roomId && !(motherId && doctorId)) {
        return NextResponse.json({ error: "roomId or motherId+doctorId required" }, { status: 400 })
    }

    const room = roomId
        ? await prisma.chatRoom.findUnique({ where: { id: roomId } })
        : await prisma.chatRoom.findUnique({ where: { motherId_doctorId: { motherId: motherId!, doctorId: doctorId! } } })

    if (!room) {
        return NextResponse.json({ success: true, roomId: null, messages: [] })
    }

    const messages = await prisma.chatMessage.findMany({
        where: { roomId: room.id },
        orderBy: { createdAt: "asc" },
        take: 200,
    })

    return NextResponse.json({ success: true, roomId: room.id, messages })
}

export async function POST(req: NextRequest) {
    const ip = clientIp(req)
    const rl = await rateLimit(`chat-messages-post:${ip}`, 60, 60_000)
    if (!rl.allowed) {
        return NextResponse.json({ error: "Too many messages sent" }, { status: 429 })
    }

    const raw = await req.json()
    const parsed = sendMessageSchema.safeParse(raw)

    if (!parsed.success) {
        return NextResponse.json({ error: "Invalid payload", issues: parsed.error.flatten() }, { status: 400 })
    }

    const { motherId, doctorId, senderId, content } = parsed.data

    const room =
        (parsed.data.roomId && (await prisma.chatRoom.findUnique({ where: { id: parsed.data.roomId } }))) ||
        (await prisma.chatRoom.upsert({
            where: { motherId_doctorId: { motherId, doctorId } },
            update: {},
            create: { motherId, doctorId },
        }))

    const message = await prisma.chatMessage.create({
        data: {
            roomId: room.id,
            senderId,
            content,
        },
    })

    return NextResponse.json({ success: true, roomId: room.id, message })
}
