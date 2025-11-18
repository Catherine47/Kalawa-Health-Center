// app/book-appointment/page.tsx
"use client"

import { AppointmentBookingWidget } from "@/components/appointment-booking-widget"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

export default function BookAppointmentPage() {
  return (
    <div className="min-h-screen">
      <Header />
      
      <section className="py-8 bg-gradient-to-br from-primary/5 via-background to-accent/5">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold mb-2">Book an Appointment</h1>
              <p className="text-muted-foreground">
                Schedule your visit with our healthcare professionals
              </p>
            </div>
            
            <AppointmentBookingWidget 
              onBookingComplete={(booking) => {
                console.log("Booking completed:", booking)
                // You can add redirect or success message here
              }}
              onBookingError={(error) => {
                console.error("Booking failed:", error)
                // You can add error handling here
              }}
            />
          </div>
        </div>
      </section>
      
      <Footer />
    </div>
  )
}