"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { ProtectedRoute } from "@/components/protected-route"
import {
  Calendar,
  FileText,
  Pill,
  User,
  Clock,
  MapPin,
  Phone,
  Mail,
  Heart,
  Activity,
  AlertCircle,
  CheckCircle,
  Plus,
  Download,
  MessageSquare,
  Search,
  Stethoscope,
  Eye,
} from "lucide-react"

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState("overview")
  const [searchTerm, setSearchTerm] = useState("")

  // Mock data
  const user = {
    name: "John Doe",
    email: "john.doe@example.com",
    phone: "(555) 123-4567",
    dateOfBirth: "1985-06-15",
    address: "123 Main St, City, State 12345",
    emergencyContact: "Jane Doe - (555) 987-6543",
  }

  const availableDoctors = [
    {
      id: 1,
      name: "Dr. Sarah Mwangi",
      specialization: "General Medicine",
      department: "Curative Services",
      availability: "Mon-Fri 8:00 AM - 4:00 PM",
      experience: "8 years",
      status: "available",
      nextAvailable: "Today 2:00 PM",
    },
    {
      id: 2,
      name: "Dr. James Kiprotich",
      specialization: "Maternal Health",
      department: "Maternity Services",
      availability: "Mon-Sat 7:00 AM - 3:00 PM",
      experience: "12 years",
      status: "available",
      nextAvailable: "Tomorrow 9:00 AM",
    },
    {
      id: 3,
      name: "Dr. Grace Njeri",
      specialization: "Pediatrics",
      department: "Child Health",
      availability: "Tue-Sat 9:00 AM - 5:00 PM",
      experience: "6 years",
      status: "busy",
      nextAvailable: "Friday 10:00 AM",
    },
    {
      id: 4,
      name: "Dr. Peter Wanjiku",
      specialization: "Laboratory Medicine",
      department: "Laboratory Services",
      availability: "Mon-Fri 6:00 AM - 2:00 PM",
      experience: "10 years",
      status: "available",
      nextAvailable: "Today 11:00 AM",
    },
  ]

  const medicalRecords = [
    {
      id: 1,
      date: "2025-01-08",
      type: "Consultation",
      doctor: "Dr. Sarah Mwangi",
      diagnosis: "Hypertension - Stage 1",
      treatment: "Lifestyle modifications, ACE inhibitor prescribed",
      notes: "Blood pressure: 145/92. Patient advised on diet and exercise.",
      prescriptions: ["Lisinopril 10mg daily"],
      labResults: ["Blood pressure monitoring"],
      followUp: "2025-02-08",
    },
    {
      id: 2,
      date: "2025-01-05",
      type: "Lab Results",
      doctor: "Dr. Peter Wanjiku",
      diagnosis: "Complete Blood Count - Normal",
      treatment: "No treatment required",
      notes: "All blood parameters within normal range.",
      prescriptions: [],
      labResults: ["CBC: Normal", "Blood glucose: 95 mg/dL"],
      followUp: "2025-07-05",
    },
    {
      id: 3,
      date: "2025-01-03",
      type: "Vaccination",
      doctor: "Dr. Grace Njeri",
      diagnosis: "Routine Immunization",
      treatment: "Tetanus booster administered",
      notes: "No adverse reactions observed. Next booster due in 10 years.",
      prescriptions: [],
      labResults: [],
      followUp: "2035-01-03",
    },
  ]

  const upcomingAppointments = [
    {
      id: 1,
      doctor: "Dr. Sarah Mwangi",
      department: "Curative Services",
      date: "2025-01-15",
      time: "10:00 AM",
      type: "Follow-up",
      location: "Room 205, Main Building",
      status: "confirmed",
    },
    {
      id: 2,
      doctor: "Dr. James Kiprotich",
      department: "Maternity Services",
      date: "2025-01-22",
      time: "2:30 PM",
      type: "Annual Checkup",
      location: "Room 101, Main Building",
      status: "pending",
    },
  ]

  const recentResults = [
    {
      id: 1,
      test: "Blood Work - Complete Panel",
      date: "2025-01-08",
      status: "completed",
      doctor: "Dr. Peter Wanjiku",
      results: "All parameters normal",
      downloadUrl: "#",
    },
    {
      id: 2,
      test: "Chest X-Ray",
      date: "2025-01-05",
      status: "completed",
      doctor: "Dr. Sarah Mwangi",
      results: "Clear lungs, no abnormalities",
      downloadUrl: "#",
    },
    {
      id: 3,
      test: "ECG",
      date: "2025-01-03",
      status: "pending",
      doctor: "Dr. Sarah Mwangi",
      results: "Awaiting results",
      downloadUrl: null,
    },
  ]

  const prescriptions = [
    {
      id: 1,
      medication: "Lisinopril 10mg",
      dosage: "Once daily",
      prescribedBy: "Dr. Sarah Mwangi",
      dateIssued: "2025-01-08",
      refillsLeft: 2,
      status: "active",
      instructions: "Take with food, monitor blood pressure",
    },
    {
      id: 2,
      medication: "Metformin 500mg",
      dosage: "Twice daily with meals",
      prescribedBy: "Dr. Sarah Mwangi",
      dateIssued: "2025-01-05",
      refillsLeft: 0,
      status: "refill_needed",
      instructions: "Take with meals to reduce stomach upset",
    },
  ]

  const healthMetrics = [
    { label: "Blood Pressure", value: "120/80", status: "normal", icon: Heart },
    { label: "Heart Rate", value: "72 bpm", status: "normal", icon: Activity },
    { label: "Weight", value: "165 lbs", status: "normal", icon: User },
    { label: "BMI", value: "24.2", status: "normal", icon: Activity },
  ]

  const filteredDoctors = availableDoctors.filter(
    (doctor) =>
      doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctor.specialization.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctor.department.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <ProtectedRoute allowedRoles={["patient"]}>
      <div className="min-h-screen">
        <Header />

        <section className="py-8 bg-gradient-to-br from-primary/5 via-background to-accent/5">
          <div className="container mx-auto px-4">
            {/* Welcome Header */}
            <div className="mb-8">
              <div className="flex items-center gap-4 mb-4">
                <Avatar className="w-16 h-16">
                  <AvatarImage src="/professional-headshot.png" />
                  <AvatarFallback className="text-lg font-semibold">
                    {user.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h1 className="text-3xl font-bold">Welcome back, {user.name.split(" ")[0]}!</h1>
                  <p className="text-muted-foreground">Here's your health overview for today</p>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Calendar className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{upcomingAppointments.length}</p>
                      <p className="text-sm text-muted-foreground">Upcoming Appointments</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <FileText className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{medicalRecords.length}</p>
                      <p className="text-sm text-muted-foreground">Medical Records</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Pill className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{prescriptions.length}</p>
                      <p className="text-sm text-muted-foreground">Active Prescriptions</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                      <Stethoscope className="w-6 h-6 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{availableDoctors.length}</p>
                      <p className="text-sm text-muted-foreground">Available Doctors</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Main Content Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid w-full grid-cols-6">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="doctors">Doctors</TabsTrigger>
                <TabsTrigger value="appointments">Appointments</TabsTrigger>
                <TabsTrigger value="records">Medical Records</TabsTrigger>
                <TabsTrigger value="prescriptions">Prescriptions</TabsTrigger>
                <TabsTrigger value="profile">Profile</TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-6">
                <div className="grid lg:grid-cols-2 gap-6">
                  {/* Upcoming Appointments */}
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                      <div>
                        <CardTitle>Upcoming Appointments</CardTitle>
                        <CardDescription>Your next scheduled visits</CardDescription>
                      </div>
                      <Button asChild size="sm">
                        <Link href="/appointments">
                          <Plus className="w-4 h-4 mr-2" />
                          Book New
                        </Link>
                      </Button>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {upcomingAppointments.map((appointment) => (
                        <div key={appointment.id} className="flex items-center gap-4 p-4 border rounded-lg">
                          <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                            <Calendar className="w-6 h-6 text-primary" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-semibold">{appointment.doctor}</h4>
                              <Badge variant={appointment.status === "confirmed" ? "default" : "secondary"}>
                                {appointment.status}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">{appointment.department}</p>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground mt-2">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {appointment.date}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {appointment.time}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  {/* Health Metrics */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Health Metrics</CardTitle>
                      <CardDescription>Your latest vital signs and measurements</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {healthMetrics.map((metric, index) => (
                        <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                              <metric.icon className="w-4 h-4 text-green-600" />
                            </div>
                            <span className="font-medium">{metric.label}</span>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold">{metric.value}</p>
                            <Badge variant="secondary" className="text-xs">
                              {metric.status}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </div>

                {/* Recent Activity */}
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                    <CardDescription>Your latest test results and prescriptions</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {medicalRecords.slice(0, 3).map((record) => (
                        <div key={record.id} className="flex items-center gap-4 p-4 border rounded-lg">
                          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <FileText className="w-5 h-5 text-blue-600" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold">{record.type}</h4>
                            <p className="text-sm text-muted-foreground">by {record.doctor}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium">{record.date}</p>
                            <Badge variant={record.type === "Consultation" ? "default" : "secondary"}>
                              {record.type}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Doctors Tab */}
              <TabsContent value="doctors" className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold">Available Doctors</h2>
                    <p className="text-muted-foreground">Find and book appointments with our medical professionals</p>
                  </div>
                  <div className="flex gap-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                      <Input
                        placeholder="Search doctors..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 w-64"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  {filteredDoctors.map((doctor) => (
                    <Card key={doctor.id}>
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          <Avatar className="w-16 h-16">
                            <AvatarFallback className="bg-blue-100 text-blue-700 text-lg font-semibold">
                              {doctor.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-semibold text-lg">{doctor.name}</h3>
                              <Badge variant={doctor.status === "available" ? "default" : "secondary"}>
                                {doctor.status}
                              </Badge>
                            </div>
                            <p className="text-muted-foreground mb-1">{doctor.specialization}</p>
                            <p className="text-sm text-muted-foreground mb-2">{doctor.department}</p>
                            <div className="space-y-1 text-sm">
                              <p>
                                <span className="font-medium">Experience:</span> {doctor.experience}
                              </p>
                              <p>
                                <span className="font-medium">Availability:</span> {doctor.availability}
                              </p>
                              <p>
                                <span className="font-medium">Next Available:</span> {doctor.nextAvailable}
                              </p>
                            </div>
                            <div className="flex gap-2 mt-4">
                              <Button size="sm" asChild>
                                <Link href="/appointments">
                                  <Calendar className="w-4 h-4 mr-2" />
                                  Book Appointment
                                </Link>
                              </Button>
                              <Button size="sm" variant="outline">
                                <Eye className="w-4 h-4 mr-2" />
                                View Profile
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              {/* Appointments Tab */}
              <TabsContent value="appointments" className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold">My Appointments</h2>
                    <p className="text-muted-foreground">Manage your upcoming and past appointments</p>
                  </div>
                  <Button asChild>
                    <Link href="/appointments">
                      <Plus className="w-4 h-4 mr-2" />
                      Book New Appointment
                    </Link>
                  </Button>
                </div>

                <div className="space-y-4">
                  {upcomingAppointments.map((appointment) => (
                    <Card key={appointment.id}>
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                              <Calendar className="w-6 h-6 text-primary" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-lg">{appointment.doctor}</h3>
                              <p className="text-muted-foreground">{appointment.department}</p>
                              <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-4 h-4" />
                                  {appointment.date}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Clock className="w-4 h-4" />
                                  {appointment.time}
                                </span>
                                <span className="flex items-center gap-1">
                                  <MapPin className="w-4 h-4" />
                                  {appointment.location}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={appointment.status === "confirmed" ? "default" : "secondary"}>
                              {appointment.status}
                            </Badge>
                            <Button variant="outline" size="sm">
                              Reschedule
                            </Button>
                            <Button variant="outline" size="sm">
                              Cancel
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              {/* Medical Records Tab */}
              <TabsContent value="records" className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold">Medical Records</h2>
                    <p className="text-muted-foreground">Access your complete medical history and records</p>
                  </div>
                  <Button variant="outline">
                    <Download className="w-4 h-4 mr-2" />
                    Download All Records
                  </Button>
                </div>

                <div className="space-y-4">
                  {medicalRecords.map((record) => (
                    <Card key={record.id}>
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-4 flex-1">
                            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                              <FileText className="w-6 h-6 text-blue-600" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h3 className="font-semibold text-lg">{record.type}</h3>
                                <Badge variant="outline">{record.date}</Badge>
                              </div>
                              <p className="text-muted-foreground mb-2">by {record.doctor}</p>

                              <div className="space-y-3">
                                <div>
                                  <h4 className="font-medium text-sm mb-1">Diagnosis:</h4>
                                  <p className="text-sm">{record.diagnosis}</p>
                                </div>

                                <div>
                                  <h4 className="font-medium text-sm mb-1">Treatment:</h4>
                                  <p className="text-sm">{record.treatment}</p>
                                </div>

                                {record.notes && (
                                  <div>
                                    <h4 className="font-medium text-sm mb-1">Notes:</h4>
                                    <p className="text-sm text-muted-foreground">{record.notes}</p>
                                  </div>
                                )}

                                {record.prescriptions.length > 0 && (
                                  <div>
                                    <h4 className="font-medium text-sm mb-1">Prescriptions:</h4>
                                    <ul className="text-sm list-disc list-inside">
                                      {record.prescriptions.map((prescription, index) => (
                                        <li key={index}>{prescription}</li>
                                      ))}
                                    </ul>
                                  </div>
                                )}

                                {record.labResults.length > 0 && (
                                  <div>
                                    <h4 className="font-medium text-sm mb-1">Lab Results:</h4>
                                    <ul className="text-sm list-disc list-inside">
                                      {record.labResults.map((result, index) => (
                                        <li key={index}>{result}</li>
                                      ))}
                                    </ul>
                                  </div>
                                )}

                                {record.followUp && (
                                  <div>
                                    <h4 className="font-medium text-sm mb-1">Follow-up:</h4>
                                    <p className="text-sm">{record.followUp}</p>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline">
                              <Download className="w-4 h-4 mr-2" />
                              Download
                            </Button>
                            <Button size="sm" variant="outline">
                              <Eye className="w-4 h-4 mr-2" />
                              View Details
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              {/* Prescriptions Tab */}
              <TabsContent value="prescriptions" className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold">My Prescriptions</h2>
                  <p className="text-muted-foreground">Manage your medications and refill requests</p>
                </div>

                <div className="space-y-4">
                  {prescriptions.map((prescription) => (
                    <Card key={prescription.id}>
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                              <Pill className="w-6 h-6 text-purple-600" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-lg">{prescription.medication}</h3>
                              <p className="text-muted-foreground">{prescription.dosage}</p>
                              <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
                                <span>Prescribed by {prescription.prescribedBy}</span>
                                <span>Issued: {prescription.dateIssued}</span>
                                <span>Refills left: {prescription.refillsLeft}</span>
                              </div>
                              {prescription.instructions && (
                                <p className="text-sm text-muted-foreground mt-1">
                                  <span className="font-medium">Instructions:</span> {prescription.instructions}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge
                              variant={
                                prescription.status === "active"
                                  ? "default"
                                  : prescription.status === "refill_needed"
                                    ? "destructive"
                                    : "secondary"
                              }
                            >
                              {prescription.status === "refill_needed" ? (
                                <AlertCircle className="w-3 h-3 mr-1" />
                              ) : (
                                <CheckCircle className="w-3 h-3 mr-1" />
                              )}
                              {prescription.status.replace("_", " ")}
                            </Badge>
                            {prescription.status === "refill_needed" ? (
                              <Button size="sm">Request Refill</Button>
                            ) : (
                              <Button variant="outline" size="sm">
                                View Details
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              {/* Profile Tab */}
              <TabsContent value="profile" className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold">My Profile</h2>
                  <p className="text-muted-foreground">Manage your personal information and preferences</p>
                </div>

                <div className="grid lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Personal Information</CardTitle>
                      <CardDescription>Your basic profile details</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center gap-4">
                        <Avatar className="w-16 h-16">
                          <AvatarImage src="/professional-headshot.png" />
                          <AvatarFallback className="text-lg font-semibold">
                            {user.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-semibold text-lg">{user.name}</h3>
                          <p className="text-muted-foreground">Patient ID: #12345</p>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <Mail className="w-4 h-4 text-muted-foreground" />
                          <span>{user.email}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <Phone className="w-4 h-4 text-muted-foreground" />
                          <span>{user.phone}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          <span>Born: {user.dateOfBirth}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <MapPin className="w-4 h-4 text-muted-foreground" />
                          <span>{user.address}</span>
                        </div>
                      </div>
                      <Button variant="outline" className="w-full bg-transparent">
                        Edit Profile
                      </Button>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Emergency Contact</CardTitle>
                      <CardDescription>Important contact information</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="p-4 border rounded-lg">
                        <div className="flex items-center gap-3 mb-2">
                          <User className="w-4 h-4 text-muted-foreground" />
                          <span className="font-medium">Emergency Contact</span>
                        </div>
                        <p className="text-muted-foreground">{user.emergencyContact}</p>
                      </div>
                      <Button variant="outline" className="w-full bg-transparent">
                        Update Emergency Contact
                      </Button>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Communication Preferences</CardTitle>
                    <CardDescription>How you'd like to receive notifications</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid md:grid-cols-3 gap-4">
                      <div className="flex items-center gap-3 p-4 border rounded-lg">
                        <Mail className="w-5 h-5 text-primary" />
                        <div>
                          <p className="font-medium">Email</p>
                          <p className="text-sm text-muted-foreground">Appointment reminders</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-4 border rounded-lg">
                        <Phone className="w-5 h-5 text-primary" />
                        <div>
                          <p className="font-medium">SMS</p>
                          <p className="text-sm text-muted-foreground">Test results</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-4 border rounded-lg">
                        <MessageSquare className="w-5 h-5 text-primary" />
                        <div>
                          <p className="font-medium">Portal</p>
                          <p className="text-sm text-muted-foreground">All notifications</p>
                        </div>
                      </div>
                    </div>
                    <Button variant="outline" className="w-full bg-transparent">
                      Update Preferences
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </section>

        <Footer />
      </div>
    </ProtectedRoute>
  )
}
