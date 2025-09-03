"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { createBrowserClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

export function AuthComponent() {
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const router = useRouter()
  const supabase = createBrowserClient()

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        setError(error.message)
      } else {
        router.refresh()
      }
    } catch (err) {
      setError("Une erreur est survenue lors de la connexion")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-50 p-4">
      <Card className="w-full max-w-md border-stone-200">
        <CardHeader className="text-center">
          <div className="relative w-16 h-16 mx-auto mb-4">
            <Image src="/images/logo-feg.png" alt="FEG Logo" width={64} height={64} className="object-contain" />
          </div>
          <CardTitle className="text-2xl font-bold text-emerald-800">Connexion FEG</CardTitle>
          <CardDescription className="text-stone-600">Accédez au système de gestion de projets</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignIn} className="space-y-4">
            {error && (
              <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">{error}</div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-stone-700">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="votre.email@feg.ga"
                className="border-stone-300 focus:border-emerald-500 focus:ring-emerald-200"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-stone-700">
                Mot de passe
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="border-stone-300 focus:border-emerald-500 focus:ring-emerald-200"
                required
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-emerald-700 hover:bg-emerald-800 text-white"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Connexion...
                </>
              ) : (
                "Se connecter"
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-stone-600">
              Pas encore de compte ?{" "}
              <Link href="/auth/sign-up" className="text-emerald-700 hover:text-emerald-800 font-medium">
                Créer un compte
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
