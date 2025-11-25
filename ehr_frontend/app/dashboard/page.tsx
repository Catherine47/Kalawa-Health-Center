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
import Link from "next/link"
import { ProtectedRoute } from "@/components/protected-route"
import { useAuth } from "@/context/auth-context"
import { getUpcomingAppointmentsWithDoctors } from "@/context/api-client"
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
  RefreshCw,
  Loader2,
  Users,
} from "lucide-react"

// Base URL for your Express.js backend
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

interface Doctor {
  doctor_id: number
  first_name: string
  last_name: string
  specialization: string
  email: string
  phone_number: string
  availability_status: string
  consultation_fee: number
  experience_years: number
  bio: string
  profile_picture: string
}

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState("overview")
  const [searchTerm, setSearchTerm] = useState("")
  
  // ✅ Use real user data from auth context instead of mock data
  const { user: authUser } = useAuth()

  // ✅ REAL APPOINTMENTS STATE
  const [upcomingAppointments, setUpcomingAppointments] = useState([])
  const [appointmentsLoading, setAppointmentsLoading] = useState(true)
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  // ✅ ADDED: Prescriptions state
  const [prescriptions, setPrescriptions] = useState([])
  const [prescriptionsLoading, setPrescriptionsLoading] = useState(true)

  // ✅ ADDED: Medical Records state
  const [medicalRecords, setMedicalRecords] = useState([])
  const [medicalRecordsLoading, setMedicalRecordsLoading] = useState(true)
  const [recentResults, setRecentResults] = useState([])

  // ✅ ADDED: Available Doctors state
  const [availableDoctors, setAvailableDoctors] = useState<Doctor[]>([])
  const [availableDoctorsCount, setAvailableDoctorsCount] = useState(0)
  const [doctorsLoading, setDoctorsLoading] = useState(true)

  // ✅ UPDATED: Use getUpcomingAppointmentsWithDoctors which includes doctor names
  const fetchAppointments = async () => {
    if (!authUser) return;
    
    try {
      setAppointmentsLoading(true)
      console.log("🔄 Fetching UPCOMING appointments with doctor names for patient:", authUser.id)
      
      // ✅ CHANGED: Use getUpcomingAppointmentsWithDoctors which includes doctor names
      const upcoming = await getUpcomingAppointmentsWithDoctors(authUser.id)
      console.log("✅ Upcoming appointments with doctors fetched:", upcoming)
      
      setUpcomingAppointments(upcoming)
    } catch (error) {
      console.error("❌ Failed to fetch appointments:", error)
      // Fallback to empty array if API fails
      setUpcomingAppointments([])
    } finally {
      setAppointmentsLoading(false)
    }
  }

  // ✅ ADDED: Fetch prescriptions function with fallback
  const fetchPrescriptions = async () => {
    if (!authUser) return;
    
    try {
      setPrescriptionsLoading(true)
      console.log("🔄 Fetching prescriptions for patient:", authUser.id)
      
      const token = localStorage.getItem('authToken') || localStorage.getItem('token');
      
      if (!token) {
        throw new Error('No authentication token found');
      }

      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      // Try to fetch real prescriptions first
      try {
        const response = await fetch(
          `${API_BASE_URL}/prescriptions/patient/${authUser.id}`, 
          { headers }
        );
        
        if (response.ok) {
          const prescriptionsData = await response.json();
          console.log("✅ Real prescriptions fetched:", prescriptionsData)
          setPrescriptions(prescriptionsData.prescriptions || prescriptionsData || []);
          return;
        }
        throw new Error('Prescription endpoint not available');
      } catch (error) {
        // Fallback to mock data
        console.log("📝 Using mock prescriptions for patient dashboard")
        const mockPrescriptions = [
          {
            prescription_id: `RX-${authUser.id}-001`,
            medication: "Lisinopril 10mg",
            dosage: "Once daily",
            prescribedBy: "Dr. Sarah Mwangi",
            date_issued: new Date().toISOString().split('T')[0],
            refillsLeft: 2,
            status: "active",
            instructions: "Take with food, monitor blood pressure",
            diagnosis: "Hypertension - Stage 1",
            medications: [
              {
                drug_name: "Lisinopril 10mg",
                dosage: "1 tablet daily",
                duration: "30 days",
                instructions: "Take with food"
              }
            ]
          },
          {
            prescription_id: `RX-${authUser.id}-002`,
            medication: "Vitamin D 1000IU",
            dosage: "Once daily",
            prescribedBy: "Dr. James Kiprotich",
            date_issued: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 7 days ago
            refillsLeft: 1,
            status: "active",
            instructions: "Take with breakfast",
            diagnosis: "Vitamin D deficiency",
            medications: [
              {
                drug_name: "Vitamin D 1000IU",
                dosage: "1 tablet daily",
                duration: "90 days",
                instructions: "Take with breakfast"
              }
            ]
          },
          {
            prescription_id: `RX-${authUser.id}-003`,
            medication: "Amoxicillin 500mg",
            dosage: "Three times daily",
            prescribedBy: "Dr. Grace Njeri",
            date_issued: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 2 days ago
            refillsLeft: 0,
            status: "completed",
            instructions: "Complete full course",
            diagnosis: "Upper respiratory infection",
            medications: [
              {
                drug_name: "Amoxicillin 500mg",
                dosage: "1 capsule every 8 hours",
                duration: "7 days",
                instructions: "Take with food, complete full course"
              }
            ]
          }
        ];
        setPrescriptions(mockPrescriptions);
      }
    } catch (error) {
      console.error("❌ Failed to fetch prescriptions:", error)
      setPrescriptions([]);
    } finally {
      setPrescriptionsLoading(false)
    }
  }

  // ✅ UPDATED: Fetch medical records from backend API with better debugging
  const fetchMedicalRecords = async () => {
    if (!authUser) {
      console.log('❌ No auth user in fetchMedicalRecords');
      return;
    }
    
    try {
      setMedicalRecordsLoading(true);
      console.log("🔄 Fetching medical records from API for patient:", authUser.id);
      
      const token = localStorage.getItem('authToken') || localStorage.getItem('token');
      
      if (!token) {
        console.log('❌ No token found');
        throw new Error('No authentication token found');
      }

      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      const apiUrl = `${API_BASE_URL}/medical_records/patient/${authUser.id}`;
      console.log('🌐 Making request to:', apiUrl);

      const response = await fetch(apiUrl, { headers });
      
      console.log('📥 Response status:', response.status);
      console.log('📥 Response OK:', response.ok);
      
      if (response.ok) {
        const recordsData = await response.json();
        console.log("📦 FULL API RESPONSE:", recordsData);
        
        // ✅ ADDED: Better response structure checking
        if (recordsData && recordsData.success !== false) {
          const records = recordsData.records || recordsData;
          
          if (Array.isArray(records) && records.length > 0) {
            console.log(`✅ Setting ${records.length} medical records`);
            setMedicalRecords(records);
            
            const recentResults = records
              .slice(0, 3)
              .map(record => ({
                id: record.id,
                test: `${record.record_type} - ${record.diagnosis}`,
                date: record.record_date,
                status: "completed",
                doctor: record.doctor_name,
                results: record.treatment,
                downloadUrl: "#",
              }));
            
            setRecentResults(recentResults);
          } else {
            console.log('ℹ️ No records array found or empty array');
            setMedicalRecords([]);
            setRecentResults([]);
          }
        } else {
          console.log('❌ API returned success: false or invalid response');
          setMedicalRecords([]);
          setRecentResults([]);
        }
      } else {
        console.log("❌ API request failed");
        const errorText = await response.text();
        console.log("❌ Error response:", errorText);
        setMedicalRecords([]);
        setRecentResults([]);
      }
      
    } catch (error) {
      console.error("❌ Failed to fetch medical records:", error);
      setMedicalRecords([]);
      setRecentResults([]);
    } finally {
      setMedicalRecordsLoading(false);
    }
  };

  // ✅ ADDED: Fetch available doctors count
  const fetchAvailableDoctorsCount = async () => {
    try {
      const token = localStorage.getItem('authToken') || localStorage.getItem('token');
      
      const response = await fetch(`${API_BASE_URL}/patients/available-doctors/count`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setAvailableDoctorsCount(data.available_doctors || 0);
        console.log(`✅ Available doctors count: ${data.available_doctors}`);
      } else {
        console.error('❌ Failed to fetch doctors count:', response.status);
        setAvailableDoctorsCount(0);
      }
    } catch (error) {
      console.error('❌ Error fetching doctors count:', error);
      setAvailableDoctorsCount(0);
    }
  };

  // ✅ ADDED: Fetch available doctors list
  const fetchAvailableDoctors = async () => {
    try {
      setDoctorsLoading(true);
      const token = localStorage.getItem('authToken') || localStorage.getItem('token');
      
      const response = await fetch(`${API_BASE_URL}/patients/available-doctors`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setAvailableDoctors(data.available_doctors || []);
        console.log(`✅ Loaded ${data.available_doctors.length} available doctors`);
      } else {
        console.error('❌ Failed to fetch doctors list:', response.status);
        setAvailableDoctors([]);
      }
    } catch (error) {
      console.error('❌ Error fetching doctors list:', error);
      setAvailableDoctors([]);
    } finally {
      setDoctorsLoading(false);
    }
  };

  // ✅ ADDED: Main data fetching function
  const fetchAllData = async () => {
    try {
      await Promise.all([
        fetchAppointments(),
        fetchPrescriptions(),
        fetchMedicalRecords(),
        fetchAvailableDoctorsCount(),
        fetchAvailableDoctors(),
      ]);
    } catch (error) {
      console.error('Error fetching patient data:', error);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, [authUser, refreshTrigger]); // ✅ Add refreshTrigger as dependency

  // ✅ ADDED: Auto-refresh available doctors every 30 seconds
  useEffect(() => {
    if (authUser?.role !== 'patient') return;

    const interval = setInterval(() => {
      fetchAvailableDoctorsCount();
      fetchAvailableDoctors();
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [authUser]);

  // Function to trigger refresh from child components
  const handleRefreshAppointments = () => {
    setRefreshTrigger(prev => prev + 1)
  }

  // ✅ Replace mock user with real user data
  const user = authUser ? {
    name: authUser.name || "Patient",
    email: authUser.email,
    phone: authUser.phone || "(555) 123-4567",
    dateOfBirth: "1985-06-15", // You can add this to your User type
    address: "123 Main St, City, State 12345", // You can add this to your User type
    emergencyContact: "Jane Doe - (555) 987-6543", // You can add this to your User type
  } : null

  const healthMetrics = [
    { label: "Blood Pressure", value: "120/80", status: "normal", icon: Heart },
    { label: "Heart Rate", value: "72 bpm", status: "normal", icon: Activity },
    { label: "Weight", value: "165 lbs", status: "normal", icon: User },
    { label: "BMI", value: "24.2", status: "normal", icon: Activity },
  ]

  // Format date for display
  const formatDate = (dateString: string) => {
    if (!dateString) return 'Not recorded'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  // ✅ Add loading state
  if (!authUser || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-2">
          <RefreshCw className="w-4 h-4 animate-spin" />
          Loading user data...
        </div>
      </div>
    )
  }

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
                  {/* ✅ Now shows the actual logged-in user's name */}
                  <h1 className="text-3xl font-bold">Welcome back, {user.name.split(" ")[0]}!</h1>
                  <p className="text-muted-foreground">Here's your health overview for today</p>
                  <div className="text-xs text-green-600 mt-1">
                    Patient ID: {authUser.id} • {upcomingAppointments.length} upcoming appointments
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Stats - UPDATED to show real counts */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Calendar className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">
                        {appointmentsLoading ? "-" : upcomingAppointments.length}
                      </p>
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
                      <p className="text-2xl font-bold">
                        {medicalRecordsLoading ? "-" : medicalRecords.length}
                      </p>
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
                      <p className="text-2xl font-bold">
                        {prescriptionsLoading ? "-" : prescriptions.length}
                      </p>
                      <p className="text-sm text-muted-foreground">Active Prescriptions</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                      <Users className="w-6 h-6 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{availableDoctorsCount}</p>
                      <p className="text-sm text-muted-foreground">Available Doctors</p>
                      <p className="text-xs text-green-600 mt-1">
                        {availableDoctorsCount > 0 ? '✅ Ready for appointments' : '❌ No doctors available'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Main Content with Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="appointments">Appointments</TabsTrigger>
                <TabsTrigger value="doctors">Available Doctors</TabsTrigger>
                <TabsTrigger value="records">Medical Records</TabsTrigger>
                <TabsTrigger value="prescriptions">Prescriptions</TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-6">
                <div className="grid lg:grid-cols-2 gap-6">
                  {/* Upcoming Appointments - UPDATED with real data and doctor names */}
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                      <div>
                        <CardTitle>Upcoming Appointments</CardTitle>
                        <CardDescription>Your next scheduled visits</CardDescription>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          onClick={handleRefreshAppointments} 
                          variant="outline" 
                          size="sm"
                          disabled={appointmentsLoading}
                        >
                          <RefreshCw className={`w-4 h-4 mr-2 ${appointmentsLoading ? 'animate-spin' : ''}`} />
                          Refresh
                        </Button>
                        <Button asChild size="sm">
                          <Link href="/appointments">
                            <Plus className="w-4 h-4 mr-2" />
                            Book New
                          </Link>
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {appointmentsLoading ? (
                        <div className="text-center py-4">
                          <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" />
                          Loading appointments...
                        </div>
                      ) : upcomingAppointments.length > 0 ? (
                        upcomingAppointments.map((appointment: any) => (
                          <div key={appointment.id} className="flex items-center gap-4 p-4 border rounded-lg">
                            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                              <Calendar className="w-6 h-6 text-primary" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-semibold">{appointment.doctor_name}</h4>
                                <Badge variant={
                                  appointment.status === "confirmed" ? "default" :
                                  appointment.status === "scheduled" ? "secondary" :
                                  appointment.status === "pending" ? "outline" : "destructive"
                                }>
                                  {appointment.status}
                                </Badge>
                              </div>
                              
                              {/* Show doctor specialization if available */}
                              {appointment.doctor_specialization && (
                                <p className="text-sm text-muted-foreground">
                                  {appointment.doctor_specialization}
                                </p>
                              )}
                              
                              {/* Show appointment department if available */}
                              {appointment.department && (
                                <p className="text-sm text-muted-foreground">
                                  {appointment.department}
                                </p>
                              )}
                              
                              <div className="flex items-center gap-4 text-xs text-muted-foreground mt-2">
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  {appointment.appointment_date ? 
                                    (() => {
                                      // Handle both DD/MM/YYYY and YYYY-MM-DD formats
                                      if (appointment.appointment_date.includes('/')) {
                                        const [day, month, year] = appointment.appointment_date.split('/');
                                        return new Date(parseInt(year), parseInt(month) - 1, parseInt(day)).toLocaleDateString();
                                      } else {
                                        return new Date(appointment.appointment_date).toLocaleDateString();
                                      }
                                    })() : 
                                    "Date not set"
                                  }
                                </span>
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {appointment.appointment_time ? 
                                    (() => {
                                      // Convert 24-hour to 12-hour format
                                      const [hours, minutes] = appointment.appointment_time.split(':');
                                      const hour = parseInt(hours);
                                      const ampm = hour >= 12 ? 'PM' : 'AM';
                                      const displayHour = hour % 12 || 12;
                                      return `${displayHour}:${minutes} ${ampm}`;
                                    })() : 
                                    "Time not set"
                                  }
                                </span>
                              </div>
                              {appointment.reason && (
                                <p className="text-xs text-muted-foreground mt-1">
                                  Reason: {appointment.reason}
                                </p>
                              )}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8 text-muted-foreground">
                          <Calendar className="w-12 h-12 mx-auto mb-2 opacity-50" />
                          <p>No upcoming appointments</p>
                          <Button asChild variant="outline" className="mt-2">
                            <Link href="/appointments">
                              <Plus className="w-4 h-4 mr-2" />
                              Book Your First Appointment
                            </Link>
                          </Button>
                        </div>
                      )}
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
                    <CardDescription>Your latest consultations and treatments</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {medicalRecordsLoading ? (
                      <div className="text-center py-4">
                        <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" />
                        <p>Loading medical records...</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {medicalRecords.slice(0, 3).map((record) => (
                          <div key={record.id} className="flex items-center gap-4 p-4 border rounded-lg">
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                              <FileText className="w-5 h-5 text-blue-600" />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-semibold">{record.record_type}</h4>
                              <p className="text-sm text-muted-foreground">by {record.doctor_name}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-medium">{formatDate(record.record_date)}</p>
                              <Badge variant={record.record_type === "Consultation" ? "default" : "secondary"}>
                                {record.record_type}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Appointments Tab */}
              <TabsContent value="appointments" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>All Appointments</CardTitle>
                    <CardDescription>Manage your scheduled visits</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-center mb-4">
                      <Button asChild>
                        <Link href="/appointments">
                          <Plus className="w-4 h-4 mr-2" />
                          Book New Appointment
                        </Link>
                      </Button>
                      <Button 
                        onClick={handleRefreshAppointments} 
                        variant="outline"
                        disabled={appointmentsLoading}
                      >
                        <RefreshCw className={`w-4 h-4 mr-2 ${appointmentsLoading ? 'animate-spin' : ''}`} />
                        Refresh
                      </Button>
                    </div>
                    
                    {appointmentsLoading ? (
                      <div className="text-center py-8">
                        <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4" />
                        <p>Loading appointments...</p>
                      </div>
                    ) : upcomingAppointments.length > 0 ? (
                      <div className="space-y-4">
                        {upcomingAppointments.map((appointment: any) => (
                          <Card key={appointment.id}>
                            <CardContent className="p-4">
                              <div className="flex justify-between items-start">
                                <div className="space-y-2">
                                  <div className="flex items-center gap-2">
                                    <User className="w-4 h-4" />
                                    <span className="font-medium">
                                      {appointment.doctor_name}
                                    </span>
                                  </div>
                                  {appointment.doctor_specialization && (
                                    <p className="text-sm text-muted-foreground">
                                      {appointment.doctor_specialization}
                                    </p>
                                  )}
                                  <div className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4" />
                                    <span>
                                      {appointment.appointment_date ? 
                                        (() => {
                                          if (appointment.appointment_date.includes('/')) {
                                            const [day, month, year] = appointment.appointment_date.split('/');
                                            return new Date(parseInt(year), parseInt(month) - 1, parseInt(day)).toLocaleDateString();
                                          } else {
                                            return new Date(appointment.appointment_date).toLocaleDateString();
                                          }
                                        })() : 
                                        "Date not set"
                                      }
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Clock className="w-4 h-4" />
                                    <span>
                                      {appointment.appointment_time ? 
                                        (() => {
                                          const [hours, minutes] = appointment.appointment_time.split(':');
                                          const hour = parseInt(hours);
                                          const ampm = hour >= 12 ? 'PM' : 'AM';
                                          const displayHour = hour % 12 || 12;
                                          return `${displayHour}:${minutes} ${ampm}`;
                                        })() : 
                                        "Time not set"
                                      }
                                    </span>
                                  </div>
                                  <p className="text-sm text-muted-foreground">
                                    {appointment.reason || "No reason provided"}
                                  </p>
                                </div>
                                <Badge variant={
                                  appointment.status === "scheduled" ? "default" :
                                  appointment.status === "confirmed" ? "secondary" : "outline"
                                }>
                                  {appointment.status}
                                </Badge>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>No upcoming appointments</p>
                        <Button asChild variant="outline" className="mt-2">
                          <Link href="/appointments">
                            <Plus className="w-4 h-4 mr-2" />
                            Book Your First Appointment
                          </Link>
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* ✅ ADDED: Available Doctors Tab */}
              <TabsContent value="doctors" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Available Doctors</CardTitle>
                    <CardDescription>
                      Browse and book appointments with available doctors
                    </CardDescription>
                    <div className="flex justify-between items-center">
                      <div className="text-sm text-muted-foreground">
                        {availableDoctorsCount} doctors available for appointments
                      </div>
                      <Button 
                        onClick={() => {
                          fetchAvailableDoctorsCount();
                          fetchAvailableDoctors();
                        }} 
                        variant="outline" 
                        size="sm"
                        disabled={doctorsLoading}
                      >
                        <RefreshCw className={`w-4 h-4 mr-2 ${doctorsLoading ? 'animate-spin' : ''}`} />
                        Refresh
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {doctorsLoading ? (
                      <div className="text-center py-8">
                        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
                        <p>Loading available doctors...</p>
                      </div>
                    ) : availableDoctors.length > 0 ? (
                      <div className="space-y-4">
                        {availableDoctors.map((doctor) => (
                          <div key={doctor.doctor_id} className="flex items-center justify-between p-4 border rounded-lg">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                                <Stethoscope className="w-6 h-6 text-blue-600" />
                              </div>
                              <div>
                                <h3 className="font-semibold">Dr. {doctor.first_name} {doctor.last_name}</h3>
                                <p className="text-sm text-muted-foreground">{doctor.specialization}</p>
                                <div className="flex gap-4 text-xs text-muted-foreground mt-1">
                                  <span>Experience: {doctor.experience_years} years</span>
                                  <span>Fee: ${doctor.consultation_fee}</span>
                                  {doctor.bio && (
                                    <span className="max-w-xs truncate">{doctor.bio}</span>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Badge variant="default" className="bg-green-100 text-green-800">
                                Available
                              </Badge>
                              <Button size="sm" asChild>
                                <Link href={`/appointments?doctor=${doctor.doctor_id}`}>
                                  Book Appointment
                                </Link>
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>No doctors available at the moment.</p>
                        <p className="text-sm">Please check back later.</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Medical Records Tab - UPDATED with real API data */}
              <TabsContent value="records" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Medical Records</CardTitle>
                    <CardDescription>Your complete medical history and consultations</CardDescription>
                    <div className="flex justify-end">
                      <Button 
                        onClick={fetchMedicalRecords} 
                        variant="outline" 
                        size="sm"
                        disabled={medicalRecordsLoading}
                      >
                        <RefreshCw className={`w-4 h-4 mr-2 ${medicalRecordsLoading ? 'animate-spin' : ''}`} />
                        Refresh Records
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {medicalRecordsLoading ? (
                      <div className="text-center py-8">
                        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
                        <p>Loading medical records...</p>
                      </div>
                    ) : medicalRecords.length > 0 ? (
                      <div className="space-y-6">
                        {/* Summary Section */}
                        <div className="border rounded-lg p-4">
                          <h3 className="text-lg font-semibold mb-3">Health Summary</h3>
                          <div className="grid md:grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm font-medium">Current Conditions</p>
                              <ul className="text-sm text-muted-foreground mt-1">
                                {medicalRecords
                                  .filter(record => record.diagnosis && !record.diagnosis.includes('Vaccination'))
                                  .slice(0, 3)
                                  .map((record, index) => (
                                    <li key={index}>• {record.diagnosis}</li>
                                  ))
                                }
                                {medicalRecords.filter(record => record.diagnosis && !record.diagnosis.includes('Vaccination')).length === 0 && (
                                  <li>No current conditions recorded</li>
                                )}
                              </ul>
                            </div>
                            <div>
                              <p className="text-sm font-medium">Recent Activity</p>
                              <ul className="text-sm text-muted-foreground mt-1">
                                {medicalRecords.slice(0, 3).map((record, index) => (
                                  <li key={index}>• {record.record_type} ({formatDate(record.record_date)})</li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </div>

                        {/* Medical History */}
                        <div>
                          <h3 className="text-lg font-semibold mb-4">Medical History</h3>
                          <div className="space-y-4">
                            {medicalRecords.map((record) => (
                              <Card key={record.id}>
                                <CardContent className="p-4">
                                  <div className="flex justify-between items-start mb-3">
                                    <div>
                                      <h4 className="font-semibold">{record.record_type}</h4>
                                      <p className="text-sm text-muted-foreground">
                                        {formatDate(record.record_date)} • {record.doctor_name}
                                        {record.doctor_specialization && ` • ${record.doctor_specialization}`}
                                      </p>
                                    </div>
                                    <Badge variant={
                                      record.record_type === "Consultation" ? "default" :
                                      record.record_type === "Follow-up" ? "secondary" : "outline"
                                    }>
                                      {record.record_type}
                                    </Badge>
                                  </div>
                                  
                                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                                    <div>
                                      <p className="font-medium mb-1">Diagnosis</p>
                                      <p className="text-muted-foreground">{record.diagnosis}</p>
                                    </div>
                                    <div>
                                      <p className="font-medium mb-1">Treatment</p>
                                      <p className="text-muted-foreground">{record.treatment}</p>
                                    </div>
                                  </div>
                                  
                                  {record.notes && (
                                    <div className="mt-3">
                                      <p className="font-medium mb-1 text-sm">Notes</p>
                                      <p className="text-sm text-muted-foreground">{record.notes}</p>
                                    </div>
                                  )}
                                  
                                  {record.follow_up_date && (
                                    <div className="mt-3 pt-3 border-t">
                                      <p className="font-medium mb-1 text-sm">Follow-up</p>
                                      <p className="text-sm text-muted-foreground">
                                        Scheduled for {formatDate(record.follow_up_date)}
                                      </p>
                                    </div>
                                  )}
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        </div>

                        {/* Test Results */}
                        <div>
                          <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
                          <div className="space-y-3">
                            {recentResults.map((result) => (
                              <div key={result.id} className="flex items-center justify-between p-4 border rounded-lg">
                                <div className="flex items-center gap-4">
                                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                                    result.status === "completed" ? "bg-green-100" : "bg-yellow-100"
                                  }`}>
                                    <FileText className={`w-5 h-5 ${
                                      result.status === "completed" ? "text-green-600" : "text-yellow-600"
                                    }`} />
                                  </div>
                                  <div>
                                    <h4 className="font-semibold">{result.test}</h4>
                                    <p className="text-sm text-muted-foreground">
                                      {formatDate(result.date)} • {result.doctor}
                                    </p>
                                    <p className="text-sm">{result.results}</p>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <Badge variant={
                                    result.status === "completed" ? "default" : "secondary"
                                  }>
                                    {result.status}
                                  </Badge>
                                  {result.downloadUrl && (
                                    <Button size="sm" variant="outline" className="mt-2">
                                      <Download className="w-4 h-4 mr-2" />
                                      Download
                                    </Button>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <h3 className="text-lg font-medium mb-2">No medical records found</h3>
                        <p>Your medical records will appear here after your first consultation.</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Prescriptions Tab - UPDATED with real data fetching */}
              <TabsContent value="prescriptions" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Pill className="w-5 h-5" />
                      Your Prescriptions
                    </CardTitle>
                    <CardDescription>All your current and past prescriptions</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {prescriptionsLoading ? (
                      <div className="text-center py-8">
                        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
                        <p>Loading prescriptions...</p>
                      </div>
                    ) : prescriptions.length > 0 ? (
                      <div className="space-y-4">
                        {prescriptions.map((prescription) => (
                          <Card key={prescription.prescription_id} className="p-4">
                            <div className="flex justify-between items-start mb-3">
                              <div>
                                <h4 className="font-semibold text-lg">
                                  {prescription.medication || prescription.medications?.[0]?.drug_name}
                                </h4>
                                <p className="text-sm text-muted-foreground">
                                  Prescribed by {prescription.prescribedBy}
                                </p>
                              </div>
                              <div className="text-right">
                                <Badge variant={
                                  prescription.status === "active" ? "default" :
                                  prescription.status === "completed" ? "secondary" : "outline"
                                }>
                                  {prescription.status}
                                </Badge>
                                <p className="text-sm text-muted-foreground mt-1">
                                  {formatDate(prescription.date_issued)}
                                </p>
                              </div>
                            </div>
                            
                            <div className="grid md:grid-cols-2 gap-4 mb-3">
                              <div>
                                <p className="text-sm font-medium mb-1">Dosage & Instructions</p>
                                <p className="text-sm">
                                  {prescription.dosage || prescription.medications?.[0]?.dosage}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {prescription.instructions || prescription.medications?.[0]?.instructions}
                                </p>
                              </div>
                              <div>
                                <p className="text-sm font-medium mb-1">Details</p>
                                <div className="text-sm space-y-1">
                                  <p>Duration: {prescription.medications?.[0]?.duration || "As prescribed"}</p>
                                  <p>Refills: {prescription.refillsLeft || 0} remaining</p>
                                  {prescription.diagnosis && (
                                    <p>Diagnosis: {prescription.diagnosis}</p>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Show all medications if available */}
                            {prescription.medications && prescription.medications.length > 0 && (
                              <div className="mb-3">
                                <p className="text-sm font-medium mb-2">Medications:</p>
                                <div className="space-y-2">
                                  {prescription.medications.map((med, index) => (
                                    <div key={index} className="text-sm p-2 bg-gray-50 rounded">
                                      <div className="flex justify-between">
                                        <span className="font-medium">{med.drug_name}</span>
                                        <span className="text-muted-foreground">
                                          {med.dosage} • {med.duration}
                                        </span>
                                      </div>
                                      {med.instructions && (
                                        <p className="text-xs text-muted-foreground mt-1">
                                          {med.instructions}
                                        </p>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            <div className="flex gap-2">
                              <Button size="sm" variant="outline">
                                <Download className="w-4 h-4 mr-2" />
                                Download
                              </Button>
                              <Button size="sm" variant="outline">
                                <MessageSquare className="w-4 h-4 mr-2" />
                                Request Refill
                              </Button>
                              <Button size="sm" variant="outline">
                                <Eye className="w-4 h-4 mr-2" />
                                View Details
                              </Button>
                            </div>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <Pill className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <h3 className="text-lg font-medium mb-2">No prescriptions found</h3>
                        <p>You don't have any prescriptions yet.</p>
                      </div>
                    )}
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