import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function SignUpSuccessPage() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col items-center gap-2">
            <img src="/images/logo-feg.png" alt="FEG Logo" className="h-16 w-auto" />
            <h1 className="text-2xl font-bold text-center">Tableau de Bord FEG</h1>
          </div>
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Inscription réussie !</CardTitle>
              <CardDescription>Vérifiez votre email pour confirmer votre compte</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Vous avez créé votre compte avec succès. Veuillez vérifier votre boîte email et cliquer sur le lien de
                confirmation pour activer votre compte.
              </p>
              <div className="flex flex-col gap-2">
                <Button asChild>
                  <Link href="/auth/login">Retour à la connexion</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
