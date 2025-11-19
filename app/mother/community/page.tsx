"use client"

import { useState } from "react"
import { useRouter } from 'next/navigation'
import { ArrowLeft, Users, MessageSquare, Heart, Shield, UserPlus, Send } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useLanguage } from "@/lib/language-context"
import { Textarea } from "@/components/ui/textarea"

interface Group {
  id: string
  name: string
  description: string
  members: number
  category: "pregnant" | "mothers" | "experts"
  icon: string
  recentMessages: Array<{
    id: string
    author: string
    message: string
    timestamp: string
  }>
}

interface JoinedGroup {
  id: string
  name: string
  category: "pregnant" | "mothers" | "experts"
  isJoined: boolean
}

export default function CommunitySupportGroups() {
  const router = useRouter()
  const { content, language } = useLanguage()
  const [activeTab, setActiveTab] = useState<"discover" | "joined">("discover")
  const [joinedGroups, setJoinedGroups] = useState<JoinedGroup[]>([])
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null)
  const [newMessage, setNewMessage] = useState("")
  const [groupMessages, setGroupMessages] = useState<{ [key: string]: Array<{ id: string; author: string; message: string; timestamp: string }> }>({})

  const allGroups: Group[] = [
    {
      id: "1",
      name: language === "en" ? "First Time Moms" : language === "hi" ? "पहली बार माताएं" : "প্রথমবার মায়েরা",
      description: language === "en" ? "Connect with first-time mothers" : language === "hi" ? "पहली बार माताओं के साथ जुड़ें" : "প্রথমবার মায়েদের সাথে সংযোগ করুন",
      members: 1240,
      category: "mothers",
      icon: "👶",
      recentMessages: [
        { id: "1", author: "Anita", message: "My baby is 2 months old now!", timestamp: "2 hours ago" },
        { id: "2", author: "Priya", message: "Sleep schedule tips please", timestamp: "4 hours ago" },
      ],
    },
    {
      id: "2",
      name: language === "en" ? "Healthy Pregnancy" : language === "hi" ? "स्वस्थ गर्भावस्था" : "স্বাস্থ্যকর গর্ভাবস্থা",
      description: language === "en" ? "Pregnancy wellness and nutrition tips" : language === "hi" ? "गर्भावस्था की सुस्थता और पोषण सुझाव" : "গর্ভাবস্থার সুস্থতা এবং পুষ্টি পরামর্শ",
      members: 2850,
      category: "pregnant",
      icon: "🤰",
      recentMessages: [
        { id: "1", author: "Dr. Sharma", message: "Iron supplements are essential", timestamp: "1 hour ago" },
        { id: "2", author: "Maya", message: "Week 28 - feeling great!", timestamp: "3 hours ago" },
      ],
    },
    {
      id: "3",
      name: language === "en" ? "Expert Advice" : language === "hi" ? "विशेषज्ञ सलाह" : "বিশেষজ্ঞ পরামর্শ",
      description: language === "en" ? "Get answers from health professionals" : language === "hi" ? "स्वास्थ्य पेशेवरों से उत्तर प्राप्त करें" : "স্বাস্থ্য পেশাদারদের কাছ থেকে উত্তর পান",
      members: 1560,
      category: "experts",
      icon: "👨‍⚕️",
      recentMessages: [
        { id: "1", author: "Dr. Patel", message: "Q&A session starts at 3 PM", timestamp: "30 min ago" },
        { id: "2", author: "Dr. Khan", message: "Remember to take your vitamins", timestamp: "2 hours ago" },
      ],
    },
    {
      id: "4",
      name: language === "en" ? "Mental Health Support" : language === "hi" ? "मानसिक स्वास्थ्य सहायता" : "মানসিক স্বাস্থ্য সহায়তা",
      description: language === "en" ? "Emotional support during pregnancy" : language === "hi" ? "गर्भावस्था के दौरान भावनात्मक सहायता" : "গর্ভাবস্থার সময় মানসিক সহায়তা",
      members: 945,
      category: "pregnant",
      icon: "💚",
      recentMessages: [
        { id: "1", author: "Lisa", message: "Anxiety is normal, you're not alone", timestamp: "1 hour ago" },
      ],
    },
  ]

  const handleJoinGroup = (group: Group) => {
    const isJoined = joinedGroups.some((g) => g.id === group.id)
    if (!isJoined) {
      setJoinedGroups([
        ...joinedGroups,
        { id: group.id, name: group.name, category: group.category, isJoined: true },
      ])
      if (!groupMessages[group.id]) {
        setGroupMessages((prev) => ({
          ...prev,
          [group.id]: group.recentMessages,
        }))
      }
      setSelectedGroup(group)
    }
  }

  const handleSendMessage = () => {
    if (newMessage.trim() && selectedGroup) {
      const newMsg = {
        id: Date.now().toString(),
        author: language === "en" ? "You" : language === "hi" ? "आप" : "আপনি",
        message: newMessage,
        timestamp: language === "en" ? "now" : language === "hi" ? "अभी" : "এখন",
      }
      
      // Update group messages
      setGroupMessages((prev) => ({
        ...prev,
        [selectedGroup.id]: [...(prev[selectedGroup.id] || selectedGroup.recentMessages), newMsg],
      }))
      
      // Clear input
      setNewMessage("")
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "pregnant":
        return "bg-warm/20 text-warm border-warm/30"
      case "mothers":
        return "bg-care/20 text-care border-care/30"
      case "experts":
        return "bg-trust/20 text-trust border-trust/30"
      default:
        return "bg-accent/20 text-accent border-accent/30"
    }
  }

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case "pregnant":
        return language === "en" ? "Pregnant Women" : language === "hi" ? "गर्भवती महिलाएं" : "গর্ভবতী নারী"
      case "mothers":
        return language === "en" ? "Mothers" : language === "hi" ? "माताएं" : "মায়েরা"
      case "experts":
        return language === "en" ? "Local Experts" : language === "hi" ? "स्थानीय विशेषज्ञ" : "স্থানীয় বিশেষজ্ঞ"
      default:
        return category
    }
  }

  if (selectedGroup) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-care/10 to-background flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-care to-care/80 p-6 text-white">
          <div className="flex items-center gap-4">
            <Button onClick={() => setSelectedGroup(null)} variant="ghost" size="icon" className="text-white">
              <ArrowLeft className="w-6 h-6" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">{selectedGroup.name}</h1>
              <p className="text-white/80 text-sm">{selectedGroup.members} members</p>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 p-6 space-y-4 overflow-y-auto">
          {(groupMessages[selectedGroup.id] || selectedGroup.recentMessages).map((msg) => (
            <Card key={msg.id} className="p-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-trust to-accent flex items-center justify-center text-white font-bold text-sm">
                  {msg.author.charAt(0)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">{msg.author}</h3>
                    <span className="text-xs text-muted-foreground">{msg.timestamp}</span>
                  </div>
                  <p className="text-sm text-foreground mt-1">{msg.message}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Message Input */}
        <div className="p-6 bg-card border-t">
          <div className="flex gap-2">
            <Textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder={language === "en" ? "Share your thoughts..." : language === "hi" ? "अपने विचार साझा करें..." : "আপনার চিন্তা শেয়ার করুন..."}
              className="min-h-[48px] max-h-[120px]"
            />
            <Button
              onClick={handleSendMessage}
              disabled={!newMessage.trim()}
              className="bg-care hover:bg-care/90"
              size="icon"
            >
              <Send className="w-5 h-5" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            {language === "en"
              ? "All conversations are monitored for safety"
              : language === "hi"
                ? "सभी बातचीत सुरक्षा के लिए निगरानी की जाती है"
                : "সমস্ত কথোপকথন নিরাপত্তার জন্য পর্যবেক্ষণ করা হয়"}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-care/10 to-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-care to-care/80 p-6 text-white">
        <div className="flex items-center gap-4 mb-4">
          <Button onClick={() => router.back()} variant="ghost" size="icon" className="text-white">
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{content.communitySupport}</h1>
            <p className="text-white/80 text-sm">
              {language === "en"
                ? "Safe and monitored support groups"
                : language === "hi"
                  ? "सुरक्षित और निगरानी वाले समर्थन समूह"
                  : "নিরাপদ এবং পর্যবেক্ষণকৃত সহায়তা গোষ্ঠী"}
            </p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Safety Banner */}
        <Card className="p-4 bg-gradient-to-r from-success/10 to-trust/10 border-success/30">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-success mb-1">
                {language === "en"
                  ? "Safe & Monitored"
                  : language === "hi"
                    ? "सुरक्षित और निगरानी"
                    : "নিরাপদ এবং পর্যবেক্ষণ করা"}
              </h3>
              <p className="text-sm text-foreground">
                {language === "en"
                  ? "All conversations are monitored by moderators to ensure a safe, supportive environment"
                  : language === "hi"
                    ? "सभी बातचीत सुरक्षित, सहायक वातावरण सुनिश्चित करने के लिए मॉडरेटर द्वारा निगरानी की जाती है"
                    : "সমস্ত কথোপকথন একটি নিরাপদ, সহায়ক পরিবেশ নিশ্চিত করতে মডারেটরদের দ্বারা পর্যবেক্ষণ করা হয়"}
              </p>
            </div>
          </div>
        </Card>

        {/* Tabs */}
        <div className="flex gap-2">
          <Button
            variant={activeTab === "discover" ? "default" : "outline"}
            onClick={() => setActiveTab("discover")}
            className={activeTab === "discover" ? "bg-care text-white" : ""}
          >
            {language === "en" ? "Discover Groups" : language === "hi" ? "समूह खोजें" : "গোষ্ঠী আবিষ্কার করুন"}
          </Button>
          <Button
            variant={activeTab === "joined" ? "default" : "outline"}
            onClick={() => setActiveTab("joined")}
            className={activeTab === "joined" ? "bg-care text-white" : ""}
          >
            {language === "en" ? "My Groups" : language === "hi" ? "मेरे समूह" : "আমার গোষ্ঠী"} ({joinedGroups.length})
          </Button>
        </div>

        {/* Groups Grid */}
        <div className="grid gap-4">
          {activeTab === "discover"
            ? allGroups.map((group) => (
                <Card key={group.id} className="p-5 hover:shadow-lg transition-shadow cursor-pointer">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className="text-4xl">{group.icon}</span>
                      <div>
                        <h3 className="font-semibold text-lg">{group.name}</h3>
                        <p className="text-xs text-muted-foreground mt-1">{group.description}</p>
                      </div>
                    </div>
                    <Button
                      onClick={() => handleJoinGroup(group)}
                      size="sm"
                      className="bg-care hover:bg-care/90 text-white"
                    >
                      <UserPlus className="w-4 h-4 mr-2" />
                      {joinedGroups.some((g) => g.id === group.id)
                        ? language === "en"
                          ? "Joined"
                          : language === "hi"
                            ? "जुड़ गया"
                            : "যোগ দিয়েছে"
                        : language === "en"
                          ? "Join"
                          : language === "hi"
                            ? "जुड़ें"
                            : "যোগ দিন"}
                    </Button>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t">
                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getCategoryColor(group.category)}`}>
                        {getCategoryLabel(group.category)}
                      </span>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {group.members} {language === "en" ? "members" : language === "hi" ? "सदस्य" : "সদস্যরা"}
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <MessageSquare className="w-3 h-3" />
                      {group.recentMessages.length}{" "}
                      {language === "en" ? "recent" : language === "hi" ? "हाल ही" : "সম্প্রতি"}
                    </span>
                  </div>
                </Card>
              ))
            : joinedGroups.length > 0
              ? joinedGroups.map((group) => (
                  <Card
                    key={group.id}
                    className="p-5 hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => setSelectedGroup(allGroups.find((g) => g.id === group.id) || null)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-lg">{group.name}</h3>
                        <span className={`mt-2 px-3 py-1 rounded-full text-xs font-medium border inline-block ${getCategoryColor(group.category)}`}>
                          {getCategoryLabel(group.category)}
                        </span>
                      </div>
                      <MessageSquare className="w-6 h-6 text-care" />
                    </div>
                  </Card>
                ))
              : (
                <Card className="p-8 text-center">
                  <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">
                    {language === "en"
                      ? "Join groups to start connecting"
                      : language === "hi"
                        ? "जुड़ना शुरू करने के लिए समूहों में शामिल हों"
                        : "সংযোগ শুরু করতে গোষ্ঠীতে যোগ দিন"}
                  </p>
                </Card>
              )}
        </div>
      </div>
    </div>
  )
}
