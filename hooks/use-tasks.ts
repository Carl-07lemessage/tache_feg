"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { useAuth } from "./use-auth"

interface Task {
  id: string
  project_id: string
  data: Record<string, any>
  created_by: string
  created_at: string
  updated_at: string
}

export function useTasks(projectId: string) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()
  const supabase = createClient()

  console.log("[v0] useTasks - projectId:", projectId, "user:", user?.id)

  useEffect(() => {
    if (!projectId || !user) {
      console.log("[v0] useTasks - Missing projectId or user, skipping fetch")
      setTasks([])
      setIsLoading(false)
      return
    }

    const fetchTasks = async () => {
      try {
        console.log("[v0] useTasks - Fetching tasks for project:", projectId)
        const { data, error } = await supabase
          .from("tasks")
          .select("*")
          .eq("project_id", projectId)
          .order("created_at", { ascending: false })

        if (error) {
          console.log("[v0] useTasks - Supabase error:", error)
          throw error
        }

        console.log("[v0] useTasks - Fetched tasks:", data)
        setTasks(data || [])
        setError(null)
      } catch (err) {
        console.log("[v0] useTasks - Error:", err)
        setError(err instanceof Error ? err.message : "Erreur lors du chargement des tâches")
      } finally {
        setIsLoading(false)
      }
    }

    fetchTasks()
  }, [projectId, user, supabase])

  const handleCreateTask = async (taskData: Record<string, any>) => {
    if (!user) return { data: null, error: "Utilisateur non connecté" }

    try {
      console.log("[v0] useTasks - Creating task with data:", taskData)
      const { data, error } = await supabase
        .from("tasks")
        .insert({
          project_id: projectId,
          created_by: user.id,
          data: taskData,
        })
        .select()
        .single()

      if (error) {
        console.log("[v0] useTasks - Create error:", error)
        throw error
      }

      console.log("[v0] useTasks - Created task:", data)
      setTasks((prev) => [data, ...prev])
      return { data, error: null }
    } catch (err) {
      console.log("[v0] useTasks - Create error:", err)
      const errorMessage = err instanceof Error ? err.message : "Erreur lors de la création de la tâche"
      return { data: null, error: errorMessage }
    }
  }

  const handleUpdateTask = async (taskId: string, updatedData: Record<string, any>) => {
    try {
      console.log("[v0] useTasks - Updating task:", taskId, "with data:", updatedData)
      const { data, error } = await supabase
        .from("tasks")
        .update({ data: updatedData })
        .eq("id", taskId)
        .select()
        .single()

      if (error) {
        console.log("[v0] useTasks - Update error:", error)
        throw error
      }

      console.log("[v0] useTasks - Updated task:", data)
      setTasks((prev) => prev.map((task) => (task.id === taskId ? data : task)))
      return { data, error: null }
    } catch (err) {
      console.log("[v0] useTasks - Update error:", err)
      const errorMessage = err instanceof Error ? err.message : "Erreur lors de la mise à jour de la tâche"
      return { data: null, error: errorMessage }
    }
  }

  return {
    tasks,
    isLoading,
    error,
    handleCreateTask,
    handleUpdateTask,
  }
}
