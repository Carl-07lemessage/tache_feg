"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { useAuth } from "./use-auth"

interface ProjectMember {
  id: string
  project_id: string
  user_id: string
  role: string
  added_at: string
  users?: {
    id: string
    email: string
    full_name: string
  }
}

export function useProjectMembers(projectId: string) {
  const [projectMembers, setProjectMembers] = useState<ProjectMember[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()
  const supabase = createClient()

  useEffect(() => {
    if (!projectId || !user) {
      setProjectMembers([])
      setIsLoading(false)
      return
    }

    const fetchProjectMembers = async () => {
      try {
        const { data, error } = await supabase
          .from("project_members")
          .select(`
            *,
            users (
              id,
              email,
              full_name
            )
          `)
          .eq("project_id", projectId)
          .order("added_at", { ascending: true })

        if (error) throw error
        setProjectMembers(data || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erreur lors du chargement des membres")
      } finally {
        setIsLoading(false)
      }
    }

    fetchProjectMembers()
  }, [projectId, user, supabase])

  const handleAddProjectMember = async (projectId: string, userId: string, role: string) => {
    try {
      const { data, error } = await supabase
        .from("project_members")
        .insert({
          project_id: projectId,
          user_id: userId,
          role,
        })
        .select(`
          *,
          users (
            id,
            email,
            full_name
          )
        `)
        .single()

      if (error) throw error

      setProjectMembers((prev) => [...prev, data])
      return { error: null }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erreur lors de l'ajout du membre"
      return { error: errorMessage }
    }
  }

  const handleRemoveProjectMember = async (projectId: string, userId: string) => {
    try {
      const { error } = await supabase
        .from("project_members")
        .delete()
        .eq("project_id", projectId)
        .eq("user_id", userId)

      if (error) throw error

      setProjectMembers((prev) =>
        prev.filter((member) => !(member.project_id === projectId && member.user_id === userId)),
      )
      return { error: null }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erreur lors de la suppression du membre"
      return { error: errorMessage }
    }
  }

  const handleUpdateMemberRole = async (memberId: string, newRole: string) => {
    try {
      const { data, error } = await supabase
        .from("project_members")
        .update({ role: newRole })
        .eq("id", memberId)
        .select(`
          *,
          users (
            id,
            email,
            full_name
          )
        `)
        .single()

      if (error) throw error

      setProjectMembers((prev) => prev.map((member) => (member.id === memberId ? data : member)))
      return { error: null }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erreur lors de la mise à jour du rôle"
      return { error: errorMessage }
    }
  }

  return {
    projectMembers,
    isLoading,
    error,
    handleAddProjectMember,
    handleRemoveProjectMember,
    handleUpdateMemberRole,
  }
}
