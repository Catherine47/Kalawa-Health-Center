"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { CalendarIcon, Clock, User, CheckCircle } from "lucide-react"
import { cn } from "@/lib/utils"

interface AppointmentBookingWidgetProps {
  onBookingComplete?: (booking: any) => void
}

export function AppointmentBookingWidget({ onBookingComplete }: AppointmentBookingWidgetProps) {
  const [step, setStep] = useState(1)
  const [selectedDate, setSelectedDate] = useState<Date>()
  const [selectedTime, setSelectedTime] = useState("")
  const [selectedDepartment, setSelectedDepartment] = useState("")
  const [selectedDoctor, setSelectedDoctor] = useState("")
  const [patientInfo, setPatientInfo] = useState({
    reason: "",
    notes: "",
  })

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

  const doctors = {
    curative: [
      { id: "dr-mwangi", name: "Dr. Peter Mwangi", specialty: "General Practice" },
      { id: "dr-wanjiku", name: "Dr. Grace Wanjiku", specialty: "Internal Medicine" },
    ],
    maternity: [
      { id: "dr-njeri", name: "Dr. Mary Njeri", specialty: "Obstetrics & Gynecology" },
      { id: "midwife-kamau", name: "Midwife Jane Kamau", specialty: "Midwifery" },
    ],
    antenatal: [
      { id: "dr-njeri", name: "Dr. Mary Njeri", specialty: "Obstetrics & Gynecology" },
      { id: "nurse-mutua", name: "Nurse Sarah Mutua", specialty: "Maternal Health" },
    ],
    "family-planning": [
      { id: "dr-wanjiku", name: "Dr. Grace Wanjiku", specialty: "Family Planning" },
      { id: "nurse-kiprotich", name: "Nurse Agnes Kiprotich", specialty: "Reproductive Health" },
    ],
    "hiv-aids": [
      { id: "dr-mwangi", name: "Dr. Peter Mwangi", specialty: "HIV/AIDS Care" },
      { id: "counselor-mbugua", name: "Counselor John Mbugua", specialty: "HIV Counseling" },
    ],
    tuberculosis: [
      { id: "dr-mwangi", name: "Dr. Peter Mwangi", specialty: "TB Treatment" },
      { id: "nurse-wambui", name: "Nurse Lucy Wambui", specialty: "TB Care" },
    ],
    immunization: [
      { id: "nurse-mutua", name: "Nurse Sarah Mutua", specialty: "Immunization" },
      { id: "nurse-kiprotich", name: "Nurse Agnes Kiprotich", specialty: "Child Health" },
    ],
    laboratory: [
      { id: "lab-tech-kimani", name: "Lab Tech David Kimani", specialty: "Medical Laboratory" },
      { id: "lab-tech-wanjiru", name: "Lab Tech Rose Wanjiru", specialty: "Clinical Laboratory" },
    ],
  }

  const timeSlots = [
    "9:00 AM",
    "9:30 AM",
    "10:00 AM",
    "10:30 AM",
    "11:00 AM",
    "11:30 AM",
    "2:00 PM",
    "2:30 PM",
    "3:00 PM",
    "3:30 PM",
    "4:00 PM",
    "4:30 PM",
  ]

  const handleNext = () => {
    if (step < 4) setStep(step + 1)
  }

  const handleBack = () => {
    if (step > 1) setStep(step - 1)
  }

  const handleBooking = () => {
    const booking = {
      department: selectedDepartment,
      doctor: selectedDoctor,
      date: selectedDate,
      time: selectedTime,
      reason: patientInfo.reason,
      notes: patientInfo.notes,
    }
    onBookingComplete?.(booking)
    alert("Appointment booked successfully!")
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarIcon className="w-5 h-5" />
          Book Appointment
        </CardTitle>
        <CardDescription>Schedule your visit in a few simple steps</CardDescription>

        {/* Progress Indicator */}
        <div className="flex items-center justify-between mt-4">
          {[1, 2, 3, 4].map((stepNumber) => (
            <div key={stepNumber} className="flex items-center">
              <div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium",
                  step >= stepNumber ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground",
                )}
              >
                {step > stepNumber ? <CheckCircle className="w-4 h-4" /> : stepNumber}
              </div>
              {stepNumber < 4 && (
                <div className={cn("w-12 h-px mx-2", step > stepNumber ? "bg-primary" : "bg-muted")} />
              )}
            </div>
          ))}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Step 1: Department Selection */}
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
                      ? "border-primary bg-primary/5"
                      : dept.available
                        ? "border-border hover:border-primary/50"
                        : "border-muted bg-muted/50 cursor-not-allowed",
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{dept.name}</span>
                    {!dept.available && <Badge variant="secondary">Unavailable</Badge>}
                  </div>
                </button>
              ))}
            </div>
            <Button onClick={handleNext} disabled={!selectedDepartment} className="w-full">
              Continue
            </Button>
          </div>
        )}

        {/* Step 2: Doctor Selection */}
        {step === 2 && (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">Select Doctor</h3>
              <p className="text-sm text-muted-foreground mb-4">Choose your preferred healthcare provider</p>
            </div>
            <div className="grid gap-3">
              {doctors[selectedDepartment as keyof typeof doctors]?.map((doctor) => (
                <button
                  key={doctor.id}
                  onClick={() => setSelectedDoctor(doctor.id)}
                  className={cn(
                    "p-4 border rounded-lg text-left transition-colors",
                    selectedDoctor === doctor.id
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50",
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{doctor.name}</p>
                      <p className="text-sm text-muted-foreground">{doctor.specialty}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleBack} className="flex-1 bg-transparent">
                Back
              </Button>
              <Button onClick={handleNext} disabled={!selectedDoctor} className="flex-1">
                Continue
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Date & Time Selection */}
        {step === 3 && (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">Select Date & Time</h3>
              <p className="text-sm text-muted-foreground mb-4">Choose your preferred appointment slot</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Select Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !selectedDate && "text-muted-foreground",
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {selectedDate ? format(selectedDate, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar mode="single" selected={selectedDate} onSelect={setSelectedDate} initialFocus />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label>Select Time</Label>
                <Select value={selectedTime} onValueChange={setSelectedTime}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose time" />
                  </SelectTrigger>
                  <SelectContent>
                    {timeSlots.map((time) => (
                      <SelectItem key={time} value={time}>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          {time}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={handleBack} className="flex-1 bg-transparent">
                Back
              </Button>
              <Button onClick={handleNext} disabled={!selectedDate || !selectedTime} className="flex-1">
                Continue
              </Button>
            </div>
          </div>
        )}

        {/* Step 4: Additional Information */}
        {step === 4 && (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">Additional Information</h3>
              <p className="text-sm text-muted-foreground mb-4">Provide details about your visit</p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reason">Reason for Visit *</Label>
                <Input
                  id="reason"
                  value={patientInfo.reason}
                  onChange={(e) => setPatientInfo((prev) => ({ ...prev, reason: e.target.value }))}
                  placeholder="Brief description of your concern"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Additional Notes (Optional)</Label>
                <Input
                  id="notes"
                  value={patientInfo.notes}
                  onChange={(e) => setPatientInfo((prev) => ({ ...prev, notes: e.target.value }))}
                  placeholder="Any additional information"
                />
              </div>
            </div>

            {/* Booking Summary */}
            <Card className="bg-muted/50">
              <CardHeader>
                <CardTitle className="text-lg">Appointment Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Department:</span>
                  <span className="font-medium">{departments.find((d) => d.id === selectedDepartment)?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Doctor:</span>
                  <span className="font-medium">
                    {doctors[selectedDepartment as keyof typeof doctors]?.find((d) => d.id === selectedDoctor)?.name}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Date:</span>
                  <span className="font-medium">{selectedDate && format(selectedDate, "PPP")}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Time:</span>
                  <span className="font-medium">{selectedTime}</span>
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-2">
              <Button variant="outline" onClick={handleBack} className="flex-1 bg-transparent">
                Back
              </Button>
              <Button onClick={handleBooking} disabled={!patientInfo.reason} className="flex-1">
                Book Appointment
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
