import { GoogleGenerativeAI } from "@google/generative-ai"

export const runtime = "edge"

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "")

async function retryWithBackoff<T>(fn: () => Promise<T>, maxRetries = 3, baseDelay = 1000): Promise<T> {
  let lastError: any

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn()
    } catch (error: any) {
      lastError = error

      // Check if it's a 503 error (service unavailable/overloaded)
      const is503Error =
        error.message?.includes("503") ||
        error.message?.includes("overloaded") ||
        error.message?.includes("UNAVAILABLE")

      // If it's the last attempt or not a retryable error, throw
      if (attempt === maxRetries - 1 || !is503Error) {
        throw error
      }

      // Exponential backoff: wait longer for each retry
      const delay = baseDelay * Math.pow(2, attempt)
      console.log(`[v0] Retry attempt ${attempt + 1}/${maxRetries} after ${delay}ms`)
      await new Promise((resolve) => setTimeout(resolve, delay))
    }
  }

  throw lastError
}

function cleanMarkdownFormatting(text: string): string {
  // Remove bold markdown (**text** or __text__)
  let cleaned = text.replace(/\*\*(.+?)\*\*/g, '$1')
  cleaned = cleaned.replace(/__(.+?)__/g, '$1')
  
  // Remove italic markdown (*text* or _text_)
  cleaned = cleaned.replace(/\*(.+?)\*/g, '$1')
  cleaned = cleaned.replace(/_(.+?)_/g, '$1')
  
  // Remove any remaining asterisks
  cleaned = cleaned.replace(/\*/g, '')
  
  return cleaned
}

export async function POST(req: Request) {
  try {
    const { messages, language } = await req.json()

    const systemPrompt = `You are Saheli, a caring and knowledgeable AI health companion for pregnant women in rural India. 

Your role:
- Provide empathetic, culturally sensitive maternal health guidance
- Assess symptoms and identify potential risks
- Offer practical health advice in simple, easy-to-understand language
- Encourage seeking professional medical help when needed
- Be supportive of mental health concerns

Risk Assessment:
- Low Risk: Normal pregnancy symptoms, routine questions
- Medium Risk: Concerning but not urgent symptoms (mild swelling, occasional headaches)
- High Risk: Serious symptoms requiring immediate attention (severe bleeding, high BP, severe pain)

IMPORTANT:
- Always be encouraging and supportive
- Never diagnose, only provide guidance
- Recommend immediate medical attention for high-risk symptoms
- Keep responses concise and actionable
- Do NOT use markdown formatting like asterisks (*), bold (**), or underscores (_)
- Write in plain, natural language without any special formatting
- ${language ? `Respond in ${language} language` : "Respond in simple English"}

If you detect high-risk symptoms, start your response with [HIGH RISK] 
If you detect medium-risk symptoms, start with [MEDIUM RISK]`

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      systemInstruction: systemPrompt,
    })

    const chatHistory = messages.slice(0, -1).map((msg: any) => ({
      role: msg.role === "user" ? "user" : "model",
      parts: [{ text: msg.content }],
    }))

    const chat = model.startChat({
      history: chatHistory,
    })

    const lastMessage = messages[messages.length - 1]

    const result = await retryWithBackoff(
      () => chat.sendMessageStream(lastMessage.content),
      3, // Max 3 retries
      1000, // Start with 1 second delay
    )

    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of result.stream) {
            const text = cleanMarkdownFormatting(chunk.text())
            controller.enqueue(encoder.encode(text))
          }
          controller.close()
        } catch (error) {
          console.error("[v0] Streaming error:", error)
          controller.error(error)
        }
      },
    })

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    })
  } catch (error: any) {
    console.error("[v0] Chat API error:", error)

    let errorMessage = "Failed to process request"
    let statusCode = 500

    if (error.message?.includes("503") || error.message?.includes("overloaded")) {
      errorMessage = "The AI service is currently busy. Please try again in a moment."
      statusCode = 503
    } else if (error.message?.includes("401") || error.message?.includes("API key")) {
      errorMessage = "API configuration error. Please contact support."
      statusCode = 500
    } else if (error.message?.includes("timeout")) {
      errorMessage = "Request timed out. Please try again."
      statusCode = 504
    }

    return new Response(
      JSON.stringify({
        error: errorMessage,
        details: error.message,
      }),
      {
        status: statusCode,
        headers: { "Content-Type": "application/json" },
      },
    )
  }
}
