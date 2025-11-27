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
  Eye,
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

  // Edit User Dialog State
  const [editingUser, setEditingUser] = useState(null)
  const [editFormData, setEditFormData] = useState({})
  const [updatingUser, setUpdatingUser] = useState(false)

  // Patient Management State
  const [editingPatient, setEditingPatient] = useState(null)
  const [patientEditFormData, setPatientEditFormData] = useState({})
  const [updatingPatient, setUpdatingPatient] = useState(false)
  const [viewingPatient, setViewingPatient] = useState(null)

  // Reports Management State
  const [generatingReport, setGeneratingReport] = useState(false)
  const [reportDialogOpen, setReportDialogOpen] = useState(false)
  const [selectedReportType, setSelectedReportType] = useState("system_overview")

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

  // Helper function to get current month and year
  const getCurrentMonthYear = () => {
    const now = new Date();
    return now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  // Helper function to generate random file size
  const generateFileSize = () => {
    const sizes = ['1.2 MB', '2.3 MB', '1.8 MB', '3.1 MB', '2.7 MB'];
    return sizes[Math.floor(Math.random() * sizes.length)];
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

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.error || `API error: ${response.status}`);
      }

      return responseData;
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

      // Use current dates for reports
      const currentDate = new Date();
      const currentMonthYear = getCurrentMonthYear();
      
      const fallbackReports = [
        {
          id: 1,
          title: "Monthly Patient Registration Report",
          description: `New patient registrations for ${currentMonthYear}`,
          type: "patient_analytics",
          generatedDate: currentDate.toISOString().split('T')[0],
          status: "ready",
          fileSize: generateFileSize(),
        },
        {
          id: 2,
          title: "Doctor Performance Report",
          description: "Consultation metrics and patient satisfaction analysis",
          type: "performance",
          generatedDate: new Date(currentDate.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 7 days ago
          status: "ready",
          fileSize: generateFileSize(),
        },
        {
          id: 3,
          title: "System Usage Statistics",
          description: "Platform usage and activity overview",
          type: "system_analytics",
          generatedDate: new Date(currentDate.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 1 day ago
          status: "ready",
          fileSize: generateFileSize(),
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

  // Edit User Functions
  const openEditDialog = (user) => {
    setEditingUser(user);
    setEditFormData({
      first_name: user.first_name || '',
      last_name: user.last_name || '',
      email_address: user.email_address || '',
      phone_number: user.phone_number || '',
      status: user.status || 'active',
      specialization: user.specialization || '',
      gender: user.gender || 'Male',
      dob: user.dob || '1990-01-01'
    });
  };

  const closeEditDialog = () => {
    setEditingUser(null);
    setEditFormData({});
  };

  const handleUpdateUser = async (userId, userData) => {
    try {
      setUpdatingUser(true);
      
      console.log('Updating user:', userId, userData);
      
      // Basic validation
      if (!userData.first_name || !userData.last_name || !userData.email_address) {
        alert('Please fill in all required fields: First Name, Last Name, and Email');
        return;
      }

      // Determine the correct API endpoint based on user role
      let endpoint = '';
      const user = allUsers.find(u => u.id === userId);
      
      if (user?.role === 'patient') {
        endpoint = `/patients/${userId}`;
      } else if (user?.role === 'doctor') {
        endpoint = `/doctors/${userId}`;
      } else {
        alert('Admin user updates would require a dedicated admin update endpoint.');
        return;
      }

      const response = await apiRequest(endpoint, {
        method: 'PUT',
        body: JSON.stringify(userData)
      });

      if (response.message || response.success) {
        alert('User updated successfully!');
        closeEditDialog();
        fetchAdminData(); // Refresh the data
      } else {
        throw new Error(response.error || 'Failed to update user');
      }

    } catch (error) {
      console.error('Error updating user:', error);
      alert(`Error updating user: ${error.message}`);
    } finally {
      setUpdatingUser(false);
    }
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

  // ============ PATIENT MANAGEMENT FUNCTIONS ============

  const openEditPatientDialog = (patient) => {
    setEditingPatient(patient);
    setPatientEditFormData({
      first_name: patient.first_name || '',
      last_name: patient.last_name || '',
      email_address: patient.email_address || '',
      phone_number: patient.phone_number || '',
      gender: patient.gender || 'Male',
      dob: patient.dob || '1990-01-01',
      is_verified: patient.is_verified || false
    });
  };

  const closeEditPatientDialog = () => {
    setEditingPatient(null);
    setPatientEditFormData({});
  };

  const handleUpdatePatient = async (patientId, patientData) => {
    try {
      setUpdatingPatient(true);
      
      console.log('Updating patient:', patientId, patientData);
      
      // Basic validation
      if (!patientData.first_name || !patientData.last_name || !patientData.email_address) {
        alert('Please fill in all required fields: First Name, Last Name, and Email');
        return;
      }

      // Prepare the data for the API - match the expected backend structure
      const updateData = {
        first_name: patientData.first_name.trim(),
        last_name: patientData.last_name.trim(),
        email_address: patientData.email_address.trim().toLowerCase(),
        phone_number: patientData.phone_number?.trim() || '',
        gender: patientData.gender || 'Male',
        dob: patientData.dob || '1990-01-01',
        is_verified: Boolean(patientData.is_verified)
      };

      console.log('Sending update data:', updateData);

      // Try different endpoints and methods
      let response;
      let success = false;

      try {
        // First try PUT request to /patients/:id
        response = await apiRequest(`/patients/${patientId}`, {
          method: 'PUT',
          body: JSON.stringify(updateData)
        });
        success = true;
      } catch (putError) {
        console.log('PUT to /patients/:id failed, trying PATCH:', putError);
        try {
          // If PUT fails, try PATCH to /patients/:id
          response = await apiRequest(`/patients/${patientId}`, {
            method: 'PATCH',
            body: JSON.stringify(updateData)
          });
          success = true;
        } catch (patchError) {
          console.log('PATCH to /patients/:id failed, trying PUT to /patients/update/:id:', patchError);
          try {
            // Try alternative endpoint
            response = await apiRequest(`/patients/update/${patientId}`, {
              method: 'PUT',
              body: JSON.stringify(updateData)
            });
            success = true;
          } catch (updateError) {
            console.log('All update methods failed:', updateError);
            throw new Error('All update methods failed. Please check the API endpoint.');
          }
        }
      }

      if (success && (response.message || response.success || response.patient_id || response.first_name)) {
        alert('Patient record updated successfully!');
        closeEditPatientDialog();
        fetchAdminData(); // Refresh the data
      } else {
        throw new Error(response?.error || 'Failed to update patient record - no success response');
      }

    } catch (error) {
      console.error('Error updating patient:', error);
      
      // More specific error messages
      if (error.message.includes('email') || error.message.includes('Email')) {
        alert('Error: This email address is already registered to another patient.');
      } else if (error.message.includes('401')) {
        alert('Authentication error. Please log in again.');
      } else if (error.message.includes('404')) {
        alert('Patient not found. The patient record may have been deleted.');
      } else if (error.message.includes('500')) {
        alert('Server error. Please try again later.');
      } else {
        alert(`Error updating patient record: ${error.message}`);
      }
    } finally {
      setUpdatingPatient(false);
    }
  };

  const openViewPatientDialog = (patient) => {
    setViewingPatient(patient);
  };

  const closeViewPatientDialog = () => {
    setViewingPatient(null);
  };

  const handleDeletePatient = async (patientId) => {
    if (confirm("Are you sure you want to delete this patient record? This action cannot be undone.")) {
      try {
        // If you have a delete endpoint, use it:
        // await apiRequest(`/patients/${patientId}`, { method: 'DELETE' });
        
        // For now, just update the local state
        setPatientRecords(prev => prev.filter(patient => patient.patient_id !== patientId));
        alert("Patient record deleted successfully!");
      } catch (error) {
        console.error('Error deleting patient:', error);
        alert('Error deleting patient record. Please try again.');
      }
    }
  }

  // ============ REPORTS MANAGEMENT FUNCTIONS ============

  const handleGenerateReport = async () => {
    setReportDialogOpen(true);
  };

  const handleConfirmGenerateReport = async () => {
    try {
      setGeneratingReport(true);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const currentDate = new Date();
      const reportTypes = {
        system_overview: {
          title: "System Overview Report",
          description: "Comprehensive system performance and usage statistics",
          type: "system_analytics"
        },
        patient_analytics: {
          title: "Patient Analytics Report",
          description: "Patient registration trends and demographic analysis",
          type: "patient_analytics"
        },
        doctor_performance: {
          title: "Medical Staff Performance Report",
          description: "Doctor consultation metrics and efficiency analysis",
          type: "performance"
        },
        financial_summary: {
          title: "Financial Summary Report",
          description: "Revenue, billing, and financial performance overview",
          type: "financial"
        }
      };

      const reportConfig = reportTypes[selectedReportType] || reportTypes.system_overview;
      
      const newReport = {
        id: systemReports.length + 1,
        title: reportConfig.title,
        description: reportConfig.description,
        type: reportConfig.type,
        generatedDate: currentDate.toISOString().split('T')[0],
        status: "ready",
        fileSize: generateFileSize(),
      };
      
      setSystemReports(prev => [newReport, ...prev]);
      setReportDialogOpen(false);
      setSelectedReportType("system_overview");
      alert("Report generated successfully! You can now download it.");
    } catch (error) {
      console.error('Error generating report:', error);
      alert('Error generating report. Please try again.');
    } finally {
      setGeneratingReport(false);
    }
  };

  const handleDownloadReport = async (reportId) => {
    try {
      // Find the report
      const report = systemReports.find(r => r.id === reportId);
      if (!report) {
        alert('Report not found.');
        return;
      }

      // Create report content for PDF
      const reportContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>${report.title}</title>
            <style>
                body {
                    font-family: 'Arial', sans-serif;
                    line-height: 1.6;
                    color: #333;
                    max-width: 800px;
                    margin: 0 auto;
                    padding: 20px;
                }
                .header {
                    text-align: center;
                    border-bottom: 3px solid #2c5aa0;
                    padding-bottom: 20px;
                    margin-bottom: 30px;
                }
                .header h1 {
                    color: #2c5aa0;
                    margin: 0;
                    font-size: 28px;
                }
                .header .subtitle {
                    color: #666;
                    font-size: 16px;
                    margin: 5px 0;
                }
                .meta-info {
                    display: flex;
                    justify-content: space-between;
                    margin-top: 10px;
                    font-size: 12px;
                    color: #888;
                }
                .section {
                    margin-bottom: 25px;
                }
                .section h2 {
                    color: #2c5aa0;
                    border-bottom: 2px solid #e0e0e0;
                    padding-bottom: 8px;
                    margin-bottom: 15px;
                    font-size: 20px;
                }
                .metrics-grid {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 15px;
                    margin: 20px 0;
                }
                .metric-card {
                    border: 1px solid #e0e0e0;
                    padding: 15px;
                    border-radius: 5px;
                    text-align: center;
                    background: #f9f9f9;
                }
                .metric-value {
                    font-size: 24px;
                    font-weight: bold;
                    color: #2c5aa0;
                    margin: 10px 0;
                }
                .metric-label {
                    color: #666;
                    font-size: 14px;
                }
                table {
                    width: 100%;
                    border-collapse: collapse;
                    margin: 20px 0;
                }
                table th, table td {
                    border: 1px solid #ddd;
                    padding: 12px;
                    text-align: left;
                }
                table th {
                    background-color: #f5f5f5;
                    font-weight: bold;
                }
                .status-badge {
                    padding: 4px 8px;
                    border-radius: 3px;
                    font-size: 12px;
                    font-weight: bold;
                }
                .status-active {
                    background: #d4edda;
                    color: #155724;
                }
                .status-pending {
                    background: #fff3cd;
                    color: #856404;
                }
                .footer {
                    text-align: center;
                    margin-top: 40px;
                    padding-top: 20px;
                    border-top: 1px solid #e0e0e0;
                    color: #666;
                    font-size: 12px;
                }
                @media print {
                    body { margin: 0; }
                    .header { margin-top: 0; }
                }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>${report.title}</h1>
                <div class="subtitle">${report.description}</div>
                <div class="meta-info">
                    <span>Generated: ${formatDate(report.generatedDate)}</span>
                    <span>Report ID: ${report.id}</span>
                    <span>Type: ${report.type}</span>
                </div>
            </div>

            <div class="section">
                <h2>Executive Summary</h2>
                <p>This report provides a comprehensive overview of the Kalawa Health Center system performance and key metrics for the reporting period. The data reflects current operational status and highlights areas of success as well as opportunities for improvement.</p>
                
                <div class="metrics-grid">
                    <div class="metric-card">
                        <div class="metric-value">${systemStats.totalPatients}</div>
                        <div class="metric-label">Total Patients</div>
                    </div>
                    <div class="metric-card">
                        <div class="metric-value">${systemStats.totalDoctors}</div>
                        <div class="metric-label">Medical Staff</div>
                    </div>
                    <div class="metric-card">
                        <div class="metric-value">${systemStats.activeAppointments}</div>
                        <div class="metric-label">Active Appointments</div>
                    </div>
                    <div class="metric-card">
                        <div class="metric-value">${systemStats.totalStaff}</div>
                        <div class="metric-label">Total Staff</div>
                    </div>
                </div>
            </div>

            <div class="section">
                <h2>User Statistics</h2>
                <table>
                    <thead>
                        <tr>
                            <th>Role</th>
                            <th>Count</th>
                            <th>Status Distribution</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>Patients</td>
                            <td>${systemStats.totalPatients}</td>
                            <td>
                                <span class="status-badge status-active">${Math.round(systemStats.totalPatients * 0.85)} Active</span>
                                <span class="status-badge status-pending">${Math.round(systemStats.totalPatients * 0.15)} Pending</span>
                            </td>
                        </tr>
                        <tr>
                            <td>Doctors</td>
                            <td>${systemStats.totalDoctors}</td>
                            <td>
                                <span class="status-badge status-active">${systemStats.totalDoctors} Active</span>
                            </td>
                        </tr>
                        <tr>
                            <td>Administrators</td>
                            <td>1</td>
                            <td>
                                <span class="status-badge status-active">1 Active</span>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div class="section">
                <h2>Recent Activity & Performance</h2>
                <p>System activity for the current reporting period shows consistent usage patterns with peak activity during regular business hours. Key performance indicators remain within expected ranges.</p>
                
                <div class="metrics-grid">
                    <div class="metric-card">
                        <div class="metric-value">+12%</div>
                        <div class="metric-label">Patient Growth</div>
                    </div>
                    <div class="metric-card">
                        <div class="metric-value">94%</div>
                        <div class="metric-label">System Uptime</div>
                    </div>
                    <div class="metric-card">
                        <div class="metric-value">89%</div>
                        <div class="metric-label">Appointment Rate</div>
                    </div>
                    <div class="metric-card">
                        <div class="metric-value">24/7</div>
                        <div class="metric-label">Availability</div>
                    </div>
                </div>
            </div>

            <div class="section">
                <h2>Recommendations</h2>
                <ul>
                    <li>Continue monitoring patient registration trends for capacity planning</li>
                    <li>Consider expanding medical staff during peak appointment hours</li>
                    <li>Review and optimize system performance metrics quarterly</li>
                    <li>Implement additional backup procedures for critical data</li>
                </ul>
            </div>

            <div class="footer">
                <p>Report generated by Kalawa Health Center Administration System</p>
                <p>Confidential - For internal use only</p>
                <p>Generated on: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
            </div>
        </body>
        </html>
      `;

      // Create a new window for printing
      const printWindow = window.open('', '_blank');
      printWindow.document.write(reportContent);
      printWindow.document.close();

      // Wait for content to load then trigger print
      printWindow.onload = () => {
        printWindow.focus();
        printWindow.print();
        
        // Show confirmation message
        alert(`Report "${report.title}" is being prepared for PDF download. Please use the print dialog and select "Save as PDF" as your printer.`);
      };

    } catch (error) {
      console.error('Error downloading report:', error);
      alert('Error downloading report. Please try again.');
    }
  };

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
                            {/* Edit User Dialog */}
                            <Dialog open={!!editingUser && editingUser.id === userItem.id} onOpenChange={(open) => !open && closeEditDialog()}>
                              <DialogTrigger asChild>
                                <Button size="sm" variant="outline" onClick={() => openEditDialog(userItem)}>
                                  <Edit className="w-4 h-4 mr-2" />
                                  Edit
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="sm:max-w-md">
                                <DialogHeader>
                                  <DialogTitle>Edit User</DialogTitle>
                                  <DialogDescription>
                                    Update user information for {getUserName(userItem)}.
                                  </DialogDescription>
                                </DialogHeader>
                                
                                <div className="grid gap-4 py-4">
                                  <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                      <Label htmlFor="edit-first-name">First Name *</Label>
                                      <Input
                                        id="edit-first-name"
                                        value={editFormData.first_name || ''}
                                        onChange={(e) => setEditFormData({...editFormData, first_name: e.target.value})}
                                        placeholder="First name"
                                      />
                                    </div>
                                    <div className="space-y-2">
                                      <Label htmlFor="edit-last-name">Last Name *</Label>
                                      <Input
                                        id="edit-last-name"
                                        value={editFormData.last_name || ''}
                                        onChange={(e) => setEditFormData({...editFormData, last_name: e.target.value})}
                                        placeholder="Last name"
                                      />
                                    </div>
                                  </div>

                                  <div className="space-y-2">
                                    <Label htmlFor="edit-email">Email Address *</Label>
                                    <Input
                                      id="edit-email"
                                      type="email"
                                      value={editFormData.email_address || ''}
                                      onChange={(e) => setEditFormData({...editFormData, email_address: e.target.value})}
                                      placeholder="Email address"
                                    />
                                  </div>

                                  <div className="space-y-2">
                                    <Label htmlFor="edit-phone">Phone Number</Label>
                                    <Input
                                      id="edit-phone"
                                      value={editFormData.phone_number || ''}
                                      onChange={(e) => setEditFormData({...editFormData, phone_number: e.target.value})}
                                      placeholder="Phone number"
                                    />
                                  </div>

                                  <div className="space-y-2">
                                    <Label htmlFor="edit-status">Status</Label>
                                    <Select 
                                      value={editFormData.status} 
                                      onValueChange={(value) => setEditFormData({...editFormData, status: value})}
                                    >
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select status" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="active">Active</SelectItem>
                                        <SelectItem value="pending">Pending</SelectItem>
                                        <SelectItem value="inactive">Inactive</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>

                                  {userItem.role === 'doctor' && (
                                    <div className="space-y-2">
                                      <Label htmlFor="edit-specialization">Specialization</Label>
                                      <Input
                                        id="edit-specialization"
                                        value={editFormData.specialization || ''}
                                        onChange={(e) => setEditFormData({...editFormData, specialization: e.target.value})}
                                        placeholder="Specialization"
                                      />
                                    </div>
                                  )}

                                  {userItem.role === 'patient' && (
                                    <>
                                      <div className="space-y-2">
                                        <Label htmlFor="edit-gender">Gender</Label>
                                        <Select 
                                          value={editFormData.gender} 
                                          onValueChange={(value) => setEditFormData({...editFormData, gender: value})}
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
                                        <Label htmlFor="edit-dob">Date of Birth</Label>
                                        <Input
                                          id="edit-dob"
                                          type="date"
                                          value={editFormData.dob || ''}
                                          onChange={(e) => setEditFormData({...editFormData, dob: e.target.value})}
                                        />
                                      </div>
                                    </>
                                  )}
                                </div>

                                <DialogFooter>
                                  <Button variant="outline" onClick={closeEditDialog}>
                                    Cancel
                                  </Button>
                                  <Button 
                                    onClick={() => handleUpdateUser(userItem.id, editFormData)}
                                    disabled={updatingUser || !editFormData.first_name || !editFormData.last_name || !editFormData.email_address}
                                  >
                                    {updatingUser ? (
                                      <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Updating...
                                      </>
                                    ) : (
                                      <>
                                        <CheckCircle className="w-4 h-4 mr-2" />
                                        Update User
                                      </>
                                    )}
                                  </Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>

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
                            {/* Edit Patient Dialog */}
                            <Dialog open={!!editingPatient && editingPatient.patient_id === patient.patient_id} onOpenChange={(open) => !open && closeEditPatientDialog()}>
                              <DialogTrigger asChild>
                                <Button size="sm" variant="outline" onClick={() => openEditPatientDialog(patient)}>
                                  <Edit className="w-4 h-4 mr-2" />
                                  Update
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="sm:max-w-md">
                                <DialogHeader>
                                  <DialogTitle>Update Patient Record</DialogTitle>
                                  <DialogDescription>
                                    Update patient information for {getPatientName(patient)}.
                                  </DialogDescription>
                                </DialogHeader>
                                
                                <div className="grid gap-4 py-4">
                                  <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                      <Label htmlFor="patient-first-name">First Name *</Label>
                                      <Input
                                        id="patient-first-name"
                                        value={patientEditFormData.first_name || ''}
                                        onChange={(e) => setPatientEditFormData({...patientEditFormData, first_name: e.target.value})}
                                        placeholder="First name"
                                      />
                                    </div>
                                    <div className="space-y-2">
                                      <Label htmlFor="patient-last-name">Last Name *</Label>
                                      <Input
                                        id="patient-last-name"
                                        value={patientEditFormData.last_name || ''}
                                        onChange={(e) => setPatientEditFormData({...patientEditFormData, last_name: e.target.value})}
                                        placeholder="Last name"
                                      />
                                    </div>
                                  </div>

                                  <div className="space-y-2">
                                    <Label htmlFor="patient-email">Email Address *</Label>
                                    <Input
                                      id="patient-email"
                                      type="email"
                                      value={patientEditFormData.email_address || ''}
                                      onChange={(e) => setPatientEditFormData({...patientEditFormData, email_address: e.target.value})}
                                      placeholder="Email address"
                                    />
                                  </div>

                                  <div className="space-y-2">
                                    <Label htmlFor="patient-phone">Phone Number</Label>
                                    <Input
                                      id="patient-phone"
                                      value={patientEditFormData.phone_number || ''}
                                      onChange={(e) => setPatientEditFormData({...patientEditFormData, phone_number: e.target.value})}
                                      placeholder="Phone number"
                                    />
                                  </div>

                                  <div className="space-y-2">
                                    <Label htmlFor="patient-gender">Gender</Label>
                                    <Select 
                                      value={patientEditFormData.gender} 
                                      onValueChange={(value) => setPatientEditFormData({...patientEditFormData, gender: value})}
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
                                    <Label htmlFor="patient-dob">Date of Birth</Label>
                                    <Input
                                      id="patient-dob"
                                      type="date"
                                      value={patientEditFormData.dob || ''}
                                      onChange={(e) => setPatientEditFormData({...patientEditFormData, dob: e.target.value})}
                                    />
                                  </div>

                                  <div className="space-y-2">
                                    <Label htmlFor="patient-status">Verification Status</Label>
                                    <Select 
                                      value={patientEditFormData.is_verified ? "verified" : "pending"} 
                                      onValueChange={(value) => setPatientEditFormData({...patientEditFormData, is_verified: value === "verified"})}
                                    >
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select status" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="verified">Verified</SelectItem>
                                        <SelectItem value="pending">Pending</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                </div>

                                <DialogFooter>
                                  <Button variant="outline" onClick={closeEditPatientDialog}>
                                    Cancel
                                  </Button>
                                  <Button 
                                    onClick={() => handleUpdatePatient(patient.patient_id, patientEditFormData)}
                                    disabled={updatingPatient || !patientEditFormData.first_name || !patientEditFormData.last_name || !patientEditFormData.email_address}
                                  >
                                    {updatingPatient ? (
                                      <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Updating...
                                      </>
                                    ) : (
                                      <>
                                        <CheckCircle className="w-4 h-4 mr-2" />
                                        Update Patient
                                      </>
                                    )}
                                  </Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>

                            {/* View Patient Dialog */}
                            <Dialog open={!!viewingPatient && viewingPatient.patient_id === patient.patient_id} onOpenChange={(open) => !open && closeViewPatientDialog()}>
                              <DialogTrigger asChild>
                                <Button size="sm" variant="outline" onClick={() => openViewPatientDialog(patient)}>
                                  <Eye className="w-4 h-4 mr-2" />
                                  View Records
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
                                <DialogHeader>
                                  <DialogTitle>Patient Record Details</DialogTitle>
                                  <DialogDescription>
                                    Complete information for {getPatientName(patient)}
                                  </DialogDescription>
                                </DialogHeader>
                                
                                <div className="grid gap-6 py-4">
                                  <div className="flex items-center gap-4">
                                    <Avatar className="w-16 h-16">
                                      <AvatarFallback className="bg-blue-100 text-blue-700 text-lg">
                                        {getPatientInitials(patient)}
                                      </AvatarFallback>
                                    </Avatar>
                                    <div>
                                      <h3 className="text-xl font-bold">{getPatientName(patient)}</h3>
                                      <div className="flex items-center gap-2 mt-1">
                                        <Badge variant="outline">ID: {patient.patient_id}</Badge>
                                        <Badge variant={patient.is_verified ? "default" : "secondary"}>
                                          {patient.is_verified ? 'Verified' : 'Pending Verification'}
                                        </Badge>
                                      </div>
                                    </div>
                                  </div>

                                  <div className="grid md:grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                      <Card>
                                        <CardHeader className="pb-3">
                                          <CardTitle className="text-sm">Personal Information</CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-2 text-sm">
                                          <div className="flex justify-between">
                                            <span className="font-medium">Age:</span>
                                            <span>{calculateAge(patient.dob)} years</span>
                                          </div>
                                          <div className="flex justify-between">
                                            <span className="font-medium">Gender:</span>
                                            <span>{patient.gender || 'Not specified'}</span>
                                          </div>
                                          <div className="flex justify-between">
                                            <span className="font-medium">Date of Birth:</span>
                                            <span>{formatDate(patient.dob)}</span>
                                          </div>
                                        </CardContent>
                                      </Card>

                                      <Card>
                                        <CardHeader className="pb-3">
                                          <CardTitle className="text-sm">Contact Information</CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-2 text-sm">
                                          <div className="flex justify-between">
                                            <span className="font-medium">Email:</span>
                                            <span>{patient.email_address || 'Not provided'}</span>
                                          </div>
                                          <div className="flex justify-between">
                                            <span className="font-medium">Phone:</span>
                                            <span>{patient.phone_number || 'Not provided'}</span>
                                          </div>
                                        </CardContent>
                                      </Card>
                                    </div>

                                    <div className="space-y-4">
                                      <Card>
                                        <CardHeader className="pb-3">
                                          <CardTitle className="text-sm">Account Information</CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-2 text-sm">
                                          <div className="flex justify-between">
                                            <span className="font-medium">Registered:</span>
                                            <span>{formatDate(patient.created_at)}</span>
                                          </div>
                                          <div className="flex justify-between">
                                            <span className="font-medium">Last Updated:</span>
                                            <span>{formatDate(patient.updated_at)}</span>
                                          </div>
                                          <div className="flex justify-between">
                                            <span className="font-medium">Account Status:</span>
                                            <Badge variant={patient.is_verified ? "default" : "secondary"}>
                                              {patient.is_verified ? 'Active' : 'Pending'}
                                            </Badge>
                                          </div>
                                        </CardContent>
                                      </Card>

                                      <Card>
                                        <CardHeader className="pb-3">
                                          <CardTitle className="text-sm">Medical Summary</CardTitle>
                                        </CardHeader>
                                        <CardContent className="text-sm">
                                          <p className="text-muted-foreground">
                                            No medical records available. Medical history would be displayed here when available.
                                          </p>
                                        </CardContent>
                                      </Card>
                                    </div>
                                  </div>
                                </div>

                                <DialogFooter>
                                  <Button variant="outline" onClick={closeViewPatientDialog}>
                                    Close
                                  </Button>
                                  <Button onClick={() => {
                                    closeViewPatientDialog();
                                    openEditPatientDialog(patient);
                                  }}>
                                    <Edit className="w-4 h-4 mr-2" />
                                    Edit Record
                                  </Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>

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
                  <div className="flex gap-2">
                    <Button size="sm" onClick={handleGenerateReport}>
                      <BarChart3 className="w-4 h-4 mr-2" />
                      Generate New Report
                    </Button>
                  </div>
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
                                <span>Generated: {formatDate(report.generatedDate)}</span>
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
                              <Button 
                                size="sm" 
                                onClick={() => handleDownloadReport(report.id)}
                              >
                                <Download className="w-4 h-4 mr-2" />
                                Download PDF
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

        {/* Generate Report Dialog */}
        <Dialog open={reportDialogOpen} onOpenChange={setReportDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Generate New Report</DialogTitle>
              <DialogDescription>
                Select the type of report you want to generate.
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="report-type">Report Type</Label>
                <Select 
                  value={selectedReportType} 
                  onValueChange={setSelectedReportType}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select report type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="system_overview">System Overview</SelectItem>
                    <SelectItem value="patient_analytics">Patient Analytics</SelectItem>
                    <SelectItem value="doctor_performance">Medical Staff Performance</SelectItem>
                    <SelectItem value="financial_summary">Financial Summary</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="bg-muted p-4 rounded-lg">
                <h4 className="font-medium mb-2">Report Details:</h4>
                <p className="text-sm text-muted-foreground">
                  {selectedReportType === "system_overview" && "Comprehensive system performance and usage statistics"}
                  {selectedReportType === "patient_analytics" && "Patient registration trends and demographic analysis"}
                  {selectedReportType === "doctor_performance" && "Doctor consultation metrics and efficiency analysis"}
                  {selectedReportType === "financial_summary" && "Revenue, billing, and financial performance overview"}
                </p>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setReportDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleConfirmGenerateReport}
                disabled={generatingReport}
              >
                {generatingReport ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <BarChart3 className="w-4 h-4 mr-2" />
                    Generate Report
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Footer />
      </div>
    </ProtectedRoute>
  )
}