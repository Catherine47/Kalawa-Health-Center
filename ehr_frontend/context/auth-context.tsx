"use client";

import type React from "react";
import { createContext, useContext, useState, useEffect } from "react";

export type UserRole = "patient" | "doctor" | "admin";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  department?: string;
  specialization?: string;
  patientId?: string;
  permissions?: string[];
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string, role: UserRole) => Promise<boolean>;
  register: (userData: any) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ✅ ADD MISSING apiCall FUNCTION
async function apiCall(endpoint: string, options: any = {}) {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
  
  const config = {
    method: options.method || 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  // Add auth token if available
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("authToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }

  // Handle request body
  if (options.body && typeof options.body === 'object') {
    config.body = JSON.stringify(options.body);
  }

  try {
    console.log(`API Call: ${baseUrl}${endpoint}`, config);
    
    const response = await fetch(`${baseUrl}${endpoint}`, config);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API error (${response.status}): ${errorText || response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('API call failed:', error);
    throw error;
  }
}

// ✅ CORRECTED: Determine correct registration endpoint based on role
const getRegistrationEndpoint = (role: UserRole): string => {
  switch (role) {
    case "patient":
      return "/api/patients/register";
    case "doctor":
      return "/api/doctors/register";
    case "admin":
      return "/api/admin/register";
    default:
      throw new Error(`Invalid role: ${role}`);
  }
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true); // Start as true for initial load

  // ✅ Auto-load user from localStorage when app starts
  useEffect(() => {
    const loadUserFromStorage = () => {
      try {
        const savedUser = localStorage.getItem("user");
        const token = localStorage.getItem("authToken");
        
        if (savedUser && token) {
          setUser(JSON.parse(savedUser));
        }
      } catch (error) {
        console.error("Error loading user from storage:", error);
        // Clear corrupted data
        localStorage.removeItem("user");
        localStorage.removeItem("authToken");
        localStorage.removeItem("userRole");
      } finally {
        setIsLoading(false);
      }
    };

    loadUserFromStorage();
  }, []);

  // ✅ CORRECTED: Enhanced register function with proper endpoint handling
  const register = async (userData: any): Promise<boolean> => {
    setIsLoading(true);

    try {
      const { role, email_address, password, first_name, last_name, phone_number, dob, gender, specialization, username } = userData;

      // ✅ Use the corrected endpoint function
      const endpoint = getRegistrationEndpoint(role);

      console.log(`📤 Registering ${role} at endpoint: ${endpoint}`);

      const response = await apiCall(endpoint, {
        method: "POST",
        body: {
          email_address,
          password,
          first_name,
          last_name,
          phone_number,
          ...(role === "patient" && { dob, gender }),
          ...(role === "doctor" && { specialization }),
          ...(role === "admin" && { username }),
        },
      });

      console.log(`[AuthContext] ${role} registration response:`, response);

      // ✅ Handle ALL possible success responses from your backend
      if (response && (
          response.message?.includes("successful") ||
          response.message?.includes("Registration successful") ||
          response.success === true ||
          response.patient !== undefined ||
          response.doctor !== undefined ||
          response.admin !== undefined
      )) {
        console.log(`[AuthContext] ${role} registration successful!`);
        return true;
      }

      // ❌ If we get here, registration failed
      const errorMessage = response?.error || response?.message || "Registration failed without specific error";
      throw new Error(errorMessage);

    } catch (error: any) {
      console.error("[AuthContext] Registration error:", error.message || error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ Enhanced login function with better error handling
  const login = async (email: string, password: string, role: UserRole): Promise<boolean> => {
    setIsLoading(true);

    try {
      // Determine correct login endpoint based on role
      const endpoint = role === "admin" ? `/api/admin/login` : `/api/${role}s/login`;

      const response = await apiCall(endpoint, {
        method: "POST",
        body: JSON.stringify({
          email_address: email,
          password,
          role,
        }),
      });

      // ✅ Validate the response object
      if (!response) {
        throw new Error("No response received from the server.");
      }

      const roleData = response[role];
      if (!roleData) {
        throw new Error(`No ${role} data returned from API`);
      }

      // ✅ Build a normalized user object
      const userData: User = {
        id: roleData.id?.toString() ?? "",
        name: roleData.first_name
          ? `${roleData.first_name} ${roleData.last_name || ""}`.trim()
          : roleData.name ?? email.split('@')[0], // Fallback to email username
        email: roleData.email_address ?? roleData.email ?? email,
        role,
        phone: roleData.phone_number ?? roleData.phone ?? "",
        specialization: roleData.specialization,
        department: roleData.department,
        permissions: roleData.permissions ?? [],
        patientId: role === "patient" ? roleData.id?.toString() : undefined,
      };

      // ✅ Store token in localStorage for future API calls
      const token = response.token || response.accessToken;
      if (token) {
        localStorage.setItem("authToken", token);
      } else {
        console.warn("No authentication token received from API");
      }

      // ✅ Save role and user details
      localStorage.setItem("userRole", role);
      localStorage.setItem("user", JSON.stringify(userData));

      setUser(userData);
      return true;
    } catch (error: any) {
      console.error("[AuthContext] Login error:", error.message || error);
      
      // Clear any partial auth data on failure
      localStorage.removeItem("authToken");
      localStorage.removeItem("userRole");
      localStorage.removeItem("user");
      
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ Logout clears all auth data
  const logout = () => {
    setUser(null);
    localStorage.removeItem("authToken");
    localStorage.removeItem("userRole");
    localStorage.removeItem("user");
  };

  const value: AuthContextType = {
    user,
    login,
    register,
    logout,
    isLoading,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}