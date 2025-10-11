import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Award, Users, Heart, Shield, Target, CheckCircle, ArrowRight } from "lucide-react"

export default function AboutPage() {
  const values = [
    {
      icon: Heart,
      title: "Patient-Centered Care",
      description: "Every decision we make is guided by what's best for our patients and their families.",
    },
    {
      icon: Shield,
      title: "Quality & Safety",
      description: "We maintain the highest standards of medical care and patient safety.",
    },
    {
      icon: Target,
      title: "Excellence",
      description: "We strive for excellence in everything we do, from medical care to patient service.",
    },
    {
      icon: Users,
      title: "Community Service",
      description: "We are committed to serving our community with compassion and dedication.",
    },
  ]

  const achievements = [
    "Ministry of Health Regulated Facility",
    "KEPH Level 4 Sub-County Hospital",
    "24/7 Emergency Services",
    "Qualified Healthcare Professionals",
    "Modern Medical Equipment",
    "Community Health Programs",
  ]

  return (
    <div className="min-h-screen">
      <Header />

      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-primary/10 via-background to-accent/10">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <Badge variant="secondary" className="w-fit mx-auto">
              About Kalawa Health Center
            </Badge>
            <h1 className="text-4xl lg:text-6xl font-bold text-balance">
              Serving Makueni County with <span className="text-primary">Quality Healthcare</span>
            </h1>
            <p className="text-xl text-muted-foreground text-pretty">
              Kalawa Health Center is a public KEPH Level 4 facility located in Kalawa ward, Mbooni constituency,
              Makueni County, Kenya. We are committed to providing quality healthcare services to our community.
            </p>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <Badge variant="secondary" className="w-fit">
                Our Mission
              </Badge>
              <h2 className="text-3xl lg:text-4xl font-bold text-balance">
                Providing Accessible Healthcare to Our Community
              </h2>
              <p className="text-lg text-muted-foreground text-pretty">
                Our mission is to provide comprehensive, quality healthcare services to the residents of Kalawa ward and
                surrounding communities. As a KEPH Level 4 facility, we are committed to delivering accessible,
                affordable, and compassionate medical care.
              </p>
              <p className="text-lg text-muted-foreground text-pretty">
                We believe in treating every patient with dignity and respect, ensuring that quality healthcare is
                available to all members of our community regardless of their background or circumstances.
              </p>
              <Button asChild>
                <Link href="/contact">
                  Get in Touch
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
            <div className="relative">
              <div className="aspect-square rounded-3xl overflow-hidden shadow-2xl">
                <img
                  src="/images/doctors-team.jpg"
                  alt="Healthcare professionals at Kalawa Health Center"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-6 -right-6 bg-card rounded-2xl shadow-xl p-6 border">
                <div className="text-center space-y-2">
                  <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mx-auto">
                    <Award className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <h3 className="font-bold">Expert Care Team</h3>
                  <p className="text-sm text-muted-foreground">Qualified professionals</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4 mb-16">
            <Badge variant="secondary" className="w-fit mx-auto">
              Our Values
            </Badge>
            <h2 className="text-3xl lg:text-4xl font-bold text-balance">What Drives Us Forward</h2>
            <p className="text-xl text-muted-foreground text-pretty max-w-2xl mx-auto">
              Our core values guide every decision we make and every service we provide.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <value.icon className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle className="text-lg">{value.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>{value.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Achievements Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <Badge variant="secondary" className="w-fit">
                Our Standards
              </Badge>
              <h2 className="text-3xl lg:text-4xl font-bold text-balance">Committed to Healthcare Excellence</h2>
              <p className="text-lg text-muted-foreground text-pretty">
                As a Ministry of Health regulated facility, we maintain high standards of medical care and continuously
                work to improve our services for the benefit of our community.
              </p>

              <div className="grid gap-3">
                {achievements.map((achievement, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                    <span className="text-foreground">{achievement}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <Card className="text-center">
                <CardHeader>
                  <CardTitle className="text-3xl font-bold text-primary">5K+</CardTitle>
                  <CardDescription>Patients Served</CardDescription>
                </CardHeader>
              </Card>
              <Card className="text-center">
                <CardHeader>
                  <CardTitle className="text-3xl font-bold text-primary">50+</CardTitle>
                  <CardDescription>Healthcare Staff</CardDescription>
                </CardHeader>
              </Card>
              <Card className="text-center">
                <CardHeader>
                  <CardTitle className="text-3xl font-bold text-primary">8+</CardTitle>
                  <CardDescription>Medical Services</CardDescription>
                </CardHeader>
              </Card>
              <Card className="text-center">
                <CardHeader>
                  <CardTitle className="text-3xl font-bold text-primary">24/7</CardTitle>
                  <CardDescription>Emergency Care</CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto space-y-8">
            <h2 className="text-3xl lg:text-4xl font-bold text-balance">Ready to Join Our Healthcare Community?</h2>
            <p className="text-xl text-primary-foreground/80 text-pretty">
              Experience quality healthcare at Kalawa Health Center. We're here to serve you and your family with
              compassionate, professional medical care.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="secondary" asChild>
                <Link href="/appointments">Book Appointment</Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary bg-transparent"
                asChild
              >
                <Link href="/contact">Contact Us</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
