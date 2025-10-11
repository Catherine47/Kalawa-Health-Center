"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AIChatbot } from "@/components/ai-chatbot"
import { Bot, MessageCircle, Clock, Shield, Heart, Zap, CheckCircle } from "lucide-react"

export default function ChatPage() {
  const [showFullscreenChat, setShowFullscreenChat] = useState(false)

  const features = [
    {
      icon: Clock,
      title: "24/7 Availability",
      description: "Get instant answers to your healthcare questions anytime, day or night",
    },
    {
      icon: Shield,
      title: "HIPAA Compliant",
      description: "Your conversations are secure and protected with enterprise-grade encryption",
    },
    {
      icon: Heart,
      title: "Healthcare Focused",
      description: "Specialized knowledge in medical terminology and healthcare procedures",
    },
    {
      icon: Zap,
      title: "Instant Responses",
      description: "Get immediate help with appointments, symptoms, and general health questions",
    },
  ]

  const capabilities = [
    "Book and manage appointments",
    "Answer general health questions",
    "Provide emergency contact information",
    "Help navigate patient portal",
    "Explain medical procedures",
    "Assist with prescription refills",
    "Find the right specialist",
    "Check insurance coverage",
  ]

  if (showFullscreenChat) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold">Healthcare Assistant</h1>
                <p className="text-muted-foreground">Chat with MediBot for instant healthcare support</p>
              </div>
              <Button variant="outline" onClick={() => setShowFullscreenChat(false)}>
                Exit Fullscreen
              </Button>
            </div>
            <div className="h-[600px]">
              <AIChatbot className="relative bottom-0 right-0 w-full h-full shadow-none border" />
            </div>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <Header />

      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-primary/10 via-background to-accent/10">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <Badge variant="secondary" className="w-fit mx-auto">
              AI Healthcare Assistant
            </Badge>
            <h1 className="text-4xl lg:text-6xl font-bold text-balance">
              Meet <span className="text-primary">MediBot</span>
            </h1>
            <p className="text-xl text-muted-foreground text-pretty">
              Your intelligent healthcare companion, available 24/7 to answer questions, help with appointments, and
              guide you through our services.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" onClick={() => setShowFullscreenChat(true)}>
                <MessageCircle className="mr-2 h-5 w-5" />
                Start Chatting
              </Button>
              <Button size="lg" variant="outline" className="bg-transparent">
                <Bot className="mr-2 h-5 w-5" />
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4 mb-16">
            <Badge variant="secondary" className="w-fit mx-auto">
              AI Features
            </Badge>
            <h2 className="text-3xl lg:text-4xl font-bold text-balance">Intelligent Healthcare Support</h2>
            <p className="text-xl text-muted-foreground text-pretty max-w-2xl mx-auto">
              MediBot combines advanced AI with healthcare expertise to provide you with accurate, helpful assistance.
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

      {/* Capabilities Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <Badge variant="secondary" className="w-fit">
                What MediBot Can Do
              </Badge>
              <h2 className="text-3xl lg:text-4xl font-bold text-balance">
                Your <span className="text-primary">Comprehensive</span> Healthcare Assistant
              </h2>
              <p className="text-lg text-muted-foreground text-pretty">
                MediBot is trained on healthcare knowledge and can assist you with a wide range of medical and
                administrative tasks, making your healthcare experience smoother and more efficient.
              </p>

              <div className="grid gap-3">
                {capabilities.map((capability, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                    <span className="text-foreground">{capability}</span>
                  </div>
                ))}
              </div>

              <Button onClick={() => setShowFullscreenChat(true)}>
                <MessageCircle className="mr-2 h-5 w-5" />
                Try MediBot Now
              </Button>
            </div>

            <div className="relative">
              <div className="aspect-square bg-gradient-to-br from-primary/20 to-accent/20 rounded-3xl p-8">
                <div className="w-full h-full bg-card rounded-2xl shadow-xl flex items-center justify-center">
                  <div className="text-center space-y-4">
                    <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center mx-auto">
                      <Bot className="w-10 h-10 text-primary-foreground" />
                    </div>
                    <h3 className="text-2xl font-bold">AI-Powered</h3>
                    <p className="text-muted-foreground">Smart Healthcare Assistant</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sample Conversation */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4 mb-16">
            <Badge variant="secondary" className="w-fit mx-auto">
              Sample Conversation
            </Badge>
            <h2 className="text-3xl lg:text-4xl font-bold text-balance">See MediBot in Action</h2>
            <p className="text-xl text-muted-foreground text-pretty max-w-2xl mx-auto">
              Here's an example of how MediBot can help you with your healthcare needs.
            </p>
          </div>

          <div className="max-w-2xl mx-auto">
            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {/* User Message */}
                  <div className="flex justify-end">
                    <div className="bg-primary text-primary-foreground rounded-lg px-4 py-2 max-w-[80%]">
                      I need to book an appointment with a cardiologist
                    </div>
                  </div>

                  {/* Bot Response */}
                  <div className="flex justify-start gap-3">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <Bot className="w-4 h-4 text-primary" />
                    </div>
                    <div className="bg-muted rounded-lg px-4 py-2 max-w-[80%]">
                      I can help you book a cardiology appointment! We have excellent cardiologists available. Would you
                      prefer Dr. Sarah Johnson (Interventional Cardiology) or Dr. Michael Smith (Cardiac Surgery)?
                    </div>
                  </div>

                  {/* User Message */}
                  <div className="flex justify-end">
                    <div className="bg-primary text-primary-foreground rounded-lg px-4 py-2 max-w-[80%]">
                      Dr. Sarah Johnson sounds good
                    </div>
                  </div>

                  {/* Bot Response */}
                  <div className="flex justify-start gap-3">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <Bot className="w-4 h-4 text-primary" />
                    </div>
                    <div className="bg-muted rounded-lg px-4 py-2 max-w-[80%]">
                      Perfect choice! Dr. Johnson has availability next week. I can redirect you to our booking system
                      or help you find the next available appointment. What works better for you?
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto space-y-8">
            <h2 className="text-3xl lg:text-4xl font-bold text-balance">Ready to Get Started?</h2>
            <p className="text-xl text-primary-foreground/80 text-pretty">
              Experience the future of healthcare assistance. MediBot is here to help you 24/7 with all your healthcare
              needs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="secondary" onClick={() => setShowFullscreenChat(true)}>
                <MessageCircle className="mr-2 h-5 w-5" />
                Start Chatting Now
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary bg-transparent"
              >
                <Bot className="mr-2 h-5 w-5" />
                Learn More About AI
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
