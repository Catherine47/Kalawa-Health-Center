"use client";

import type React from "react";
import { createContext, useContext, useState, useEffect } from "react";
import { apiCall } from "./api-client";

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
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const login = async (email: string, password: string, role: UserRole): Promise<boolean> => {
    setIsLoading(true);

    try {
      const endpoint = role === "admin" ? `/api/admin/login` : `/api/${role}s/login`;

      const response = await apiCall(endpoint, {
        method: "POST",
        body: JSON.stringify({
          email_address: email,
          password,
          role,
        }),
      });

      // ✅ Extract the right user data depending on role
      const roleData = response[role];
      if (!roleData) throw new Error(`No ${role} data returned from API`);

      // ✅ Construct user object safely
      const userData: User = {
        id: roleData.id?.toString(),
        name: roleData.first_name
          ? `${roleData.first_name} ${roleData.last_name}`
          : roleData.name ?? "Unknown User",
        email: roleData.email_address ?? roleData.email ?? "",
        role,
        phone: roleData.phone_number ?? roleData.phone ?? "",
        specialization: roleData.specialization,
        department: roleData.department,
        permissions: roleData.permissions ?? [],
        patientId: role === "patient" ? roleData.id?.toString() : undefined,
      };

      // ✅ Save user data and token
      setUser(userData);
      if (response.token) {
        localStorage.setItem("authToken", response.token);
      }
      localStorage.setItem("userRole", role);
      localStorage.setItem("user", JSON.stringify(userData));

      return true;
    } catch (error) {
      console.error("[v0] Login error:", error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("authToken");
    localStorage.removeItem("userRole");
    localStorage.removeItem("user");
  };

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
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
