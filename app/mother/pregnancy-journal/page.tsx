"use client"

import { useState } from "react"
import { useRouter } from 'next/navigation'
import { ArrowLeft, Plus, Heart, Trash2, Image } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useLanguage } from "@/lib/language-context"

interface JournalEntry {
  id: string
  date: string
  title: string
  mood: string
  content: string
  image?: string
}

export default function PregnancyJournal() {
  const router = useRouter()
  const { content } = useLanguage()
  const [entries, setEntries] = useState<JournalEntry[]>([
    {
      id: "1",
      date: "2025-01-15",
      title: "First baby kick!",
      mood: "Happy",
      content: "Felt baby move for the first time today. So emotional!",
    },
    {
      id: "2",
      date: "2025-01-10",
      title: "Pregnancy mood swings",
      mood: "Mixed",
      content: "Had an emotional day but feeling better now with husband's support",
    },
  ])

  const getMoodEmoji = (mood: string) => {
    const emojis: Record<string, string> = {
      "Happy": "😊",
      "Mixed": "😐",
      "Anxious": "😰",
      "Excited": "🤩",
    }
    return emojis[mood] || "😊"
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-care/10 to-background">
      <div className="bg-gradient-to-r from-care to-care/80 p-6 text-white">
        <div className="flex items-center gap-4 mb-4">
          <Button onClick={() => router.back()} variant="ghost" size="icon" className="text-white hover:bg-white/20">
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">Pregnancy Journal</h1>
            <p className="text-white/80 text-sm">Capture your pregnancy memories</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-4">
        {entries.map((entry) => (
          <Card key={entry.id} className="p-4 border-2 border-care/20">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-semibold">{entry.title}</h3>
                <p className="text-xs text-muted-foreground">{new Date(entry.date).toLocaleDateString()}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-2xl">{getMoodEmoji(entry.mood)}</span>
                <Button variant="ghost" size="icon" className="text-alert">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed mb-3">{entry.content}</p>
            {entry.image && <div className="w-full h-40 bg-muted rounded mb-2" />}
          </Card>
        ))}

        <Button className="w-full bg-care text-white">
          <Plus className="w-4 h-4 mr-2" /> New Journal Entry
        </Button>
      </div>
    </div>
  )
}
