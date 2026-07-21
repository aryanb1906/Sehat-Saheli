import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { clientIp, rateLimit } from "@/lib/rate-limit"
import { requireSessionUser } from "@/lib/api-auth"

const sendMessageSchema = z.object({
    roomId: z.string().optional(),
    motherId: z.string(),
    doctorId: z.string(),
    content: z.string().min(1).max(2000),
})

// A caller is only ever allowed to touch a chat room they are a participant
// in. Previously motherId/doctorId came straight from the query/body with no
// check against the session at all — any authenticated (or even anonymous)
// caller could read or write another patient's private consultation by
// guessing/enumerating IDs.
function assertParticipant(userId: string, role: string, motherId: string, doctorId: string) {
    if (role === "MOTHER") return motherId === userId
    if (role === "DOCTOR") return doctorId === userId
    return false // ASHA is not a chat participant in this feature
}

export async function GET(req: NextRequest) {
    const user = await requireSessionUser()
    if (!user) {
        return NextResponse.json({ success: false, error: "Authentication required" }, { status: 401 })
    }

    const ip = clientIp(req)
    const rl = await rateLimit(`chat-messages-get:${user.id}:${ip}`, 120, 60_000)
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

    try {
        const room = roomId
            ? await prisma.chatRoom.findUnique({ where: { id: roomId } })
            : await prisma.chatRoom.findUnique({ where: { motherId_doctorId: { motherId: motherId!, doctorId: doctorId! } } })

        if (!room) {
            return NextResponse.json({ success: true, roomId: null, messages: [] })
        }

        if (!assertParticipant(user.id, user.role, room.motherId, room.doctorId)) {
            return NextResponse.json({ success: false, error: "Not allowed to access this conversation" }, { status: 403 })
        }

        const messages = await prisma.chatMessage.findMany({
            where: { roomId: room.id },
            orderBy: { createdAt: "asc" },
            take: 200,
        })

        return NextResponse.json({ success: true, roomId: room.id, messages })
    } catch (error) {
        // Previously this fell back to a fabricated "mock-room-123" / empty
        // messages response with success:true on ANY database error — which
        // meant a real outage looked identical to "no messages yet" from the
        // client's point of view. Surface the failure instead so the
        // offline-sync client's retry path (and the UI) can react correctly.
        return NextResponse.json({ success: false, error: "Chat is temporarily unavailable. Please try again." }, { status: 503 })
    }
}

export async function POST(req: NextRequest) {
    const user = await requireSessionUser()
    if (!user) {
        return NextResponse.json({ success: false, error: "Authentication required" }, { status: 401 })
    }

    const ip = clientIp(req)
    const rl = await rateLimit(`chat-messages-post:${user.id}:${ip}`, 60, 60_000)
    if (!rl.allowed) {
        return NextResponse.json({ error: "Too many messages sent" }, { status: 429 })
    }

    const raw = await req.json()
    const parsed = sendMessageSchema.safeParse(raw)

    if (!parsed.success) {
        return NextResponse.json({ error: "Invalid payload", issues: parsed.error.flatten() }, { status: 400 })
    }

    const { motherId, doctorId, content } = parsed.data

    if (!assertParticipant(user.id, user.role, motherId, doctorId)) {
        return NextResponse.json({ success: false, error: "Not allowed to post in this conversation" }, { status: 403 })
    }

    try {
        const room =
            (parsed.data.roomId && (await prisma.chatRoom.findUnique({ where: { id: parsed.data.roomId } }))) ||
            (await prisma.chatRoom.upsert({
                where: { motherId_doctorId: { motherId, doctorId } },
                update: {},
                create: { motherId, doctorId },
            }))

        if (!assertParticipant(user.id, user.role, room.motherId, room.doctorId)) {
            return NextResponse.json({ success: false, error: "Not allowed to post in this conversation" }, { status: 403 })
        }

        const message = await prisma.chatMessage.create({
            data: {
                roomId: room.id,
                senderId: user.id,
                content,
            },
        })

        return NextResponse.json({ success: true, roomId: room.id, message })
    } catch (error) {
        // Previously this fabricated a fake "sent" message and returned
        // success:true when the database write actually failed — a message
        // could silently vanish while the UI reported it was delivered. Fail
        // loudly instead; lib/offline-sync-client.ts already knows how to
        // queue/retry a 5xx from a mutating POST.
        return NextResponse.json({ success: false, error: "Message could not be sent. It will be retried." }, { status: 503 })
    }
}
