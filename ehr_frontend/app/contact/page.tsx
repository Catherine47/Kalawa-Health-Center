"use client"

import type React from "react"

import { useState } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MapPin, Phone, Mail, Clock, MessageSquare, Send, Building, Car, Accessibility } from "lucide-react"
import Image from "next/image"

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
    department: "",
  })

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Contact form:", formData)
    alert("Message sent! We'll get back to you within 24 hours.")
    setFormData({
      name: "",
      email: "",
      phone: "",
      subject: "",
      message: "",
      department: "",
    })
  }

  const contactInfo = [
    {
      icon: Phone,
      title: "Phone",
      details: [
        { label: "Main Line", value: "0745 120283" },
        { label: "Emergency", value: "0745 120283" },
        { label: "Appointments", value: "0745 120283" },
      ],
    },
    {
      icon: Mail,
      title: "Email",
      details: [
        { label: "General Info", value: "kalawa.hospital@makueni.go.ke" },
        { label: "Appointments", value: "kalawa.hospital@makueni.go.ke" },
        { label: "Support", value: "kalawa.hospital@makueni.go.ke" },
      ],
    },
    {
      icon: MapPin,
      title: "Address",
      details: [
        { label: "Location", value: "Kalawa Ward" },
        { label: "Constituency", value: "Mbooni Constituency" },
        { label: "County", value: "Makueni County, Kenya" },
      ],
    },
    {
      icon: Clock,
      title: "Hours",
      details: [
        { label: "Emergency", value: "24/7 Always Open" },
        { label: "Outpatient", value: "Daily Services" },
        { label: "Administration", value: "Mon-Fri 8AM-5PM" },
      ],
    },
  ]

  const departments = [
    "General Inquiry",
    "Appointments",
    "General Medicine",
    "Maternity Services",
    "Pediatrics",
    "Emergency Services",
    "Patient Records",
  ]

  const facilities = [
    {
      icon: Car,
      title: "Accessible Location",
      description: "Easily accessible location in Kalawa ward for community members",
    },
    {
      icon: Accessibility,
      title: "Patient-Friendly",
      description: "Facilities designed to accommodate all patients with various needs",
    },
    {
      icon: Building,
      title: "KEPH Level 4 Facility",
      description: "Sub-county hospital with comprehensive medical services",
    },
    {
      icon: Clock,
      title: "24/7 Emergency",
      description: "Round-the-clock emergency medical services for urgent care",
    },
  ]

  return (
    <div className="min-h-screen">
      <Header />

      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-primary/10 via-background to-accent/10">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <Badge variant="secondary" className="w-fit mx-auto">
              Contact Us
            </Badge>
            <h1 className="text-4xl lg:text-6xl font-bold text-balance">
              Get in <span className="text-primary">Touch</span> With Us
            </h1>
            <p className="text-xl text-muted-foreground text-pretty">
              We're here to help with all your healthcare needs. Contact Kalawa Health Center for appointments,
              questions, or medical support.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Information */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4 mb-16">
            <Badge variant="secondary" className="w-fit mx-auto">
              Contact Information
            </Badge>
            <h2 className="text-3xl lg:text-4xl font-bold text-balance">Multiple Ways to Reach Us</h2>
            <p className="text-xl text-muted-foreground text-pretty max-w-2xl mx-auto">
              Choose the most convenient way to contact our healthcare team.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {contactInfo.map((info, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <info.icon className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle className="text-lg">{info.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {info.details.map((detail, detailIndex) => (
                    <div key={detailIndex} className="text-sm">
                      <div className="font-medium text-muted-foreground">{detail.label}</div>
                      <div className="text-foreground">{detail.value}</div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center space-y-4 mb-12">
              <Badge variant="secondary" className="w-fit mx-auto">
                Send Message
              </Badge>
              <h2 className="text-3xl lg:text-4xl font-bold text-balance">Send Us a Message</h2>
              <p className="text-xl text-muted-foreground text-pretty">
                Fill out the form below and we'll get back to you within 24 hours.
              </p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-2">
                  <MessageSquare className="w-6 h-6" />
                  Contact Form
                </CardTitle>
                <CardDescription>We'll respond to your message as soon as possible.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => handleInputChange("name", e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => handleInputChange("phone", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Department</Label>
                      <Select
                        value={formData.department}
                        onValueChange={(value) => handleInputChange("department", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select department" />
                        </SelectTrigger>
                        <SelectContent>
                          {departments.map((dept) => (
                            <SelectItem key={dept} value={dept}>
                              {dept}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject *</Label>
                    <Input
                      id="subject"
                      value={formData.subject}
                      onChange={(e) => handleInputChange("subject", e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Message *</Label>
                    <Textarea
                      id="message"
                      value={formData.message}
                      onChange={(e) => handleInputChange("message", e.target.value)}
                      placeholder="Please describe your inquiry or message..."
                      className="min-h-32"
                      required
                    />
                  </div>

                  <Button type="submit" size="lg" className="w-full">
                    <Send className="mr-2 h-5 w-5" />
                    Send Message
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Facilities */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4 mb-16">
            <Badge variant="secondary" className="w-fit mx-auto">
              Our Facilities
            </Badge>
            <h2 className="text-3xl lg:text-4xl font-bold text-balance">Modern Healthcare Facility</h2>
            <p className="text-xl text-muted-foreground text-pretty max-w-2xl mx-auto">
              Our state-of-the-art facility is designed with patient comfort and accessibility in mind.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {facilities.map((facility, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <facility.icon className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle className="text-lg">{facility.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>{facility.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4 mb-12">
            <Badge variant="secondary" className="w-fit mx-auto">
              Location
            </Badge>
            <h2 className="text-3xl lg:text-4xl font-bold text-balance">Find Us</h2>
            <p className="text-xl text-muted-foreground text-pretty">
              Located in Kalawa ward, Mbooni constituency, Makueni County, Kenya.
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <Card>
              <CardContent className="p-0">
                <div className="aspect-video relative rounded-lg overflow-hidden">
                  <Image
                    src="/kalawa-hospital-map.png"
                    alt="Kalawa Health Center Location Map"
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                    <div className="text-center space-y-4 text-white">
                      <MapPin className="w-12 h-12 mx-auto" />
                      <div>
                        <h3 className="text-xl font-semibold">Kalawa Health Center</h3>
                        <p>Kalawa Ward, Mbooni Constituency, Makueni County</p>
                      </div>
                      <Button variant="secondary">
                        <MapPin className="mr-2 h-4 w-4" />
                        Get Directions
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
