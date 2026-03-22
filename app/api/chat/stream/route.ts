import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { clientIp, rateLimit } from "@/lib/rate-limit"

export const runtime = "nodejs"

export async function GET(req: NextRequest) {
    const ip = clientIp(req)
    const rl = await rateLimit(`chat-stream:${ip}`, 30, 60_000)
    if (!rl.allowed) {
        return new Response("Too many stream requests", { status: 429 })
    }

    const { searchParams } = new URL(req.url)
    const roomId = searchParams.get("roomId")

    if (!roomId || roomId.length < 4) {
        return new Response("roomId is required", { status: 400 })
    }

    const encoder = new TextEncoder()

    const stream = new ReadableStream({
        async start(controller) {
            let closed = false
            let lastTimestamp = new Date(0)

            const timer = setInterval(async () => {
                if (closed) return

                const updates = await prisma.chatMessage.findMany({
                    where: {
                        roomId,
                        createdAt: { gt: lastTimestamp },
                    },
                    orderBy: { createdAt: "asc" },
                })

                for (const msg of updates) {
                    lastTimestamp = msg.createdAt
                    controller.enqueue(encoder.encode(`data: ${JSON.stringify(msg)}\n\n`))
                }
            }, 2000)

            controller.enqueue(encoder.encode(`event: connected\ndata: ${JSON.stringify({ roomId })}\n\n`))

            req.signal.addEventListener("abort", () => {
                closed = true
                clearInterval(timer)
                controller.close()
            })
        },
    })

    return new Response(stream, {
        headers: {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache, no-transform",
            Connection: "keep-alive",
        },
    })
}
