import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default async function AuthErrorPage({
  searchParams,
}: {
  searchParams: Promise<{ error: string }>
}) {
  const params = await searchParams

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
              <CardTitle className="text-2xl">Erreur d'authentification</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {params?.error ? (
                <p className="text-sm text-muted-foreground">Erreur : {params.error}</p>
              ) : (
                <p className="text-sm text-muted-foreground">Une erreur non spécifiée s'est produite.</p>
              )}
              <Button asChild className="w-full">
                <Link href="/auth/login">Retour à la connexion</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
