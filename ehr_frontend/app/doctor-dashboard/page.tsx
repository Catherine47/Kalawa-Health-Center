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
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAuth } from "@/lib/auth-context"
import {
  Calendar,
  Users,
  FileText,
  Clock,
  AlertCircle,
  Plus,
  Search,
  Filter,
  Stethoscope,
  Pill,
  FlaskConical,
  Edit,
  Save,
  Eye,
} from "lucide-react"
import { ProtectedRoute } from "@/components/protected-route"

export default function DoctorDashboardPage() {
  const [activeTab, setActiveTab] = useState("overview")
  const [selectedPatient, setSelectedPatient] = useState(null)
  const [diagnosisForm, setDiagnosisForm] = useState({
    patientId: "",
    diagnosis: "",
    treatment: "",
    notes: "",
    prescriptions: "",
    followUp: "",
  })
  const { user } = useAuth()

  // Mock data for doctor dashboard
  const todayAppointments = [
    {
      id: 1,
      patient: "Mary Wanjiku",
      patientId: "KHC-2025-001",
      time: "09:00 AM",
      type: "Follow-up",
      status: "confirmed",
      reason: "Hypertension check-up",
      phone: "+254 712 345 678",
      age: 45,
    },
    {
      id: 2,
      patient: "James Mutua",
      patientId: "KHC-2025-002",
      time: "10:30 AM",
      type: "New Patient",
      status: "waiting",
      reason: "General consultation",
      phone: "+254 723 456 789",
      age: 32,
    },
    {
      id: 3,
      patient: "Grace Njeri",
      patientId: "KHC-2025-003",
      time: "02:00 PM",
      type: "Follow-up",
      status: "pending",
      reason: "Diabetes management",
      phone: "+254 734 567 890",
      age: 58,
    },
  ]

  const patientHistory = [
    {
      id: 1,
      patientId: "KHC-2025-001",
      name: "Mary Wanjiku",
      age: 45,
      gender: "Female",
      phone: "+254 712 345 678",
      email: "mary.wanjiku@email.com",
      address: "Mbooni Town, Makueni County",
      emergencyContact: "John Wanjiku - +254 712 345 679",
      medicalHistory: [
        {
          date: "2025-01-08",
          diagnosis: "Hypertension - Stage 1",
          treatment: "ACE inhibitor prescribed",
          doctor: "Dr. Sarah Mwangi",
          notes: "Blood pressure: 145/92. Patient advised on diet and exercise.",
        },
        {
          date: "2024-12-15",
          diagnosis: "Upper Respiratory Infection",
          treatment: "Antibiotics and rest",
          doctor: "Dr. Sarah Mwangi",
          notes: "Symptoms resolved after 7 days of treatment.",
        },
      ],
      currentMedications: ["Lisinopril 10mg daily"],
      allergies: ["Penicillin"],
      vitals: {
        bloodPressure: "145/92",
        heartRate: "78 bpm",
        temperature: "98.6°F",
        weight: "70 kg",
        height: "165 cm",
      },
    },
    {
      id: 2,
      patientId: "KHC-2025-002",
      name: "James Mutua",
      age: 32,
      gender: "Male",
      phone: "+254 723 456 789",
      email: "james.mutua@email.com",
      address: "Kikima, Makueni County",
      emergencyContact: "Susan Mutua - +254 723 456 788",
      medicalHistory: [
        {
          date: "2025-01-10",
          diagnosis: "General Health Check",
          treatment: "No treatment required",
          doctor: "Dr. Sarah Mwangi",
          notes: "All parameters normal. Advised regular exercise.",
        },
      ],
      currentMedications: [],
      allergies: ["None known"],
      vitals: {
        bloodPressure: "120/80",
        heartRate: "72 bpm",
        temperature: "98.4°F",
        weight: "75 kg",
        height: "175 cm",
      },
    },
  ]

  const labResults = [
    {
      id: 1,
      patientId: "KHC-2025-001",
      patientName: "Mary Wanjiku",
      testType: "Complete Blood Count",
      orderDate: "2025-01-08",
      resultDate: "2025-01-09",
      status: "completed",
      results: {
        "White Blood Cells": "7.2 K/uL (Normal: 4.0-11.0)",
        "Red Blood Cells": "4.5 M/uL (Normal: 4.2-5.4)",
        Hemoglobin: "13.8 g/dL (Normal: 12.0-16.0)",
        Hematocrit: "41.2% (Normal: 36.0-46.0)",
        Platelets: "285 K/uL (Normal: 150-450)",
      },
      interpretation: "All values within normal limits",
      criticalValues: [],
    },
    {
      id: 2,
      patientId: "KHC-2025-002",
      patientName: "James Mutua",
      testType: "Blood Glucose",
      orderDate: "2025-01-10",
      resultDate: "2025-01-10",
      status: "completed",
      results: {
        "Fasting Glucose": "95 mg/dL (Normal: 70-100)",
        HbA1c: "5.2% (Normal: <5.7%)",
      },
      interpretation: "Normal glucose metabolism",
      criticalValues: [],
    },
    {
      id: 3,
      patientId: "KHC-2025-003",
      patientName: "Grace Njeri",
      testType: "Lipid Panel",
      orderDate: "2025-01-12",
      resultDate: "pending",
      status: "pending",
      results: {},
      interpretation: "Results pending",
      criticalValues: [],
    },
  ]

  const prescriptionTemplates = [
    {
      medication: "Paracetamol 500mg",
      dosage: "1-2 tablets every 6 hours",
      duration: "5 days",
      instructions: "Take with food if stomach upset occurs",
    },
    {
      medication: "Amoxicillin 500mg",
      dosage: "1 capsule every 8 hours",
      duration: "7 days",
      instructions: "Complete full course even if feeling better",
    },
    {
      medication: "Lisinopril 10mg",
      dosage: "1 tablet daily",
      duration: "30 days",
      instructions: "Take at the same time each day, monitor blood pressure",
    },
  ]

  const recentPatients = [
    {
      id: 1,
      name: "Peter Kiprotich",
      patientId: "KHC-2025-004",
      lastVisit: "2025-01-08",
      condition: "Malaria treatment",
      status: "recovered",
    },
    {
      id: 2,
      name: "Susan Achieng",
      patientId: "KHC-2025-005",
      lastVisit: "2025-01-07",
      condition: "Prenatal care",
      status: "ongoing",
    },
  ]

  const pendingTasks = [
    {
      id: 1,
      task: "Review lab results for Mary Wanjiku",
      priority: "high",
      dueTime: "11:00 AM",
    },
    {
      id: 2,
      task: "Complete discharge summary for John Mwangi",
      priority: "medium",
      dueTime: "03:00 PM",
    },
    {
      id: 3,
      task: "Prescription refill approval - Grace Njeri",
      priority: "low",
      dueTime: "End of day",
    },
  ]

  const handleDiagnosisSubmit = (e) => {
    e.preventDefault()
    // Here you would typically send the data to your backend
    console.log("Diagnosis submitted:", diagnosisForm)
    alert("Diagnosis recorded successfully!")
    setDiagnosisForm({
      patientId: "",
      diagnosis: "",
      treatment: "",
      notes: "",
      prescriptions: "",
      followUp: "",
    })
  }

  return (
    <ProtectedRoute allowedRoles={["doctor"]}>
      <div className="min-h-screen">
        <Header />

        <section className="py-8 bg-gradient-to-br from-primary/5 via-background to-accent/5">
          <div className="container mx-auto px-4">
            {/* Welcome Header */}
            <div className="mb-8">
              <div className="flex items-center gap-4 mb-4">
                <Avatar className="w-16 h-16">
                  <AvatarImage src="/doctor-avatar.png" />
                  <AvatarFallback className="text-lg font-semibold bg-green-100 text-green-700">
                    {user?.name
                      ?.split(" ")
                      .map((n) => n[0])
                      .join("") || "DR"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h1 className="text-3xl font-bold">Good morning, {user?.name || "Doctor"}!</h1>
                  <p className="text-muted-foreground">
                    {user?.department} • {user?.specialization}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    You have {todayAppointments.length} appointments today
                  </p>
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
                      <p className="text-2xl font-bold">{todayAppointments.length}</p>
                      <p className="text-sm text-muted-foreground">Today's Appointments</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <Users className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{patientHistory.length}</p>
                      <p className="text-sm text-muted-foreground">Active Patients</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                      <FlaskConical className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{labResults.filter((r) => r.status === "completed").length}</p>
                      <p className="text-sm text-muted-foreground">Lab Results</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                      <AlertCircle className="w-6 h-6 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{pendingTasks.length}</p>
                      <p className="text-sm text-muted-foreground">Pending Tasks</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Main Content Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid w-full grid-cols-6">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="appointments">Appointments</TabsTrigger>
                <TabsTrigger value="patients">Patient History</TabsTrigger>
                <TabsTrigger value="diagnosis">Record Diagnosis</TabsTrigger>
                <TabsTrigger value="prescriptions">E-Prescriptions</TabsTrigger>
                <TabsTrigger value="lab-results">Lab Results</TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-6">
                {/* ... existing overview content ... */}
              </TabsContent>

              {/* Enhanced Appointments Tab */}
              <TabsContent value="appointments" className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold">Today's Appointments</h2>
                    <p className="text-muted-foreground">Manage your appointment schedule and patient visits</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Filter className="w-4 h-4 mr-2" />
                      Filter
                    </Button>
                    <Button size="sm">
                      <Plus className="w-4 h-4 mr-2" />
                      New Appointment
                    </Button>
                  </div>
                </div>

                <div className="space-y-4">
                  {todayAppointments.map((appointment) => (
                    <Card key={appointment.id}>
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                              <Clock className="w-6 h-6 text-primary" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-semibold text-lg">{appointment.patient}</h3>
                                <Badge
                                  variant={
                                    appointment.status === "confirmed"
                                      ? "default"
                                      : appointment.status === "waiting"
                                        ? "secondary"
                                        : "outline"
                                  }
                                >
                                  {appointment.status}
                                </Badge>
                              </div>
                              <p className="text-muted-foreground">{appointment.reason}</p>
                              <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
                                <span className="flex items-center gap-1">
                                  <Clock className="w-4 h-4" />
                                  {appointment.time}
                                </span>
                                <span>ID: {appointment.patientId}</span>
                                <span>Age: {appointment.age}</span>
                                <span>Phone: {appointment.phone}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline">
                              <Eye className="w-4 h-4 mr-2" />
                              View History
                            </Button>
                            <Button size="sm">
                              <Stethoscope className="w-4 h-4 mr-2" />
                              Start Consultation
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="patients" className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold">Patient History</h2>
                    <p className="text-muted-foreground">View comprehensive patient medical records and history</p>
                  </div>
                  <Button size="sm">
                    <Search className="w-4 h-4 mr-2" />
                    Search Patients
                  </Button>
                </div>

                <div className="space-y-6">
                  {patientHistory.map((patient) => (
                    <Card key={patient.id}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <Avatar className="w-12 h-12">
                              <AvatarFallback className="bg-blue-100 text-blue-700">
                                {patient.name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <CardTitle>{patient.name}</CardTitle>
                              <CardDescription>
                                {patient.age} years • {patient.gender} • ID: {patient.patientId}
                              </CardDescription>
                            </div>
                          </div>
                          <Button size="sm" variant="outline">
                            <Edit className="w-4 h-4 mr-2" />
                            Update Record
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <h4 className="font-medium mb-2">Contact Information</h4>
                            <div className="space-y-1 text-sm">
                              <p>Phone: {patient.phone}</p>
                              <p>Email: {patient.email}</p>
                              <p>Address: {patient.address}</p>
                              <p>Emergency: {patient.emergencyContact}</p>
                            </div>
                          </div>
                          <div>
                            <h4 className="font-medium mb-2">Current Vitals</h4>
                            <div className="space-y-1 text-sm">
                              <p>BP: {patient.vitals.bloodPressure}</p>
                              <p>HR: {patient.vitals.heartRate}</p>
                              <p>Temp: {patient.vitals.temperature}</p>
                              <p>Weight: {patient.vitals.weight}</p>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h4 className="font-medium mb-2">Medical History</h4>
                          <div className="space-y-2">
                            {patient.medicalHistory.map((record, index) => (
                              <div key={index} className="p-3 border rounded-lg">
                                <div className="flex justify-between items-start mb-1">
                                  <h5 className="font-medium text-sm">{record.diagnosis}</h5>
                                  <span className="text-xs text-muted-foreground">{record.date}</span>
                                </div>
                                <p className="text-sm text-muted-foreground mb-1">{record.treatment}</p>
                                <p className="text-xs text-muted-foreground">{record.notes}</p>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <h4 className="font-medium mb-2">Current Medications</h4>
                            <ul className="text-sm list-disc list-inside">
                              {patient.currentMedications.map((med, index) => (
                                <li key={index}>{med}</li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <h4 className="font-medium mb-2">Allergies</h4>
                            <ul className="text-sm list-disc list-inside">
                              {patient.allergies.map((allergy, index) => (
                                <li key={index}>{allergy}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="diagnosis" className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold">Record Diagnosis</h2>
                  <p className="text-muted-foreground">Document patient diagnosis and treatment plans</p>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>New Diagnosis Entry</CardTitle>
                    <CardDescription>Complete the form to record patient diagnosis and treatment</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleDiagnosisSubmit} className="space-y-4">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="patientId">Patient ID</Label>
                          <Select
                            value={diagnosisForm.patientId}
                            onValueChange={(value) => setDiagnosisForm({ ...diagnosisForm, patientId: value })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select patient" />
                            </SelectTrigger>
                            <SelectContent>
                              {todayAppointments.map((appointment) => (
                                <SelectItem key={appointment.patientId} value={appointment.patientId}>
                                  {appointment.patient} - {appointment.patientId}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="followUp">Follow-up Date</Label>
                          <Input
                            id="followUp"
                            type="date"
                            value={diagnosisForm.followUp}
                            onChange={(e) => setDiagnosisForm({ ...diagnosisForm, followUp: e.target.value })}
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="diagnosis">Diagnosis</Label>
                        <Input
                          id="diagnosis"
                          placeholder="Enter primary diagnosis"
                          value={diagnosisForm.diagnosis}
                          onChange={(e) => setDiagnosisForm({ ...diagnosisForm, diagnosis: e.target.value })}
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor="treatment">Treatment Plan</Label>
                        <Textarea
                          id="treatment"
                          placeholder="Describe the treatment plan and recommendations"
                          value={diagnosisForm.treatment}
                          onChange={(e) => setDiagnosisForm({ ...diagnosisForm, treatment: e.target.value })}
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor="prescriptions">Prescriptions</Label>
                        <Textarea
                          id="prescriptions"
                          placeholder="List medications, dosages, and instructions"
                          value={diagnosisForm.prescriptions}
                          onChange={(e) => setDiagnosisForm({ ...diagnosisForm, prescriptions: e.target.value })}
                        />
                      </div>

                      <div>
                        <Label htmlFor="notes">Clinical Notes</Label>
                        <Textarea
                          id="notes"
                          placeholder="Additional observations, patient response, etc."
                          value={diagnosisForm.notes}
                          onChange={(e) => setDiagnosisForm({ ...diagnosisForm, notes: e.target.value })}
                        />
                      </div>

                      <div className="flex gap-2">
                        <Button type="submit">
                          <Save className="w-4 h-4 mr-2" />
                          Save Diagnosis
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() =>
                            setDiagnosisForm({
                              patientId: "",
                              diagnosis: "",
                              treatment: "",
                              notes: "",
                              prescriptions: "",
                              followUp: "",
                            })
                          }
                        >
                          Clear Form
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="prescriptions" className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold">Electronic Prescriptions</h2>
                  <p className="text-muted-foreground">Generate and manage electronic prescriptions</p>
                </div>

                <div className="grid lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Quick Prescription Templates</CardTitle>
                      <CardDescription>Common medications for quick prescribing</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {prescriptionTemplates.map((template, index) => (
                        <div key={index} className="p-3 border rounded-lg">
                          <h4 className="font-medium">{template.medication}</h4>
                          <p className="text-sm text-muted-foreground">
                            {template.dosage} • {template.duration}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">{template.instructions}</p>
                          <Button size="sm" className="mt-2">
                            <Pill className="w-4 h-4 mr-2" />
                            Use Template
                          </Button>
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>New Prescription</CardTitle>
                      <CardDescription>Create a new electronic prescription</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <form className="space-y-4">
                        <div>
                          <Label htmlFor="prescriptionPatient">Patient</Label>
                          <Select>
                            <SelectTrigger>
                              <SelectValue placeholder="Select patient" />
                            </SelectTrigger>
                            <SelectContent>
                              {todayAppointments.map((appointment) => (
                                <SelectItem key={appointment.patientId} value={appointment.patientId}>
                                  {appointment.patient} - {appointment.patientId}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label htmlFor="medication">Medication</Label>
                          <Input id="medication" placeholder="Enter medication name and strength" />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="dosage">Dosage</Label>
                            <Input id="dosage" placeholder="e.g., 1 tablet twice daily" />
                          </div>
                          <div>
                            <Label htmlFor="duration">Duration</Label>
                            <Input id="duration" placeholder="e.g., 7 days" />
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="instructions">Instructions</Label>
                          <Textarea id="instructions" placeholder="Special instructions for patient" />
                        </div>

                        <div className="flex gap-2">
                          <Button type="submit">
                            <Pill className="w-4 h-4 mr-2" />
                            Generate Prescription
                          </Button>
                          <Button type="button" variant="outline">
                            Save as Template
                          </Button>
                        </div>
                      </form>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="lab-results" className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold">Laboratory Results</h2>
                    <p className="text-muted-foreground">View and interpret patient lab results</p>
                  </div>
                  <Button size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Order New Test
                  </Button>
                </div>

                <div className="space-y-4">
                  {labResults.map((result) => (
                    <Card key={result.id}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle>{result.testType}</CardTitle>
                            <CardDescription>
                              {result.patientName} • ID: {result.patientId}
                            </CardDescription>
                          </div>
                          <Badge variant={result.status === "completed" ? "default" : "secondary"}>
                            {result.status}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid md:grid-cols-2 gap-4 mb-4">
                          <div>
                            <p className="text-sm">
                              <span className="font-medium">Ordered:</span> {result.orderDate}
                            </p>
                            <p className="text-sm">
                              <span className="font-medium">Result Date:</span> {result.resultDate}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm">
                              <span className="font-medium">Status:</span> {result.status}
                            </p>
                            <p className="text-sm">
                              <span className="font-medium">Interpretation:</span> {result.interpretation}
                            </p>
                          </div>
                        </div>

                        {result.status === "completed" && Object.keys(result.results).length > 0 && (
                          <div>
                            <h4 className="font-medium mb-2">Results:</h4>
                            <div className="space-y-2">
                              {Object.entries(result.results).map(([test, value]) => (
                                <div key={test} className="flex justify-between items-center p-2 bg-muted/50 rounded">
                                  <span className="font-medium text-sm">{test}</span>
                                  <span className="text-sm">{value}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {result.criticalValues.length > 0 && (
                          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                            <h4 className="font-medium text-red-800 mb-1">Critical Values:</h4>
                            <ul className="text-sm text-red-700 list-disc list-inside">
                              {result.criticalValues.map((value, index) => (
                                <li key={index}>{value}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        <div className="flex gap-2 mt-4">
                          <Button size="sm" variant="outline">
                            <Eye className="w-4 h-4 mr-2" />
                            View Full Report
                          </Button>
                          <Button size="sm" variant="outline">
                            <FileText className="w-4 h-4 mr-2" />
                            Add Interpretation
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </section>

        <Footer />
      </div>
    </ProtectedRoute>
  )
}
