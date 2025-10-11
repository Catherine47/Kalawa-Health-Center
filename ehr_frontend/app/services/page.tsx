import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Shield, Pill, TestTube, Heart, CheckCircle, ArrowRight, Baby, Users, Activity, Microscope } from "lucide-react"

export default function ServicesPage() {
  const services = [
    {
      icon: Heart,
      title: "Curative Services",
      description:
        "Comprehensive outpatient and inpatient care for various medical conditions with dedicated beds for admitted patients.",
      features: ["General Outpatient Department", "Inpatient Care", "Medical Consultations", "Treatment Plans"],
      color: "bg-blue-100 text-blue-600",
    },
    {
      icon: Baby,
      title: "Maternity & Neonatal Services",
      description:
        "Complete maternal care including maternity wards, operating theatres for deliveries, and comprehensive newborn care.",
      features: ["Normal Deliveries", "Caesarean Sections", "Newborn Care", "Child Healthcare"],
      color: "bg-pink-100 text-pink-600",
    },
    {
      icon: Users,
      title: "Antenatal & Postnatal Care",
      description:
        "Specialized care for women during pregnancy and after childbirth, including high-risk pregnancy management.",
      features: ["Pregnancy Monitoring", "High-Risk Pregnancy Care", "Postnatal Support", "Maternal Health"],
      color: "bg-purple-100 text-purple-600",
    },
    {
      icon: Shield,
      title: "Family Planning Services",
      description:
        "Comprehensive family planning options including various contraceptive methods and natural family planning.",
      features: ["Short-Acting Methods", "Long-Acting Methods", "Natural Family Planning", "Counseling Services"],
      color: "bg-green-100 text-green-600",
    },
    {
      icon: Activity,
      title: "HIV/AIDS Services",
      description:
        "Complete HIV care including counseling, testing, treatment, and prevention of mother-to-child transmission.",
      features: ["HIV Counseling & Testing", "Treatment Services", "EMTCT Prevention", "Support Programs"],
      color: "bg-red-100 text-red-600",
    },
    {
      icon: TestTube,
      title: "Laboratory Services",
      description:
        "On-site laboratory facilities providing various diagnostic tests including malaria and HIV testing.",
      features: ["Malaria Testing", "HIV Testing", "Blood Work", "Diagnostic Services"],
      color: "bg-orange-100 text-orange-600",
    },
    {
      icon: Microscope,
      title: "Tuberculosis (TB) Care",
      description:
        "Comprehensive TB services including diagnosis through smear microscopy and complete treatment programs.",
      features: ["TB Diagnosis", "Smear Microscopy", "Treatment Programs", "Follow-up Care"],
      color: "bg-indigo-100 text-indigo-600",
    },
    {
      icon: Pill,
      title: "Immunization Services",
      description: "Routine child immunization programs as part of comprehensive maternal and child health services.",
      features: ["Child Immunizations", "Vaccination Schedules", "Health Monitoring", "Preventive Care"],
      color: "bg-teal-100 text-teal-600",
    },
  ]

  const benefits = [
    "24/7 Healthcare Services",
    "KEPH Level 4 Facility",
    "Qualified Medical Staff",
    "Modern Equipment",
    "Community-Focused Care",
    "Affordable Healthcare",
  ]

  return (
    <div className="min-h-screen">
      <Header />

      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-primary/10 via-background to-accent/10">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <Badge variant="secondary" className="w-fit mx-auto">
              Clinical Services
            </Badge>
            <h1 className="text-4xl lg:text-6xl font-bold text-balance">
              Comprehensive <span className="text-primary">Healthcare</span> Services
            </h1>
            <p className="text-xl text-muted-foreground text-pretty">
              Kalawa Health Center provides a full range of clinical services to meet the healthcare needs of our
              community in Makueni County.
            </p>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4 mb-16">
            <Badge variant="secondary" className="w-fit mx-auto">
              Our Clinical Services
            </Badge>
            <h2 className="text-3xl lg:text-4xl font-bold text-balance">Quality Healthcare for All</h2>
            <p className="text-xl text-muted-foreground text-pretty max-w-2xl mx-auto">
              From maternal care to laboratory services, we provide comprehensive healthcare solutions for our
              community.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 ${service.color}`}>
                    <service.icon className="w-6 h-6" />
                  </div>
                  <CardTitle className="text-xl">{service.title}</CardTitle>
                  <CardDescription className="text-base">{service.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                      Services Offered
                    </h4>
                    <ul className="space-y-2">
                      {service.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="text-sm text-foreground flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-primary flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <Badge variant="secondary" className="w-fit">
                Why Choose Kalawa Health Center
              </Badge>
              <h2 className="text-3xl lg:text-4xl font-bold text-balance">
                <span className="text-primary">KEPH Level 4</span> Healthcare Excellence
              </h2>
              <p className="text-lg text-muted-foreground text-pretty">
                As a KEPH Level 4 facility, Kalawa Health Center is committed to providing quality healthcare services
                to the community of Makueni County with modern facilities and qualified medical professionals.
              </p>

              <div className="grid grid-cols-2 gap-3">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                    <span className="text-sm font-medium">{benefit}</span>
                  </div>
                ))}
              </div>

              <Button asChild>
                <Link href="/appointments">
                  Book Appointment Today
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>

            <div className="relative">
              <div className="aspect-square bg-gradient-to-br from-primary/20 to-accent/20 rounded-3xl p-8">
                <div className="w-full h-full bg-card rounded-2xl shadow-xl flex items-center justify-center">
                  <div className="text-center space-y-4">
                    <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center mx-auto">
                      <Heart className="w-10 h-10 text-primary-foreground" />
                    </div>
                    <h3 className="text-2xl font-bold">Community Care</h3>
                    <p className="text-muted-foreground">Serving Makueni County</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4 mb-16">
            <Badge variant="secondary" className="w-fit mx-auto">
              How It Works
            </Badge>
            <h2 className="text-3xl lg:text-4xl font-bold text-balance">Simple Steps to Better Healthcare</h2>
            <p className="text-xl text-muted-foreground text-pretty max-w-2xl mx-auto">
              Getting started with our digital healthcare services is easy and straightforward.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto text-primary-foreground text-2xl font-bold">
                1
              </div>
              <h3 className="text-xl font-semibold">Register & Verify</h3>
              <p className="text-muted-foreground">
                Create your account and verify your identity through our secure registration process.
              </p>
            </div>
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto text-primary-foreground text-2xl font-bold">
                2
              </div>
              <h3 className="text-xl font-semibold">Access Your Portal</h3>
              <p className="text-muted-foreground">
                Log in to your patient portal to access all your health information and services.
              </p>
            </div>
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto text-primary-foreground text-2xl font-bold">
                3
              </div>
              <h3 className="text-xl font-semibold">Manage Your Health</h3>
              <p className="text-muted-foreground">
                Book appointments, view records, get prescriptions, and communicate with your care team.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto space-y-8">
            <h2 className="text-3xl lg:text-4xl font-bold text-balance">Ready for Quality Healthcare?</h2>
            <p className="text-xl text-primary-foreground/80 text-pretty">
              Contact Kalawa Health Center today to access our comprehensive clinical services and experience quality
              healthcare in Makueni County.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="secondary" asChild>
                <Link href="/contact">Contact Us</Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary bg-transparent"
                asChild
              >
                <Link href="/appointments">Book Appointment</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
