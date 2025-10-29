import Link from "next/link"
import { Heart, Phone, Mail, MapPin, Clock } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-muted/50 border-t">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex items-center justify-center w-10 h-10 bg-primary rounded-lg">
                <Heart className="h-6 w-6 text-primary-foreground" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold text-primary">Kalawa Health Center</span>
                <span className="text-xs text-muted-foreground">KEPH Level 4</span>
              </div>
            </Link>
            <p className="text-sm text-muted-foreground max-w-xs">
              A public KEPH Level 4 facility serving Kalawa ward, Mbooni constituency, Makueni County with quality
              healthcare services.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Quick Links</h3>
            <nav className="flex flex-col gap-2">
              <Link href="/about" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                About Us
              </Link>
              <Link href="/departments" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Departments
              </Link>
              <Link href="/services" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Services
              </Link>
              <Link href="/appointments" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Book Appointment
              </Link>
            </nav>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Contact Info</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="h-4 w-4" />
                <span>0745 120 283</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="h-4 w-4" />
                <span>kalawa.hospital@makueni.go.ke</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>Kalawa Ward, Mbooni Constituency, Makueni County, Kenya</span>
              </div>
            </div>
          </div>

          {/* Hours */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Hours</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="font-medium">Open 24/7</div>
                  <div className="text-muted-foreground">Always Available</div>
                </div>
              </div>
              <div className="text-sm text-muted-foreground">
                <div>Emergency Services: 24 Hours</div>
                <div>Outpatient Services: Daily</div>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; 2025 Kalawa Health Center. All rights reserved. | Ministry of Health Regulated Facility</p>
        </div>
      </div>
    </footer>
  )
}
