"use client"

import { useMemo, useState } from "react"
import { Sidebar } from "@/components/dashboard/sidebar"
import { useData } from "@/lib/data-context"
import { formatCurrency, getDaysUntil, isToday, formatDate } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  CheckSquare,
  Target,
  Pill,
  AlertCircle,
  Calendar as CalendarIcon,
  Briefcase,
  Bell,
  ChevronRight,
  Clock,
  Plus,
} from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"

export default function Dashboard() {
  const {
    tasks,
    toggleTask,
    transactions,
    goals,
    medications,
    appointments,
    settings,
    isLoading,
  } = useData()

  const today = new Date().toISOString().split("T")[0]

  const balance = useMemo(() => {
    const income = transactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + t.value, 0)
    const expense = transactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + t.value, 0)
    const jobEarnings = transactions
      .filter((t) => t.type === "income" && t.jobId)
      .reduce((sum, t) => sum + t.value, 0)
    return { income, expense, total: income - expense, jobEarnings }
  }, [transactions])

  const todayTasks = useMemo(() => {
    return tasks.filter((t) => !t.completed && (t.dueDate === today || !t.dueDate))
  }, [tasks, today])

  const upcomingBills = useMemo(() => {
    return transactions
      .filter((t) => t.type === "expense" && !t.paid && t.dueDate)
      .sort((a, b) => a.dueDate!.localeCompare(b.dueDate!))
      .slice(0, 3)
  }, [transactions])

  const activeGoals = useMemo(() => {
    return goals.filter((g) => g.status === "in-progress").slice(0, 2)
  }, [goals])

  const pendingMedications = useMemo(() => {
    return medications
      .map((med) => {
        const pendingTimes = med.times.filter(
          (time) => !med.takenToday.includes(`${today}-${time}`)
        )
        return { ...med, pendingTimes }
      })
      .filter((med) => med.pendingTimes.length > 0)
  }, [medications, today])

  const upcomingAppointments = useMemo(() => {
    return appointments
      .filter((apt) => apt.date >= today)
      .sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time))
      .slice(0, 3)
  }, [appointments, today])

  const alerts = useMemo(() => {
    const items = []
    
    // Alerta de contas vencendo hoje ou atrasadas
    const overdueBills = transactions.filter(
      (t) => t.type === "expense" && !t.paid && t.dueDate && t.dueDate <= today
    )
    if (overdueBills.length > 0) {
      items.push({
        message: `Você tem ${overdueBills.length} conta(s) pendente(s) para hoje ou atrasada(s).`,
        priority: "high",
      })
    }

    // Alerta de tarefas de alta prioridade
    const highPriorityTasks = todayTasks.filter((t) => t.priority === "high")
    if (highPriorityTasks.length > 0) {
      items.push({
        message: `Você tem ${highPriorityTasks.length} tarefa(s) de alta prioridade para hoje.`,
        priority: "medium",
      })
    }

    return items
  }, [transactions, todayTasks, today])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-foreground">Carregando dashboard...</div>
      </div>
    )
  }

  const hasTasks = todayTasks.length > 0
  const hasBills = upcomingBills.length > 0
  const hasGoals = activeGoals.length > 0
  const hasMedications = pendingMedications.length > 0
  const hasAppointments = upcomingAppointments.length > 0
  const hasAlerts = alerts.length > 0

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
          <div className="mx-auto max-w-7xl space-y-8">
            {/* Top Bar / Welcome */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pt-12 lg:pt-0">
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-foreground">
                  Bem-vindo, {settings.name.split(" ")[0]}
                </h1>
                <p className="text-muted-foreground">
                  {formatDate(new Date())} • Seu resumo inteligente está pronto.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Link href="/configuracoes">
                  <Button variant="outline" size="sm" className="bg-card">
                    Configurações
                  </Button>
                </Link>
                <Link href="/tarefas">
                  <Button size="sm" className="bg-primary text-primary-foreground shadow-lg shadow-primary/20">
                    <Plus className="mr-2 h-4 w-4" /> Nova Tarefa
                  </Button>
                </Link>
              </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
              {/* Coluna da Esquerda: Saldo e Notificações */}
              <div className="lg:col-span-2 space-y-6">
                {/* Saldo Principal Estilizado */}
                <Card className="overflow-hidden border-none bg-gradient-to-br from-primary/10 via-primary/5 to-background shadow-md">
                  <CardContent className="p-0">
                    <div className="grid grid-cols-1 divide-y divide-border/50 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
                      <div className="p-6">
                        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-1">
                          <Wallet className="h-4 w-4" /> Saldo Total
                        </div>
                        <div className={cn(
                          "text-3xl font-bold tracking-tight",
                          balance.total >= 0 ? "text-foreground" : "text-destructive"
                        )}>
                          {formatCurrency(balance.total)}
                        </div>
                      </div>
                      <div className="p-6">
                        <div className="flex items-center gap-2 text-sm font-medium text-primary mb-1">
                          <TrendingUp className="h-4 w-4" /> Entradas
                        </div>
                        <div className="text-2xl font-bold text-foreground">
                          {formatCurrency(balance.income)}
                        </div>
                        {balance.jobEarnings > 0 && (
                          <p className="text-xs text-muted-foreground mt-1">
                            +{formatCurrency(balance.jobEarnings)} de trabalhos
                          </p>
                        )}
                      </div>
                      <div className="p-6">
                        <div className="flex items-center gap-2 text-sm font-medium text-destructive mb-1">
                          <TrendingDown className="h-4 w-4" /> Saídas
                        </div>
                        <div className="text-2xl font-bold text-foreground">
                          {formatCurrency(balance.expense)}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Centro de Notificações / Alertas */}
                <Card className="bg-card/50 backdrop-blur-md border-border shadow-sm">
                  <CardHeader className="pb-3 flex flex-row items-center justify-between">
                    <CardTitle className="text-lg font-semibold flex items-center gap-2">
                      <Bell className="h-5 w-5 text-primary" /> Central de Alertas
                    </CardTitle>
                    {hasAlerts && (
                      <Badge variant="secondary" className="bg-primary/10 text-primary border-none">
                        {alerts.length} pendentes
                      </Badge>
                    )}
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {hasAlerts ? (
                      alerts.map((alert, i) => (
                        <div
                          key={i}
                          className={cn(
                            "group flex items-center justify-between gap-4 rounded-xl p-4 transition-all hover:scale-[1.01]",
                            alert.priority === "high"
                              ? "bg-destructive/5 border border-destructive/10 text-destructive"
                              : "bg-primary/5 border border-primary/10 text-primary"
                          )}
                        >
                          <div className="flex items-center gap-3">
                            <div className={cn(
                              "p-2 rounded-full",
                              alert.priority === "high" ? "bg-destructive/10" : "bg-primary/10"
                            )}>
                              <AlertCircle className="h-5 w-5" />
                            </div>
                            <div>
                              <p className="font-medium">{alert.message}</p>
                              <p className="text-xs opacity-70">Ação necessária imediata</p>
                            </div>
                          </div>
                          <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </div>
                      ))
                    ) : (
                      <div className="py-8 text-center text-muted-foreground">
                        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                          <CheckSquare className="h-6 w-6" />
                        </div>
                        <p>Tudo em ordem por aqui!</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Grid de Atividades Próximas */}
                <div className="grid gap-6 md:grid-cols-2">
                  {/* Tarefas Prioritárias */}
                  <Card className="bg-card border-border shadow-sm">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base font-semibold flex items-center gap-2">
                        <CheckSquare className="h-4 w-4 text-primary" /> Próximas Tarefas
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {hasTasks ? (
                        todayTasks.map((task) => (
                          <div key={task.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-secondary/50 transition-colors">
                            <Checkbox checked={task.completed} onCheckedChange={() => toggleTask(task.id)} />
                            <div className="flex-1 min-w-0">
                              <p className={cn("text-sm font-medium truncate", task.completed && "line-through text-muted-foreground")}>
                                {task.title}
                              </p>
                            </div>
                            {task.priority === "high" && <div className="h-2 w-2 rounded-full bg-destructive" />}
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-muted-foreground py-4 text-center">Nenhuma tarefa para hoje</p>
                      )}
                      <Link href="/tarefas" className="block pt-2">
                        <Button variant="ghost" size="sm" className="w-full text-xs text-primary hover:text-primary hover:bg-primary/5">
                          Ver todas as tarefas
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>

                  {/* Saúde / Medicamentos */}
                  <Card className="bg-card border-border shadow-sm">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base font-semibold flex items-center gap-2">
                        <Pill className="h-4 w-4 text-primary" /> Saúde & Bem-estar
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {hasMedications ? (
                        pendingMedications.slice(0, 3).map((med) => (
                          <div key={med.id} className="flex items-center justify-between p-2 rounded-lg bg-primary/5">
                            <div className="flex items-center gap-2">
                              <div className="p-1.5 rounded-md bg-primary/10">
                                <Clock className="h-3 w-3 text-primary" />
                              </div>
                              <span className="text-sm font-medium">{med.name}</span>
                            </div>
                            <Badge variant="outline" className="text-[10px] py-0 px-1.5 border-primary/20 text-primary">
                              {med.pendingTimes[0]}
                            </Badge>
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-muted-foreground py-4 text-center">Saúde em dia</p>
                      )}
                      <Link href="/saude" className="block pt-1">
                        <Button variant="ghost" size="sm" className="w-full text-xs text-primary hover:text-primary hover:bg-primary/5">
                          Acessar painel de saúde
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Coluna da Direita: Mini Calendário e Metas */}
              <div className="space-y-6">
                {/* Mini Calendário Funcional */}
                <Card className="bg-card border-border shadow-sm overflow-hidden">
                  <CardHeader className="pb-2 bg-secondary/30">
                    <CardTitle className="text-sm font-semibold flex items-center gap-2">
                      <CalendarIcon className="h-4 w-4 text-primary" /> Agenda Mensal
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4">
                    <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-muted-foreground mb-2">
                      {["D", "S", "T", "Q", "Q", "S", "S"].map(d => <div key={d}>{d}</div>)}
                    </div>
                    <div className="grid grid-cols-7 gap-1">
                      {Array.from({ length: 31 }).map((_, i) => {
                        const day = i + 1;
                        const isCurrent = day === new Date().getDate();
                        return (
                          <div 
                            key={i} 
                            className={cn(
                              "aspect-square flex items-center justify-center text-xs rounded-md transition-colors",
                              isCurrent ? "bg-primary text-primary-foreground font-bold shadow-sm" : "hover:bg-secondary cursor-default"
                            )}
                          >
                            {day}
                          </div>
                        )
                      })}
                    </div>
                    <Link href="/calendario" className="block mt-4">
                      <Button variant="outline" size="sm" className="w-full text-xs border-border">
                        Ver Calendário Completo
                      </Button>
                    </Link>
                  </CardContent>
                </Card>

                {/* Metas de Curto Prazo */}
                <Card className="bg-card border-border shadow-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-semibold flex items-center gap-2">
                      <Target className="h-4 w-4 text-primary" /> Suas Metas
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {hasGoals ? (
                      activeGoals.map((goal) => {
                        const progress = (goal.currentValue / goal.targetValue) * 100
                        return (
                          <div key={goal.id} className="space-y-1.5">
                            <div className="flex items-center justify-between text-xs">
                              <span className="font-medium">{goal.title}</span>
                              <span className="text-muted-foreground">{Math.round(progress)}%</span>
                            </div>
                            <div className="h-1.5 w-full rounded-full bg-secondary overflow-hidden">
                              <div 
                                className="h-full bg-primary transition-all duration-500" 
                                style={{ width: `${Math.min(progress, 100)}%` }}
                              />
                            </div>
                          </div>
                        )
                      })
                    ) : (
                      <p className="text-xs text-muted-foreground py-4 text-center">Nenhuma meta ativa</p>
                    )}
                    <Link href="/metas" className="block pt-2">
                      <Button variant="ghost" size="sm" className="w-full text-xs text-primary hover:text-primary hover:bg-primary/5">
                        Gerenciar metas
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
