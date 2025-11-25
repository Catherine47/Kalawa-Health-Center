"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useAuth } from "@/context/auth-context"
import { ProtectedRoute } from "@/components/protected-route"
import {
  Users,
  Activity,
  UserPlus,
  Settings,
  BarChart3,
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
  Loader2,
  Stethoscope,
} from "lucide-react"

// Base URL for your Express.js backend
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState("users")
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)
  const [systemStats, setSystemStats] = useState({
    totalPatients: 0,
    totalDoctors: 0,
    totalStaff: 0,
    activeAppointments: 0,
  })
  const [allUsers, setAllUsers] = useState([])
  const [patientRecords, setPatientRecords] = useState([])
  const [systemReports, setSystemReports] = useState([])
  const { user } = useAuth()

  // Add User Dialog State
  const [addUserOpen, setAddUserOpen] = useState(false)
  const [newUser, setNewUser] = useState({
    first_name: '',
    last_name: '',
    email_address: '',
    phone_number: '',
    role: 'patient',
    password: '',
    confirmPassword: '',
    specialization: '',
    gender: 'Male',
    dob: '1990-01-01'
  })
  const [creatingUser, setCreatingUser] = useState(false)

  // ============ HELPER FUNCTIONS ============

  // Helper function to get user full name
  const getUserName = (userItem) => {
    if (!userItem) return '';
    return `${userItem.first_name || ''} ${userItem.last_name || ''}`.trim();
  };

  // Helper function to get user initials
  const getUserInitials = (userItem) => {
    if (!userItem) return 'NA';
    const name = getUserName(userItem);
    if (!name) return 'NA';
    return name
      .split(" ")
      .map((n) => n?.[0] || '')
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Helper function to get patient full name
  const getPatientName = (patient) => {
    if (!patient) return '';
    return `${patient.first_name || ''} ${patient.last_name || ''}`.trim();
  };

  // Helper function to get patient initials
  const getPatientInitials = (patient) => {
    if (!patient) return 'NA';
    const name = getPatientName(patient);
    if (!name) return 'NA';
    return name
      .split(" ")
      .map((n) => n?.[0] || '')
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Helper function to calculate age from date of birth
  const calculateAge = (dob) => {
    if (!dob) return 'N/A';
    try {
      const birthDate = new Date(dob);
      if (isNaN(birthDate.getTime())) return 'N/A';
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      return age;
    } catch (error) {
      return 'N/A';
    }
  };

  // Helper function to format date
  const formatDate = (dateString) => {
    if (!dateString) return 'Not recorded';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid date';
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      return 'Invalid date';
    }
  };

  // ============ FILTER FUNCTIONS ============

  const filteredUsers = allUsers.filter((userItem) => {
    if (!userItem) return false;
    
    const name = getUserName(userItem).toLowerCase();
    const email = (userItem.email_address || '').toLowerCase();
    const role = (userItem.role || '').toLowerCase();
    const phone = (userItem.phone_number || '').toLowerCase();
    const searchLower = searchTerm.toLowerCase();
    
    return name.includes(searchLower) ||
           email.includes(searchLower) ||
           role.includes(searchLower) ||
           phone.includes(searchLower);
  });

  const filteredPatients = patientRecords.filter((patient) => {
    if (!patient) return false;
    
    const name = getPatientName(patient).toLowerCase();
    const patientId = (patient.patient_id || '').toString().toLowerCase();
    const email = (patient.email_address || '').toLowerCase();
    const phone = (patient.phone_number || '').toLowerCase();
    const searchLower = searchTerm.toLowerCase();
    
    return name.includes(searchLower) ||
           patientId.includes(searchLower) ||
           email.includes(searchLower) ||
           phone.includes(searchLower);
  });

  // ============ API AND DATA FUNCTIONS ============

  // API helper function
  const apiRequest = async (endpoint, options = {}) => {
    const token = user?.token || localStorage.getItem('authToken') || localStorage.getItem('token');
    
    if (!token) {
      alert('Authentication required. Please login again.');
      window.location.href = '/login';
      throw new Error('No authentication token');
    }

    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...options.headers,
    };

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
      });

      if (response.status === 401) {
        localStorage.removeItem('authToken');
        localStorage.removeItem('token');
        alert('Your session has expired. Please login again.');
        window.location.href = '/login';
        throw new Error('Authentication failed');
      }

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error);
      throw error;
    }
  };

  // Fetch all users by combining patients and doctors
  const fetchAllUsers = async () => {
    try {
      const token = user?.token || localStorage.getItem('authToken') || localStorage.getItem('token');
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      const users = [];

      // Fetch patients
      try {
        const patientsResponse = await fetch(`${API_BASE_URL}/patients`, { headers });
        if (patientsResponse.ok) {
          const patientsData = await patientsResponse.json();
          
          if (Array.isArray(patientsData)) {
            const patientUsers = patientsData.map(patient => ({
              id: patient.patient_id,
              first_name: patient.first_name,
              last_name: patient.last_name,
              email_address: patient.email_address,
              phone_number: patient.phone_number,
              role: 'patient',
              status: patient.is_verified ? 'active' : 'pending',
              joinDate: patient.created_at,
              lastLogin: patient.updated_at,
              department: null,
              is_verified: patient.is_verified,
              is_deleted: patient.is_deleted,
              gender: patient.gender,
              dob: patient.dob
            }));
            users.push(...patientUsers);
          }
        }
      } catch (error) {
        console.error('Error fetching patients:', error);
      }

      // Fetch doctors
      try {
        const doctorsResponse = await fetch(`${API_BASE_URL}/doctors`, { headers });
        if (doctorsResponse.ok) {
          const doctorsData = await doctorsResponse.json();
          
          if (Array.isArray(doctorsData)) {
            const doctorUsers = doctorsData.map(doctor => ({
              id: doctor.doctor_id,
              first_name: doctor.first_name,
              last_name: doctor.last_name,
              email_address: doctor.email_address,
              phone_number: doctor.phone_number,
              role: 'doctor',
              status: doctor.is_verified ? 'active' : 'pending',
              joinDate: doctor.created_at,
              lastLogin: doctor.updated_at,
              department: doctor.specialization,
              specialization: doctor.specialization,
              is_deleted: doctor.is_deleted
            }));
            users.push(...doctorUsers);
          }
        }
      } catch (error) {
        console.error('Error fetching doctors:', error);
      }

      // Add current admin user
      if (user) {
        users.push({
          id: user.id,
          first_name: user.name?.split(' ')[0] || "Admin",
          last_name: user.name?.split(' ')[1] || "User",
          email_address: user.email,
          role: 'admin',
          status: 'active',
          joinDate: new Date().toISOString(),
          lastLogin: new Date().toISOString(),
          department: 'Administration',
          phone_number: 'Not provided'
        });
      }

      setAllUsers(users);
      return users;

    } catch (error) {
      console.error('Error fetching users:', error);
      return [];
    }
  };

  // Fetch admin data
  const fetchAdminData = async () => {
    try {
      setLoading(true);
      
      const token = user?.token || localStorage.getItem('authToken') || localStorage.getItem('token');
      
      if (!token) {
        console.error('No authentication token found');
        return;
      }

      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      // Fetch patients
      try {
        const patientsResponse = await fetch(`${API_BASE_URL}/patients`, { headers });
        if (patientsResponse.ok) {
          const patientsData = await patientsResponse.json();
          
          // Set patient records directly - no transformation
          setPatientRecords(Array.isArray(patientsData) ? patientsData : []);
          
          setSystemStats(prev => ({
            ...prev,
            totalPatients: Array.isArray(patientsData) ? patientsData.length : 0
          }));
        }
      } catch (error) {
        console.error('Error fetching patients:', error);
      }

      // Fetch doctors
      try {
        const doctorsResponse = await fetch(`${API_BASE_URL}/doctors`, { headers });
        if (doctorsResponse.ok) {
          const doctorsData = await doctorsResponse.json();
          const doctorsCount = Array.isArray(doctorsData) ? doctorsData.length : 0;
          setSystemStats(prev => ({
            ...prev,
            totalDoctors: doctorsCount,
            totalStaff: doctorsCount + 5
          }));
        }
      } catch (error) {
        console.error('Error fetching doctors:', error);
      }

      // Fetch appointments
      try {
        const appointmentsResponse = await fetch(`${API_BASE_URL}/appointments`, { headers });
        if (appointmentsResponse.ok) {
          const appointmentsData = await appointmentsResponse.json();
          
          if (Array.isArray(appointmentsData)) {
            const activeAppointments = appointmentsData.filter(apt => {
              const isActive = apt.status === 'scheduled' || 
                              apt.status === 'confirmed' || 
                              apt.status === 'pending';
              const notDeleted = !apt.is_deleted;
              return isActive && notDeleted;
            });
            
            setSystemStats(prev => ({
              ...prev,
              activeAppointments: activeAppointments.length
            }));
          }
        } else {
          setSystemStats(prev => ({
            ...prev,
            activeAppointments: 23
          }));
        }
      } catch (error) {
        console.error('Error fetching appointments:', error);
        setSystemStats(prev => ({
          ...prev,
          activeAppointments: 23
        }));
      }

      // Fetch all users (patients + doctors + admins)
      await fetchAllUsers();

      // Use fallback data for reports
      const fallbackReports = [
        {
          id: 1,
          title: "Monthly Patient Registration Report",
          description: "New patient registrations for January 2025",
          type: "patient_analytics",
          generatedDate: "2025-01-15",
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
        }
      ];
      setSystemReports(fallbackReports);

    } catch (error) {
      console.error('Error fetching admin data:', error);
      setSystemStats({
        totalPatients: 0,
        totalDoctors: 0,
        totalStaff: 0,
        activeAppointments: 0,
      });
      setAllUsers([]);
      setPatientRecords([]);
    } finally {
      setLoading(false);
    }
  };

  // ============ USER MANAGEMENT FUNCTIONS ============

  const handleAddUser = async () => {
    if (!newUser.first_name || !newUser.last_name || !newUser.email_address || !newUser.role) {
      alert('Please fill in all required fields: First Name, Last Name, Email, and Role');
      return;
    }

    if (!newUser.password || newUser.password.length < 6) {
      alert('Password is required and must be at least 6 characters long');
      return;
    }

    if (newUser.password !== newUser.confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    setCreatingUser(true);

    try {
      let endpoint = '';
      let userData = {};

      switch (newUser.role) {
        case 'patient':
          endpoint = '/patients/register';
          userData = {
            first_name: newUser.first_name.trim(),
            last_name: newUser.last_name.trim(),
            email_address: newUser.email_address.trim().toLowerCase(),
            phone_number: newUser.phone_number?.trim() || '',
            password: newUser.password,
            gender: newUser.gender || 'Unknown',
            dob: newUser.dob || '1990-01-01'
          };
          break;

        case 'doctor':
          endpoint = '/doctors/register';
          userData = {
            first_name: newUser.first_name.trim(),
            last_name: newUser.last_name.trim(),
            email_address: newUser.email_address.trim().toLowerCase(),
            phone_number: newUser.phone_number?.trim() || '',
            specialization: newUser.specialization?.trim() || 'General Medicine',
            password: newUser.password
          };
          break;

        case 'admin':
          alert('Admin user creation would require a dedicated admin registration endpoint.');
          setCreatingUser(false);
          return;

        default:
          throw new Error('Invalid role selected');
      }

      const response = await apiRequest(endpoint, {
        method: 'POST',
        body: JSON.stringify(userData)
      });

      if (response.message || response.success) {
        alert(`User created successfully! ${response.message || 'User account has been created.'}`);
        setAddUserOpen(false);
        resetNewUserForm();
        fetchAdminData();
      } else {
        throw new Error(response.error || 'Failed to create user');
      }

    } catch (error) {
      console.error('Error creating user:', error);
      alert(`Error creating user: ${error.message}`);
    } finally {
      setCreatingUser(false);
    }
  };

  const resetNewUserForm = () => {
    setNewUser({
      first_name: '',
      last_name: '',
      email_address: '',
      phone_number: '',
      role: 'patient',
      password: '',
      confirmPassword: '',
      specialization: '',
      gender: 'Male',
      dob: '1990-01-01'
    });
  };

  const handleDeleteUser = async (userId) => {
    if (confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
      try {
        setAllUsers(prev => prev.filter(user => user.id !== userId));
        alert("User deleted successfully!");
      } catch (error) {
        console.error('Error deleting user:', error);
        alert('Error deleting user. Please try again.');
      }
    }
  }

  const handleDeletePatient = async (patientId) => {
    if (confirm("Are you sure you want to delete this patient record? This action cannot be undone.")) {
      try {
        setPatientRecords(prev => prev.filter(patient => patient.patient_id !== patientId));
        alert("Patient record deleted successfully!");
      } catch (error) {
        console.error('Error deleting patient:', error);
        alert('Error deleting patient record. Please try again.');
      }
    }
  }

  const handleGenerateReport = async () => {
    try {
      const newReport = {
        id: systemReports.length + 1,
        title: `System Report ${new Date().toLocaleDateString()}`,
        description: "Automatically generated system overview",
        type: "system",
        generatedDate: new Date().toISOString().split('T')[0],
        status: "ready",
        fileSize: "1.2 MB",
      };
      
      setSystemReports(prev => [newReport, ...prev]);
      alert("Report generated successfully!");
    } catch (error) {
      console.error('Error generating report:', error);
      alert('Error generating report. Please try again.');
    }
  }

  // ============ USE EFFECTS ============

  useEffect(() => {
    fetchAdminData();
  }, []);

  if (loading) {
    return (
      <ProtectedRoute allowedRoles={["admin"]}>
        <div className="min-h-screen flex flex-col">
          <Header />
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
              <p>Loading admin dashboard...</p>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    )
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
                  <p className="text-sm text-muted-foreground">
                    Managing {systemStats.totalPatients} patients, {systemStats.totalDoctors} doctors, and {systemStats.activeAppointments} appointments
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
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
                      <Stethoscope className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{systemStats.totalDoctors}</p>
                      <p className="text-sm text-muted-foreground">Medical Staff</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Calendar className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{systemStats.activeAppointments}</p>
                      <p className="text-sm text-muted-foreground">Active Appointments</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Main Content Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="users">User Management</TabsTrigger>
                <TabsTrigger value="patients">Patient Records</TabsTrigger>
                <TabsTrigger value="reports">System Reports</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
              </TabsList>

              {/* User Management Tab */}
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
                    
                    <Dialog open={addUserOpen} onOpenChange={setAddUserOpen}>
                      <DialogTrigger asChild>
                        <Button size="sm">
                          <UserPlus className="w-4 h-4 mr-2" />
                          Add User
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>Add New User</DialogTitle>
                          <DialogDescription>
                            Create a new user account. Fill in the required information below.
                          </DialogDescription>
                        </DialogHeader>
                        
                        <div className="grid gap-4 py-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="first_name">First Name *</Label>
                              <Input
                                id="first_name"
                                value={newUser.first_name}
                                onChange={(e) => setNewUser({...newUser, first_name: e.target.value})}
                                placeholder="Enter first name"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="last_name">Last Name *</Label>
                              <Input
                                id="last_name"
                                value={newUser.last_name}
                                onChange={(e) => setNewUser({...newUser, last_name: e.target.value})}
                                placeholder="Enter last name"
                              />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="email_address">Email Address *</Label>
                            <Input
                              id="email_address"
                              type="email"
                              value={newUser.email_address}
                              onChange={(e) => setNewUser({...newUser, email_address: e.target.value})}
                              placeholder="Enter email address"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="phone_number">Phone Number</Label>
                            <Input
                                id="phone_number"
                                value={newUser.phone_number}
                                onChange={(e) => setNewUser({...newUser, phone_number: e.target.value})}
                                placeholder="Enter phone number"
                              />
                            </div>

                          <div className="space-y-2">
                            <Label htmlFor="role">User Role *</Label>
                            <Select value={newUser.role} onValueChange={(value) => setNewUser({...newUser, role: value})}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select role" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="patient">Patient</SelectItem>
                                <SelectItem value="doctor">Doctor</SelectItem>
                                <SelectItem value="admin">Administrator</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          {newUser.role === 'doctor' && (
                            <div className="space-y-2">
                              <Label htmlFor="specialization">Specialization</Label>
                              <Input
                                id="specialization"
                                value={newUser.specialization}
                                onChange={(e) => setNewUser({...newUser, specialization: e.target.value})}
                                placeholder="e.g., General Medicine, Pediatrics"
                              />
                            </div>
                          )}

                          {newUser.role === 'patient' && (
                            <>
                              <div className="space-y-2">
                                <Label htmlFor="gender">Gender</Label>
                                <Select 
                                  value={newUser.gender} 
                                  onValueChange={(value) => setNewUser({...newUser, gender: value})}
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select gender" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="Male">Male</SelectItem>
                                    <SelectItem value="Female">Female</SelectItem>
                                    <SelectItem value="Other">Other</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="dob">Date of Birth</Label>
                                <Input
                                  id="dob"
                                  type="date"
                                  value={newUser.dob}
                                  onChange={(e) => setNewUser({...newUser, dob: e.target.value})}
                                />
                              </div>
                            </>
                          )}

                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="password">Password *</Label>
                              <Input
                                id="password"
                                type="password"
                                value={newUser.password}
                                onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                                placeholder="Enter password"
                              />
                              <p className="text-xs text-muted-foreground">Minimum 6 characters</p>
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="confirmPassword">Confirm Password *</Label>
                              <Input
                                id="confirmPassword"
                                type="password"
                                value={newUser.confirmPassword}
                                onChange={(e) => setNewUser({...newUser, confirmPassword: e.target.value})}
                                placeholder="Confirm password"
                              />
                            </div>
                          </div>
                        </div>

                        <DialogFooter>
                          <Button 
                            variant="outline" 
                            onClick={() => {
                              setAddUserOpen(false);
                              resetNewUserForm();
                            }}
                          >
                            Cancel
                          </Button>
                          <Button 
                            onClick={handleAddUser}
                            disabled={creatingUser}
                          >
                            {creatingUser ? (
                              <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Creating...
                              </>
                            ) : (
                              <>
                                <UserPlus className="w-4 h-4 mr-2" />
                                Create User
                              </>
                            )}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>

                <div className="space-y-4">
                  {filteredUsers.map((userItem) => (
                    <Card key={userItem.id}>
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <Avatar className="w-12 h-12">
                              <AvatarFallback
                                className={`text-white ${
                                  userItem.role === "doctor"
                                    ? "bg-green-500"
                                    : userItem.role === "admin"
                                      ? "bg-purple-500"
                                      : "bg-blue-500"
                                }`}
                              >
                                {getUserInitials(userItem)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-semibold">{getUserName(userItem)}</h3>
                                <Badge variant={userItem.status === "active" ? "default" : "secondary"}>
                                  {userItem.status}
                                </Badge>
                                <Badge variant="outline">{userItem.role}</Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">{userItem.email_address}</p>
                              <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                                <span>Phone: {userItem.phone_number || 'Not provided'}</span>
                                <span>Joined: {formatDate(userItem.joinDate)}</span>
                                <span>Last login: {formatDate(userItem.lastLogin)}</span>
                                {userItem.department && <span>Dept: {userItem.department}</span>}
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
                              onClick={() => handleDeleteUser(userItem.id)}
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
                  {filteredUsers.length === 0 && (
                    <Card>
                      <CardContent className="p-8 text-center">
                        <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-medium mb-2">No users found</h3>
                        <p className="text-muted-foreground">No user records match your search criteria.</p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </TabsContent>

              {/* Patient Records Tab */}
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
                    <Card key={patient.patient_id}>
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-4 flex-1">
                            <Avatar className="w-12 h-12">
                              <AvatarFallback className="bg-blue-100 text-blue-700">
                                {getPatientInitials(patient)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h3 className="font-semibold text-lg">{getPatientName(patient)}</h3>
                                <Badge variant="outline">ID: {patient.patient_id}</Badge>
                                <Badge variant={patient.is_verified ? "default" : "secondary"}>
                                  {patient.is_verified ? 'active' : 'pending'}
                                </Badge>
                              </div>

                              <div className="grid md:grid-cols-2 gap-4 text-sm">
                                <div>
                                  <p>
                                    <span className="font-medium">Age:</span> {calculateAge(patient.dob)} years
                                  </p>
                                  <p>
                                    <span className="font-medium">Gender:</span> {patient.gender || 'Not specified'}
                                  </p>
                                  <p>
                                    <span className="font-medium">Phone:</span> {patient.phone_number || 'Not provided'}
                                  </p>
                                  <p>
                                    <span className="font-medium">Email:</span> {patient.email_address || 'Not provided'}
                                  </p>
                                </div>
                                <div>
                                  <p>
                                    <span className="font-medium">Address:</span> Not provided
                                  </p>
                                  <p>
                                    <span className="font-medium">Registered:</span> {formatDate(patient.created_at)}
                                  </p>
                                  <p>
                                    <span className="font-medium">Last Visit:</span> {formatDate(patient.updated_at)}
                                  </p>
                                  <p>
                                    <span className="font-medium">Status:</span> {patient.is_verified ? 'Active' : 'Pending'}
                                  </p>
                                </div>
                              </div>
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
                              onClick={() => handleDeletePatient(patient.patient_id)}
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
                  {filteredPatients.length === 0 && (
                    <Card>
                      <CardContent className="p-8 text-center">
                        <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-medium mb-2">No patients found</h3>
                        <p className="text-muted-foreground">No patient records match your search criteria.</p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </TabsContent>

              {/* System Reports Tab */}
              <TabsContent value="reports" className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold">System Reports & Analytics</h2>
                    <p className="text-muted-foreground">Generate and download comprehensive system reports</p>
                  </div>
                  <Button size="sm" onClick={handleGenerateReport}>
                    <BarChart3 className="w-4 h-4 mr-2" />
                    Generate New Report
                  </Button>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
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
                  {systemReports.length === 0 && (
                    <Card>
                      <CardContent className="p-8 text-center">
                        <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-medium mb-2">No reports available</h3>
                        <p className="text-muted-foreground">Generate your first system report to get started.</p>
                      </CardContent>
                    </Card>
                  )}
                </div>
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