"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Mic, Send, ArrowLeft, Volume2, MicOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { useLanguage } from "@/lib/language-context"
import { useSession } from "next-auth/react"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
}

interface DoctorMessage {
  id: string
  senderId: string
  content: string
  createdAt: string
}

export default function TalkToSaheli() {
  const router = useRouter()
  const { language, content } = useLanguage()
  const { data: session } = useSession()
  const [isListening, setIsListening] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [doctorMessages, setDoctorMessages] = useState<DoctorMessage[]>([])
  const [chatMode, setChatMode] = useState<"ai" | "doctor">("ai")
  const [roomId, setRoomId] = useState<string | null>(null)
  const [doctorLoading, setDoctorLoading] = useState(false)
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const motherId = (session?.user?.id as string) || "demo-mother"
  const doctorId = "demo-doctor"

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, doctorMessages])

  useEffect(() => {
    const fetchDoctorChat = async () => {
      try {
        setDoctorLoading(true)
        const res = await fetch(`/api/chat/messages?motherId=${motherId}&doctorId=${doctorId}`)
        const data = await res.json()
        if (data?.roomId) setRoomId(data.roomId)
        setDoctorMessages(data?.messages || [])
      } catch (error) {
        console.error("Failed to load doctor messages", error)
      } finally {
        setDoctorLoading(false)
      }
    }

    fetchDoctorChat()
  }, [motherId])

  useEffect(() => {
    if (!roomId) return

    const source = new EventSource(`/api/chat/stream?roomId=${roomId}`)
    source.onmessage = (event) => {
      const incoming = JSON.parse(event.data) as DoctorMessage
      setDoctorMessages((prev) => {
        if (prev.some((msg) => msg.id === incoming.id)) return prev
        return [...prev, incoming]
      })
    }

    source.onerror = () => {
      source.close()
    }

    return () => source.close()
  }, [roomId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    if (chatMode === "doctor") {
      try {
        setIsLoading(true)
        const res = await fetch("/api/chat/messages", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            roomId,
            motherId,
            doctorId,
            senderId: motherId,
            content: input.trim(),
          }),
        })

        if (!res.ok) {
          throw new Error("Failed to send doctor message")
        }

        const data = await res.json()
        setRoomId(data.roomId)
        setDoctorMessages((prev) => [...prev, data.message])
        setInput("")
      } catch (error) {
        console.error(error)
      } finally {
        setIsLoading(false)
      }

      return
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    let retryCount = 0
    const maxClientRetries = 2

    const attemptChat = async (): Promise<boolean> => {
      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: [...messages, userMessage],
            language: content.languageName,
          }),
        })

        if (!response.ok) {
          const error = await response.json()

          if (response.status === 503 && retryCount < maxClientRetries) {
            retryCount++
            console.log(`[v0] Retrying request (${retryCount}/${maxClientRetries})...`)
            await new Promise((resolve) => setTimeout(resolve, 2000 * retryCount))
            return attemptChat()
          }

          throw new Error(error.error || error.details || "Failed to get response")
        }

        const reader = response.body?.getReader()
        const decoder = new TextDecoder()

        if (!reader) {
          throw new Error("No response body")
        }

        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: "",
        }

        setMessages((prev) => [...prev, assistantMessage])

        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const text = decoder.decode(value, { stream: true })

          assistantMessage.content += text
          setMessages((prev) => {
            const newMessages = [...prev]
            newMessages[newMessages.length - 1] = { ...assistantMessage }
            return newMessages
          })
        }

        return true
      } catch (error) {
        console.error("[v0] Chat error:", error)
        throw error
      }
    }

    try {
      await attemptChat()
    } catch (error: any) {
      let errorText = "Sorry, I'm having trouble connecting. Please try again."

      if (error.message?.includes("busy") || error.message?.includes("overloaded")) {
        errorText = "I'm experiencing high demand right now. Please wait a moment and try again."
      } else if (error.message?.includes("timeout")) {
        errorText = "The request took too long. Please try again with a shorter message."
      }

      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: errorText,
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleVoiceInput = () => {
    if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) {
      alert("Voice recognition is not supported in your browser")
      return
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    const recognition = new SpeechRecognition()

    const langMap: Record<string, string> = {
      en: "en-IN",
      hi: "hi-IN",
      or: "or-IN",
      bn: "bn-IN",
      te: "te-IN",
      ta: "ta-IN",
      mr: "mr-IN",
      gu: "gu-IN",
    }
    recognition.lang = langMap[language] || "en-IN"
    recognition.continuous = false
    recognition.interimResults = false

    recognition.onstart = () => {
      setIsListening(true)
    }

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript
      setInput(transcript)
      setIsListening(false)
    }

    recognition.onerror = (event: any) => {
      console.error("[v0] Voice recognition error:", event.error)
      setIsListening(false)
    }

    recognition.onend = () => {
      setIsListening(false)
    }

    recognition.start()
  }

  const speakText = (text: string) => {
    if ("speechSynthesis" in window) {
      speechSynthesis.cancel()
      const utterance = new SpeechSynthesisUtterance(text)

      const langMap: Record<string, string> = {
        en: "en-IN",
        hi: "hi-IN",
        or: "or-IN",
        bn: "bn-IN",
        te: "te-IN",
        ta: "ta-IN",
        mr: "mr-IN",
        gu: "gu-IN",
      }
      utterance.lang = langMap[language] || "en-IN"
      utterance.rate = 0.9

      const voices = speechSynthesis.getVoices()
      const femaleVoice =
        voices.find(
          (voice) =>
            voice.lang.startsWith(language) &&
            (voice.name.toLowerCase().includes("female") || voice.name.toLowerCase().includes("woman")),
        ) || voices.find((voice) => voice.lang.startsWith(language) && !voice.name.toLowerCase().includes("male"))

      if (femaleVoice) {
        utterance.voice = femaleVoice
      }

      utterance.pitch = 1.1
      speechSynthesis.speak(utterance)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-trust/10 to-background flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-trust to-accent p-6 text-white">
        <div className="flex items-center gap-4 mb-4">
          <Button onClick={() => router.back()} variant="ghost" size="icon" className="text-white hover:bg-white/20">
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">{content.chatTitle}</h1>
            <p className="text-white/80 text-sm">{content.chatSubtitle}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 max-w-xs">
          <Button
            variant={chatMode === "ai" ? "default" : "secondary"}
            className="h-10"
            onClick={() => setChatMode("ai")}
          >
            AI Saheli
          </Button>
          <Button
            variant={chatMode === "doctor" ? "default" : "secondary"}
            className="h-10"
            onClick={() => setChatMode("doctor")}
          >
            Doctor Chat
          </Button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 p-6 space-y-4 overflow-y-auto">
        {chatMode === "ai" && messages.length === 0 && (
          <div className="flex justify-start">
            <Card className="p-4 bg-card border-2">
              <p className="text-sm leading-relaxed">
                {content.greeting}! I am Saheli, your health companion. {content.greetingQuestion}
              </p>
            </Card>
          </div>
        )}

        {chatMode === "ai" && messages.map((message) => (
          <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
            <Card className={`p-4 max-w-[80%] ${message.role === "user" ? "bg-trust text-white" : "bg-card border-2"}`}>
              <div className="flex items-start gap-2">
                <p className="text-sm leading-relaxed flex-1 whitespace-pre-wrap">{message.content}</p>
                {message.role === "assistant" && message.content && (
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-6 w-6 shrink-0"
                    onClick={() => speakText(message.content)}
                  >
                    <Volume2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </Card>
          </div>
        ))}

        {chatMode === "doctor" && doctorMessages.length === 0 && !doctorLoading && (
          <div className="flex justify-start">
            <Card className="p-4 bg-card border-2">
              <p className="text-sm leading-relaxed">
                Start a conversation with your doctor. Messages are synced in near real-time.
              </p>
            </Card>
          </div>
        )}

        {chatMode === "doctor" && doctorMessages.map((message) => {
          const mine = message.senderId === motherId
          return (
            <div key={message.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
              <Card className={`p-4 max-w-[80%] ${mine ? "bg-trust text-white" : "bg-card border-2"}`}>
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
              </Card>
            </div>
          )
        })}

        {isLoading && chatMode === "ai" && (
          <div className="flex justify-start">
            <Card className="p-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-trust rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-trust rounded-full animate-bounce [animation-delay:0.2s]" />
                <div className="w-2 h-2 bg-trust rounded-full animate-bounce [animation-delay:0.4s]" />
                <span className="text-sm text-muted-foreground ml-2">Saheli is thinking...</span>
              </div>
            </Card>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-6 bg-card border-t">
        {isListening && (
          <div className="mb-2 text-center">
            <span className="text-sm text-alert animate-pulse">{content.listening}</span>
          </div>
        )}
        <form onSubmit={handleSubmit} className="flex gap-2">
          {chatMode === "ai" && (
            <Button
              type="button"
              onClick={handleVoiceInput}
              size="icon"
              className={`${isListening ? "bg-alert animate-pulse" : "bg-trust hover:bg-trust/90"}`}
              disabled={isLoading}
            >
              {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </Button>
          )}
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={chatMode === "ai" ? content.typePlaceholder : "Type your message to doctor..."}
            className="min-h-[48px] max-h-[120px] resize-none"
            disabled={isLoading}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault()
                handleSubmit(e as any)
              }
            }}
          />
          <Button
            type="submit"
            size="icon"
            className="bg-success hover:bg-success/90"
            disabled={isLoading || !input.trim()}
          >
            <Send className="w-5 h-5" />
          </Button>
        </form>
        <p className="text-xs text-muted-foreground mt-2 text-center">Press Enter to send, Shift+Enter for new line</p>
      </div>
    </div>
  )
}
