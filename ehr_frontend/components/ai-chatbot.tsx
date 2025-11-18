"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { MessageCircle, Send, X, Minimize2, Maximize2, Bot, User } from "lucide-react"
import { cn } from "@/lib/utils"

interface Message {
  id: string
  content: string
  sender: "user" | "bot"
  timestamp: Date
  type?: "text" | "quick-reply" | "appointment" | "info"
  quickReplies?: string[]
}

interface AIChatbotProps {
  className?: string
}

export function AIChatbot({ className }: AIChatbotProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content:
        "Hello! I'm HealthBot, your Kalawa Health Center assistant. I can help you with appointments, general health questions, and navigating our services. How can I assist you today?",
      sender: "bot",
      timestamp: new Date(),
      type: "quick-reply",
      quickReplies: ["Book Appointment", "Check Symptoms", "Find Doctor", "Emergency Info"],
    },
  ])
  const [inputValue, setInputValue] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (isOpen && !isMinimized) {
      inputRef.current?.focus()
    }
  }, [isOpen, isMinimized])

  const generateBotResponse = (userMessage: string): Message => {
    const lowerMessage = userMessage.toLowerCase()

    // Appointment-related responses
    if (lowerMessage.includes("appointment") || lowerMessage.includes("book") || lowerMessage.includes("schedule")) {
      return {
        id: Date.now().toString(),
        content:
          "I can help you book an appointment! You can either use our online booking system or I can guide you through the process. Which department would you like to schedule with?",
        sender: "bot",
        timestamp: new Date(),
        type: "quick-reply",
        quickReplies: ["Cardiology", "Neurology", "Internal Medicine", "Emergency"],
      }
    }

    // Symptom checking
    if (lowerMessage.includes("symptom") || lowerMessage.includes("pain") || lowerMessage.includes("sick")) {
      return {
        id: Date.now().toString(),
        content:
          "I understand you're experiencing symptoms. While I can provide general information, it's important to consult with a healthcare professional for proper diagnosis. Would you like me to help you book an urgent appointment?",
        sender: "bot",
        timestamp: new Date(),
        type: "quick-reply",
        quickReplies: ["Book Urgent Appointment", "Find Nearest Clinic", "Emergency Services"],
      }
    }

    // Doctor finding
    if (lowerMessage.includes("doctor") || lowerMessage.includes("physician") || lowerMessage.includes("specialist")) {
      return {
        id: Date.now().toString(),
        content:
          "I can help you find the right doctor for your needs. Our medical team includes specialists in various fields. What type of specialist are you looking for?",
        sender: "bot",
        timestamp: new Date(),
        type: "quick-reply",
        quickReplies: ["Cardiologist", "Neurologist", "Orthopedist", "General Practitioner"],
      }
    }

    // Emergency information
    if (lowerMessage.includes("emergency") || lowerMessage.includes("urgent") || lowerMessage.includes("911")) {
      return {
        id: Date.now().toString(),
        content:
          "🚨 For life-threatening emergencies, please call 911 immediately. Our emergency department is open 24/7 at (555) 911-HELP. For non-emergency urgent care, I can help you find the fastest available appointment.",
        sender: "bot",
        timestamp: new Date(),
        type: "quick-reply",
        quickReplies: ["Call Emergency", "Urgent Care", "Find Nearest Hospital"],
      }
    }

    // Hours and contact info
    if (lowerMessage.includes("hours") || lowerMessage.includes("open") || lowerMessage.includes("contact")) {
      return {
        id: Date.now().toString(),
        content:
          "Our main hospital is open 24/7 for emergencies. Regular clinic hours are Mon-Fri 8AM-8PM, Sat-Sun 9AM-6PM. You can reach us at 0745 120 283 or info@kalawa.go.ke.",
        sender: "bot",
        timestamp: new Date(),
        type: "info",
      }
    }

    // Insurance and billing
    if (lowerMessage.includes("insurance") || lowerMessage.includes("billing") || lowerMessage.includes("cost")) {
      return {
        id: Date.now().toString(),
        content:
          "We accept most major insurance plans. For specific coverage questions, please contact our billing department at 0745 120 283. I can also help you understand what services are typically covered.",
        sender: "bot",
        timestamp: new Date(),
        type: "quick-reply",
        quickReplies: ["Check Coverage", "Payment Options", "Billing Support"],
      }
    }

    // Test results
    if (lowerMessage.includes("results") || lowerMessage.includes("lab") || lowerMessage.includes("test")) {
      return {
        id: Date.now().toString(),
        content:
          "Test results are typically available in your patient portal within 24-48 hours. You can access them by logging into your account. Would you like help accessing your portal?",
        sender: "bot",
        timestamp: new Date(),
        type: "quick-reply",
        quickReplies: ["Login Help", "Portal Guide", "Contact Lab"],
      }
    }

    // Prescriptions
    if (
      lowerMessage.includes("prescription") ||
      lowerMessage.includes("medication") ||
      lowerMessage.includes("refill")
    ) {
      return {
        id: Date.now().toString(),
        content:
          "For prescription refills, you can request them through your patient portal or call our pharmacy line at 0745 120 283. Most refills are processed within 24 hours.",
        sender: "bot",
        timestamp: new Date(),
        type: "quick-reply",
        quickReplies: ["Request Refill", "Pharmacy Info", "Medication Questions"],
      }
    }

    // Default response
    return {
      id: Date.now().toString(),
      content:
        "I'm here to help with your healthcare needs! I can assist with appointments, general health questions, finding doctors, or navigating our services. What would you like to know more about?",
      sender: "bot",
      timestamp: new Date(),
      type: "quick-reply",
      quickReplies: ["Book Appointment", "Find Doctor", "Emergency Info", "Contact Us"],
    }
  }

  const handleSendMessage = async (content: string) => {
    if (!content.trim()) return

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      content: content.trim(),
      sender: "user",
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputValue("")
    setIsTyping(true)

    // Simulate typing delay
    setTimeout(
      () => {
        const botResponse = generateBotResponse(content)
        setMessages((prev) => [...prev, botResponse])
        setIsTyping(false)
      },
      1000 + Math.random() * 1000,
    )
  }

  const handleQuickReply = (reply: string) => {
    handleSendMessage(reply)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    handleSendMessage(inputValue)
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        size="lg"
        className={cn(
          "fixed bottom-6 right-6 z-50 rounded-full w-14 h-14 shadow-lg hover:shadow-xl transition-all duration-300",
          className,
        )}
      >
        <MessageCircle className="w-6 h-6" />
        <span className="sr-only">Open chat</span>
      </Button>
    )
  }

  return (
    <Card
      className={cn(
        "fixed bottom-6 right-6 z-50 w-96 shadow-2xl transition-all duration-300",
        isMinimized ? "h-16" : "h-[600px]",
        className,
      )}
    >
      {/* Header */}
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 bg-primary text-primary-foreground rounded-t-lg">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary-foreground/20 rounded-full flex items-center justify-center">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <CardTitle className="text-sm font-semibold">HealthBot</CardTitle>
            <p className="text-xs text-primary-foreground/80">Kalawa Health Center Assistant</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsMinimized(!isMinimized)}
            className="h-8 w-8 p-0 text-primary-foreground hover:bg-primary-foreground/20"
          >
            {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsOpen(false)}
            className="h-8 w-8 p-0 text-primary-foreground hover:bg-primary-foreground/20"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>

      {!isMinimized && (
        <CardContent className="p-0 flex flex-col h-[calc(600px-80px)]">
          {/* Messages */}
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn("flex gap-3", message.sender === "user" ? "justify-end" : "justify-start")}
                >
                  {message.sender === "bot" && (
                    <Avatar className="w-8 h-8 flex-shrink-0">
                      <AvatarFallback className="bg-primary/10">
                        <Bot className="w-4 h-4 text-primary" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <div
                    className={cn(
                      "max-w-[80%] space-y-2",
                      message.sender === "user" ? "items-end" : "items-start",
                      "flex flex-col",
                    )}
                  >
                    <div
                      className={cn(
                        "rounded-lg px-3 py-2 text-sm",
                        message.sender === "user" ? "bg-primary text-primary-foreground" : "bg-muted text-foreground",
                      )}
                    >
                      {message.content}
                    </div>
                    <span className="text-xs text-muted-foreground">{formatTime(message.timestamp)}</span>

                    {/* Quick Replies */}
                    {message.quickReplies && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {message.quickReplies.map((reply, index) => (
                          <Button
                            key={index}
                            variant="outline"
                            size="sm"
                            onClick={() => handleQuickReply(reply)}
                            className="text-xs h-7 bg-transparent"
                          >
                            {reply}
                          </Button>
                        ))}
                      </div>
                    )}
                  </div>
                  {message.sender === "user" && (
                    <Avatar className="w-8 h-8 flex-shrink-0">
                      <AvatarFallback className="bg-secondary">
                        <User className="w-4 h-4" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))}

              {/* Typing Indicator */}
              {isTyping && (
                <div className="flex gap-3 justify-start">
                  <Avatar className="w-8 h-8 flex-shrink-0">
                    <AvatarFallback className="bg-primary/10">
                      <Bot className="w-4 h-4 text-primary" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="bg-muted rounded-lg px-3 py-2">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:0.1s]" />
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:0.2s]" />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {/* Input */}
          <div className="border-t p-4">
            <form onSubmit={handleSubmit} className="flex gap-2">
              <Input
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Type your message..."
                className="flex-1"
                disabled={isTyping}
              />
              <Button type="submit" size="sm" disabled={!inputValue.trim() || isTyping}>
                <Send className="w-4 h-4" />
              </Button>
            </form>
            <div className="flex items-center justify-center mt-2">
              <Badge variant="secondary" className="text-xs">
                Powered by AI • For emergencies call 911
              </Badge>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  )
}


