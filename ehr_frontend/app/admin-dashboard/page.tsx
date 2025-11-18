"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/context/auth-context"
import { ProtectedRoute } from "@/components/protected-route"
import {
  Users,
  Activity,
  DollarSign,
  UserPlus,
  Settings,
  BarChart3,
  AlertTriangle,
  CheckCircle,
  Clock,
  Search,
  Edit,
  Trash2,
  Download,
  FileText,
  Shield,
  Database,
  TrendingUp,
  Calendar,
} from "lucide-react"

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState("overview")
  const [searchTerm, setSearchTerm] = useState("")
  const { user } = useAuth()

  // Mock data for admin dashboard
  const systemStats = {
    totalPatients: 1247,
    totalDoctors: 18,
    totalStaff: 45,
    monthlyRevenue: 2850000, // KES
    activeAppointments: 156,
    pendingApprovals: 12,
  }

  const allUsers = [
    {
      id: 1,
      name: "Mary Wanjiku",
      email: "mary.wanjiku@kalawa.go.ke",
      role: "patient",
      status: "active",
      joinDate: "2024-12-15",
      lastLogin: "2025-01-12",
      phone: "+254 712 345 678",
      department: null,
    },
    {
      id: 2,
      name: "Dr. Sarah Mwangi",
      email: "sarah.mwangi@kalawa.go.ke",
      role: "doctor",
      status: "active",
      joinDate: "2024-01-10",
      lastLogin: "2025-01-12",
      phone: "+254 723 456 789",
      department: "General Medicine",
    },
    {
      id: 3,
      name: "James Mutua",
      email: "james.mutua@kalawa.go.ke",
      role: "patient",
      status: "inactive",
      joinDate: "2024-11-20",
      lastLogin: "2025-01-05",
      phone: "+254 734 567 890",
      department: null,
    },
    {
      id: 4,
      name: "Dr. Grace Njeri",
      email: "grace.njeri@kalawa.go.ke",
      role: "doctor",
      status: "active",
      joinDate: "2024-03-15",
      lastLogin: "2025-01-12",
      phone: "+254 745 678 901",
      department: "Pediatrics",
    },
    {
      id: 5,
      name: "Peter Kiprotich",
      email: "peter.kiprotich@kalawa.go.ke",
      role: "admin",
      status: "active",
      joinDate: "2023-06-01",
      lastLogin: "2025-01-12",
      phone: "+254 756 789 012",
      department: "Administration",
    },
  ]

  const systemReports = [
    {
      id: 1,
      title: "Monthly Patient Registration Report",
      description: "New patient registrations for January 2025",
      type: "patient_analytics",
      generatedDate: "2025-01-12",
      status: "ready",
      fileSize: "2.3 MB",
    },
    {
      id: 2,
      title: "Doctor Performance Report",
      description: "Consultation metrics and patient satisfaction",
      type: "performance",
      generatedDate: "2025-01-10",
      status: "ready",
      fileSize: "1.8 MB",
    },
    {
      id: 3,
      title: "Financial Summary Report",
      description: "Revenue and expense analysis for Q4 2024",
      type: "financial",
      generatedDate: "2025-01-08",
      status: "ready",
      fileSize: "3.1 MB",
    },
    {
      id: 4,
      title: "System Usage Analytics",
      description: "Platform usage statistics and trends",
      type: "system",
      generatedDate: "2025-01-12",
      status: "generating",
      fileSize: null,
    },
  ]

  const patientRecords = [
    {
      id: 1,
      patientId: "KHC-2025-001",
      name: "Mary Wanjiku",
      age: 45,
      gender: "Female",
      phone: "+254 712 345 678",
      email: "mary.wanjiku@email.com",
      address: "Mbooni Town, Makueni County",
      registrationDate: "2024-12-15",
      lastVisit: "2025-01-08",
      totalVisits: 8,
      status: "active",
      medicalConditions: ["Hypertension"],
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
      registrationDate: "2024-11-20",
      lastVisit: "2025-01-10",
      totalVisits: 3,
      status: "active",
      medicalConditions: [],
    },
    {
      id: 3,
      patientId: "KHC-2025-003",
      name: "Grace Njeri",
      age: 58,
      gender: "Female",
      phone: "+254 734 567 890",
      email: "grace.njeri@email.com",
      address: "Wote, Makueni County",
      registrationDate: "2024-10-05",
      lastVisit: "2025-01-12",
      totalVisits: 12,
      status: "active",
      medicalConditions: ["Diabetes", "Hypertension"],
    },
  ]

  const recentActivities = [
    {
      id: 1,
      type: "user_registration",
      message: "New patient registered: Mary Wanjiku",
      timestamp: "2 minutes ago",
      status: "success",
    },
    {
      id: 2,
      type: "appointment_booked",
      message: "Appointment booked with Dr. Sarah Mwangi",
      timestamp: "15 minutes ago",
      status: "info",
    },
    {
      id: 3,
      type: "system_alert",
      message: "Server backup completed successfully",
      timestamp: "1 hour ago",
      status: "success",
    },
    {
      id: 4,
      type: "payment_received",
      message: "Payment received: KES 5,000",
      timestamp: "2 hours ago",
      status: "success",
    },
  ]

  const pendingApprovals = [
    {
      id: 1,
      type: "doctor_registration",
      title: "Dr. John Kiprotich - Pediatrician",
      description: "New doctor registration pending approval",
      priority: "high",
    },
    {
      id: 2,
      type: "equipment_request",
      title: "X-Ray Machine Maintenance",
      description: "Maintenance request for radiology equipment",
      priority: "medium",
    },
    {
      id: 3,
      type: "policy_update",
      title: "Updated Privacy Policy",
      description: "New privacy policy requires admin approval",
      priority: "low",
    },
  ]

  const systemHealth = [
    { metric: "Server Uptime", value: "99.9%", status: "excellent" },
    { metric: "Database Performance", value: "Good", status: "good" },
    { metric: "API Response Time", value: "120ms", status: "good" },
    { metric: "Storage Usage", value: "67%", status: "warning" },
  ]

  const filteredUsers = allUsers.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.role.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const filteredPatients = patientRecords.filter(
    (patient) =>
      patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.patientId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.email.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleDeleteUser = (userId) => {
    if (confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
      // Here you would typically call your API to delete the user
      console.log("Deleting user:", userId)
      alert("User deleted successfully!")
    }
  }

  const handleDeletePatient = (patientId) => {
    if (confirm("Are you sure you want to delete this patient record? This action cannot be undone.")) {
      // Here you would typically call your API to delete the patient record
      console.log("Deleting patient:", patientId)
      alert("Patient record deleted successfully!")
    }
  }

  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <div className="min-h-screen">
        <Header />

        <section className="py-8 bg-gradient-to-br from-primary/5 via-background to-accent/5">
          <div className="container mx-auto px-4">
            {/* Welcome Header */}
            <div className="mb-8">
              <div className="flex items-center gap-4 mb-4">
                <Avatar className="w-16 h-16">
                  <AvatarFallback className="text-lg font-semibold bg-purple-100 text-purple-700">
                    {user?.name
                      ?.split(" ")
                      .map((n) => n[0])
                      .join("") || "AD"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h1 className="text-3xl font-bold">Welcome, {user?.name || "Administrator"}!</h1>
                  <p className="text-muted-foreground">System Administrator • Kalawa Health Center</p>
                  <p className="text-sm text-muted-foreground">System status: All services operational</p>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Users className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{systemStats.totalPatients.toLocaleString()}</p>
                      <p className="text-sm text-muted-foreground">Total Patients</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <Activity className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{systemStats.totalDoctors}</p>
                      <p className="text-sm text-muted-foreground">Active Doctors</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                      <DollarSign className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">KES {(systemStats.monthlyRevenue / 1000000).toFixed(1)}M</p>
                      <p className="text-sm text-muted-foreground">Monthly Revenue</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                      <AlertTriangle className="w-6 h-6 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{systemStats.pendingApprovals}</p>
                      <p className="text-sm text-muted-foreground">Pending Approvals</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Main Content Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid w-full grid-cols-6">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="users">User Management</TabsTrigger>
                <TabsTrigger value="patients">Patient Records</TabsTrigger>
                <TabsTrigger value="reports">System Reports</TabsTrigger>
                <TabsTrigger value="approvals">Approvals</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-6">
                {/* ... existing overview content ... */}
              </TabsContent>

              <TabsContent value="users" className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold">User Management</h2>
                    <p className="text-muted-foreground">Manage patients, doctors, and staff accounts</p>
                  </div>
                  <div className="flex gap-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                      <Input
                        placeholder="Search users..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 w-64"
                      />
                    </div>
                    <Button size="sm">
                      <UserPlus className="w-4 h-4 mr-2" />
                      Add User
                    </Button>
                  </div>
                </div>

                <div className="space-y-4">
                  {filteredUsers.map((user) => (
                    <Card key={user.id}>
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <Avatar className="w-12 h-12">
                              <AvatarFallback
                                className={`text-white ${
                                  user.role === "doctor"
                                    ? "bg-green-500"
                                    : user.role === "admin"
                                      ? "bg-purple-500"
                                      : "bg-blue-500"
                                }`}
                              >
                                {user.name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-semibold">{user.name}</h3>
                                <Badge variant={user.status === "active" ? "default" : "secondary"}>
                                  {user.status}
                                </Badge>
                                <Badge variant="outline">{user.role}</Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">{user.email}</p>
                              <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                                <span>Phone: {user.phone}</span>
                                <span>Joined: {user.joinDate}</span>
                                <span>Last login: {user.lastLogin}</span>
                                {user.department && <span>Dept: {user.department}</span>}
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline">
                              <Edit className="w-4 h-4 mr-2" />
                              Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDeleteUser(user.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
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
                    <h2 className="text-2xl font-bold">Patient Records Management</h2>
                    <p className="text-muted-foreground">View, update, and manage patient medical records</p>
                  </div>
                  <div className="flex gap-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                      <Input
                        placeholder="Search patients..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 w-64"
                      />
                    </div>
                    <Button size="sm" variant="outline">
                      <Download className="w-4 h-4 mr-2" />
                      Export Records
                    </Button>
                  </div>
                </div>

                <div className="space-y-4">
                  {filteredPatients.map((patient) => (
                    <Card key={patient.id}>
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-4 flex-1">
                            <Avatar className="w-12 h-12">
                              <AvatarFallback className="bg-blue-100 text-blue-700">
                                {patient.name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h3 className="font-semibold text-lg">{patient.name}</h3>
                                <Badge variant="outline">ID: {patient.patientId}</Badge>
                                <Badge variant={patient.status === "active" ? "default" : "secondary"}>
                                  {patient.status}
                                </Badge>
                              </div>

                              <div className="grid md:grid-cols-2 gap-4 text-sm">
                                <div>
                                  <p>
                                    <span className="font-medium">Age:</span> {patient.age} years
                                  </p>
                                  <p>
                                    <span className="font-medium">Gender:</span> {patient.gender}
                                  </p>
                                  <p>
                                    <span className="font-medium">Phone:</span> {patient.phone}
                                  </p>
                                  <p>
                                    <span className="font-medium">Email:</span> {patient.email}
                                  </p>
                                </div>
                                <div>
                                  <p>
                                    <span className="font-medium">Address:</span> {patient.address}
                                  </p>
                                  <p>
                                    <span className="font-medium">Registered:</span> {patient.registrationDate}
                                  </p>
                                  <p>
                                    <span className="font-medium">Last Visit:</span> {patient.lastVisit}
                                  </p>
                                  <p>
                                    <span className="font-medium">Total Visits:</span> {patient.totalVisits}
                                  </p>
                                </div>
                              </div>

                              {patient.medicalConditions.length > 0 && (
                                <div className="mt-3">
                                  <p className="font-medium text-sm mb-1">Medical Conditions:</p>
                                  <div className="flex gap-2">
                                    {patient.medicalConditions.map((condition, index) => (
                                      <Badge key={index} variant="secondary" className="text-xs">
                                        {condition}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline">
                              <Edit className="w-4 h-4 mr-2" />
                              Update
                            </Button>
                            <Button size="sm" variant="outline">
                              <FileText className="w-4 h-4 mr-2" />
                              View Records
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDeletePatient(patient.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="reports" className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold">System Reports & Analytics</h2>
                    <p className="text-muted-foreground">Generate and download comprehensive system reports</p>
                  </div>
                  <Button size="sm">
                    <BarChart3 className="w-4 h-4 mr-2" />
                    Generate New Report
                  </Button>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                          <TrendingUp className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-2xl font-bold">+12%</p>
                          <p className="text-sm text-muted-foreground">Patient Growth</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                          <Calendar className="w-6 h-6 text-green-600" />
                        </div>
                        <div>
                          <p className="text-2xl font-bold">89%</p>
                          <p className="text-sm text-muted-foreground">Appointment Rate</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                          <DollarSign className="w-6 h-6 text-purple-600" />
                        </div>
                        <div>
                          <p className="text-2xl font-bold">+8%</p>
                          <p className="text-sm text-muted-foreground">Revenue Growth</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                          <Activity className="w-6 h-6 text-orange-600" />
                        </div>
                        <div>
                          <p className="text-2xl font-bold">94%</p>
                          <p className="text-sm text-muted-foreground">System Uptime</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="space-y-4">
                  {systemReports.map((report) => (
                    <Card key={report.id}>
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                              <FileText className="w-6 h-6 text-blue-600" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-lg">{report.title}</h3>
                              <p className="text-muted-foreground">{report.description}</p>
                              <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
                                <span>Generated: {report.generatedDate}</span>
                                <Badge variant="outline">{report.type}</Badge>
                                {report.fileSize && <span>Size: {report.fileSize}</span>}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={report.status === "ready" ? "default" : "secondary"}>
                              {report.status === "generating" ? (
                                <Clock className="w-3 h-3 mr-1" />
                              ) : (
                                <CheckCircle className="w-3 h-3 mr-1" />
                              )}
                              {report.status}
                            </Badge>
                            {report.status === "ready" && (
                              <Button size="sm">
                                <Download className="w-4 h-4 mr-2" />
                                Download
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              {/* Approvals Tab */}
              <TabsContent value="approvals" className="space-y-6">
                {/* ... existing approvals content ... */}
              </TabsContent>

              {/* Settings Tab */}
              <TabsContent value="settings" className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold">System Settings</h2>
                    <p className="text-muted-foreground">Configure system preferences and security</p>
                  </div>
                  <Button size="sm" variant="outline">
                    <Settings className="w-4 h-4 mr-2" />
                    Advanced Settings
                  </Button>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Shield className="w-5 h-5" />
                        Security Settings
                      </CardTitle>
                      <CardDescription>Manage system security and access controls</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span>Two-Factor Authentication</span>
                        <Badge variant="default">Enabled</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Password Policy</span>
                        <Badge variant="default">Strong</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Session Timeout</span>
                        <Badge variant="outline">30 minutes</Badge>
                      </div>
                      <Button variant="outline" className="w-full bg-transparent">
                        Update Security Settings
                      </Button>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Database className="w-5 h-5" />
                        System Maintenance
                      </CardTitle>
                      <CardDescription>Database and system maintenance tools</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span>Last Backup</span>
                        <Badge variant="default">2 hours ago</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Database Size</span>
                        <Badge variant="outline">2.3 GB</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>System Version</span>
                        <Badge variant="outline">v2.1.0</Badge>
                      </div>
                      <Button variant="outline" className="w-full bg-transparent">
                        Run System Maintenance
                      </Button>
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
