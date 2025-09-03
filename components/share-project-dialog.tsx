"use client"

import { useState } from "react"
import { useInvitations } from "@/hooks/use-invitations"
import { useProjectMembers } from "@/hooks/use-membre_projets"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Mail, Users, UserMinus, Eye, Edit, Shield, Crown, Clock, CheckCircle, XCircle, Copy } from "lucide-react"

interface ShareProjectDialogProps {
  isOpen: boolean
  onClose: () => void
  projectId: string
  projectName: string
}

export function ShareProjectDialog({ isOpen, onClose, projectId, projectName }: ShareProjectDialogProps) {
  const { invitations, sendInvitation, cancelInvitation } = useInvitations(projectId)
  const { projectMembers, handleRemoveProjectMember, handleUpdateMemberRole } = useProjectMembers(projectId)

  const [newInvite, setNewInvite] = useState({ email: "", role: "Membre" })
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const handleSendInvitation = async () => {
    if (!newInvite.email.trim()) return

    setIsLoading(true)
    setMessage(null)

    const { error } = await sendInvitation(projectId, newInvite.email, newInvite.role)

    if (error) {
      // Affiche le message d'erreur détaillé dans l'alerte
      setMessage({ type: "error", text: typeof error === 'string' ? error : JSON.stringify(error) })
    } else {
      setMessage({ type: "success", text: "Invitation envoyée avec succès !" })
      setNewInvite({ email: "", role: "Membre" })
    }
    setIsLoading(false)
  }

  const handleCancelInvitation = async (invitationId: string) => {
    const { error } = await cancelInvitation(invitationId)
    if (error) {
      setMessage({ type: "error", text: error })
    }
  }

  const copyInviteLink = (token: string) => {
    const link = `${window.location.origin}/invite/${token}`
    navigator.clipboard.writeText(link)
    setMessage({ type: "success", text: "Lien d'invitation copié dans le presse-papiers !" })
    setTimeout(() => setMessage(null), 3000)
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "Propriétaire":
        return <Crown className="w-4 h-4 text-yellow-600" />
      case "Admin":
        return <Shield className="w-4 h-4 text-blue-600" />
      case "Membre":
        return <Edit className="w-4 h-4 text-green-600" />
      case "Observateur":
        return <Eye className="w-4 h-4 text-gray-600" />
      default:
        return <Users className="w-4 h-4" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "En attente":
        return (
          <Badge variant="outline" className="text-yellow-600 border-yellow-300">
            <Clock className="w-3 h-3 mr-1" />
            En attente
          </Badge>
        )
      case "Accepté":
        return (
          <Badge variant="outline" className="text-green-600 border-green-300">
            <CheckCircle className="w-3 h-3 mr-1" />
            Accepté
          </Badge>
        )
      case "Expiré":
        return (
          <Badge variant="outline" className="text-red-600 border-red-300">
            <XCircle className="w-3 h-3 mr-1" />
            Expiré
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-emerald-600" />
            Partager "{projectName}"
          </DialogTitle>
          <DialogDescription>Invitez des collaborateurs par email et gérez les accès au projet.</DialogDescription>
        </DialogHeader>

        {message && (
          <Alert className={message.type === "error" ? "border-red-200 bg-red-50" : "border-green-200 bg-green-50"}>
            <AlertDescription className={message.type === "error" ? "text-red-700" : "text-green-700"}>
              {message.text}
            </AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="invite" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="invite" className="flex items-center gap-2">
              <Mail className="w-4 h-4" />
              Inviter
            </TabsTrigger>
            <TabsTrigger value="members" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Membres ({projectMembers.length})
            </TabsTrigger>
            <TabsTrigger value="invitations" className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Invitations ({invitations.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="invite" className="space-y-4">
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="utilisateur@exemple.com"
                  value={newInvite.email}
                  onChange={(e) => setNewInvite({ ...newInvite, email: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="role">Rôle</Label>
                <Select value={newInvite.role} onValueChange={(value) => setNewInvite({ ...newInvite, role: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Observateur">
                      <div className="flex items-center gap-2">
                        <Eye className="w-4 h-4 text-gray-600" />
                        Observateur - Lecture seule
                      </div>
                    </SelectItem>
                    <SelectItem value="Membre">
                      <div className="flex items-center gap-2">
                        <Edit className="w-4 h-4 text-green-600" />
                        Membre - Lecture et écriture
                      </div>
                    </SelectItem>
                    <SelectItem value="Admin">
                      <div className="flex items-center gap-2">
                        <Shield className="w-4 h-4 text-blue-600" />
                        Admin - Gestion complète
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleSendInvitation} disabled={!newInvite.email.trim() || isLoading}>
                {isLoading ? "Envoi..." : "Envoyer l'invitation"}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="members" className="space-y-4">
            <div className="space-y-2">
              {projectMembers.map((member) => (
                <div key={member.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {getRoleIcon(member.role)}
                    <div>
                        <p className="font-medium">
                          {member.users?.full_name}
                        </p>
                        <p className="text-sm text-muted-foreground">{member.users?.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{member.role}</Badge>
                    {member.role !== "Propriétaire" && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveProjectMember(projectId, member.user_id)}
                        className="text-red-600 hover:bg-red-50"
                      >
                        <UserMinus className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="invitations" className="space-y-4">
            <div className="space-y-2">
              {invitations.map((invitation) => (
                <div key={invitation.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Mail className="w-4 h-4 text-emerald-600" />
                    <div>
                        <p className="font-medium">{invitation.email}</p>
                        {/* Affichage de l'invité : la structure ne contient pas de profil, afficher seulement l'email ou ajouter une logique si besoin */}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(invitation.status)}
                    <Badge variant="outline">{invitation.role}</Badge>
                    {invitation.status === "En attente" && (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyInviteLink(invitation.token)}
                          className="text-emerald-600 hover:bg-emerald-50"
                          title="Copier le lien d'invitation"
                        >
                          <Copy className="w-4 h-4 mr-1" />
                          Copier le lien
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCancelInvitation(invitation.id)}
                          className="text-red-600 hover:bg-red-50"
                          title="Annuler l'invitation"
                        >
                          <XCircle className="w-4 h-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              ))}
              {invitations.length === 0 && (
                <p className="text-center text-muted-foreground py-8">Aucune invitation envoyée</p>
              )}
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Fermer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
