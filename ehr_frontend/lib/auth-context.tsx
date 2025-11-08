"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { apiCall } from "./api-client"

export type UserRole = "patient" | "doctor" | "admin"

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  phone?: string
  department?: string
  specialization?: string
  patientId?: string
  permissions?: string[]
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

  const login = async (email: string, password: string, role: UserRole): Promise<boolean> => {
    setIsLoading(true)

    try {
      const response = await apiCall("/auth/login", {
        method: "POST",
        body: JSON.stringify({
          email_address: email,
          password,
          role,
        }),
      })

      const userData: User = {
        id: response.user.id,
        name: response.user.first_name + " " + response.user.last_name,
        email: response.user.email_address,
        role: role,
        phone: response.user.phone_number,
        specialization: response.user.specialization,
      }

      setUser(userData)
      localStorage.setItem("authToken", response.token)
      localStorage.setItem("userRole", role)
      localStorage.setItem("user", JSON.stringify(userData))

      return true
    } catch (error) {
      console.log("[v0] Login error:", error)
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("authToken")
    localStorage.removeItem("userRole")
    localStorage.removeItem("user")
  }

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
