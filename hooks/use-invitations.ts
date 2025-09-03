"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { useAuth } from "./use-auth"

interface ProjectInvitation {
  id: string
  project_id: string
  email: string
  role: string
  token: string
  status: string
  created_at: string
  expires_at: string
}

export function useInvitations(projectId?: string) {
  const [invitations, setInvitations] = useState<ProjectInvitation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()
  const supabase = createClient()

  useEffect(() => {
    if (!user) {
      setInvitations([])
      setIsLoading(false)
      return
    }

    const fetchInvitations = async () => {
      try {
        let query = supabase.from("invitations").select("*").order("created_at", { ascending: false })

        if (projectId) {
          query = query.eq("project_id", projectId)
        }

        const { data, error } = await query

        if (error) throw error
        setInvitations(data || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erreur lors du chargement des invitations")
      } finally {
        setIsLoading(false)
      }
    }

    fetchInvitations()
  }, [projectId, user, supabase])

  const sendInvitation = async (projectId: string, email: string, role: string) => {
    if (!user) return { data: null, error: "Utilisateur non connecté" }

    try {
      // Generate a unique token
      const token = crypto.randomUUID()

      console.log("[v0] useInvitations - Sending invitation:", { projectId, email, role, token })

      const { data, error } = await supabase
        .from("invitations")
        .insert({
          project_id: projectId,
          email: email.toLowerCase(),
          role,
          token,
        })
        .select("*")
        .single()

      if (error) {
        console.log("[v0] useInvitations - Send error:", error)
        throw error
      }

      console.log("[v0] useInvitations - Invitation sent:", data)
      setInvitations((prev) => [data, ...prev])
      return { data, error: null }
    } catch (err) {
      console.log("[v0] useInvitations - Send error:", err)
      const errorMessage = err instanceof Error ? err.message : "Erreur lors de l'envoi de l'invitation"
      return { data: null, error: errorMessage }
    }
  }

  const acceptInvitation = async (token: string) => {
    if (!user) return { error: "Utilisateur non connecté" }

    try {
      const { data: invitation, error: inviteError } = await supabase
        .from("invitations")
        .select("*")
        .eq("token", token)
        .eq("status", "pending")
        .single()

      if (inviteError || !invitation) {
        throw new Error("Invitation non trouvée ou expirée")
      }

      const { data: userProfile } = await supabase.from("users").select("email").eq("id", user.id).single()

      if (!userProfile || userProfile.email !== invitation.email) {
        throw new Error("Cette invitation n'est pas pour votre compte")
      }

      // Check if invitation is not expired
      if (new Date(invitation.expires_at) < new Date()) {
        throw new Error("Cette invitation a expiré")
      }

      // Add user to project members
      const { error: memberError } = await supabase.from("project_members").insert({
        project_id: invitation.project_id,
        user_id: user.id,
        role: invitation.role,
      })

      if (memberError) throw memberError

      const { error: updateError } = await supabase
        .from("invitations")
        .update({ status: "accepted" })
        .eq("id", invitation.id)

      if (updateError) throw updateError

      return { error: null }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erreur lors de l'acceptation de l'invitation"
      return { error: errorMessage }
    }
  }

  const cancelInvitation = async (invitationId: string) => {
    try {
      const { error } = await supabase.from("invitations").update({ status: "cancelled" }).eq("id", invitationId)

      if (error) throw error

      setInvitations((prev) => prev.map((inv) => (inv.id === invitationId ? { ...inv, status: "cancelled" } : inv)))
      return { error: null }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erreur lors de l'annulation de l'invitation"
      return { error: errorMessage }
    }
  }

  return {
    invitations,
    isLoading,
    error,
    sendInvitation,
    acceptInvitation,
    cancelInvitation,
  }
}
