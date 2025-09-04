"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { useInvitations } from "@/hooks/use-invitations"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, CheckCircle, XCircle, Users } from "lucide-react"
import Link from "next/link"

export default function InvitePage({ params }: { params: { token: string } }) {
  const { user, loading: authLoading } = useAuth()
  const { acceptInvitation } = useInvitations()
  const [isAccepting, setIsAccepting] = useState(false)
  const [result, setResult] = useState<{ success?: boolean; error?: string } | null>(null)
  const router = useRouter()

  const handleAcceptInvitation = async () => {
    if (!user) return

    setIsAccepting(true)
    const { error } = await acceptInvitation(params.token)

    if (error) {
      setResult({ error })
    } else {
      setResult({ success: true })
      setTimeout(() => {
        router.push("/")
      }, 2000)
    }
    setIsAccepting(false)
  }

  if (authLoading) {
    return (
      <div className="flex min-h-svh w-full items-center justify-center p-6">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600 mx-auto mb-4" />
          <p className="text-stone-600">Chargement...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex min-h-svh w-full items-center justify-center p-6">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <Users className="h-12 w-12 text-emerald-600 mx-auto mb-4" />
            <CardTitle className="text-2xl">Invitation au Projet</CardTitle>
            <CardDescription>Vous devez être connecté pour accepter cette invitation</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col gap-2">
              <Button asChild>
                <Link href="/auth/login">Se connecter</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/auth/sign-up">Créer un compte</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <Users className="h-12 w-12 text-emerald-600 mx-auto mb-4" />
          <CardTitle className="text-2xl">Invitation au Projet</CardTitle>
          <CardDescription>Vous avez été invité à rejoindre un projet</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {result?.success && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-700">
                Invitation acceptée avec succès ! Redirection en cours...
              </AlertDescription>
            </Alert>
          )}

          {result?.error && (
            <Alert className="border-red-200 bg-red-50">
              <XCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-700">{result.error}</AlertDescription>
            </Alert>
          )}

          {!result && (
            <div className="flex flex-col gap-2">
              <Button onClick={handleAcceptInvitation} disabled={isAccepting} className="w-full">
                {isAccepting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Acceptation...
                  </>
                ) : (
                  "Accepter l'invitation"
                )}
              </Button>
              <Button variant="outline" asChild>
                <Link href="/">Retour au tableau de bord</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}