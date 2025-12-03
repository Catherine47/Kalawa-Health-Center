"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { format, addDays, isBefore, startOfDay } from "date-fns"
import { CalendarIcon, Clock, User, CheckCircle, Loader2, ArrowLeft } from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/context/auth-context"
import { bookAppointment } from "@/context/api-client"
import { useRouter } from "next/navigation"

interface Doctor {
  id: number;
  first_name: string;
  last_name: string;
  specialization: string;
  email: string;
  phone: string;
}

interface AppointmentBookingWidgetProps {
  onBookingComplete?: (booking: any) => void
  onBookingError?: (error: any) => void
  onBookingStart?: () => void
  isBooking?: boolean
}

// ✅ ADD THIS FUNCTION HERE (after interfaces, before BookingSuccess)
const formatDoctorName = (firstName: string, lastName: string): string => {
  if (!firstName || !lastName) return "Unknown Doctor";
  
  // Remove ALL "Dr." prefixes
  const cleanFirstName = firstName.replace(/^dr\.?\s*/i, '').trim();
  
  if (!cleanFirstName) {
    return `Dr. ${lastName.trim()}`;
  }
  
  return `Dr. ${cleanFirstName} ${lastName.trim()}`;
};

// -------------------------- Success Component --------------------------
function BookingSuccess({ booking, onNewBooking }: { booking: any; onNewBooking: () => void }) {
  const router = useRouter()
  const [countdown, setCountdown] = useState(5)

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          router.push('/dashboard')
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [router])

  const handleRedirectToDashboard = () => router.push('/dashboard')
  const handleBookAnother = () => onNewBooking()

  return (
    <Card className="w-full max-w-2xl mx-auto border-green-200 bg-green-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-green-700">
          <CheckCircle className="w-5 h-5" />
          Appointment Booked Successfully!
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h4 className="font-semibold text-sm text-muted-foreground">Doctor</h4>
            <p className="text-lg font-medium">{booking.doctor_name}</p>
            <p className="text-sm text-muted-foreground">{booking.doctor_specialty}</p>
          </div>
          <div>
            <h4 className="font-semibold text-sm text-muted-foreground">Department</h4>
            <p className="text-lg font-medium">{booking.department}</p>
          </div>
          <div>
            <h4 className="font-semibold text-sm text-muted-foreground">Date</h4>
            <p className="text-lg font-medium">
              {new Date(booking.appointment_date + 'T00:00:00').toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-sm text-muted-foreground">Time</h4>
            <p className="text-lg font-medium">{booking.appointment_time}</p>
          </div>
        </div>

        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-700">
            <strong>Important:</strong> Please arrive 15 minutes before your scheduled time. Bring your ID and any relevant medical records.
          </p>
          <p className="text-sm text-blue-700 mt-2 font-semibold">
            Redirecting to dashboard in {countdown} seconds...
          </p>
        </div>

        <div className="flex gap-2">
          <Button onClick={() => window.print()} variant="outline" className="flex-1">
            Print Confirmation
          </Button>
          <Button onClick={handleBookAnother} variant="outline" className="flex-1">
            Book Another Appointment
          </Button>
          <Button onClick={handleRedirectToDashboard} className="flex-1">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go to Dashboard
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

// -------------------------- Appointment Booking Widget --------------------------
export function AppointmentBookingWidget({ 
  onBookingComplete, 
  onBookingError, 
  onBookingStart,
  isBooking = false 
}: AppointmentBookingWidgetProps) {
  const { user } = useAuth()
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [selectedDate, setSelectedDate] = useState<Date>()
  const [selectedTime, setSelectedTime] = useState("")
  const [selectedDepartment, setSelectedDepartment] = useState("")
  const [selectedDoctor, setSelectedDoctor] = useState("")
  const [patientInfo, setPatientInfo] = useState({ reason: "", notes: "" })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [bookingSuccess, setBookingSuccess] = useState<any>(null)
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [loadingDoctors, setLoadingDoctors] = useState(false)

  const patientId = user?.patientId || user?.id || user?.userId

  const departments = [
    { id: "curative", name: "Curative Services (General Outpatient & Inpatient)", available: true },
    { id: "maternity", name: "Maternity and Neonatal Services", available: true },
    { id: "antenatal", name: "Antenatal and Postnatal Care", available: true },
    { id: "family-planning", name: "Family Planning", available: true },
    { id: "hiv-aids", name: "HIV/AIDS Services", available: true },
    { id: "tuberculosis", name: "Tuberculosis (TB) Care", available: true },
    { id: "immunization", name: "Immunization", available: true },
    { id: "laboratory", name: "Laboratory Services", available: true },
  ]

  const timeSlots = [
    "9:00 AM", "9:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM",
    "2:00 PM", "2:30 PM", "3:00 PM", "3:30 PM", "4:00 PM", "4:30 PM",
  ]

  const today = startOfDay(new Date())
  const maxDate = addDays(today, 90)
  const isDateDisabled = (date: Date) => isBefore(date, today) || isBefore(maxDate, date)

  const currentDoctor = doctors.find(d => String(d.id) === selectedDoctor)
  const currentDepartmentInfo = departments.find(d => d.id === selectedDepartment)

  // ✅ NEW: Fetch available doctors from API
  useEffect(() => {
    const fetchDoctors = async () => {
      setLoadingDoctors(true)
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
        const response = await fetch(`${baseUrl}/api/doctors/public/available`)
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        
        const doctorsData = await response.json()
        setDoctors(doctorsData)
        console.log(`✅ Loaded ${doctorsData.length} doctors for appointment booking`)
      } catch (error) {
        console.error("Error fetching doctors:", error)
      } finally {
        setLoadingDoctors(false)
      }
    }

    fetchDoctors()
  }, [])

  const startNewBooking = () => {
    setBookingSuccess(null)
    setStep(1)
    setSelectedDate(undefined)
    setSelectedTime("")
    setSelectedDepartment("")
    setSelectedDoctor("")
    setPatientInfo({ reason: "", notes: "" })
  }

  const handleGoToDashboard = () => router.push('/dashboard')
  const handleNext = () => { if (step < 4) setStep(step + 1) }
  const handleBack = () => { if (step > 1) setStep(step - 1) }

  // -------------------------- Booking Handler --------------------------
  const handleBooking = async () => {
    if (!selectedDoctor || !selectedDate || !selectedTime) {
      alert("Please fill in all required fields.")
      return
    }

    const numericPatientId = Number(patientId)
    if (isNaN(numericPatientId)) {
      console.error("❌ Invalid patient ID:", patientId)
      alert("Invalid patient information. Please contact support.")
      return
    }

    const currentDoctorInfo = doctors.find(
      doctor => Number(doctor.id) === Number(selectedDoctor)
    )
    const currentDepartmentInfo = departments.find(
      dept => dept.id === selectedDepartment
    )

    if (!currentDoctorInfo) {
      console.error("❌ Doctor not found for selected ID:", selectedDoctor)
      alert("Selected doctor not found. Please try again.")
      return
    }

    if (!currentDepartmentInfo) {
      console.error("❌ Department not found for selected ID:", selectedDepartment)
      alert("Selected department not found. Please try again.")
      return
    }

    setIsSubmitting(true)
    onBookingStart?.()

    try {
      const year = selectedDate.getFullYear()
      const month = String(selectedDate.getMonth() + 1).padStart(2, "0")
      const day = String(selectedDate.getDate()).padStart(2, "0")
      const appointmentDate = `${year}-${month}-${day}`

      const appointmentData = {
        patient_id: numericPatientId,
        doctor_id: Number(selectedDoctor),
        appointment_date: appointmentDate,
        appointment_time: selectedTime,
        status: "scheduled",
      }

      console.log("📋 Sending to backend:", appointmentData)
      const result = await bookAppointment(appointmentData)
      console.log("✅ Backend result:", result)

      const bookingConfirmation = {
        doctor_name: formatDoctorName(currentDoctorInfo.first_name, currentDoctorInfo.last_name),
        doctor_specialty: currentDoctorInfo.specialization,
        department: currentDepartmentInfo.name,
        appointment_date: appointmentDate,
        appointment_time: selectedTime,
        patient_id: numericPatientId,
        ...result,
      }

      console.log("🎉 Booking confirmed:", bookingConfirmation)
      setBookingSuccess(bookingConfirmation)
      onBookingComplete?.(bookingConfirmation)

      setTimeout(() => {
        if (bookingSuccess) router.push('/dashboard')
      }, 8000)

    } catch (error: any) {
      console.error("❌ Booking failed:", error)
      let errorMessage = "Failed to book appointment. Please try again."
      if (error.message?.includes("Network") || error.message?.includes("fetch")) {
        errorMessage = "Network error. Please check your connection."
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message
      } else if (error.message) {
        errorMessage = error.message
      }
      alert(`❌ ${errorMessage}`)
      onBookingError?.(error)
    } finally {
      setIsSubmitting(false)
    }
  }

  // -------------------------- Conditional Render --------------------------
  if (bookingSuccess) return <BookingSuccess booking={bookingSuccess} onNewBooking={startNewBooking} />
  if (!user) return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardContent className="p-6 text-center">
        <div className="flex items-center justify-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin" />
          <p>Loading user information...</p>
        </div>
      </CardContent>
    </Card>
  )
  if (user.role !== "patient") return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardContent className="p-6 text-center">
        <p className="text-muted-foreground">Please log in as a patient to book an appointment.</p>
        <p className="text-sm text-muted-foreground mt-2">Current role: {user.role}</p>
      </CardContent>
    </Card>
  )
  if (!patientId) return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardContent className="p-6 text-center">
        <p className="text-red-600">Unable to identify patient. Please contact support.</p>
        <p className="text-sm text-muted-foreground mt-2">User ID: {user?.id}</p>
      </CardContent>
    </Card>
  )

  // -------------------------- Main Render --------------------------
  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarIcon className="w-5 h-5" />
          Book Appointment
        </CardTitle>
        <CardDescription>
          Schedule your visit in a few simple steps
          <div className="text-xs mt-1 text-green-600">
            Logged in as: {user.name} (Patient ID: {patientId})
          </div>
          <div className="mt-2">
            <Button variant="outline" size="sm" onClick={handleGoToDashboard} className="text-xs">
              <ArrowLeft className="w-3 h-3 mr-1" /> Back to Dashboard
            </Button>
          </div>
        </CardDescription>

        {/* Progress Indicator */}
        <div className="flex items-center justify-between mt-4">
          {[1, 2, 3, 4].map((stepNumber) => (
            <div key={stepNumber} className="flex items-center">
              <div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium border-2",
                  step >= stepNumber
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-muted text-muted-foreground border-muted"
                )}
              >
                {step > stepNumber ? <CheckCircle className="w-4 h-4" /> : stepNumber}
              </div>
              {stepNumber < 4 && <div className={cn("w-12 h-1 mx-2", step > stepNumber ? "bg-primary" : "bg-muted")} />}
            </div>
          ))}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Step 1: Department */}
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">Select Department</h3>
              <p className="text-sm text-muted-foreground mb-4">Choose the medical department for your visit</p>
            </div>
            <div className="grid gap-3">
              {departments.map((dept) => (
                <button
                  key={dept.id}
                  onClick={() => dept.available && setSelectedDepartment(dept.id)}
                  disabled={!dept.available}
                  className={cn(
                    "p-4 border rounded-lg text-left transition-colors",
                    selectedDepartment === dept.id
                      ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                      : dept.available
                      ? "border-border hover:border-primary/50 hover:bg-accent/50"
                      : "border-muted bg-muted/50 cursor-not-allowed"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{dept.name}</span>
                    {!dept.available && <Badge variant="secondary">Unavailable</Badge>}
                  </div>
                </button>
              ))}
            </div>
            <Button onClick={handleNext} disabled={!selectedDepartment} className="w-full">Continue</Button>
          </div>
        )}

        {/* Step 2: Doctor */}
        {step === 2 && (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">Select Doctor</h3>
              <p className="text-sm text-muted-foreground mb-4">Choose your preferred healthcare provider</p>
            </div>
            
            {loadingDoctors ? (
              <div className="flex items-center justify-center p-8">
                <Loader2 className="w-6 h-6 animate-spin mr-2" />
                <p>Loading available doctors...</p>
              </div>
            ) : doctors.length === 0 ? (
              <div className="text-center p-8 text-muted-foreground">
                <p>No doctors available at the moment.</p>
                <p className="text-sm mt-2">Please check back later or contact the administration.</p>
              </div>
            ) : (
              <Select value={selectedDoctor} onValueChange={setSelectedDoctor}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a doctor" />
                </SelectTrigger>
                <SelectContent>
                  {doctors.map((doctor) => (
                    <SelectItem key={doctor.id} value={String(doctor.id)}>
                      {formatDoctorName(doctor.first_name, doctor.last_name)} - {doctor.specialization}
                        </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            
            <div className="flex gap-2">
              <Button onClick={handleBack} variant="outline">Back</Button>
              <Button onClick={handleNext} disabled={!selectedDoctor || loadingDoctors || doctors.length === 0}>
                Continue
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Date & Time */}
        {step === 3 && (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">Select Date & Time</h3>
            </div>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left">
                  {selectedDate ? format(selectedDate, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  disabled={isDateDisabled}
                  initialFocus
                />
              </PopoverContent>
            </Popover>

            <Select value={selectedTime} onValueChange={setSelectedTime}>
              <SelectTrigger>
                <SelectValue placeholder="Select a time" />
              </SelectTrigger>
              <SelectContent>
                {timeSlots.map((time) => (
                  <SelectItem key={time} value={time}>{time}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex gap-2">
              <Button onClick={handleBack} variant="outline">Back</Button>
              <Button onClick={handleNext} disabled={!selectedDate || !selectedTime}>Continue</Button>
            </div>
          </div>
        )}

        {/* Step 4: Reason & Notes */}
        {step === 4 && (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">Reason for Visit</h3>
              <p className="text-sm text-muted-foreground mb-4">Provide a brief description of your appointment reason</p>
            </div>
            <div className="grid gap-3">
              <Label htmlFor="reason">Reason</Label>
              <Input
                id="reason"
                placeholder="Enter reason for visit"
                value={patientInfo.reason}
                onChange={(e) => setPatientInfo({ ...patientInfo, reason: e.target.value })}
              />
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Input
                id="notes"
                placeholder="Any additional notes"
                value={patientInfo.notes}
                onChange={(e) => setPatientInfo({ ...patientInfo, notes: e.target.value })}
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleBack} variant="outline" className="flex-1">Back</Button>
              <Button onClick={handleBooking} className="flex-1" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Confirm Appointment
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}