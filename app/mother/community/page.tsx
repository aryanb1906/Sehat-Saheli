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
  const t = (copy: Record<string, string>) => copy[language] || copy.en
  const [activeTab, setActiveTab] = useState<"discover" | "joined">("discover")
  const [joinedGroups, setJoinedGroups] = useState<JoinedGroup[]>([])
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null)
  const [newMessage, setNewMessage] = useState("")
  const [groupMessages, setGroupMessages] = useState<{ [key: string]: Array<{ id: string; author: string; message: string; timestamp: string }> }>({})

  const allGroups: Group[] = [
    {
      id: "1",
      name: t({ en: "First Time Moms", hi: "पहली बार माताएं", or: "ପ୍ରଥମ ଥର ମା'ମାନେ", bn: "প্রথমবার মায়েরা", te: "మొదటిసారి తల్లులు", ta: "முதல் முறை தாய்மார்கள்", mr: "पहिल्यांदा मातां", gu: "પ્રથમ વખત માતાઓ" }),
      description: t({ en: "Connect with first-time mothers", hi: "पहली बार माताओं के साथ जुड़ें", or: "ପ୍ରଥମ ଥର ମା'ମାନଙ୍କ ସହ ଯୋଡନ୍ତୁ", bn: "প্রথমবার মায়েদের সাথে সংযোগ করুন", te: "మొదటిసారి తల్లులతో కలవండి", ta: "முதல் முறை தாய்மார்களுடன் இணையுங்கள்", mr: "पहिल्यांदा मातांसोबत जोडा", gu: "પ્રથમ વખત માતાઓ સાથે જોડાઓ" }),
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
      name: t({ en: "Healthy Pregnancy", hi: "स्वस्थ गर्भावस्था", or: "ସ୍ୱସ୍ଥ ଗର୍ଭାବସ୍ଥା", bn: "স্বাস্থ্যকর গর্ভাবস্থা", te: "ఆరోగ్యకర గర్భధారణ", ta: "ஆரோக்கியமான கர்ப்பம்", mr: "निरोगी गर्भधारणा", gu: "સ્વસ્થ ગર્ભાવસ્થા" }),
      description: t({ en: "Pregnancy wellness and nutrition tips", hi: "गर्भावस्था स्वास्थ्य और पोषण सुझाव", or: "ଗର୍ଭାବସ୍ଥା ସୁସ୍ଥତା ଏବଂ ପୋଷଣ ପରାମର୍ଶ", bn: "গর্ভাবস্থার সুস্থতা এবং পুষ্টি পরামর্শ", te: "గర్భధారణ ఆరోగ్యం మరియు పోషణ సూచనలు", ta: "கர்ப்பநலம் மற்றும் ஊட்டச்சத்து குறிப்புகள்", mr: "गर्भधारणा आरोग्य आणि पोषण टिप्स", gu: "ગર્ભાવસ્થા સુખાકારી અને પોષણ સૂચનો" }),
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
      name: t({ en: "Expert Advice", hi: "विशेषज्ञ सलाह", or: "ବିଶେଷଜ୍ଞ ପରାମର୍ଶ", bn: "বিশেষজ্ঞ পরামর্শ", te: "నిపుణుల సలహా", ta: "நிபுணர் ஆலோசனை", mr: "तज्ञ सल्ला", gu: "નિષ્ણાત સલાહ" }),
      description: t({ en: "Get answers from health professionals", hi: "स्वास्थ्य विशेषज्ञों से उत्तर पाएँ", or: "ସ୍ୱାସ୍ଥ୍ୟ ବିଶେଷଜ୍ଞଙ୍କଠାରୁ ଉତ୍ତର ପାଆନ୍ତୁ", bn: "স্বাস্থ্য বিশেষজ্ঞদের কাছ থেকে উত্তর পান", te: "ఆరోగ్య నిపుణుల నుంచి సమాధానాలు పొందండి", ta: "சுகாதார நிபுணர்களிடமிருந்து பதில்கள் பெறுங்கள்", mr: "आरोग्य तज्ञांकडून उत्तरे मिळवा", gu: "આરોગ્ય નિષ્ણાતો પાસેથી જવાબ મેળવો" }),
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
      name: t({ en: "Mental Health Support", hi: "मानसिक स्वास्थ्य सहायता", or: "ମାନସିକ ସ୍ୱାସ୍ଥ୍ୟ ସହାୟତା", bn: "মানসিক স্বাস্থ্য সহায়তা", te: "మానసిక ఆరోగ్య సహాయం", ta: "மனநல ஆதரவு", mr: "मानसिक आरोग्य सहाय्य", gu: "માનસિક આરોગ્ય સહાય" }),
      description: t({ en: "Emotional support during pregnancy", hi: "गर्भावस्था के दौरान भावनात्मक सहायता", or: "ଗର୍ଭାବସ୍ଥା ସମୟରେ ଭାବନାତ୍ମକ ସହାୟତା", bn: "গর্ভাবস্থার সময় মানসিক সহায়তা", te: "గర్భధారణ సమయంలో భావోద్వేగ సహాయం", ta: "கர்ப்பகாலத்தில் உணர்ச்சி ஆதரவு", mr: "गर्भधारणेदरम्यान भावनिक सहाय्य", gu: "ગર્ભાવસ્થામાં ભાવનાત્મક સહાય" }),
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
        author: t({ en: "You", hi: "आप", or: "ଆପଣ", bn: "আপনি", te: "మీరు", ta: "நீங்கள்", mr: "तुम्ही", gu: "તમે" }),
        message: newMessage,
        timestamp: t({ en: "now", hi: "अभी", or: "ଏବେ", bn: "এখন", te: "ఇప్పుడే", ta: "இப்போது", mr: "आत्ता", gu: "હમણાં" }),
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
        return t({ en: "Pregnant Women", hi: "गर्भवती महिलाएं", or: "ଗର୍ଭବତୀ ମହିଳା", bn: "গর্ভবতী নারী", te: "గర్భిణీ మహిళలు", ta: "கர்ப்பிணிப் பெண்கள்", mr: "गर्भवती महिला", gu: "ગર્ભવતી મહિલાઓ" })
      case "mothers":
        return t({ en: "Mothers", hi: "माताएं", or: "ମା'ମାନେ", bn: "মায়েরা", te: "తల్లులు", ta: "தாய்மார்கள்", mr: "माता", gu: "માતાઓ" })
      case "experts":
        return t({ en: "Local Experts", hi: "स्थानीय विशेषज्ञ", or: "ସ୍ଥାନୀୟ ବିଶେଷଜ୍ଞ", bn: "স্থানীয় বিশেষজ্ঞ", te: "స్థానిక నిపుణులు", ta: "உள்ளூர் நிபுணர்கள்", mr: "स्थानिक तज्ञ", gu: "સ્થાનિક નિષ્ણાતો" })
      default:
        return category
    }
  }

  if (selectedGroup) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-princess-1/20 via-white to-princess-1/10 pb-10">
        {/* Header */}
        <div className="mx-3 mt-4 overflow-hidden rounded-3xl bg-gradient-to-r from-princess-4 to-primary p-6 text-white shadow-lg shadow-princess-4/20 border border-white/20 md:mx-6 2xl:mx-auto 2xl:max-w-7xl">
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
              placeholder={t({ en: "Share your thoughts...", hi: "अपने विचार साझा करें...", or: "ଆପଣଙ୍କ ଭାବନା ସେୟାର୍ କରନ୍ତୁ...", bn: "আপনার চিন্তা শেয়ার করুন...", te: "మీ ఆలోచనలు పంచుకోండి...", ta: "உங்கள் எண்ணங்களை பகிருங்கள்...", mr: "तुमचे विचार शेअर करा...", gu: "તમારા વિચારો શેર કરો..." })}
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
            {t({ en: "All conversations are monitored for safety", hi: "सभी बातचीत सुरक्षा के लिए निगरानी की जाती है", or: "ସୁରକ୍ଷା ପାଇଁ ସମସ୍ତ କଥୋପକଥନ ନିରୀକ୍ଷଣ ହୁଏ", bn: "সমস্ত কথোপকথন নিরাপত্তার জন্য পর্যবেক্ষণ করা হয়", te: "భద్రత కోసం అన్ని సంభాషణలు పర్యవేక్షించబడతాయి", ta: "பாதுகாப்பிற்காக அனைத்து உரையாடல்களும் கண்காணிக்கப்படுகின்றன", mr: "सुरक्षेसाठी सर्व संभाषणे देखरेखीखाली असतात", gu: "સુરક્ષા માટે બધી વાતચીતનું નિરીક્ષણ થાય છે" })}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-princess-1/20 via-white to-princess-1/10 pb-10">
      {/* Header */}
      <div className="mx-3 mt-4 overflow-hidden rounded-3xl bg-gradient-to-r from-princess-4 to-primary p-6 text-white shadow-lg shadow-princess-4/20 border border-white/20 md:mx-6 2xl:mx-auto 2xl:max-w-7xl">
        <div className="flex items-center gap-4 mb-4">
          <Button onClick={() => router.back()} variant="ghost" size="icon" className="text-white">
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{content.communitySupport}</h1>
            <p className="text-white/80 text-sm">
              {t({ en: "Safe and monitored support groups", hi: "सुरक्षित और निगरानी वाले समर्थन समूह", or: "ସୁରକ୍ଷିତ ଏବଂ ନିରୀକ୍ଷିତ ସହାୟତା ଗୋଷ୍ଠୀ", bn: "নিরাপদ এবং পর্যবেক্ষণকৃত সহায়তা গোষ্ঠী", te: "సురక్షిత మరియు పర్యవేక్షిత మద్దతు గ్రూపులు", ta: "பாதுகாப்பான மற்றும் கண்காணிக்கப்படும் ஆதரவு குழுக்கள்", mr: "सुरक्षित आणि देखरेखीखालील सहाय्य गट", gu: "સુરક્ષિત અને નિરીક્ષણવાળા સહાય સમૂહો" })}
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
                {t({ en: "Safe & Monitored", hi: "सुरक्षित और निगरानी", or: "ସୁରକ୍ଷିତ ଏବଂ ନିରୀକ୍ଷିତ", bn: "নিরাপদ এবং পর্যবেক্ষণ করা", te: "సురక్షితం & పర్యవేక్షితం", ta: "பாதுகாப்பான & கண்காணிப்பு", mr: "सुरक्षित आणि देखरेखीखाली", gu: "સુરક્ષિત અને નિરીક્ષણમાં" })}
              </h3>
              <p className="text-sm text-foreground">
                {t({ en: "All conversations are monitored by moderators to ensure a safe, supportive environment", hi: "सभी बातचीत सुरक्षित, सहायक वातावरण सुनिश्चित करने के लिए मॉडरेटर द्वारा निगरानी की जाती है", or: "ସୁରକ୍ଷିତ ଏବଂ ସହଯୋଗୀ ପରିବେଶ ପାଇଁ ସମସ୍ତ କଥୋପକଥନ ମଡେରେଟରମାନେ ନିରୀକ୍ଷଣ କରନ୍ତି", bn: "সমস্ত কথোপকথন নিরাপদ ও সহায়ক পরিবেশ নিশ্চিত করতে মডারেটরদের দ্বারা পর্যবেক্ষণ করা হয়", te: "సురక్షిత, మద్దతుగల వాతావరణం కోసం అన్ని సంభాషణలను మోడరేటర్లు పర్యవేక్షిస్తారు", ta: "பாதுகாப்பான, ஆதரவு சூழலை உறுதி செய்ய அனைத்து உரையாடல்களும் நிர்வாகிகளால் கண்காணிக்கப்படுகின்றன", mr: "सुरक्षित आणि सहाय्यक वातावरणासाठी सर्व संभाषणे मॉडरेटर्सकडून पाहिली जातात", gu: "સુરક્ષિત અને સહાયક વાતાવરણ માટે બધી વાતચીતનું મોડરેટર્સ દ્વારા નિરીક્ષણ થાય છે" })}
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
            {t({ en: "Discover Groups", hi: "समूह खोजें", or: "ଗୋଷ୍ଠୀ ଖୋଜନ୍ତୁ", bn: "গোষ্ঠী আবিষ্কার করুন", te: "గ్రూపులు కనుగొనండి", ta: "குழுக்களை கண்டறியவும்", mr: "गट शोधा", gu: "સમૂહ શોધો" })}
          </Button>
          <Button
            variant={activeTab === "joined" ? "default" : "outline"}
            onClick={() => setActiveTab("joined")}
            className={activeTab === "joined" ? "bg-care text-white" : ""}
          >
            {t({ en: "My Groups", hi: "मेरे समूह", or: "ମୋର ଗୋଷ୍ଠୀ", bn: "আমার গোষ্ঠী", te: "నా గ్రూపులు", ta: "என் குழுக்கள்", mr: "माझे गट", gu: "મારા સમૂહો" })} ({joinedGroups.length})
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
                      ? t({ en: "Joined", hi: "जुड़ गया", or: "ଯୋଗ ହୋଇଛି", bn: "যোগ দিয়েছে", te: "చేరింది", ta: "சேர்ந்தது", mr: "सामील झाले", gu: "જોડાયું" })
                      : t({ en: "Join", hi: "जुड़ें", or: "ଯୋଡନ୍ତୁ", bn: "যোগ দিন", te: "చేరండి", ta: "சேரவும்", mr: "सामील व्हा", gu: "જોડાઓ" })}
                  </Button>
                </div>

                <div className="flex items-center justify-between pt-3 border-t">
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getCategoryColor(group.category)}`}>
                      {getCategoryLabel(group.category)}
                    </span>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {group.members} {t({ en: "members", hi: "सदस्य", or: "ସଦସ୍ୟ", bn: "সদস্য", te: "సభ్యులు", ta: "உறுப்பினர்கள்", mr: "सदस्य", gu: "સભ્યો" })}
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <MessageSquare className="w-3 h-3" />
                    {group.recentMessages.length}{" "}
                    {t({ en: "recent", hi: "हाल ही", or: "ସମ୍ପ୍ରତି", bn: "সম্প্রতি", te: "ఇటీవలి", ta: "சமீபத்திய", mr: "अलिकडील", gu: "તાજેતરના" })}
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
                    {t({ en: "Join groups to start connecting", hi: "जुड़ना शुरू करने के लिए समूहों में शामिल हों", or: "ସଂଯୋଗ ଆରମ୍ଭ ପାଇଁ ଗୋଷ୍ଠୀରେ ଯୋଡନ୍ତୁ", bn: "সংযোগ শুরু করতে গোষ্ঠীতে যোগ দিন", te: "కనెక్ట్ కావడం ప్రారంభించడానికి గ్రూపుల్లో చేరండి", ta: "இணையத் தொடங்க குழுக்களில் சேரவும்", mr: "जुळण्यासाठी गटात सामील व्हा", gu: "જોડાવા શરૂ કરવા સમૂહોમાં જોડાઓ" })}
                  </p>
                </Card>
              )}
        </div>
      </div>
    </div>
  )
}
