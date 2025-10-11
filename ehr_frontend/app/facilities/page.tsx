import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { MapPin, Phone, Clock, ArrowRight } from "lucide-react"

export default function FacilitiesPage() {
  const facilities = [
    {
      title: "Modern Examination Rooms",
      description: "Well-equipped examination rooms with the latest medical equipment for comprehensive patient care.",
      image: "/images/examination-room.jpg",
      features: ["Digital equipment", "Comfortable environment", "Privacy assured", "Sterile conditions"],
    },
    {
      title: "Surgical Theater",
      description: "State-of-the-art surgical facilities with qualified medical staff for various medical procedures.",
      image: "/images/surgical-theater.jpg",
      features: ["Modern surgical equipment", "Sterile environment", "Qualified staff", "Emergency ready"],
    },
    {
      title: "Medical Ward",
      description: "Dedicated patient care areas with professional medical staff providing comprehensive treatment.",
      image: "/images/medical-ward.jpg",
      features: ["Patient monitoring", "Professional care", "Comfortable beds", "24/7 supervision"],
    },
    {
      title: "Patient Waiting Areas",
      description: "Comfortable and accessible waiting areas designed with patient comfort and convenience in mind.",
      image: "/images/hospital-corridor.jpg",
      features: ["Comfortable seating", "Covered walkways", "Easy accessibility", "Clean environment"],
    },
    {
      title: "Hospital Campus",
      description:
        "Our welcoming hospital buildings are designed to serve the community with easy access and modern facilities.",
      image: "/images/hospital-exterior-2.jpg",
      features: ["Modern architecture", "Accessible design", "Community-focused", "Well-maintained grounds"],
    },
    {
      title: "Hospital Buildings",
      description:
        "Our welcoming hospital buildings are designed to serve the community with easy access and modern facilities.",
      image: "/images/hospital-exterior-2.jpg",
      features: ["Modern architecture", "Accessible design", "Community-focused", "Well-maintained grounds"],
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
              Our Facilities
            </Badge>
            <h1 className="text-4xl lg:text-6xl font-bold text-balance">
              Modern Healthcare <span className="text-primary">Infrastructure</span>
            </h1>
            <p className="text-xl text-muted-foreground text-pretty">
              Explore our well-equipped facilities designed to provide the best healthcare experience for patients in
              Makueni County.
            </p>
          </div>
        </div>
      </section>

      {/* Main Hospital Image */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="aspect-[16/9] rounded-3xl overflow-hidden shadow-2xl mb-8">
              <img
                src="/images/hospital-exterior-1.jpg"
                alt="Kalawa Health Center main building"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="text-center space-y-4">
              <h2 className="text-3xl font-bold">Kalawa Health Center Healthcare Facility</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Our main hospital building houses all major departments and services, providing comprehensive healthcare
                to the Kalawa ward and surrounding communities.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Facilities Grid */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4 mb-16">
            <Badge variant="secondary" className="w-fit mx-auto">
              Facility Features
            </Badge>
            <h2 className="text-3xl lg:text-4xl font-bold text-balance">Inside Our Healthcare Facility</h2>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {facilities.map((facility, index) => (
              <Card key={index} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="aspect-[4/3] overflow-hidden">
                  <img
                    src={facility.image || "/placeholder.svg"}
                    alt={facility.title}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <CardHeader>
                  <CardTitle className="text-xl">{facility.title}</CardTitle>
                  <CardDescription>{facility.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {facility.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center gap-2 text-sm">
                        <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Location Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <Badge variant="secondary" className="w-fit">
                Visit Us
              </Badge>
              <h2 className="text-3xl lg:text-4xl font-bold text-balance">Find Us in Kalawa Ward</h2>
              <p className="text-lg text-muted-foreground text-pretty">
                Located in the heart of Kalawa ward, Mbooni constituency, our facility is easily accessible to serve the
                healthcare needs of Makueni County residents.
              </p>

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-primary" />
                  <span>Kalawa Ward, Mbooni Constituency, Makueni County</span>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-primary" />
                  <span>0745 120283</span>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-primary" />
                  <span>Open 24/7 for Emergency Services</span>
                </div>
              </div>

              <Button asChild>
                <Link href="/contact">
                  Get Directions
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>

            <div className="aspect-square rounded-3xl overflow-hidden shadow-2xl">
              <img
                src="/kalawa-hospital-map.png"
                alt="Kalawa Health Center location map"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
