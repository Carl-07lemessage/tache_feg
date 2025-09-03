"use client"

import type React from "react"

import { useState, useEffect, createContext, useContext } from "react"
import { createBrowserClient } from "@/lib/supabase/client"
import type { User } from "@supabase/supabase-js"

interface AuthContextType {
  user: User | null
  loading: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signOut: async () => {},
})

export function useAuth() {
  return useContext(AuthContext)
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createBrowserClient()

  useEffect(() => {
    console.log("[v0] AuthProvider: Initializing auth state")

    // Get initial session
    const getInitialSession = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession()
        console.log("[v0] AuthProvider: Initial session", { session, error })

        if (error) {
          console.error("[v0] AuthProvider: Error getting session", error)
        } else {
          setUser(session?.user ?? null)
        }
      } catch (err) {
        console.error("[v0] AuthProvider: Exception getting session", err)
      } finally {
        setLoading(false)
      }
    }

    getInitialSession()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("[v0] AuthProvider: Auth state changed", { event, session })
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => {
      console.log("[v0] AuthProvider: Cleaning up auth subscription")
      subscription.unsubscribe()
    }
  }, [supabase.auth])

  const signOut = async () => {
    console.log("[v0] AuthProvider: Signing out")
    try {
      const { error } = await supabase.auth.signOut()
      if (error) {
        console.error("[v0] AuthProvider: Error signing out", error)
      }
    } catch (err) {
      console.error("[v0] AuthProvider: Exception signing out", err)
    }
  }

  return <AuthContext.Provider value={{ user, loading, signOut }}>{children}</AuthContext.Provider>
}
