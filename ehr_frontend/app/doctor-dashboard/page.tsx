"use client"

import { useState, useEffect } from "react"
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
import { useAuth } from "@/context/auth-context"
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
  Edit,
  Save,
  Eye,
  Loader2,
} from "lucide-react"
import { ProtectedRoute } from "@/components/protected-route"

// Base URL for your Express.js backend
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

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
  const [loading, setLoading] = useState(true)
  const [patients, setPatients] = useState([])
  const [appointments, setAppointments] = useState([])
  const { user } = useAuth()

  // Helper function to calculate age from date of birth
  const calculateAge = (dob) => {
    if (!dob) return 'N/A'
    const birthDate = new Date(dob)
    const today = new Date()
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    return age
  }

  // Helper function to get patient full name
  const getPatientName = (patient) => {
    return `${patient.first_name || ''} ${patient.last_name || ''}`.trim()
  }

  // Helper function to get patient initials
  const getPatientInitials = (patient) => {
    return `${patient.first_name?.[0] || ''}${patient.last_name?.[0] || ''}`.toUpperCase()
  }

  // Helper function to format time
  const formatTime = (timeString) => {
    if (!timeString) return 'No time'
    try {
      if (timeString.includes(':')) {
        const [hours, minutes] = timeString.split(':')
        const hour = parseInt(hours)
        const ampm = hour >= 12 ? 'PM' : 'AM'
        const displayHour = hour % 12 || 12
        return `${displayHour}:${minutes} ${ampm}`
      }
      return timeString
    } catch (error) {
      return timeString
    }
  }

  // Fetch patients and appointments from Express.js backend
  useEffect(() => {
    fetchDoctorData()
  }, [])

  // FIXED: Updated fetchDoctorData function with proper token handling
  const fetchDoctorData = async () => {
    try {
      setLoading(true);
      
      // FIXED: Get token from both possible locations
      const token = user?.token || localStorage.getItem('authToken');
      console.log('🔐 Using token:', token ? 'Found' : 'Not found');
      
      if (!token) {
        console.error('No authentication token found');
        alert('Please login again');
        return;
      }

      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      // Fetch patients
      console.log('📋 Fetching patients...');
      const patientsResponse = await fetch(`${API_BASE_URL}/doctors/dashboard/patients`, { headers });
      
      if (!patientsResponse.ok) {
        throw new Error(`Patients API error: ${patientsResponse.status}`);
      }
      
      const patientsData = await patientsResponse.json();
      console.log('📦 Patients response:', patientsData);
      
      if (patientsData.success) {
        setPatients(patientsData.patients || []);
      } else {
        console.error('Error in patients response:', patientsData.error);
        setPatients([]);
      }

      // Fetch appointments
      console.log('📋 Fetching appointments...');
      const appointmentsResponse = await fetch(`${API_BASE_URL}/doctors/appointments/all`, { headers });
      
      if (!appointmentsResponse.ok) {
        throw new Error(`Appointments API error: ${appointmentsResponse.status}`);
      }
      
      const appointmentsData = await appointmentsResponse.json();
      console.log('📦 Appointments response:', appointmentsData);
      
      if (appointmentsData.success) {
        setAppointments(appointmentsData.appointments || []);
      } else {
        console.error('Error in appointments response:', appointmentsData.error);
        setAppointments([]);
      }

    } catch (error) {
      console.error('❌ Error fetching doctor data:', error);
      setPatients([]);
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  // Mock data for other sections
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

  const pendingTasks = [
    {
      id: 1,
      task: "Complete discharge summary for John Mwangi",
      priority: "medium",
      dueTime: "03:00 PM",
    },
    {
      id: 2,
      task: "Prescription refill approval - Grace Njeri",
      priority: "low",
      dueTime: "End of day",
    },
  ]

  const handleDiagnosisSubmit = async (e) => {
    e.preventDefault()
    try {
      const token = user?.token
      if (!token) {
        alert('Authentication required')
        return
      }

      const response = await fetch(`${API_BASE_URL}/doctors/diagnosis`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(diagnosisForm),
      })

      const data = await response.json()

      if (data.success) {
        alert("Diagnosis recorded successfully!")
        setDiagnosisForm({
          patientId: "",
          diagnosis: "",
          treatment: "",
          notes: "",
          prescriptions: "",
          followUp: "",
        })
        // Refresh patient data to show updated diagnosis
        fetchDoctorData()
      } else {
        alert("Error recording diagnosis: " + (data.error || 'Unknown error'))
      }
    } catch (error) {
      console.error('Error submitting diagnosis:', error)
      alert('Error recording diagnosis. Please try again.')
    }
  }

  const handleStartConsultation = async (appointmentId) => {
    try {
      const token = user?.token
      if (!token) {
        alert('Authentication required')
        return
      }

      const response = await fetch(`${API_BASE_URL}/doctors/appointments/start`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ appointmentId }),
      })

      const data = await response.json()

      if (data.success) {
        // Update appointment status locally
        setAppointments(prev => prev.map(apt => 
          apt.appointment_id === appointmentId ? { ...apt, status: 'in-progress' } : apt
        ))
        alert("Consultation started!")
      } else {
        alert("Error starting consultation: " + (data.error || 'Unknown error'))
      }
    } catch (error) {
      console.error('Error starting consultation:', error)
      alert('Error starting consultation. Please try again.')
    }
  }

  const handleCreatePrescription = async (e) => {
    e.preventDefault()
    try {
      const token = user?.token
      if (!token) {
        alert('Authentication required')
        return
      }

      // This would be connected to your prescriptions API
      alert("Prescription functionality would be implemented here")
    } catch (error) {
      console.error('Error creating prescription:', error)
      alert('Error creating prescription. Please try again.')
    }
  }

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'Not recorded'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <ProtectedRoute allowedRoles={["doctor"]}>
        <div className="min-h-screen flex flex-col">
          <Header />
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
              <p>Loading dashboard...</p>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute allowedRoles={["doctor"]}>
      <div className="min-h-screen">
        <Header />

        <section className="py-8 bg-gradient-to-br from-primary/5 via-background to-accent/5">
          <div className="container mx-auto px-4">
            {/* Welcome Header - FIXED AVATAR */}
            <div className="mb-8">
              <div className="flex items-center gap-4 mb-4">
                <Avatar className="w-16 h-16">
                  <AvatarFallback className="text-lg font-semibold bg-green-100 text-green-700">
                    {user?.name
                      ?.split(" ")
                      .map((n) => n[0])
                      .join("") || "DR"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h1 className="text-3xl font-bold">Welcome, {user?.name || "Doctor"}!</h1>
                  <p className="text-muted-foreground">
                    {user?.specialization || "General Practitioner"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    You have {appointments.length} appointments today
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
                      <p className="text-2xl font-bold">{appointments.length}</p>
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
                      <p className="text-2xl font-bold">{patients.length}</p>
                      <p className="text-sm text-muted-foreground">Active Patients</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                      <FileText className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">
                        {patients.filter(p => p.last_visit && new Date(p.last_visit).toDateString() === new Date().toDateString()).length}
                      </p>
                      <p className="text-sm text-muted-foreground">Patients Today</p>
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
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="appointments">Appointments</TabsTrigger>
                <TabsTrigger value="patients">Patient History</TabsTrigger>
                <TabsTrigger value="diagnosis">Record Diagnosis</TabsTrigger>
                <TabsTrigger value="prescriptions">E-Prescriptions</TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-6">
                <div className="grid lg:grid-cols-2 gap-6">
                  {/* Today's Appointments */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Calendar className="w-5 h-5" />
                        Today's Appointments
                      </CardTitle>
                      <CardDescription>Your schedule for today</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {appointments.map((appointment) => (
                        <div key={appointment.appointment_id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                              <Clock className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                              <p className="font-medium">{appointment.patient_first_name} {appointment.patient_last_name}</p>
                              <p className="text-sm text-muted-foreground">{formatTime(appointment.time)}</p>
                            </div>
                          </div>
                          <Badge
                            variant={
                              appointment.status === "confirmed"
                                ? "default"
                                : appointment.status === "in-progress"
                                  ? "secondary"
                                  : appointment.status === "completed"
                                    ? "outline"
                                    : "secondary"
                            }
                          >
                            {appointment.status}
                          </Badge>
                        </div>
                      ))}
                      {appointments.length === 0 && (
                        <p className="text-center text-muted-foreground py-4">No appointments scheduled for today</p>
                      )}
                    </CardContent>
                  </Card>

                  {/* Recent Patients - FIXED AVATARS */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Users className="w-5 h-5" />
                        Recent Patients
                      </CardTitle>
                      <CardDescription>Patients seen recently</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {patients.slice(0, 5).map((patient) => (
                        <div key={patient.patient_id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <Avatar className="w-10 h-10">
                              <AvatarFallback className="bg-blue-100 text-blue-700">
                                {getPatientInitials(patient)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{getPatientName(patient)}</p>
                              <p className="text-sm text-muted-foreground">{patient.last_condition || "General checkup"}</p>
                            </div>
                          </div>
                          <Badge variant={patient.status === "recovered" ? "default" : "secondary"}>
                            {patient.status || "active"}
                          </Badge>
                        </div>
                      ))}
                      {patients.length === 0 && (
                        <p className="text-center text-muted-foreground py-4">No patients found</p>
                      )}
                    </CardContent>
                  </Card>

                  {/* Pending Tasks */}
                  <Card className="lg:col-span-2">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <AlertCircle className="w-5 h-5" />
                        Pending Tasks
                      </CardTitle>
                      <CardDescription>Tasks requiring your attention</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {pendingTasks.map((task) => (
                        <div key={task.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <p className="font-medium">{task.task}</p>
                            <p className="text-sm text-muted-foreground">Due: {task.dueTime}</p>
                          </div>
                          <Badge
                            variant={
                              task.priority === "high" ? "destructive" : task.priority === "medium" ? "default" : "secondary"
                            }
                          >
                            {task.priority}
                          </Badge>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Enhanced Appointments Tab */}
              <TabsContent value="appointments" className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold">Appointments</h2>
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
                  {appointments.map((appointment) => (
                    <Card key={appointment.appointment_id}>
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                              <Clock className="w-6 h-6 text-primary" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-semibold text-lg">{appointment.patient_first_name} {appointment.patient_last_name}</h3>
                                <Badge
                                  variant={
                                    appointment.status === "confirmed"
                                      ? "default"
                                      : appointment.status === "in-progress"
                                        ? "secondary"
                                        : appointment.status === "completed"
                                          ? "outline"
                                          : "secondary"
                                  }
                                >
                                  {appointment.status}
                                </Badge>
                              </div>
                              <p className="text-muted-foreground">{appointment.reason}</p>
                              <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-4 h-4" />
                                  {formatDate(appointment.date)}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Clock className="w-4 h-4" />
                                  {formatTime(appointment.time)}
                                </span>
                                <span>ID: {appointment.patient_id}</span>
                                <span>Age: {calculateAge(appointment.patient_dob)}</span>
                                <span>Phone: {appointment.patient_phone}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => setSelectedPatient(appointment)}
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              View History
                            </Button>
                            <Button 
                              size="sm"
                              onClick={() => handleStartConsultation(appointment.appointment_id)}
                              disabled={appointment.status === "in-progress" || appointment.status === "completed"}
                            >
                              <Stethoscope className="w-4 h-4 mr-2" />
                              {appointment.status === "in-progress" ? "In Progress" : "Start Consultation"}
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  {appointments.length === 0 && (
                    <Card>
                      <CardContent className="p-8 text-center">
                        <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-medium mb-2">No appointments scheduled</h3>
                        <p className="text-muted-foreground">You have no appointments scheduled.</p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </TabsContent>

              {/* Patient History Tab - FIXED AVATARS */}
              <TabsContent value="patients" className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold">Patient History</h2>
                    <p className="text-muted-foreground">View comprehensive patient medical records and history</p>
                  </div>
                  <Button size="sm" onClick={fetchDoctorData}>
                    <Search className="w-4 h-4 mr-2" />
                    Refresh
                  </Button>
                </div>

                <div className="space-y-6">
                  {patients.map((patient) => (
                    <Card key={patient.patient_id}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <Avatar className="w-12 h-12">
                              <AvatarFallback className="bg-blue-100 text-blue-700">
                                {getPatientInitials(patient)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <CardTitle>{getPatientName(patient)}</CardTitle>
                              <CardDescription>
                                {calculateAge(patient.dob)} years • {patient.gender} • ID: {patient.patient_id}
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
                             <p>Phone: {patient.phone_number || "Not provided"}</p>
                             <p>Email: {patient.email_address || "Not provided"}</p>
                             <p>Emergency: {patient.emergency_contact || "Not provided"}</p>
                               {/* Remove address line temporarily or handle gracefully */}
                            </div>
                          </div>
                          <div>
                            <h4 className="font-medium mb-2">Patient Info</h4>
                            <div className="space-y-1 text-sm">
                              <p>Status: {patient.status || "Active"}</p>
                              <p>Last Condition: {patient.last_condition || "None recorded"}</p>
                              <p>Last Visit: {formatDate(patient.last_visit)}</p>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h4 className="font-medium mb-2">Medical History</h4>
                          <div className="space-y-2">
                            {patient.medicalHistory?.length > 0 ? (
                              patient.medicalHistory.map((record, index) => (
                                <div key={index} className="p-3 border rounded-lg">
                                  <div className="flex justify-between items-start mb-1">
                                    <h5 className="font-medium text-sm">{record.diagnosis}</h5>
                                    <span className="text-xs text-muted-foreground">{formatDate(record.date)}</span>
                                  </div>
                                  <p className="text-sm text-muted-foreground mb-1">{record.treatment}</p>
                                  <p className="text-xs text-muted-foreground">{record.notes}</p>
                                </div>
                              ))
                            ) : (
                              <p className="text-muted-foreground text-sm">No medical history recorded</p>
                            )}
                          </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <h4 className="font-medium mb-2">Current Medications</h4>
                            <ul className="text-sm list-disc list-inside">
                              {patient.current_medications?.length > 0 ? (
                                patient.current_medications.map((med, index) => (
                                  <li key={index}>{med}</li>
                                ))
                              ) : (
                                <li>No current medications</li>
                              )}
                            </ul>
                          </div>
                          <div>
                            <h4 className="font-medium mb-2">Allergies</h4>
                            <ul className="text-sm list-disc list-inside">
                              {patient.allergies?.length > 0 ? (
                                patient.allergies.map((allergy, index) => (
                                  <li key={index}>{allergy}</li>
                                ))
                              ) : (
                                <li>No known allergies</li>
                              )}
                            </ul>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  {patients.length === 0 && (
                    <Card>
                      <CardContent className="p-8 text-center">
                        <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-medium mb-2">No patients found</h3>
                        <p className="text-muted-foreground">No patient records available.</p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </TabsContent>

              {/* Diagnosis Tab - COMPLETE */}
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
                          <Label htmlFor="patientId">Patient</Label>
                          <Select
                            value={diagnosisForm.patientId}
                            onValueChange={(value) => setDiagnosisForm({ ...diagnosisForm, patientId: value })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select patient" />
                            </SelectTrigger>
                            <SelectContent>
                              {patients.map((patient) => (
                                <SelectItem key={patient.patient_id} value={patient.patient_id}>
                                  {getPatientName(patient)} - {patient.patient_id}
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

              {/* Prescriptions Tab - COMPLETE */}
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
                      <form onSubmit={handleCreatePrescription} className="space-y-4">
                        <div>
                          <Label htmlFor="prescriptionPatient">Patient</Label>
                          <Select>
                            <SelectTrigger>
                              <SelectValue placeholder="Select patient" />
                            </SelectTrigger>
                            <SelectContent>
                              {patients.map((patient) => (
                                <SelectItem key={patient.patient_id} value={patient.patient_id}>
                                  {getPatientName(patient)} - {patient.patient_id}
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
            </Tabs>
          </div>
        </section>

        <Footer />
      </div>
    </ProtectedRoute>
  )
}