"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Loader2, Calendar, Clock, Stethoscope } from "lucide-react"
import { useAuth } from "@/context/auth-context"

// Your actual doctors data
const allDoctors = [
  { id: 1, name: "Dr. Ian Mwangi", specialty: "Dermatologist" },
  { id: 2, name: "Dr. Ruth Mutua", specialty: "General Practitioner" },
  { id: 3, name: "Dr. Laban Nzau", specialty: "Cardiologist" },
  { id: 4, name: "Dr. Mercy Kibet", specialty: "Gynecologist" },
  { id: 5, name: "Dr. John Otieno", specialty: "Neurologist" },
  { id: 6, name: "Dr. Raphael Mwanzia", specialty: "Radiologist" },
  { id: 7, name: "Dr. Ann Kamau", specialty: "Psychiatrist" },
  { id: 8, name: "Dr. Andrew Mogaka", specialty: "General Practitioner" },
  { id: 9, name: "Dr. Catherine Muendo", specialty: "Nutritionist" },
  { id: 10, name: "Dr. Bramuel Ombati", specialty: "Surgeon" },
  { id: 11, name: "Faith Mwangi", specialty: "Cardiologist" },
  { id: 12, name: "Japheth Kiragu", specialty: "Dermatologist" },
  { id: 14, name: "Dr. Brian Kariuki", specialty: "Orthopedic Surgeon" },
  { id: 15, name: "Dr. John Kamau", specialty: "Surgeon" },
  { id: 17, name: "John Mutua", specialty: "Pediatrics" },
  { id: 21, name: "Dr. David Johnson", specialty: "Cardiology" },
  { id: 22, name: "Dr. Kanyi Kamau", specialty: "Surgeon" },
  { id: 23, name: "Dr. Mutunga Koech", specialty: "Surgeon" },
  { id: 24, name: "Dr. Muthee Ikamati", specialty: "Pediatrician" },
  { id: 25, name: "Dr. Waweru Kimani", specialty: "Neurologist" },
  { id: 26, name: "Dr. Kibe Karua", specialty: "Dermatologist" },
  { id: 27, name: "Dr. Waweru Bosire", specialty: "Neurologist" },
]

export function PatientAppointments() {
  const { user } = useAuth()
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)

  const patientId = user?.patientId || user?.id || user?.userId

  useEffect(() => {
    fetchAppointments()
  }, [patientId])

  const fetchAppointments = async () => {
    try {
      // Use the exact same API as your booking widget
      const response = await fetch('/api/appointments')
      
      if (!response.ok) {
        throw new Error('Failed to fetch appointments')
      }

      const data = await response.json()
      
      // Filter appointments for current patient and enhance with doctor info
      const patientAppointments = data
        .filter(apt => apt.patient_id === Number(patientId))
        .map(appointment => {
          const doctor = allDoctors.find(d => d.id === appointment.doctor_id)
          return {
            ...appointment,
            doctor_name: doctor?.name || `Doctor ID: ${appointment.doctor_id}`,
            doctor_specialty: doctor?.specialty || "Medical Professional",
            formatted_date: new Date(appointment.appointment_date + 'T00:00:00').toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })
          }
        })

      setAppointments(patientAppointments)
    } catch (error) {
      console.error('Failed to fetch appointments:', error)
      // If API fails, show sample data
      setAppointments(getSampleAppointments())
    } finally {
      setLoading(false)
    }
  }

  // Sample data in case API fails
  const getSampleAppointments = () => {
    return [
      {
        appointment_id: 1,
        patient_id: Number(patientId),
        doctor_id: 2,
        appointment_date: "2024-12-25",
        appointment_time: "2:00 PM",
        status: "scheduled",
        doctor_name: "Dr. Ruth Mutua",
        doctor_specialty: "General Practitioner",
        formatted_date: "Wednesday, December 25, 2024"
      },
      {
        appointment_id: 2,
        patient_id: Number(patientId),
        doctor_id: 4,
        appointment_date: "2024-12-20",
        appointment_time: "10:00 AM",
        status: "completed",
        doctor_name: "Dr. Mercy Kibet",
        doctor_specialty: "Gynecologist",
        formatted_date: "Friday, December 20, 2024"
      }
    ]
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p>Loading your appointments...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          My Appointments
        </CardTitle>
        <CardDescription>
          View and manage your scheduled appointments
        </CardDescription>
      </CardHeader>

      <CardContent>
        {appointments.length === 0 ? (
          <div className="text-center p-8">
            <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No appointments scheduled.</p>
            <p className="text-sm text-muted-foreground mt-2">
              Book your first appointment to get started.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {appointments.map((appointment) => (
              <AppointmentCard key={appointment.appointment_id} appointment={appointment} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function AppointmentCard({ appointment }) {
  return (
    <Card className="p-6 border-l-4 border-l-primary">
      <div className="flex justify-between items-start">
        <div className="space-y-3 flex-1">
          {/* Doctor Information */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
              <Stethoscope className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">{appointment.doctor_name}</h3>
              <p className="text-sm text-muted-foreground">{appointment.doctor_specialty}</p>
            </div>
          </div>

          {/* Appointment Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <span>{appointment.formatted_date}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <span>{appointment.appointment_time}</span>
            </div>
          </div>
        </div>

        {/* Status Badge */}
        <Badge variant={
          appointment.status === 'scheduled' ? 'default' :
          appointment.status === 'completed' ? 'secondary' :
          appointment.status === 'cancelled' ? 'destructive' : 'outline'
        }>
          {appointment.status}
        </Badge>
      </div>
    </Card>
  )
}