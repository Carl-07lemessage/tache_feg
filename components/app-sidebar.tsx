"use client"

import { useState, useEffect } from "react"
import { useAppConfig } from "@/hooks/use-app-config"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { Plus, FolderOpen, Loader2, AlertTriangle } from "lucide-react"
import Image from "next/image"

interface AppSidebarProps {
  projects: any[]
  isLoading: boolean
  error: string | null
  handleCreateProject: (nom: string, description?: string) => Promise<any>
  selectedProjectId: string
  setSelectedProjectId: (id: string) => void
}

export function AppSidebar({
  projects,
  isLoading: projectsLoading,
  error: projectsError,
  handleCreateProject,
  selectedProjectId,
  setSelectedProjectId,
}: AppSidebarProps) {
  const [isProjectDialogOpen, setIsProjectDialogOpen] = useState(false)
  const [newProject, setNewProject] = useState({
    nom: "",
    description: "",
  })

  const { config } = useAppConfig()

  useEffect(() => {
    if (!selectedProjectId && projects.length > 0) {
      setSelectedProjectId(projects[0].id)
    }
  }, [projects, selectedProjectId, setSelectedProjectId])

  const getProjectIcon = () => <FolderOpen className="w-4 h-4 text-emerald-600" />

  const handleCreateNewProject = async () => {
    if (!newProject.nom.trim()) return

    const result = await handleCreateProject(newProject.nom, newProject.description)
    if (result.data) {
      setSelectedProjectId(result.data.id)
      setNewProject({ nom: "", description: "" })
      setIsProjectDialogOpen(false)
    }
  }

  return (
    <>
      <Sidebar className="border-r border-stone-200 bg-stone-50">
        <SidebarHeader className="border-b border-stone-200 p-4 bg-white">
          <div className="flex items-center gap-3">
            <div className="relative w-8 h-8">
              <Image
                src={config?.logo_url || "/images/logo-feg.png"}
                alt={`${config?.organization_short || "FEG"} Logo`}
                width={32}
                height={32}
                className="object-contain"
              />
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-emerald-800 text-sm">{config?.organization_short || "FEG"}</span>
              <span className="text-xs text-stone-600">Gestion de Projets</span>
            </div>
          </div>
        </SidebarHeader>

        <SidebarContent className="p-3">
          <SidebarGroup>
            <SidebarGroupLabel className="text-stone-600 font-semibold text-xs px-3 py-2 flex items-center justify-between uppercase tracking-wide">
              Projets Institutionnels
              <Button
                onClick={() => setIsProjectDialogOpen(true)}
                variant="ghost"
                size="sm"
                className="h-5 w-5 p-0 hover:bg-stone-200 text-emerald-700"
              >
                <Plus className="w-3 h-3" />
              </Button>
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {projectsError && (
                  <SidebarMenuItem>
                    <Alert className="mx-1 mb-2 border-red-200 bg-red-50">
                      <AlertTriangle className="h-4 w-4 text-red-600" />
                      <AlertDescription className="text-red-700 text-xs">{projectsError}</AlertDescription>
                    </Alert>
                  </SidebarMenuItem>
                )}
                {projectsLoading ? (
                  <SidebarMenuItem>
                    <div className="flex items-center gap-2 p-3">
                      <Loader2 className="h-4 w-4 animate-spin text-emerald-600" />
                      <span className="text-xs text-stone-600">Chargement des projets...</span>
                    </div>
                  </SidebarMenuItem>
                ) : (
                  projects.map((project) => (
                    <SidebarMenuItem key={project.id}>
                      <SidebarMenuButton
                        onClick={() => setSelectedProjectId(project.id)}
                        className={`w-full flex items-center gap-2 px-3 py-2 text-xs ${
                          selectedProjectId === project.id
                            ? "bg-emerald-100 text-emerald-800 font-medium"
                            : "text-stone-700 hover:bg-stone-100"
                        }`}
                      >
                        {getProjectIcon()}
                        <span className="truncate  text-xl">{project.nom}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))
                )}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>

      <Dialog open={isProjectDialogOpen} onOpenChange={setIsProjectDialogOpen}>
        <DialogContent className="border-stone-200">
          <DialogHeader>
            <DialogTitle className="text-emerald-800">Créer un Nouveau Projet</DialogTitle>
            <DialogDescription className="text-stone-600">
              Entrez les détails du nouveau projet institutionnel.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name" className="text-stone-700 font-medium">
                Nom du Projet
              </Label>
              <Input
                id="name"
                value={newProject.nom}
                onChange={(e) => setNewProject({ ...newProject, nom: e.target.value })}
                placeholder="Entrez le nom du projet"
                className="border-stone-300 focus:border-emerald-500 focus:ring-emerald-200"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description" className="text-stone-700 font-medium">
                Description
              </Label>
              <Input
                id="description"
                value={newProject.description}
                onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                placeholder="Description optionnelle"
                className="border-stone-300 focus:border-emerald-500 focus:ring-emerald-200"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsProjectDialogOpen(false)} className="border-stone-300">
              Annuler
            </Button>
            <Button
              onClick={handleCreateNewProject}
              disabled={!newProject.nom.trim()}
              className="bg-emerald-700 hover:bg-emerald-800 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Créer Projet
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
