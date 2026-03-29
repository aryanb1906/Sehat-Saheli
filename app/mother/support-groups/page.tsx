"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Users, MessageCircle, Heart, Share2, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useLanguage } from "@/lib/language-context"
import { useToast } from "@/hooks/use-toast"

interface SupportGroup {
    id: string
    name: string
    topic: string
    memberCount: number
    createdAt: string
    isActive: boolean
    lastActivityDate: string
}

export default function SupportGroupsPage() {
    const router = useRouter()
    const { content } = useLanguage()
    const { toast } = useToast()
    const [groups, setGroups] = useState<SupportGroup[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedGroup, setSelectedGroup] = useState<SupportGroup | null>(null)

    useEffect(() => {
        fetchGroups()
    }, [])

    const fetchGroups = async () => {
        try {
            const response = await fetch("/api/community?type=support-groups")
            const data = await response.json()
            setGroups(data.groups)
        } catch (error) {
            console.error("Failed to fetch groups:", error)
        } finally {
            setLoading(false)
        }
    }

    const joinGroup = async (groupId: string) => {
        try {
            await fetch("/api/community", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    action: "join-group",
                    data: { groupId, userId: "user_001" },
                }),
            })
            toast({
                title: "✅ Joined Successfully!",
                description: "You're now part of this support group.",
            })
        } catch (error) {
            console.error("Failed to join group:", error)
            toast({
                title: "Error",
                description: "Failed to join group. Please try again.",
                variant: "destructive",
            })
        }
    }

    const getTopicEmoji = (topic: string) => {
        const emojis: Record<string, string> = {
            "first-trimester": "🤰",
            "second-trimester": "👶",
            "third-trimester": "🔔",
            "labor-prep": "🏥",
            postpartum: "👪",
        }
        return emojis[topic] || "💬"
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-princess-1/20 via-white to-princess-1/10 pb-10">
            <div className="mx-3 mt-4 overflow-hidden rounded-3xl bg-gradient-to-r from-princess-4 to-primary p-5 text-white sticky top-4 z-30 shadow-lg shadow-princess-4/20 border border-white/20 md:mx-6 2xl:mx-auto 2xl:max-w-7xl">
                <div className="flex items-center gap-4 mb-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="text-white"
                        onClick={() => router.back()}
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                    <h1 className="text-2xl font-bold">Support Communities</h1>
                </div>
                <p className="text-white/90 leading-relaxed">Connect with mothers, share experiences, find support</p>
            </div>

            <div className="p-6 max-w-4xl mx-auto">
                <div className="mb-6">
                    <Button className="bg-care text-white h-11">
                        <Plus className="w-4 h-4 mr-2" />
                        Create New Group
                    </Button>
                </div>

                {loading ? (
                    <div className="grid md:grid-cols-2 gap-6">
                        {[...Array(4)].map((_, i) => (
                            <Card key={i} className="p-6">
                                <Skeleton className="h-16 w-16 rounded-full mb-4" />
                                <Skeleton className="h-6 w-32 mb-3" />
                                <Skeleton className="h-4 w-full mb-2" />
                                <Skeleton className="h-10 w-full" />
                            </Card>
                        ))}
                    </div>
                ) : groups.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                        <Users className="w-12 h-12 text-primary/30 mb-4" />
                        <p className="text-lg font-semibold leading-relaxed">No support groups found</p>
                        <p className="text-sm text-foreground/60 mt-2 leading-relaxed">Create one or browse existing groups</p>
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 gap-6">
                        {groups.map((group) => (
                            <Card
                                key={group.id}
                                className="p-6 cursor-pointer hover:shadow-lg transition-all"
                                onClick={() => setSelectedGroup(group)}
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div>
                                        <p className="text-3xl mb-2">{getTopicEmoji(group.topic)}</p>
                                        <h3 className="text-lg font-bold leading-relaxed">{group.name}</h3>
                                    </div>
                                    <span className="px-3 py-1 bg-success/20 text-success rounded-full text-xs font-semibold">
                                        Active
                                    </span>
                                </div>

                                <div className="mb-4 space-y-1 text-sm text-foreground/70 leading-relaxed">
                                    <p className="flex items-center gap-2">
                                        <Users className="w-4 h-4" />
                                        {group.memberCount} members
                                    </p>
                                    <p className="flex items-center gap-2">
                                        <MessageCircle className="w-4 h-4" />
                                        Last active: {new Date(group.lastActivityDate).toLocaleDateString()}
                                    </p>
                                </div>

                                <Button
                                    className="w-full bg-care text-white h-11"
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        joinGroup(group.id)
                                    }}
                                >
                                    Join Group
                                </Button>
                            </Card>
                        ))}
                    </div>
                )}

                {/* Group Detail Modal */}
                {selectedGroup && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <Card className="max-w-2xl w-full max-h-96 overflow-y-auto">
                            <div className="p-6">
                                <div className="flex justify-between items-start mb-6">
                                    <div>
                                        <div className="flex items-center gap-3 mb-2">
                                            <p className="text-3xl">{getTopicEmoji(selectedGroup.topic)}</p>
                                            <div>
                                                <h2 className="text-2xl font-bold leading-relaxed">{selectedGroup.name}</h2>
                                                <p className="text-sm text-foreground/60 leading-relaxed">
                                                    {selectedGroup.memberCount} members · Active
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    <Button
                                        variant="outline"
                                        onClick={() => setSelectedGroup(null)}
                                    >
                                        ✕
                                    </Button>
                                </div>

                                <div className="mb-6">
                                    <h3 className="font-bold mb-3 leading-relaxed">Recent Discussions</h3>
                                    <div className="space-y-2">
                                        <div className="p-3 bg-gray-50 rounded">
                                            <p className="font-semibold text-sm leading-relaxed">First trimester nausea tips</p>
                                            <p className="text-xs text-foreground/60 leading-relaxed">By Priya · 2 hours ago</p>
                                        </div>
                                        <div className="p-3 bg-gray-50 rounded">
                                            <p className="font-semibold text-sm leading-relaxed">Safe exercises during pregnancy</p>
                                            <p className="text-xs text-foreground/60 leading-relaxed">By Kavya · 4 hours ago</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    <Button
                                        className="flex-1 bg-care text-white h-11"
                                        onClick={() => {
                                            joinGroup(selectedGroup.id)
                                            setSelectedGroup(null)
                                        }}
                                    >
                                        <Users className="w-4 h-4 mr-2" />
                                        Join Group
                                    </Button>
                                    <Button
                                        variant="outline"
                                        className="flex-1 h-11"
                                        onClick={() => toast({
                                            title: "✅ Shared!",
                                            description: "Group link copied to clipboard",
                                        })}
                                    >
                                        <Share2 className="w-4 h-4 mr-2" />
                                        Share
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    </div>
                )}
            </div>
        </div>
    )
}
