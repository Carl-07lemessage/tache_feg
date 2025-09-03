"use client"

import { useState, useEffect } from "react"

export interface ProjectColumn {
  id: string
  name: string
  type: "text" | "select" | "multiselect" | "date" | "checkbox" | "number" | "person"
  visible: boolean
  position: number
  options?: string[] // pour les types select/multiselect
}

// Colonnes statiques par défaut
const defaultColumns: ProjectColumn[] = [
  { id: "expeditionDate", name: "Date d'expédition", type: "date", visible: true, position: 0 },
  { id: "arrivalDate", name: "Date d'arrivée", type: "date", visible: true, position: 1 },
  { id: "sender", name: "Expéditeur", type: "text", visible: true, position: 2 },
  { id: "subject", name: "Objet", type: "text", visible: true, position: 3 },
  { id: "instruction", name: "Instruction", type: "text", visible: true, position: 4 },
  { id: "orderGiver", name: "Donneur d'ordre", type: "text", visible: true, position: 5 },
  { id: "deadline", name: "Date limite", type: "date", visible: true, position: 6 },
  { id: "rmo", name: "RMO", type: "text", visible: true, position: 7 },
  { id: "receptionDay", name: "Jour de réception", type: "date", visible: true, position: 8 },
  { id: "exitDate", name: "Date de sortie", type: "date", visible: true, position: 9 },
  { id: "observation", name: "Observation", type: "text", visible: true, position: 10 },
]

export function useProjectColumns() {
  const [columns, setColumns] = useState<ProjectColumn[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    try {
      setIsLoading(true)
      setColumns(defaultColumns)
      setError(null)
    } catch (err) {
      console.error("[v0] Error loading default columns:", err)
      setError("Erreur lors du chargement des colonnes par défaut")
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Mettre à jour une colonne
  const updateColumn = (columnId: string, updates: Partial<ProjectColumn>) => {
    setColumns((prev) =>
      prev.map((col) => (col.id === columnId ? { ...col, ...updates } : col))
    )
  }

  // Ajouter une nouvelle colonne
  const addColumn = (column: Omit<ProjectColumn, "position">) => {
    const newColumn: ProjectColumn = {
      ...column,
      position: columns.length, // placer à la fin
    }
    setColumns((prev) => [...prev, newColumn])
  }

  return {
    columns,
    isLoading,
    error,
    updateColumn,
    addColumn,
  }
}
