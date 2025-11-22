"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Calendar, Clock, MapPin, Plus, Bell, Edit2, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"

interface Appointment {
  id: string
  date: string
  time: string
  type: string
  location: string
  doctor: string
  status: "upcoming" | "completed" | "cancelled"
}

export default function Appointments() {
  const router = useRouter()
  const { toast } = useToast()
  const [appointments, setAppointments] = useState<Appointment[]>([
    {
      id: "1",
      date: "2025-01-15",
      time: "10:00 AM",
      type: "Regular Checkup",
      location: "Primary Health Center, Village",
      doctor: "Dr. Anjali Sharma",
      status: "upcoming",
    },
    {
      id: "2",
      date: "2025-01-20",
      time: "2:00 PM",
      type: "Ultrasound Scan",
      location: "District Hospital",
      doctor: "Dr. Rajesh Kumar",
      status: "upcoming",
    },
    {
      id: "3",
      date: "2025-01-05",
      time: "11:00 AM",
      type: "Blood Test",
      location: "Community Health Center",
      doctor: "Lab Technician",
      status: "completed",
    },
  ])

  const handleSetReminder = (appointment: Appointment) => {
    toast({
      title: "Reminder Set!",
      description: `You'll be notified 1 day before your ${appointment.type} on ${new Date(appointment.date).toLocaleDateString("en-IN")}`,
    })
  }

  const handleReschedule = (appointmentId: string) => {
    router.push(`/mother/appointments/reschedule/${appointmentId}`)
  }

  const handleDelete = (appointmentId: string) => {
    if (confirm("Are you sure you want to cancel this appointment?")) {
      setAppointments(appointments.filter((apt) => apt.id !== appointmentId))
      toast({
        title: "Appointment Cancelled",
        description: "The appointment has been removed from your schedule.",
        variant: "destructive",
      })
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "upcoming":
        return "bg-trust text-white"
      case "completed":
        return "bg-success text-white"
      case "cancelled":
        return "bg-muted text-muted-foreground"
      default:
        return "bg-muted"
    }
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-trust/10 to-background">
      {/* Header */}
      <div className="bg-linear-to-r from-trust to-accent p-6 text-white">
        <div className="flex items-center gap-4 mb-4">
          <Button onClick={() => router.back()} variant="ghost" size="icon" className="text-white hover:bg-white/20">
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">My Appointments</h1>
            <p className="text-white/80 text-sm">Upcoming and past appointments</p>
          </div>
          <Button
            onClick={() => router.push("/mother/appointments/add")}
            size="icon"
            className="bg-white text-trust hover:bg-white/90"
          >
            <Plus className="w-5 h-5" />
          </Button>
        </div>
      </div>

      <div className="p-6 space-y-4">
        {appointments.length === 0 ? (
          <Card className="p-8 text-center">
            <Calendar className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground mb-4">No appointments scheduled yet.</p>
            <Button onClick={() => router.push("/mother/appointments/add")} className="bg-trust">
              <Plus className="w-4 h-4 mr-2" />
              Schedule Appointment
            </Button>
          </Card>
        ) : (
          appointments.map((appointment) => (
            <Card key={appointment.id} className="p-5 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-lg mb-1">{appointment.type}</h3>
                  <p className="text-sm text-muted-foreground">{appointment.doctor}</p>
                </div>
                <Badge className={getStatusColor(appointment.status)}>{appointment.status}</Badge>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span>
                    {new Date(appointment.date).toLocaleDateString("en-IN", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span>{appointment.time}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <span>{appointment.location}</span>
                </div>
              </div>

              {appointment.status === "upcoming" && (
                <div className="mt-4 pt-4 border-t flex gap-2">
                  <Button onClick={() => handleSetReminder(appointment)} variant="outline" size="sm" className="flex-1">
                    <Bell className="w-4 h-4 mr-2" />
                    Set Reminder
                  </Button>
                  <Button
                    onClick={() => handleReschedule(appointment.id)}
                    variant="outline"
                    size="sm"
                    className="flex-1"
                  >
                    <Edit2 className="w-4 h-4 mr-2" />
                    Reschedule
                  </Button>
                  <Button
                    onClick={() => handleDelete(appointment.id)}
                    variant="outline"
                    size="sm"
                    className="text-alert hover:bg-alert/10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
