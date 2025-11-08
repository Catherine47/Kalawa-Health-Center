const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"

export async function apiCall(endpoint: string, options: RequestInit = {}) {
  const url = `${API_URL}${endpoint}`

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  }

  const token = typeof window !== "undefined" ? localStorage.getItem("authToken") : null
  if (token) {
    headers["Authorization"] = `Bearer ${token}`
  }

  try {
    console.log("[v0] API Call:", { url, method: options.method || "GET" })

    const response = await fetch(url, {
      ...options,
      headers,
    })

    const data = await response.json()

    if (!response.ok) {
      console.log("[v0] API Error:", data)
      throw new Error(data.error || `API Error: ${response.statusText}`)
    }

    console.log("[v0] API Success:", data)
    return data
  } catch (error) {
    console.log("[v0] API Exception:", error)
    throw error
  }
}
