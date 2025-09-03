"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { useAuth } from "./use-auth"

interface Project {
  id: string
  nom: string
  description?: string
  statut: string
  date_debut?: string
  date_fin?: string
  budget?: number
  owner_id: string
  created_at: string
  updated_at: string
}

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()
  const supabase = createClient()

  useEffect(() => {
    console.log("[v0] useProjects: Effect triggered", { user: user?.id })

    if (!user) {
      console.log("[v0] useProjects: No user, clearing projects")
      setProjects([])
      setIsLoading(false)
      return
    }

    const fetchProjects = async () => {
      console.log("[v0] useProjects: Fetching projects for user", user.id)
      try {
        setError(null)
        const { data, error } = await supabase.from("projects").select("*").order("created_at", { ascending: false })

        console.log("[v0] useProjects: Supabase response", { data, error })

        if (error) {
          console.error("[v0] useProjects: Supabase error details", {
            message: error.message,
            details: error.details,
            hint: error.hint,
            code: error.code,
          })
          throw error
        }
        setProjects(data || [])
        console.log("[v0] useProjects: Successfully loaded", data?.length || 0, "projects")
      } catch (err) {
        console.error("[v0] useProjects: Error fetching projects", err)
        let errorMessage = "Erreur lors du chargement des projets"
        if (err instanceof Error) {
          if (err.message.includes('relation "projects" does not exist')) {
            errorMessage = "Table 'projects' n'existe pas. Veuillez exécuter les scripts de base de données."
          } else {
            errorMessage = `Erreur DB: ${err.message}`
          }
        }
        setError(errorMessage)
      } finally {
        setIsLoading(false)
      }
    }

    fetchProjects()
  }, [user, supabase])

  const handleCreateProject = async (nom: string, description?: string) => {
    if (!user) return { data: null, error: "Utilisateur non connecté" }

    try {
      const { data, error } = await supabase
        .from("projects")
        .insert({
          nom,
          description,
          owner_id: user.id,
          statut: "En cours",
        })
        .select()
        .single()

      if (error) throw error

      setProjects((prev) => [data, ...prev])
      return { data, error: null }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erreur lors de la création du projet"
      return { data: null, error: errorMessage }
    }
  }

  return {
    projects,
    isLoading,
    error,
    handleCreateProject,
  }
}
