import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Heart, Baby, Users, Shield, Activity, TestTube, Microscope, Pill, Clock, Phone, MapPin } from "lucide-react"

export default function DepartmentsPage() {
  const departments = [
    {
      icon: Heart,
      name: "Curative Services",
      description:
        "General outpatient department for initial consultations and inpatient section with dedicated beds for comprehensive medical care.",
      services: ["General Consultations", "Inpatient Care", "Medical Treatment", "Health Assessments"],
      availability: "24/7",
      color: "bg-blue-100 text-blue-600",
    },
    {
      icon: Baby,
      name: "Maternity & Neonatal",
      description:
        "Complete maternal and newborn care with maternity wards and operating theatres for both normal and caesarean deliveries.",
      services: ["Normal Deliveries", "Caesarean Sections", "Newborn Care", "Pediatric Services"],
      availability: "24/7",
      color: "bg-pink-100 text-pink-600",
    },
    {
      icon: Users,
      name: "Antenatal & Postnatal Care",
      description:
        "Specialized care for women during pregnancy and after childbirth, including management of high-risk pregnancies.",
      services: ["Pregnancy Monitoring", "High-Risk Pregnancy Care", "Postnatal Support", "Maternal Health Education"],
      availability: "Daily",
      color: "bg-purple-100 text-purple-600",
    },
    {
      icon: Shield,
      name: "Family Planning",
      description:
        "Comprehensive family planning services offering various contraceptive methods and natural family planning education.",
      services: [
        "Short-Acting Methods",
        "Long-Acting Methods",
        "Natural Family Planning",
        "Reproductive Health Counseling",
      ],
      availability: "Daily",
      color: "bg-green-100 text-green-600",
    },
    {
      icon: Activity,
      name: "HIV/AIDS Services",
      description:
        "Complete HIV care including counseling, testing, treatment services, and prevention of mother-to-child transmission.",
      services: ["HIV Counseling & Testing", "Antiretroviral Treatment", "EMTCT Prevention", "Support Groups"],
      availability: "Daily",
      color: "bg-red-100 text-red-600",
    },
    {
      icon: TestTube,
      name: "Laboratory Services",
      description:
        "On-site laboratory facilities providing essential diagnostic tests including malaria and HIV testing with quick results.",
      services: ["Malaria Testing", "HIV Testing", "Blood Analysis", "Diagnostic Tests"],
      availability: "24/7",
      color: "bg-orange-100 text-orange-600",
    },
    {
      icon: Microscope,
      name: "Tuberculosis Care",
      description:
        "Comprehensive TB services including diagnosis through smear microscopy and complete treatment programs with follow-up care.",
      services: ["TB Diagnosis", "Smear Microscopy", "Treatment Programs", "Patient Monitoring"],
      availability: "Daily",
      color: "bg-indigo-100 text-indigo-600",
    },
    {
      icon: Pill,
      name: "Immunization",
      description:
        "Routine child immunization programs as part of comprehensive maternal and child health services for community wellness.",
      services: ["Child Immunizations", "Vaccination Schedules", "Health Records", "Preventive Care"],
      availability: "Daily",
      color: "bg-teal-100 text-teal-600",
    },
  ]

  return (
    <div className="min-h-screen">
      <Header />

      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-primary/10 via-background to-accent/10">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <Badge variant="secondary" className="w-fit mx-auto">
              Clinical Departments
            </Badge>
            <h1 className="text-4xl lg:text-6xl font-bold text-balance">
              Comprehensive <span className="text-primary">Healthcare</span> Departments
            </h1>
            <p className="text-xl text-muted-foreground text-pretty">
              Kalawa Health Center's specialized departments provide quality healthcare services to meet the diverse
              medical needs of our community in Makueni County.
            </p>
          </div>
        </div>
      </section>

      {/* Departments Grid */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {departments.map((dept, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${dept.color}`}>
                    <dept.icon className="w-8 h-8" />
                  </div>
                  <CardTitle className="text-xl">{dept.name}</CardTitle>
                  <CardDescription className="text-base">{dept.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                      Services Offered
                    </h4>
                    <ul className="space-y-1">
                      {dept.services.map((service, serviceIndex) => (
                        <li key={serviceIndex} className="text-sm text-foreground flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-primary rounded-full flex-shrink-0" />
                          {service}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      <span>{dept.availability}</span>
                    </div>
                    <Button size="sm" variant="outline">
                      <Phone className="w-4 h-4 mr-2" />
                      Contact
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Emergency Section */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto space-y-8">
            <div className="w-16 h-16 bg-primary-foreground/20 rounded-full flex items-center justify-center mx-auto">
              <Heart className="w-8 h-8" />
            </div>
            <h2 className="text-3xl lg:text-4xl font-bold text-balance">24/7 Healthcare Services</h2>
            <p className="text-xl text-primary-foreground/80 text-pretty">
              Kalawa Health Center is always ready to provide quality healthcare services when you need them most. Our
              facility operates around the clock to serve our community.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="secondary">
                <Phone className="mr-2 h-5 w-5" />
                Call: 0745 120283
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary bg-transparent"
              >
                <MapPin className="mr-2 h-5 w-5" />
                Kalawa Ward, Mbooni
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
