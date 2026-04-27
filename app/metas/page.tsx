"use client"

import { useState, useMemo } from "react"
import { Sidebar } from "@/components/dashboard/sidebar"
import { useData } from "@/lib/data-context"
import { formatCurrency, getDaysUntil } from "@/lib/types"
import type { Goal } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Plus, Pencil, Trash2, Target, TrendingUp, CheckCircle2 } from "lucide-react"
import { cn } from "@/lib/utils"

export default function MetasPage() {
  const { goals, addGoal, updateGoal, deleteGoal, updateGoalProgress, settings, isLoading } = useData()
  const [isOpen, setIsOpen] = useState(false)
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null)
  const [isProgressOpen, setIsProgressOpen] = useState(false)
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null)
  const [newProgress, setNewProgress] = useState("")

  // Form state
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [targetValue, setTargetValue] = useState("")
  const [currentValue, setCurrentValue] = useState("0")
  const [deadline, setDeadline] = useState("")
  const [category, setCategory] = useState("Pessoal")

  const activeGoals = useMemo(() => {
    return goals.filter((g) => g.status === "in-progress")
  }, [goals])

  const completedGoals = useMemo(() => {
    return goals.filter((g) => g.status === "completed")
  }, [goals])

  const totalProgress = useMemo(() => {
    if (activeGoals.length === 0) return 0
    const sumProgress = activeGoals.reduce((sum, g) => {
      return sum + (g.currentValue / g.targetValue) * 100
    }, 0)
    return sumProgress / activeGoals.length
  }, [activeGoals])

  const resetForm = () => {
    setTitle("")
    setDescription("")
    setTargetValue("")
    setCurrentValue("0")
    setDeadline("")
    setCategory("Pessoal")
    setEditingGoal(null)
  }

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open)
    if (!open) {
      resetForm()
    }
  }

  const handleEdit = (goal: Goal) => {
    setEditingGoal(goal)
    setTitle(goal.title)
    setDescription(goal.description || "")
    setTargetValue(goal.targetValue.toString())
    setCurrentValue(goal.currentValue.toString())
    setDeadline(goal.deadline || "")
    setCategory(goal.description?.split(" [Cat: ")[1]?.replace("]", "") || "Pessoal")
    setIsOpen(true)
  }

  const handleOpenProgress = (goal: Goal) => {
    setSelectedGoal(goal)
    setNewProgress(goal.currentValue.toString())
    setIsProgressOpen(true)
  }

  const handleUpdateProgress = () => {
    if (selectedGoal && newProgress) {
      updateGoalProgress(selectedGoal.id, parseFloat(newProgress))
      setIsProgressOpen(false)
      setSelectedGoal(null)
      setNewProgress("")
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !targetValue) return

    const goalData = {
      title,
      description: description ? `${description} [Cat: ${category}]` : `[Cat: ${category}]`,
      targetValue: parseFloat(targetValue),
      currentValue: parseFloat(currentValue) || 0,
      deadline: deadline || undefined,
    }

    if (editingGoal) {
      updateGoal(editingGoal.id, {
        ...goalData,
        status: goalData.currentValue >= goalData.targetValue ? "completed" : "in-progress",
      })
    } else {
      addGoal(goalData)
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
                <h1 className="text-2xl font-bold text-foreground">Metas</h1>
                <p className="text-muted-foreground">Acompanhe suas conquistas</p>
              </div>

              <Dialog open={isOpen} onOpenChange={handleOpenChange}>
                <DialogTrigger asChild>
                  <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                    <Plus className="h-4 w-4 mr-2" />
                    Nova Meta
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-card border-border">
                  <DialogHeader>
                    <DialogTitle className="text-card-foreground">
                      {editingGoal ? "Editar Meta" : "Nova Meta"}
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
                        placeholder="Ex: Economizar para viagem"
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
                        placeholder="Detalhes sobre a meta"
                        className="bg-secondary border-border text-foreground"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="targetValue" className="text-card-foreground">
                          Valor Objetivo (R$)
                        </Label>
                        <Input
                          id="targetValue"
                          type="number"
                          step="0.01"
                          min="0"
                          value={targetValue}
                          onChange={(e) => setTargetValue(e.target.value)}
                          placeholder="0,00"
                          className="bg-secondary border-border text-foreground"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="currentValue" className="text-card-foreground">
                          Valor Atual (R$)
                        </Label>
                        <Input
                          id="currentValue"
                          type="number"
                          step="0.01"
                          min="0"
                          value={currentValue}
                          onChange={(e) => setCurrentValue(e.target.value)}
                          placeholder="0,00"
                          className="bg-secondary border-border text-foreground"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="deadline" className="text-card-foreground">
                          Data Limite (opcional)
                        </Label>
                        <Input
                          id="deadline"
                          type="date"
                          value={deadline}
                          onChange={(e) => setDeadline(e.target.value)}
                          className="bg-secondary border-border text-foreground"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="category" className="text-card-foreground">
                          Categoria
                        </Label>
                        <Select value={category} onValueChange={setCategory}>
                          <SelectTrigger className="bg-secondary border-border text-foreground">
                            <SelectValue placeholder="Selecione" />
                          </SelectTrigger>
                          <SelectContent className="bg-card border-border">
                            <SelectItem value="Pessoal">Pessoal</SelectItem>
                            <SelectItem value="Financeira">Financeira</SelectItem>
                            <SelectItem value="Saúde">Saúde</SelectItem>
                            <SelectItem value="Trabalho">Trabalho</SelectItem>
                            <SelectItem value="Educação">Educação</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <Button
                      type="submit"
                      className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                    >
                      {editingGoal ? "Salvar Alterações" : "Criar Meta"}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>

              {/* Progress Dialog */}
              <Dialog open={isProgressOpen} onOpenChange={setIsProgressOpen}>
                <DialogContent className="bg-card border-border">
                  <DialogHeader>
                    <DialogTitle className="text-card-foreground">
                      Atualizar Progresso
                    </DialogTitle>
                  </DialogHeader>
                  {selectedGoal && (
                    <div className="space-y-4">
                      <p className="text-sm text-muted-foreground">
                        Meta: {selectedGoal.title}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Objetivo: {formatCurrency(selectedGoal.targetValue)}
                      </p>
                      <div className="space-y-2">
                        <Label htmlFor="progress" className="text-card-foreground">
                          Novo Valor (R$)
                        </Label>
                        <Input
                          id="progress"
                          type="number"
                          step="0.01"
                          min="0"
                          max={selectedGoal.targetValue}
                          value={newProgress}
                          onChange={(e) => setNewProgress(e.target.value)}
                          className="bg-secondary border-border text-foreground"
                        />
                      </div>
                      <Button
                        onClick={handleUpdateProgress}
                        className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                      >
                        Atualizar
                      </Button>
                    </div>
                  )}
                </DialogContent>
              </Dialog>
            </div>

            {/* Stats */}
            <div className="grid gap-4 sm:grid-cols-3">
              <Card className="bg-card border-border">
                <CardContent className="flex items-center gap-4 p-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                    <Target className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Metas Ativas</p>
                    <p className="text-2xl font-bold text-foreground">{activeGoals.length}</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card border-border">
                <CardContent className="flex items-center gap-4 p-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                    <TrendingUp className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Progresso Médio</p>
                    <p className="text-2xl font-bold text-primary">{Math.round(totalProgress)}%</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card border-border">
                <CardContent className="flex items-center gap-4 p-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                    <CheckCircle2 className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Concluídas</p>
                    <p className="text-2xl font-bold text-foreground">{completedGoals.length}</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Metas Ativas */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-card-foreground">
                  <Target className="h-5 w-5 text-primary" />
                  Metas em Andamento
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {activeGoals.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    Nenhuma meta ativa. Crie sua primeira meta!
                  </p>
                ) : (
                  activeGoals.map((goal) => {
                    const progress = (goal.currentValue / goal.targetValue) * 100
                    const daysLeft = goal.deadline ? getDaysUntil(goal.deadline) : null

                    return (
                      <div
                        key={goal.id}
                        className="rounded-lg bg-secondary/50 p-4 space-y-3"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-medium text-card-foreground">
                              {goal.title}
                            </h3>
                            {goal.description && (
                              <p className="text-sm text-muted-foreground mt-0.5">
                                {goal.description}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleOpenProgress(goal)}
                              className="h-8 w-8 text-muted-foreground hover:text-primary"
                            >
                              <TrendingUp className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEdit(goal)}
                              className="h-8 w-8 text-muted-foreground hover:text-foreground"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => deleteGoal(goal.id)}
                              className="h-8 w-8 text-muted-foreground hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">
                              {formatCurrency(goal.currentValue)} de {formatCurrency(goal.targetValue)}
                            </span>
                            <span className="font-medium text-primary">
                              {Math.round(progress)}%
                            </span>
                          </div>
                          <div className="h-3 rounded-full bg-secondary">
                            <div
                              className="h-3 rounded-full bg-primary transition-all duration-500"
                              style={{ width: `${Math.min(progress, 100)}%` }}
                            />
                          </div>
                          {daysLeft !== null && (
                            <p
                              className={cn(
                                "text-xs",
                                daysLeft < 0
                                  ? "text-destructive"
                                  : daysLeft <= 7
                                  ? "text-primary"
                                  : "text-muted-foreground"
                              )}
                            >
                              {daysLeft < 0
                                ? `Prazo expirou há ${Math.abs(daysLeft)} dia(s)`
                                : daysLeft === 0
                                ? "Prazo expira hoje"
                                : `${daysLeft} dia(s) restante(s)`}
                            </p>
                          )}
                        </div>
                      </div>
                    )
                  })
                )}
              </CardContent>
            </Card>

            {/* Metas Concluídas */}
            {completedGoals.length > 0 && (
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-card-foreground">
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                    Metas Concluídas
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {completedGoals.map((goal) => (
                    <div
                      key={goal.id}
                      className="flex items-center justify-between rounded-lg bg-primary/10 p-3"
                    >
                      <div>
                        <h3 className="font-medium text-card-foreground">
                          {goal.title}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {formatCurrency(goal.targetValue)} alcançado
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-5 w-5 text-primary" />
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteGoal(goal.id)}
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
