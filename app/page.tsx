"use client"

import { useState } from "react"
import { useAuth } from "@/hooks/use-auth"
import { useProjects as useProjectManagement } from "@/hooks/use-projects"
import { useAppConfig } from "@/hooks/use-app-config"
import { AuthComponent } from "@/components/auth"
import { ErrorBoundary } from "@/components/error-boundary"
import { AppSidebar } from "@/components/app-sidebar"
import { ProjectHeader } from "@/components/project-header"
import { TasksTable } from "@/components/tasks-table"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { Settings, LogOut, Loader2, FolderOpen } from "lucide-react"
import Image from "next/image"

function getUserInitials(user: any): string {
  if (!user) return "U"

  if (user.user_metadata?.full_name) {
    return user.user_metadata.full_name
      .split(" ")
      .map((n: string) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  if (user.email) {
    return user.email.charAt(0).toUpperCase()
  }

  return "U"
}

function MainContent({ selectedProjectId, projects }: { selectedProjectId: string; projects: any[] }) {
  const selectedProject = projects.find((p) => p.id === selectedProjectId)

  if (!selectedProject) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8 bg-stone-50">
        <FolderOpen className="w-12 h-12 text-emerald-600 mb-4" />
        <h2 className="text-xl font-semibold text-emerald-800 mb-2">Aucun Projet Sélectionné</h2>
        <p className="text-stone-600">Sélectionnez un projet dans la barre latérale pour commencer.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full w-full bg-amber-300">
      {/* Bandeau projet (sous le header global) */}
      <ProjectHeader project={selectedProject} />

      {/* Conteneur qui scrolle */}
      <div className="flex-1 overflow-auto bg-stone-50 p-6">
        <div className="w-full flex justify-center">
          {/* Tableau centré à 70% */}
          <div className="w-[75vw] min-w-[600px]">
            <TasksTable projectId={selectedProjectId} />
          </div>
        </div>
      </div>
    </div>
  )
}

export default function FEGProjectManager() {
  const { user, loading: authLoading, signOut } = useAuth()
  const [selectedProjectId, setSelectedProjectId] = useState<string>("")

  const { config } = useAppConfig()
  const { projects, isLoading: projectsLoading, error: projectsError, handleCreateProject } = useProjectManagement()

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto mb-4">
            <Image
              src={config?.logo_url || "/images/logo-feg.png"}
              alt={`${config?.organization_short || "FEG"} Logo`}
              width={64}
              height={64}
              className="object-contain"
            />
          </div>
          <Loader2 className="h-6 w-6 animate-spin text-emerald-600 mx-auto mb-4" />
          <p className="text-stone-600">Chargement de {config?.app_name || "l'application FEG"}...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <AuthComponent />
  }

  return (
    <ErrorBoundary>
      <SidebarProvider>
        <div className="flex h-screen w-screen bg-stone-50 overflow-hidden">
          {/* Sidebar fixe */}
          <AppSidebar
            projects={projects}
            isLoading={projectsLoading}
            error={projectsError}
            handleCreateProject={handleCreateProject}
            selectedProjectId={selectedProjectId}
            setSelectedProjectId={setSelectedProjectId}
          />

          {/* Contenu principal avec header fixe */}
          <SidebarInset className="flex flex-col flex-1">
            {/* Header fixe */}
            <header className="flex h-14 w-full shrink-0 items-center gap-2 border-b border-stone-200 px-6 bg-white shadow-sm z-20 sticky top-0">
              <SidebarTrigger className="-ml-1 text-stone-600 hover:text-emerald-700" />
              <div className="flex items-center gap-3 text-sm text-stone-600">
                <div className="relative w-6 h-6">
                  <Image
                    src={config?.logo_url || "/images/logo-feg.png"}
                    alt={`${config?.organization_short || "FEG"} Logo`}
                    width={24}
                    height={24}
                    className="object-contain"
                  />
                </div>
                <span className="font-semibold text-emerald-800">
                  {config?.organization_name || "Fédération des Entreprises du Gabon"}
                </span>
                <span className="text-stone-400">•</span>
                <span className="text-stone-600">Système de Gestion de Projets</span>
              </div>
              <div className="ml-auto flex items-center gap-3">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-stone-100">
                      <Avatar className="h-7 w-7">
                        <AvatarFallback className="text-xs bg-emerald-100 text-emerald-700 font-semibold">
                          {getUserInitials(user)}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="border-stone-200">
                    <DropdownMenuItem className="hover:bg-stone-50">
                      <Settings className="w-4 h-4 mr-2" />
                      Paramètres
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => signOut()} className="text-red-600 hover:bg-red-50">
                      <LogOut className="w-4 h-4 mr-2" />
                      Déconnexion
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </header>

            {/* Zone scrollable avec tableau centré */}
            <MainContent selectedProjectId={selectedProjectId} projects={projects} />
          </SidebarInset>
        </div>
      </SidebarProvider>
    </ErrorBoundary>
  )
}
