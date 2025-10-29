"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAuth } from "@/lib/auth-context"
import { Menu, X, Heart, Phone, Mail, User, LogOut, Settings, Stethoscope } from "lucide-react"

export function Header() {
  const [isOpen, setIsOpen] = useState(false)
  const { user, logout } = useAuth()
  const router = useRouter()

  const navigation = [
    { name: "Home", href: "/" },
    { name: "About", href: "/about" },
    { name: "Departments", href: "/departments" },
    { name: "Services", href: "/services" },
    { name: "Appointments", href: "/appointments" },
    { name: "AI Assistant", href: "/chat" },
    { name: "Contact", href: "/contact" },
  ]

  const handleLogout = () => {
    logout()
    router.push("/")
  }

  const getDashboardLink = () => {
    if (!user) return "/login"
    switch (user.role) {
      case "patient":
        return "/dashboard"
      case "doctor":
        return "/doctor-dashboard"
      case "admin":
        return "/admin-dashboard"
      default:
        return "/login"
    }
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      {/* Top bar */}
      <div className="bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 py-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                <span>Emergency: 0745 120 283</span>
              </div>
              <div className="hidden md:flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <span>kalawa.hospital@makueni.go.ke</span>
              </div>
            </div>
            <div className="text-sm">24/7 Emergency Services Available</div>
          </div>
        </div>
      </div>

      {/* Main navigation */}
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex items-center justify-center w-10 h-10 bg-primary rounded-lg">
              <Heart className="h-6 w-6 text-primary-foreground" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold text-primary">Kalawa Health Center</span>
              <span className="text-xs text-muted-foreground">KEPH Level 4 Facility</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-sm font-medium text-foreground hover:text-primary transition-colors"
              >
                {item.name}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-4">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback
                        className={`text-sm font-semibold ${
                          user.role === "patient"
                            ? "bg-blue-100 text-blue-700"
                            : user.role === "doctor"
                              ? "bg-green-100 text-green-700"
                              : "bg-purple-100 text-purple-700"
                        }`}
                      >
                        {user.name
                          ?.split(" ")
                          .map((n) => n[0])
                          .join("") || "U"}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      <p className="font-medium">{user.name}</p>
                      <p className="w-[200px] truncate text-sm text-muted-foreground">{user.email}</p>
                      <p className="text-xs text-muted-foreground capitalize">
                        {user.role === "doctor" ? "Doctor" : user.role === "admin" ? "Administrator" : "Patient"}
                      </p>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href={getDashboardLink()} className="flex items-center">
                      {user.role === "doctor" ? (
                        <Stethoscope className="mr-2 h-4 w-4" />
                      ) : user.role === "admin" ? (
                        <Settings className="mr-2 h-4 w-4" />
                      ) : (
                        <User className="mr-2 h-4 w-4" />
                      )}
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button asChild className="hidden md:inline-flex">
                <Link href="/login">Login</Link>
              </Button>
            )}

            {/* Mobile Navigation */}
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild className="md:hidden">
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80">
                <div className="flex items-center justify-between mb-6">
                  <Link href="/" className="flex items-center gap-2">
                    <Heart className="h-6 w-6 text-primary" />
                    <span className="text-lg font-bold">Kalawa Health Center</span>
                  </Link>
                  <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
                    <X className="h-6 w-6" />
                  </Button>
                </div>
                <nav className="flex flex-col gap-4">
                  {navigation.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className="text-lg font-medium text-foreground hover:text-primary transition-colors"
                      onClick={() => setIsOpen(false)}
                    >
                      {item.name}
                    </Link>
                  ))}
                  {user ? (
                    <div className="mt-4 space-y-2">
                      <Button asChild className="w-full">
                        <Link href={getDashboardLink()}>Dashboard</Link>
                      </Button>
                      <Button variant="outline" className="w-full bg-transparent" onClick={handleLogout}>
                        Log out
                      </Button>
                    </div>
                  ) : (
                    <Button asChild className="mt-4">
                      <Link href="/login">Login</Link>
                    </Button>
                  )}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  )
}
