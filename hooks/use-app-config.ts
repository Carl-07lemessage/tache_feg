"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"

interface AppConfig {
  app_name: string
  organization_name: string
  organization_short: string
  logo_url: string
  default_columns: any[]
}

export function useAppConfig() {
  const [config, setConfig] = useState<AppConfig | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        console.log("[v0] useAppConfig: Fetching configuration...")
        const supabase = createClient()

        const { data, error } = await supabase
          .from("app_config")
          .select("key, value")

        if (error) {
          console.log("[v0] useAppConfig: Supabase error:", error)
          throw error
        }

        console.log("[v0] useAppConfig: Raw data:", data)

        if (!data || data.length === 0) {
          console.log("[v0] useAppConfig: No config data found, using defaults")
          throw new Error("No configuration data found")
        }

        const configObj = data.reduce((acc, item) => {
          try {
            acc[item.key as keyof AppConfig] =
              typeof item.value === "string" ? JSON.parse(item.value) : item.value
          } catch (parseError) {
            console.warn(
              "[v0] useAppConfig: Failed to parse value for key:",
              item.key,
              parseError
            )
            acc[item.key as keyof AppConfig] = item.value
          }
          return acc
        }, {} as Partial<AppConfig>) as AppConfig

        console.log("[v0] useAppConfig: Parsed config:", configObj)
        setConfig(configObj)
      } catch (err) {
        console.error("[v0] Error fetching app config:", err)
        setError(
          err instanceof Error
            ? err.message
            : "Erreur lors du chargement de la configuration"
        )

        const defaultConfig: AppConfig = {
          app_name: "Tableau de Bord FEG",
          organization_name: "Fédération des Entreprises du Gabon",
          organization_short: "FEG",
          logo_url: "/images/logo-feg.png",
          default_columns: [
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
          ],
        }

        console.log("[v0] useAppConfig: Using default config:", defaultConfig)
        setConfig(defaultConfig)
      } finally {
        setIsLoading(false)
      }
    }

    fetchConfig()
  }, [])

  return { config, isLoading, error }
}
