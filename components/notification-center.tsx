"use client"

import { useState, useEffect } from "react"
import { Bell, X, Calendar, Heart, AlertTriangle, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useLanguage } from "@/lib/language-context"

interface Notification {
  id: string
  type: "appointment" | "health" | "emergency" | "info"
  title: string
  message: string
  time: string
  read: boolean
}

export function NotificationCenter() {
  const [isOpen, setIsOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const { content } = useLanguage()

  useEffect(() => {
    // Load notifications from localStorage
    const savedNotifications = localStorage.getItem("notifications")
    if (savedNotifications) {
      setNotifications(JSON.parse(savedNotifications))
    } else {
      // Initialize with demo notifications
      const demoNotifications: Notification[] = [
        {
          id: "1",
          type: "appointment",
          title: content.myAppointments,
          message: "Regular Checkup tomorrow at 10:00 AM",
          time: "2 hours ago",
          read: false,
        },
        {
          id: "2",
          type: "health",
          title: content.healthTips,
          message: "Don't forget to take your iron supplement today",
          time: "5 hours ago",
          read: false,
        },
      ]
      setNotifications(demoNotifications)
      localStorage.setItem("notifications", JSON.stringify(demoNotifications))
    }
  }, [content])

  const unreadCount = notifications.filter((n) => !n.read).length

  const markAsRead = (id: string) => {
    const updated = notifications.map((n) => (n.id === id ? { ...n, read: true } : n))
    setNotifications(updated)
    localStorage.setItem("notifications", JSON.stringify(updated))
  }

  const removeNotification = (id: string) => {
    const updated = notifications.filter((n) => n.id !== id)
    setNotifications(updated)
    localStorage.setItem("notifications", JSON.stringify(updated))
  }

  const getIcon = (type: string) => {
    switch (type) {
      case "appointment":
        return <Calendar className="w-5 h-5 text-trust" />
      case "health":
        return <Heart className="w-5 h-5 text-care" />
      case "emergency":
        return <AlertTriangle className="w-5 h-5 text-alert" />
      default:
        return <Info className="w-5 h-5 text-muted-foreground" />
    }
  }

  return (
    <div className="relative">
      <Button variant="ghost" size="icon" className="relative" onClick={() => setIsOpen(!isOpen)}>
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 w-5 h-5 bg-alert text-white text-xs rounded-full flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </Button>

      {isOpen && (
        <div className="absolute right-0 top-12 w-80 md:w-96 z-50">
          <Card className="shadow-lg border-2">
            <div className="p-4 border-b">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-lg">Notifications</h3>
                <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </div>

            <div className="max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  <Bell className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No notifications</p>
                </div>
              ) : (
                notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 border-b hover:bg-muted/50 cursor-pointer transition-colors ${
                      !notification.read ? "bg-trust/5" : ""
                    }`}
                    onClick={() => markAsRead(notification.id)}
                  >
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 mt-1">{getIcon(notification.type)}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="font-semibold text-sm">{notification.title}</h4>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="w-6 h-6 flex-shrink-0"
                            onClick={(e) => {
                              e.stopPropagation()
                              removeNotification(notification.id)
                            }}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{notification.message}</p>
                        <p className="text-xs text-muted-foreground mt-2">{notification.time}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
