"use client"

import type React from "react"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth, type UserRole } from "@/context/auth-context"

interface ProtectedRouteProps {
  children: React.ReactNode
  allowedRoles?: UserRole[]
  redirectTo?: string
}

export function ProtectedRoute({
  children,
  allowedRoles = ["patient", "doctor", "admin"],
  redirectTo = "/login",
}: ProtectedRouteProps) {
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!user) {
      router.push(redirectTo)
      return
    }

    if (!allowedRoles.includes(user.role)) {
      // Redirect to appropriate dashboard based on role
      const dashboardRoutes = {
        patient: "/dashboard",
        doctor: "/doctor-dashboard",
        admin: "/admin-dashboard",
      }
      router.push(dashboardRoutes[user.role])
    }
  }, [user, allowedRoles, redirectTo, router])

  if (!user || !allowedRoles.includes(user.role)) {
    return null
  }

  return <>{children}</>
}
