export interface Patient {
  id: string
  name: string
  age: number
  weeks: number
  risk: "Low" | "Medium" | "High"
  lastCheckup: string
  phone: string
  village: string
  bloodPressure: string
  hemoglobin: number
  weight: number
  symptoms: string[]
  nextAppointment: string
  ashaWorkerId: string
  mentalHealthScore: number
  emergencyContact: string
}

export interface HealthLog {
  id: string
  patientId: string
  date: string
  symptoms: string[]
  mood: string
  notes: string
  bloodPressure?: string
  weight?: number
}

export interface Appointment {
  id: string
  patientId: string
  date: string
  time: string
  type: string
  location: string
  status: "upcoming" | "completed" | "cancelled"
  notes?: string
}

export const demoPatients: Patient[] = [
  {
    id: "1",
    name: "Sita Devi",
    age: 26,
    weeks: 28,
    risk: "High",
    lastCheckup: "2025-01-08",
    phone: "+91 98765 11111",
    village: "Rampur",
    bloodPressure: "145/95",
    hemoglobin: 9.2,
    weight: 58,
    symptoms: ["Severe headache", "High BP", "Swelling"],
    nextAppointment: "2025-01-15",
    ashaWorkerId: "asha1",
    mentalHealthScore: 6,
    emergencyContact: "+91 98765 00001",
  },
  {
    id: "2",
    name: "Priya Sharma",
    age: 24,
    weeks: 32,
    risk: "Low",
    lastCheckup: "2025-01-10",
    phone: "+91 98765 22222",
    village: "Sitapur",
    bloodPressure: "118/76",
    hemoglobin: 11.5,
    weight: 62,
    symptoms: [],
    nextAppointment: "2025-01-20",
    ashaWorkerId: "asha1",
    mentalHealthScore: 8,
    emergencyContact: "+91 98765 00002",
  },
  {
    id: "3",
    name: "Rekha Kumari",
    age: 30,
    weeks: 20,
    risk: "Medium",
    lastCheckup: "2025-01-09",
    phone: "+91 98765 33333",
    village: "Laxmipur",
    bloodPressure: "132/88",
    hemoglobin: 10.1,
    weight: 60,
    symptoms: ["Mild headache", "Fatigue"],
    nextAppointment: "2025-01-18",
    ashaWorkerId: "asha1",
    mentalHealthScore: 7,
    emergencyContact: "+91 98765 00003",
  },
  {
    id: "4",
    name: "Anita Singh",
    age: 22,
    weeks: 36,
    risk: "Low",
    lastCheckup: "2025-01-11",
    phone: "+91 98765 44444",
    village: "Rampur",
    bloodPressure: "115/72",
    hemoglobin: 11.8,
    weight: 65,
    symptoms: [],
    nextAppointment: "2025-01-17",
    ashaWorkerId: "asha1",
    mentalHealthScore: 9,
    emergencyContact: "+91 98765 00004",
  },
  {
    id: "5",
    name: "Lakshmi Devi",
    age: 28,
    weeks: 24,
    risk: "Medium",
    lastCheckup: "2025-01-07",
    phone: "+91 98765 55555",
    village: "Sitapur",
    bloodPressure: "128/84",
    hemoglobin: 10.5,
    weight: 57,
    symptoms: ["Back pain", "Nausea"],
    nextAppointment: "2025-01-16",
    ashaWorkerId: "asha1",
    mentalHealthScore: 7,
    emergencyContact: "+91 98765 00005",
  },
]

export const demoHealthLogs: HealthLog[] = [
  {
    id: "log1",
    patientId: "1",
    date: "2025-01-13",
    symptoms: ["Headache", "Dizziness"],
    mood: "Worried",
    notes: "Headache since morning",
    bloodPressure: "142/92",
    weight: 58,
  },
  {
    id: "log2",
    patientId: "2",
    date: "2025-01-13",
    symptoms: [],
    mood: "Happy",
    notes: "Feeling good today",
    bloodPressure: "116/74",
    weight: 62,
  },
]

export const demoAppointments: Appointment[] = [
  {
    id: "apt1",
    patientId: "1",
    date: "2025-01-15",
    time: "10:00 AM",
    type: "Antenatal Checkup",
    location: "Primary Health Centre, Rampur",
    status: "upcoming",
    notes: "Regular ANC checkup",
  },
  {
    id: "apt2",
    patientId: "2",
    date: "2025-01-20",
    time: "11:00 AM",
    type: "Ultrasound",
    location: "District Hospital",
    status: "upcoming",
  },
  {
    id: "apt3",
    patientId: "3",
    date: "2025-01-18",
    time: "2:00 PM",
    type: "Blood Test",
    location: "Community Health Centre",
    status: "upcoming",
  },
]

export function getPatientById(id: string): Patient | undefined {
  return demoPatients.find((p) => p.id === id)
}

export function getPatientsByRisk(risk: "Low" | "Medium" | "High"): Patient[] {
  return demoPatients.filter((p) => p.risk === risk)
}

export function getHealthLogsByPatient(patientId: string): HealthLog[] {
  return demoHealthLogs.filter((log) => log.patientId === patientId)
}

export function getAppointmentsByPatient(patientId: string): Appointment[] {
  return demoAppointments.filter((apt) => apt.patientId === patientId)
}
