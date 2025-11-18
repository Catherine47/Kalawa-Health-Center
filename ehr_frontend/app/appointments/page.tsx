"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Badge } from "@/components/ui/badge"
import { AppointmentBookingWidget } from "@/components/appointment-booking-widget"
import { ProtectedRoute } from "@/components/protected-route"

export default function AppointmentsPage() {
  const [isBooking, setIsBooking] = useState(false)
  const router = useRouter()

  const handleBookingComplete = async (booking: any) => {
    console.log("✅ Booking completed:", booking)
    setIsBooking(false)
    
    // Show success message (you'll need to install a toast library)
    // toast.success("Appointment booked successfully!")
    
    // Redirect to dashboard to see the new appointment
    setTimeout(() => {
      router.push('/dashboard')
    }, 1500)
  }

  const handleBookingError = (error: any) => {
    console.error("❌ Booking failed:", error)
    setIsBooking(false)
    // toast.error("Failed to book appointment. Please try again.")
  }

  const handleBookingStart = () => {
    setIsBooking(true)
  }

  return (
    <ProtectedRoute allowedRoles={["patient"]}>
      <div className="min-h-screen">
        <Header />

        {/* Hero Section */}
        <section className="py-20 bg-gradient-to-br from-primary/10 via-background to-accent/10">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center space-y-8 mb-12">
              <Badge variant="secondary" className="w-fit mx-auto">
                Book Appointment
              </Badge>
              <h1 className="text-4xl lg:text-6xl font-bold text-balance">
                Schedule Your <span className="text-primary">Healthcare</span> Visit
              </h1>
              <p className="text-xl text-muted-foreground text-pretty">
                Book appointments with our expert healthcare providers quickly and easily. 
                Choose your preferred time, doctor, and department.
              </p>
            </div>

            <AppointmentBookingWidget 
              onBookingComplete={handleBookingComplete}
              onBookingError={handleBookingError}
              onBookingStart={handleBookingStart}
              isBooking={isBooking}
            />
          </div>
        </section>

        <Footer />
      </div>
    </ProtectedRoute>
  )
}