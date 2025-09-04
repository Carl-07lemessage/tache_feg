"use client"

import { useState } from "react"
import { useTasks } from "@/hooks/use-tasks"
import { useProjectColumns, ProjectColumn } from "@/hooks/use-project-columns"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Check, Loader2, AlertTriangle, Plus } from "lucide-react"

interface CellEditorProps {
  column: ProjectColumn
  value: any
  onUpdate: (value: any) => void
}

function CellEditor({ column, value, onUpdate }: CellEditorProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(value || "")

  const handleSave = () => {
    onUpdate(editValue)
    setIsEditing(false)
  }

  const handleCancel = () => {
    setEditValue(value || "")
    setIsEditing(false)
  }

  if (isEditing) {
    return (
      <div className="flex items-center gap-4">
        {column.type === "date" ? (
          <Input type="date" value={editValue} onChange={(e) => setEditValue(e.target.value)} className="h-8 text-xs" />
        ) : column.type === "select" && column.options ? (
          <Select value={editValue} onValueChange={setEditValue}>
            <SelectTrigger className="h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {column.options.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <Input value={editValue} onChange={(e) => setEditValue(e.target.value)} className="h-8 text-xs" />
        )}
        <Button size="sm" onClick={handleSave} className="h-6 px-2 text-xs">
          <Check className="w-3 h-3" />
        </Button>
        <Button size="sm" variant="ghost" onClick={handleCancel} className="h-6 px-2 text-xs">
          ×
        </Button>
      </div>
    )
  }

  return (
    <div
      onClick={() => setIsEditing(true)}
      className="cursor-pointer hover:bg-stone-100 p-1 rounded text-sm min-h-[24px] flex items-center"
    >
      {value || <span className="text-stone-400 italic">Cliquer pour modifier</span>}
    </div>
  )
}

interface TasksTableProps {
  projectId: string
}

export function TasksTable({ projectId }: TasksTableProps) {
  const { tasks, isLoading: tasksLoading, error: tasksError, handleCreateTask, handleUpdateTask } = useTasks(projectId)
  const { columns, isLoading: columnsLoading, error: columnsError } = useProjectColumns()

  const handleCellUpdate = async (taskId: string, columnId: string, value: any) => {
    const task = tasks.find((t) => t.id === taskId)
    if (task) {
      const updatedData = { ...task.data, [columnId]: value }
      await handleUpdateTask(taskId, updatedData)
    }
  }

  const handleAddTask = async () => {
    const emptyData: Record<string, any> = {}
    columns.forEach((col) => {
      emptyData[col.id] = ""
    })
    await handleCreateTask(emptyData)
  }

  if (tasksLoading || columnsLoading) {
    return (
      <div className="flex items-center justify-center h-32">
        <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
      </div>
    )
  }

  return (
    <div className="space-y-4 w-full flex flex-col items-center">
      {(tasksError || columnsError) && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-700">{tasksError || columnsError}</AlertDescription>
        </Alert>
      )}

      {/* En-tête d’actions */}
      <div className="flex justify-between items-center w-full">
        <h3 className="text-lg font-semibold text-emerald-800">Tâches du Projet</h3>
        <Button onClick={handleAddTask} className="bg-emerald-700 hover:bg-emerald-800">
          <Plus className="w-4 h-4 mr-2" />
          Nouvelle Tâche
        </Button>
      </div>

      {/* Tableau qui occupe toute la largeur disponible (limité par le parent) */}
      <div className="border border-stone-200 rounded-md overflow-auto w-full max-h-[70vh]">
        <Table>
          <TableHeader className="sticky top-0 z-10 bg-emerald-50 shadow-sm">
            <TableRow>
              {columns
                .filter((c) => c.visible)
                .map((col) => (
                  <TableHead key={col.id} className="text-stone-700 font-semibold">
                    {col.name}
                  </TableHead>
                ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {tasks.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.filter((c) => c.visible).length}
                  className="text-center py-8 text-stone-500"
                >
                  Aucune tâche pour ce projet. Cliquez sur "Nouvelle Tâche" pour commencer.
                </TableCell>
              </TableRow>
            ) : (
              tasks.map((task) => (
                <TableRow key={task.id} className="hover:bg-stone-50">
                  {columns
                    .filter((c) => c.visible)
                    .map((col) => (
                      <TableCell key={col.id} className="p-2">
                        <CellEditor
                          column={col}
                          value={task.data[col.id]}
                          onUpdate={(value) => handleCellUpdate(task.id, col.id, value)}
                        />
                      </TableCell>
                    ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
