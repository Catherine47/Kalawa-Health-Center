"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"

export type UserRole = "patient" | "doctor" | "admin"

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  phone?: string
  department?: string // for doctors
  specialization?: string // for doctors
  patientId?: string // for patients
  permissions?: string[] // for admins
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string, role: UserRole) => Promise<boolean>
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Mock user data for different roles
  const mockUsers = {
    patient: {
      id: "1",
      name: "John Doe",
      email: "patient@kalawa.go.ke",
      role: "patient" as UserRole,
      phone: "0712345678",
      patientId: "KHC-2025-001",
    },
    doctor: {
      id: "2",
      name: "Dr. Sarah Mwangi",
      email: "doctor@kalawa.go.ke",
      role: "doctor" as UserRole,
      phone: "0723456789",
      department: "Internal Medicine",
      specialization: "General Practice",
    },
    admin: {
      id: "3",
      name: "Admin User",
      email: "admin@kalawa.go.ke",
      role: "admin" as UserRole,
      phone: "0734567890",
      permissions: ["manage_users", "view_reports", "system_settings"],
    },
  }

  const login = async (email: string, password: string, role: UserRole): Promise<boolean> => {
    setIsLoading(true)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Mock authentication logic
      const mockUser = mockUsers[role]
      if (email === mockUser.email && password === "password123") {
        setUser(mockUser)
        localStorage.setItem("user", JSON.stringify(mockUser))
        return true
      }
      return false
    } catch (error) {
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("user")
  }

  // Check for existing session on mount
  useEffect(() => {
    const savedUser = localStorage.getItem("user")
    if (savedUser) {
      setUser(JSON.parse(savedUser))
    }
  }, [])

  return <AuthContext.Provider value={{ user, login, logout, isLoading }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
