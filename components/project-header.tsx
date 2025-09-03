"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ShareProjectDialog } from "@/components/share-project-dialog"
import { MoreHorizontal, Trash2, Users, FileText, BarChart3 } from "lucide-react"

interface ProjectHeaderProps {
  project: {
    id: string
    name: string
    description?: string
  }
}

export function ProjectHeader({ project }: ProjectHeaderProps) {
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false)

  return (
    <>
      <div className="p-6 border-b border-stone-200 bg-white">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-emerald-800">{project.name}</h1>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              className="border-stone-300 bg-transparent"
              onClick={() => setIsShareDialogOpen(true)}
            >
              <Users className="w-4 h-4 mr-2" />
              Partager
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <FileText className="w-4 h-4 mr-2" />
                  Exporter
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Statistiques
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-red-600">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Supprimer
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        <p className="mt-2 text-stone-600">{project.description || "Aucune description disponible."}</p>
      </div>

      <ShareProjectDialog
        isOpen={isShareDialogOpen}
        onClose={() => setIsShareDialogOpen(false)}
        projectId={project.id}
        projectName={project.name}
      />
    </>
  )
}
