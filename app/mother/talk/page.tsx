"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Mic, Send, ArrowLeft, Volume2, MicOff, Activity, Baby, Hospital, Apple, HeartPulse, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { useLanguage } from "@/lib/language-context"
import { useSession } from "next-auth/react"
import { motion, AnimatePresence } from "framer-motion"
import { Playfair_Display, Outfit } from "next/font/google"

const playfair = Playfair_Display({ subsets: ["latin"], weight: ["600", "700", "900"] })
const outfit = Outfit({ subsets: ["latin"], weight: ["400", "500", "600", "700", "800", "900"] })

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
        
        if (!res.ok) {
          throw new Error(`Doctor chat API failed with status: ${res.status}`)
        }
        
        try {
          const data = await res.json()
          if (data?.roomId) setRoomId(data.roomId)
          setDoctorMessages(data?.messages || [])
        } catch (parseError) {
          console.error("Failed to parse JSON from doctor chat API", parseError)
        }
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

        try {
          const data = await res.json()
          setRoomId(data.roomId)
          setDoctorMessages((prev) => [...prev, data.message])
          setInput("")
        } catch (parseError) {
          console.error("Failed to parse response for sent message", parseError)
        }
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

  const parseA2UI = (content: string) => {
    try {
      const match = content.match(/```json\s+([\s\S]*?)\s+```/);
      if (match) {
        const jsonContent = JSON.parse(match[1]);
        const textContent = content.replace(match[0], "").trim();
        return { text: textContent, component: jsonContent.component, data: jsonContent.data };
      }
    } catch(e) {
      // Ignored, likely partial JSON during stream
    }
    
    const partialMatch = content.match(/```json[\s\S]*$/);
    if (partialMatch) {
      return { text: content.replace(partialMatch[0], "").trim(), component: null, data: null };
    }
    
    return { text: content, component: null, data: null };
  }

  return (
    <div className={`min-h-screen bg-background flex flex-col relative overflow-hidden ${outfit.className} antialiased`}>
      {/* Ambient Sensory Background */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <motion.div 
          animate={{ backgroundPosition: ["0% 0%", "100% 100%", "0% 0%"] }} 
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="w-full h-full opacity-[0.03] dark:opacity-10"
          style={{ 
            background: "radial-gradient(circle at 20% 30%, hsl(var(--trust)) 0%, transparent 50%), radial-gradient(circle at 80% 70%, hsl(var(--accent)) 0%, transparent 50%)", 
            backgroundSize: "200% 200%" 
          }}
        />
        <AnimatePresence>
          {isListening && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, transition: { duration: 0.5 } }}
              className="absolute inset-0 flex items-center justify-center mix-blend-screen dark:mix-blend-plus-lighter"
            >
              <motion.div
                animate={{ 
                  scale: [1, 1.8, 1.2, 2.2, 1],
                  opacity: [0.1, 0.4, 0.2, 0.5, 0.1]
                }}
                transition={{
                  repeat: Infinity,
                  duration: 1.5,
                  ease: "easeInOut"
                }}
                className="w-[50vw] h-[50vw] rounded-full bg-alert blur-[100px]"
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Header */}
      <div className="bg-card/70 backdrop-blur-xl border-b border-border/40 p-6 z-20 sticky top-0 shadow-sm">
        <div className="flex items-center gap-4 mb-4">
          <Button onClick={() => router.back()} variant="ghost" size="icon" className="text-muted-foreground hover:bg-muted min-h-[44px] min-w-[44px]" aria-label="Go back">
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <div className="flex-1">
            <h1 className={`text-3xl font-black tracking-tight text-foreground ${playfair.className} leading-none`}>{content.chatTitle}</h1>
            <p className="text-muted-foreground text-xs font-bold uppercase tracking-[0.2em] mt-1">{content.chatSubtitle}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 max-w-xs">
          <Button
            variant={chatMode === "ai" ? "default" : "outline"}
            className={`h-10 transition-colors ${chatMode === "ai" ? "bg-trust hover:bg-trust/90 text-white" : "text-muted-foreground"}`}
            onClick={() => setChatMode("ai")}
          >
            AI Saheli
          </Button>
          <Button
            variant={chatMode === "doctor" ? "default" : "outline"}
            className={`h-10 transition-colors ${chatMode === "doctor" ? "bg-accent hover:bg-accent/90 text-white" : "text-muted-foreground"}`}
            onClick={() => setChatMode("doctor")}
          >
            Doctor Chat
          </Button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 p-6 space-y-6 overflow-y-auto bg-transparent z-10 relative scroll-smooth">
        <AnimatePresence mode="popLayout">
        {chatMode === "ai" && messages.length === 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 30 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            layout 
            className="flex justify-start max-w-2xl mx-auto w-full pt-10"
          >
            <Card className="p-8 bg-card/80 backdrop-blur-md border border-border/50 shadow-2xl text-foreground w-full rounded-2xl">
              <div className="w-16 h-16 bg-trust/10 rounded-2xl flex items-center justify-center mb-6 shadow-inner">
                <span className="text-4xl">✨</span>
              </div>
              <h2 className={`text-4xl font-black tracking-tight mb-4 text-trust ${playfair.className}`}>Hello Saheli.</h2>
              <p className="text-lg font-medium leading-[1.7] text-muted-foreground max-w-[45ch]">
                I am Saheli, your health companion. {content.greetingQuestion}
              </p>
            </Card>
          </motion.div>
        )}

        {chatMode === "ai" && messages.map((message) => {
          const parsed = message.role === "assistant" ? parseA2UI(message.content) : { text: message.content, component: null, data: null };
          
          return (
          <motion.div 
            layout
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ type: "spring", stiffness: 400, damping: 25, mass: 0.5 }}
            key={message.id} 
            className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div className={`max-w-[85%] flex flex-col gap-3 ${message.role === "user" ? "items-end" : "items-start"}`}>
              <Card className={`p-5 w-full shadow-md ${message.role === "user" ? "bg-trust text-white border-0 rounded-br-sm" : "bg-card border-border/50 rounded-bl-sm"}`}>
                <div className="flex items-start gap-3">
                  <p className={`text-[16px] font-medium leading-[1.6] flex-1 whitespace-pre-wrap max-w-[65ch] ${message.role === "user" ? "text-white" : "text-foreground"}`}>{parsed.text}</p>
                  {message.role === "assistant" && parsed.text && (
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-10 w-10 shrink-0 text-muted-foreground hover:text-foreground"
                      onClick={() => speakText(parsed.text)}
                      aria-label="Play message"
                    >
                      <Volume2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </Card>
              
              {/* Agentic UI Component Renderer */}
              {parsed.component === "SymptomCard" && parsed.data && (
                <motion.div layout>
                <Card className="overflow-hidden border border-border/50 shadow-lg w-full transition-shadow duration-500">
                  <div className={`px-5 py-3 border-b flex items-center justify-between ${
                    parsed.data.severity === "Severe" || parsed.data.severity === "High Risk" ? "bg-alert/5 border-b-alert/20 text-alert" :
                    parsed.data.severity === "Moderate" ? "bg-warning/10 border-b-warning/30 text-yellow-700" :
                    "bg-success/5 border-b-success/20 text-success"
                  }`}>
                    <span className="flex items-center gap-2 text-[13px] font-bold tracking-wide uppercase"><Activity className="w-4 h-4" /> Symptom Alert</span>
                    <span className="text-[11px] uppercase tracking-[0.2em] font-black opacity-80">{parsed.data.severity}</span>
                  </div>
                  <div className="p-5 space-y-4 bg-card">
                    <div className={`font-black text-3xl text-foreground tracking-tight leading-none ${playfair.className}`}>{parsed.data.symptom}</div>
                    <p className="text-[16px] font-medium text-foreground/80 leading-[1.6] max-w-[50ch]">{parsed.data.recommendation}</p>
                    {parsed.data.requiresDoctor && (
                      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Button 
                          className="w-full bg-trust hover:bg-trust/90 text-white mt-1 shadow-md font-bold text-base min-h-[48px]" 
                          onClick={() => setChatMode("doctor")}
                        >
                          Talk to a Doctor Now
                        </Button>
                      </motion.div>
                    )}
                  </div>
                </Card>
                </motion.div>
              )}
              
              {/* Kick Counter Card Renderer */}
              {parsed.component === "KickCounterCard" && parsed.data && (
                <motion.div layout>
                <Card className="overflow-hidden border border-l-[6px] border-l-trust border-y-border/50 border-r-border/50 shadow-lg w-full flex flex-col p-6 bg-card transition-shadow">
                  <div className="flex flex-col mb-5">
                    <div className="flex items-center gap-3 mb-3">
                       <div className="text-trust bg-trust/10 p-3 rounded-xl"><Baby className="w-6 h-6 stroke-[2.5px]"/></div>
                       <h3 className={`text-2xl font-black tracking-tight text-foreground ${playfair.className}`}>Track Baby Kicks</h3>
                    </div>
                    <p className="text-[16px] font-medium text-muted-foreground leading-[1.6] max-w-[50ch]">{parsed.data.instructions || "Tap the button below every time you feel your baby kick or move."}</p>
                  </div>
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button variant="outline" className="w-full text-base font-bold border-trust/30 text-trust hover:bg-trust/5 min-h-[48px]" onClick={() => router.push('/mother/kick-counter')}>
                      Open Fetal Kick Counter
                    </Button>
                  </motion.div>
                </Card>
                </motion.div>
              )}
              
              {/* Hospital Finder Card Renderer */}
              {parsed.component === "HospitalFinderCard" && parsed.data && (
                <motion.div layout>
                <Card className="overflow-hidden border border-l-[6px] border-l-accent border-y-border/50 border-r-border/50 shadow-lg w-full flex flex-col p-6 bg-card transition-shadow">
                  <div className="flex flex-col mb-5">
                    <div className="flex items-center gap-3 mb-3">
                       <div className="text-accent bg-accent/10 p-3 rounded-xl"><Hospital className="w-6 h-6 stroke-[2.5px]"/></div>
                       <h3 className={`text-2xl font-black tracking-tight text-foreground ${playfair.className}`}>Find Medical Centers</h3>
                    </div>
                    <p className="text-[16px] font-medium text-muted-foreground leading-[1.6] max-w-[50ch]">{parsed.data.reason || "Locate nearby healthcare providers"}</p>
                  </div>
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button variant="outline" className="w-full text-base font-bold border-accent/30 text-accent hover:bg-accent/5 min-h-[48px]" onClick={() => router.push('/mother/hospital-finder')}>
                      Open Hospital Map
                    </Button>
                  </motion.div>
                </Card>
                </motion.div>
              )}

              {/* Nutrition Card Renderer */}
              {parsed.component === "NutritionCard" && parsed.data && (
                <motion.div layout>
                <Card className="overflow-hidden border border-l-[6px] border-l-success border-y-border/50 border-r-border/50 shadow-lg w-full flex flex-col p-6 bg-card transition-shadow">
                  <div className="flex flex-col mb-5">
                    <div className="flex items-center gap-3 mb-3">
                       <div className="text-success bg-success/10 p-3 rounded-xl"><Apple className="w-6 h-6 stroke-[2.5px]"/></div>
                       <h3 className={`text-2xl font-black tracking-tight text-foreground ${playfair.className}`}>Nutrition & Diet</h3>
                    </div>
                    <p className="text-[16px] font-bold text-foreground tracking-tight leading-[1.5] max-w-[50ch]">{parsed.data.focus}</p>
                    <p className="text-[15px] font-medium text-muted-foreground mt-2 leading-[1.6] max-w-[50ch]">{parsed.data.quickTip}</p>
                  </div>
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button variant="outline" className="w-full text-base font-bold border-success/30 text-success hover:bg-success/5 min-h-[48px]" onClick={() => router.push('/mother/nutrition-planner')}>
                      Open Meal Planner
                    </Button>
                  </motion.div>
                </Card>
                </motion.div>
              )}

              {/* Vitals Card Renderer */}
              {parsed.component === "VitalsCard" && parsed.data && (
                <motion.div layout>
                <Card className="overflow-hidden border border-l-[6px] border-l-[#9333ea] border-y-border/50 border-r-border/50 shadow-lg w-full flex flex-col p-6 bg-card transition-shadow">
                  <div className="flex flex-col mb-5">
                    <div className="flex items-center gap-3 mb-3">
                       <div className="text-[#9333ea] bg-[#f3e8ff] dark:bg-[#3b0764] p-3 rounded-xl"><HeartPulse className="w-6 h-6 stroke-[2.5px]"/></div>
                       <h3 className={`text-2xl font-black tracking-tight text-foreground ${playfair.className}`}>Vital Signs</h3>
                    </div>
                    <p className="text-[16px] font-medium text-muted-foreground leading-[1.6] max-w-[50ch]">{parsed.data.message}</p>
                  </div>
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button variant="outline" className="w-full text-base font-bold border-[#e9d5ff] dark:border-[#581c87] text-[#9333ea] dark:text-[#d8b4fe] hover:bg-[#faf5ff] dark:hover:bg-[#2e094f] min-h-[48px]" onClick={() => router.push('/mother/vital-signs')}>
                      Log Vitals Now
                    </Button>
                  </motion.div>
                </Card>
                </motion.div>
              )}

              {/* SOS Emergency Card Renderer */}
              {parsed.component === "SOSCard" && parsed.data && (
                <motion.div layout>
                <Card className="overflow-hidden border border-alert/30 shadow-[0_0_30px_rgba(239,68,68,0.15)] w-full duration-300">
                  <div className="p-5 bg-alert/5 border-b border-alert/20 flex flex-col items-center py-8">
                    <motion.div 
                      animate={{ scale: [1, 1.1, 1] }} 
                      transition={{ repeat: Infinity, duration: 2 }}
                      className="w-16 h-16 bg-alert/10 rounded-2xl flex items-center justify-center text-alert mb-4 shadow-inner"
                    >
                       <AlertTriangle className="w-8 h-8 stroke-[2.5px]" />
                    </motion.div>
                    <h3 className={`font-black text-3xl text-alert tracking-tight uppercase ${playfair.className}`}>Emergency</h3>
                    <p className="text-[16px] font-bold text-muted-foreground text-center mt-3 max-w-[35ch] leading-[1.6]">{parsed.data.alert}</p>
                  </div>
                  <div className="p-5 bg-card space-y-3">
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Button className="w-full bg-alert hover:bg-alert/90 text-white font-bold text-base min-h-[56px] shadow-lg shadow-alert/20" onClick={() => window.location.href='tel:108'}>
                        Call 108 Ambulance
                      </Button>
                    </motion.div>
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Button variant="outline" className="w-full border-warning/50 text-yellow-700 dark:text-warning hover:bg-warning/10 font-bold text-base min-h-[48px]" onClick={() => router.push('/mother/sos-emergency')}>
                        Trigger Family Alert
                      </Button>
                    </motion.div>
                  </div>
                </Card>
                </motion.div>
              )}
            </div>
          </motion.div>
          )
        })}

        {chatMode === "doctor" && doctorMessages.length === 0 && !doctorLoading && (
          <motion.div layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
            <Card className="p-5 bg-card border border-border/50 text-muted-foreground shadow-sm">
              <p className="text-base font-medium leading-relaxed">
                Start a conversation with your doctor. Messages are synced securely.
              </p>
            </Card>
          </motion.div>
        )}

        {chatMode === "doctor" && doctorMessages.map((message) => {
          const mine = message.senderId === motherId
          return (
            <motion.div 
              layout
              initial={{ opacity: 0, y: 40, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              key={message.id} 
              className={`flex ${mine ? "justify-end" : "justify-start"}`}
            >
              <Card className={`p-5 max-w-[85%] shadow-md ${mine ? "bg-accent text-white border-0 rounded-tl-sm rounded-br-none" : "bg-card border border-border/50 rounded-tr-sm rounded-bl-none"}`}>
                <p className={`text-[16px] font-medium leading-[1.6] whitespace-pre-wrap max-w-[65ch] ${mine ? "text-white" : "text-foreground"}`}>{message.content}</p>
              </Card>
            </motion.div>
          )
        })}

        {isLoading && chatMode === "ai" && (
          <motion.div layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex justify-start">
            <Card className="p-4 bg-card border border-border/50 shadow-sm">
              <div className="flex items-center gap-3">
                <motion.div animate={{ y: [0, -6, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0 }} className="w-2.5 h-2.5 bg-trust rounded-full" />
                <motion.div animate={{ y: [0, -6, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }} className="w-2.5 h-2.5 bg-trust rounded-full" />
                <motion.div animate={{ y: [0, -6, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }} className="w-2.5 h-2.5 bg-trust rounded-full" />
                <span className="text-sm font-semibold text-muted-foreground ml-2">Saheli is thinking...</span>
              </div>
            </Card>
          </motion.div>
        )}
        </AnimatePresence>

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-6 bg-card border-t border-border/40 shadow-[0_-10px_40px_rgba(0,0,0,0.03)] z-10 relative">
        {isListening && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-3 text-center">
            <span className="text-sm font-bold tracking-widest uppercase text-alert animate-pulse">{content.listening}</span>
          </motion.div>
        )}
        <form onSubmit={handleSubmit} className="flex gap-3">
          {chatMode === "ai" && (
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                type="button"
                onClick={handleVoiceInput}
                size="icon"
                variant="outline"
                className={`h-14 w-14 min-h-[56px] min-w-[56px] rounded-2xl border-border/50 transition-colors ${isListening ? "bg-alert/10 text-alert border-alert/30" : "bg-muted/50 text-muted-foreground hover:bg-muted"}`}
                disabled={isLoading}
                aria-label={isListening ? "Stop voice recognition" : "Start voice recognition"}
              >
                {isListening ? <MicOff className="w-6 h-6 animate-pulse" /> : <Mic className="w-6 h-6" />}
              </Button>
            </motion.div>
          )}
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={chatMode === "ai" ? content.typePlaceholder : "Type your message to doctor..."}
            className="min-h-[56px] max-h-[140px] resize-none border-border/50 py-4 px-5 text-[15px] font-medium rounded-2xl bg-muted/30 focus-visible:ring-trust shadow-inner"
            disabled={isLoading}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault()
                handleSubmit(e as any)
              }
            }}
          />
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              type="submit"
              size="icon"
              className="bg-trust hover:bg-trust/90 h-14 w-14 min-h-[56px] min-w-[56px] rounded-2xl transition-all shadow-lg shadow-trust/20 flex-shrink-0"
              disabled={isLoading || !input.trim()}
              aria-label="Send message"
            >
              <Send className="w-6 h-6 text-white" />
            </Button>
          </motion.div>
        </form>
        <p className="text-xs text-muted-foreground mt-2 text-center">Press Enter to send, Shift+Enter for new line</p>
      </div>
    </div>
  )
}
