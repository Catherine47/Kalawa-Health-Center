import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import {
  Heart,
  Shield,
  Clock,
  Users,
  Stethoscope,
  Brain,
  Bone,
  Eye,
  Calendar,
  FileText,
  Phone,
  ArrowRight,
} from "lucide-react"

export default function HomePage() {
  const features = [
    {
      icon: Shield,
      title: "Secure & Compliant",
      description: "HIPAA compliant with end-to-end encryption for all patient data",
    },
    {
      icon: Clock,
      title: "24/7 Access",
      description: "Access your health records anytime, anywhere with our secure portal",
    },
    {
      icon: Users,
      title: "Expert Care Team",
      description: "Qualified healthcare professionals dedicated to your health",
    },
    {
      icon: FileText,
      title: "Digital Prescriptions",
      description: "Electronic prescriptions sent directly to your preferred pharmacy",
    },
  ]

  const departments = [
    {
      icon: Heart,
      name: "General Medicine",
      description: "Comprehensive primary healthcare",
      color: "bg-red-100 text-red-600",
    },
    {
      icon: Brain,
      name: "Pediatrics",
      description: "Specialized care for children",
      color: "bg-purple-100 text-purple-600",
    },
    {
      icon: Bone,
      name: "Maternity",
      description: "Maternal and child health services",
      color: "bg-blue-100 text-blue-600",
    },
    {
      icon: Eye,
      name: "Emergency",
      description: "24/7 emergency medical services",
      color: "bg-green-100 text-green-600",
    },
  ]

  const stats = [
    { number: "5,000+", label: "Patients Served" },
    { number: "50+", label: "Healthcare Staff" },
    { number: "8+", label: "Medical Services" },
    { number: "24/7", label: "Emergency Care" },
  ]

  return (
    <div className="min-h-screen">
      <Header />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary/10 via-background to-accent/10 py-20">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <Badge variant="secondary" className="w-fit">
                  KEPH Level 4 Healthcare Facility
                </Badge>
                <h1 className="text-4xl lg:text-6xl font-bold text-balance leading-tight">
                  Quality Healthcare for <span className="text-primary">Makueni County</span>
                </h1>
                <p className="text-xl text-muted-foreground text-pretty max-w-lg">
                  Serving the Kalawa ward and surrounding communities with comprehensive healthcare services. Your
                  health, our priority - available 24/7.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" asChild>
                  <Link href="/appointments">
                    <Calendar className="mr-2 h-5 w-5" />
                    Book Appointment
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href="/login">
                    Patient Portal
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 pt-8">
                {stats.map((stat, index) => (
                  <div key={index} className="text-center">
                    <div className="text-2xl lg:text-3xl font-bold text-primary">{stat.number}</div>
                    <div className="text-sm text-muted-foreground">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl">
                <img
                  src="/images/hospital-exterior-1.jpg"
                  alt="Kalawa Health Center exterior view"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-6 -left-6 bg-card rounded-2xl shadow-xl p-6 border">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                    <Stethoscope className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <div>
                    <h3 className="font-bold">24/7 Emergency Care</h3>
                    <p className="text-sm text-muted-foreground">Always here for you</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4 mb-16">
            <Badge variant="secondary" className="w-fit mx-auto">
              Our Facilities
            </Badge>
            <h2 className="text-3xl lg:text-4xl font-bold text-balance">Modern Healthcare Infrastructure</h2>
            <p className="text-xl text-muted-foreground text-pretty max-w-2xl mx-auto">
              Take a look at our well-equipped facilities designed to provide the best healthcare experience for our
              patients.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="space-y-4">
              <div className="aspect-[4/3] rounded-xl overflow-hidden shadow-lg">
                <img
                  src="/images/examination-room.jpg"
                  alt="Modern examination room with medical equipment"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-semibold">Examination Rooms</h3>
                <p className="text-muted-foreground">
                  Modern, well-equipped examination rooms with the latest medical equipment
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="aspect-[4/3] rounded-xl overflow-hidden shadow-lg">
                <img
                  src="/images/surgical-theater.jpg"
                  alt="Surgical theater with medical staff"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-semibold">Surgical Theater</h3>
                <p className="text-muted-foreground">
                  State-of-the-art surgical facilities with qualified medical staff
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="aspect-[4/3] rounded-xl overflow-hidden shadow-lg">
                <img
                  src="/images/medical-ward.jpg"
                  alt="Medical ward with patient care"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-semibold">Medical Ward</h3>
                <p className="text-muted-foreground">
                  Dedicated patient care areas with professional medical attention
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4 mb-16">
            <Badge variant="secondary" className="w-fit mx-auto">
              Why Choose Kalawa Health Center
            </Badge>
            <h2 className="text-3xl lg:text-4xl font-bold text-balance">Modern Healthcare Technology</h2>
            <p className="text-xl text-muted-foreground text-pretty max-w-2xl mx-auto">
              Our EHR system combines modern technology with compassionate care to deliver exceptional healthcare
              experiences for our community.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <feature.icon className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>{feature.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Departments Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4 mb-16">
            <Badge variant="secondary" className="w-fit mx-auto">
              Medical Services
            </Badge>
            <h2 className="text-3xl lg:text-4xl font-bold text-balance">Our Departments</h2>
            <p className="text-xl text-muted-foreground text-pretty max-w-2xl mx-auto">
              Comprehensive healthcare services as a KEPH Level 4 facility, providing quality medical care to our
              community with qualified healthcare professionals.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {departments.map((dept, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader className="text-center">
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${dept.color}`}>
                    <dept.icon className="w-8 h-8" />
                  </div>
                  <CardTitle className="text-lg">{dept.name}</CardTitle>
                  <CardDescription>{dept.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <Button asChild variant="outline" size="lg">
              <Link href="/departments">
                View All Departments
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto space-y-8">
            <h2 className="text-3xl lg:text-4xl font-bold text-balance">Ready to Experience Quality Healthcare?</h2>
            <p className="text-xl text-primary-foreground/80 text-pretty">
              Join thousands of patients who trust Kalawa Health Center for their healthcare needs. Book your
              appointment today or access your patient portal.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="secondary">
                <Calendar className="mr-2 h-5 w-5" />
                Book Appointment
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary bg-transparent"
              >
                <Phone className="mr-2 h-5 w-5" />
                Call Now: 0745 120283
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
