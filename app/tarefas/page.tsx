"use client"

import { useState, useMemo } from "react"
import { Sidebar } from "@/components/dashboard/sidebar"
import { useData } from "@/lib/data-context"
import { isToday } from "@/lib/types"
import type { Task } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Plus, Pencil, Trash2, CheckSquare, Filter } from "lucide-react"
import { cn } from "@/lib/utils"

type FilterStatus = "all" | "pending" | "completed"

export default function TarefasPage() {
  const { tasks, addTask, updateTask, deleteTask, toggleTask, settings, isLoading } = useData()
  const [isOpen, setIsOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [filter, setFilter] = useState<FilterStatus>("all")

  // Form state
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium")
  const [dueDate, setDueDate] = useState("")
  const [dueTime, setDueTime] = useState("")
  const [category, setCategory] = useState("Geral")
  const [reminder, setReminder] = useState(false)

  const filteredTasks = useMemo(() => {
    let filtered = [...tasks]

    if (filter === "pending") {
      filtered = filtered.filter((t) => !t.completed)
    } else if (filter === "completed") {
      filtered = filtered.filter((t) => t.completed)
    }

    // Ordenar: tarefas do dia primeiro, depois por prioridade
    return filtered.sort((a, b) => {
      // Tarefas do dia primeiro
      const aIsToday = a.dueDate && isToday(a.dueDate)
      const bIsToday = b.dueDate && isToday(b.dueDate)
      if (aIsToday && !bIsToday) return -1
      if (!aIsToday && bIsToday) return 1

      // Depois por prioridade
      const priorityOrder = { high: 0, medium: 1, low: 2 }
      return priorityOrder[a.priority] - priorityOrder[b.priority]
    })
  }, [tasks, filter])

  const todayTasksCount = useMemo(() => {
    const today = new Date().toISOString().split("T")[0]
    return tasks.filter((t) => t.dueDate === today).length
  }, [tasks])

  const pendingCount = tasks.filter((t) => !t.completed).length
  const completedCount = tasks.filter((t) => t.completed).length

  const resetForm = () => {
    setTitle("")
    setDescription("")
    setPriority("medium")
    setDueDate("")
    setDueTime("")
    setCategory("Geral")
    setReminder(false)
    setEditingTask(null)
  }

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open)
    if (!open) {
      resetForm()
    }
  }

  const handleEdit = (task: Task) => {
    setEditingTask(task)
    setTitle(task.title)
    setDescription(task.description || "")
    setPriority(task.priority)
    setDueDate(task.dueDate || "")
    setDueTime(task.dueTime || "")
    setCategory(task.category || "Geral")
    setReminder(task.reminder || false)
    setIsOpen(true)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return

    if (editingTask) {
      updateTask(editingTask.id, {
        title,
        description: description || undefined,
        priority,
        dueDate: dueDate || undefined,
        dueTime: dueTime || undefined,
        category,
        reminder,
      })
    } else {
      addTask({
        title,
        description: description || undefined,
        completed: false,
        priority,
        dueDate: dueDate || undefined,
        dueTime: dueTime || undefined,
        category,
        reminder,
      })
    }

    handleOpenChange(false)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-foreground">Carregando...</div>
      </div>
    )
  }

  return (
    <div 
      className="min-h-screen bg-background"
      style={settings.backgroundImage ? {
        backgroundImage: `url(${settings.backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
      } : undefined}
    >
      {settings.backgroundImage && (
        <div className="fixed inset-0 bg-background/85 backdrop-blur-sm" />
      )}
      
      <Sidebar />

      <main className={cn("lg:pl-64", settings.backgroundImage && "relative z-10")}>
        <div className="px-4 py-6 lg:px-8 lg:py-8">
          <div className="mx-auto max-w-4xl space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-4 pt-12 lg:pt-0 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-2xl font-bold text-foreground">Tarefas</h1>
                <p className="text-muted-foreground">
                  {todayTasksCount > 0
                    ? `${todayTasksCount} tarefa(s) para hoje`
                    : "Gerencie suas tarefas"}
                </p>
              </div>

              <Dialog open={isOpen} onOpenChange={handleOpenChange}>
                <DialogTrigger asChild>
                  <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                    <Plus className="h-4 w-4 mr-2" />
                    Nova Tarefa
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-card border-border">
                  <DialogHeader>
                    <DialogTitle className="text-card-foreground">
                      {editingTask ? "Editar Tarefa" : "Nova Tarefa"}
                    </DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="title" className="text-card-foreground">
                        Título
                      </Label>
                      <Input
                        id="title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Digite o título da tarefa"
                        className="bg-secondary border-border text-foreground"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description" className="text-card-foreground">
                        Descrição (opcional)
                      </Label>
                      <Input
                        id="description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Descrição adicional"
                        className="bg-secondary border-border text-foreground"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="priority" className="text-card-foreground">
                          Prioridade
                        </Label>
                        <Select value={priority} onValueChange={(v) => setPriority(v as Task["priority"])}>
                          <SelectTrigger className="bg-secondary border-border text-foreground">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-card border-border">
                            <SelectItem value="low">Baixa</SelectItem>
                            <SelectItem value="medium">Média</SelectItem>
                            <SelectItem value="high">Alta</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="dueDate" className="text-card-foreground">
                          Data
                        </Label>
                        <Input
                          id="dueDate"
                          type="date"
                          value={dueDate}
                          onChange={(e) => setDueDate(e.target.value)}
                          className="bg-secondary border-border text-foreground"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="category" className="text-card-foreground">
                          Categoria
                        </Label>
                        <Select value={category} onValueChange={setCategory}>
                          <SelectTrigger className="bg-secondary border-border text-foreground">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-card border-border">
                            <SelectItem value="Geral">Geral</SelectItem>
                            <SelectItem value="Trabalho">Trabalho</SelectItem>
                            <SelectItem value="Pessoal">Pessoal</SelectItem>
                            <SelectItem value="Estudo">Estudo</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="dueTime" className="text-card-foreground">
                          Horário (opcional)
                        </Label>
                        <Input
                          id="dueTime"
                          type="time"
                          value={dueTime}
                          onChange={(e) => setDueTime(e.target.value)}
                          className="bg-secondary border-border text-foreground"
                        />
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="reminder"
                        checked={reminder}
                        onCheckedChange={(checked) => setReminder(checked as boolean)}
                        className="border-primary data-[state=checked]:bg-primary"
                      />
                      <Label htmlFor="reminder" className="text-card-foreground">
                        Ativar lembrete para esta tarefa
                      </Label>
                    </div>

                    <Button
                      type="submit"
                      className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                    >
                      {editingTask ? "Salvar Alterações" : "Adicionar Tarefa"}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
              <Card className="bg-card border-border">
                <CardContent className="p-4 text-center">
                  <p className="text-2xl font-bold text-foreground">{tasks.length}</p>
                  <p className="text-sm text-muted-foreground">Total</p>
                </CardContent>
              </Card>
              <Card className="bg-card border-border">
                <CardContent className="p-4 text-center">
                  <p className="text-2xl font-bold text-primary">{pendingCount}</p>
                  <p className="text-sm text-muted-foreground">Pendentes</p>
                </CardContent>
              </Card>
              <Card className="bg-card border-border">
                <CardContent className="p-4 text-center">
                  <p className="text-2xl font-bold text-primary">{completedCount}</p>
                  <p className="text-sm text-muted-foreground">Concluídas</p>
                </CardContent>
              </Card>
            </div>

            {/* Filter */}
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={filter} onValueChange={(v) => setFilter(v as FilterStatus)}>
                <SelectTrigger className="w-40 bg-secondary border-border text-foreground">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="pending">Pendentes</SelectItem>
                  <SelectItem value="completed">Concluídas</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Tasks List */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-card-foreground">
                  <CheckSquare className="h-5 w-5 text-primary" />
                  Lista de Tarefas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {filteredTasks.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    {filter === "all"
                      ? "Nenhuma tarefa cadastrada"
                      : filter === "pending"
                      ? "Nenhuma tarefa pendente"
                      : "Nenhuma tarefa concluída"}
                  </p>
                ) : (
                  filteredTasks.map((task) => (
                    <div
                      key={task.id}
                      className={cn(
                        "flex items-start gap-3 rounded-lg bg-secondary/50 p-4 transition-colors",
                        task.completed && "opacity-60"
                      )}
                    >
                      <Checkbox
                        checked={task.completed}
                        onCheckedChange={() => toggleTask(task.id)}
                        className="mt-1 border-primary data-[state=checked]:bg-primary"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p
                              className={cn(
                                "font-medium text-card-foreground",
                                task.completed && "line-through text-muted-foreground"
                              )}
                            >
                              {task.title}
                            </p>
                            {task.description && (
                              <p className="text-sm text-muted-foreground mt-0.5">
                                {task.description}
                              </p>
                            )}
                            <div className="flex items-center gap-2 mt-2 flex-wrap">
                              <span
                                className={cn(
                                  "text-xs px-2 py-0.5 rounded",
                                  task.priority === "high" && "bg-destructive/20 text-destructive",
                                  task.priority === "medium" && "bg-primary/20 text-primary",
                                  task.priority === "low" && "bg-muted text-muted-foreground"
                                )}
                              >
                                {task.priority === "high"
                                  ? "Alta"
                                  : task.priority === "medium"
                                  ? "Média"
                                  : "Baixa"}
                              </span>
                              {task.dueDate && (
                                <span
                                  className={cn(
                                    "text-xs px-2 py-0.5 rounded",
                                    isToday(task.dueDate)
                                      ? "bg-primary/20 text-primary"
                                      : "bg-muted text-muted-foreground"
                                  )}
                                >
                                  {new Date(task.dueDate).toLocaleDateString("pt-BR")}
                                  {task.dueTime && ` às ${task.dueTime}`}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEdit(task)}
                              className="h-8 w-8 text-muted-foreground hover:text-foreground"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => deleteTask(task.id)}
                              className="h-8 w-8 text-muted-foreground hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
