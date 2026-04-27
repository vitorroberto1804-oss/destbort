"use client"

import { useState, useMemo } from "react"
import { Sidebar } from "@/components/dashboard/sidebar"
import { useData } from "@/lib/data-context"
import { formatCurrency, isSameDay } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  CheckSquare,
  Wallet,
  Pill,
  Stethoscope,
} from "lucide-react"
import { cn } from "@/lib/utils"

const WEEKDAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"]
const MONTHS = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
]

interface CalendarDay {
  date: Date
  dateString: string
  isCurrentMonth: boolean
  isToday: boolean
  events: {
    tasks: number
    bills: number
    medications: number
    appointments: number
    isHighPriority: boolean
  }
}

export default function CalendarioPage() {
  const { tasks, transactions, medications, appointments, settings, isLoading } = useData()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  )

  const today = new Date().toISOString().split("T")[0]

  // Generate calendar days
  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()

    const firstDayOfMonth = new Date(year, month, 1)
    const lastDayOfMonth = new Date(year, month + 1, 0)

    const startDay = firstDayOfMonth.getDay()
    const daysInMonth = lastDayOfMonth.getDate()

    const days: CalendarDay[] = []

    // Previous month days
    const prevMonth = new Date(year, month, 0)
    const prevMonthDays = prevMonth.getDate()
    for (let i = startDay - 1; i >= 0; i--) {
      const date = new Date(year, month - 1, prevMonthDays - i)
      const dateString = date.toISOString().split("T")[0]
      days.push({
        date,
        dateString,
        isCurrentMonth: false,
        isToday: dateString === today,
        events: getEventsForDate(dateString),
      })
    }

    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day)
      const dateString = date.toISOString().split("T")[0]
      days.push({
        date,
        dateString,
        isCurrentMonth: true,
        isToday: dateString === today,
        events: getEventsForDate(dateString),
      })
    }

    // Next month days
    const remainingDays = 42 - days.length
    for (let day = 1; day <= remainingDays; day++) {
      const date = new Date(year, month + 1, day)
      const dateString = date.toISOString().split("T")[0]
      days.push({
        date,
        dateString,
        isCurrentMonth: false,
        isToday: dateString === today,
        events: getEventsForDate(dateString),
      })
    }

    return days
  }, [currentDate, tasks, transactions, medications, appointments, today])

  function getEventsForDate(dateString: string) {
    const dateTasks = tasks.filter((t) => t.dueDate === dateString)
    const dateBills = transactions.filter(
      (t) => t.type === "expense" && (t.dueDate === dateString || t.date === dateString)
    )
    const dateAppointments = appointments.filter((a) => a.date === dateString)
    
    return {
      tasks: dateTasks.length,
      bills: dateBills.length,
      medications: medications.length > 0 ? 1 : 0,
      appointments: dateAppointments.length,
      isHighPriority: dateTasks.some(t => t.priority === "high") || dateBills.some(b => !b.paid)
    }
  }

  // Get events for selected date
  const selectedDateEvents = useMemo(() => {
    const dateTasks = tasks.filter((t) => t.dueDate === selectedDate)
    const dateBills = transactions.filter(
      (t) =>
        t.type === "expense" &&
        (t.dueDate === selectedDate || t.date === selectedDate)
    )
    const dateAppointments = appointments.filter((a) => a.date === selectedDate)

    return { tasks: dateTasks, bills: dateBills, appointments: dateAppointments }
  }, [selectedDate, tasks, transactions, appointments])

  const hasEventsOnDate = (day: CalendarDay) => {
    const e = day.events
    return e.tasks > 0 || e.bills > 0 || e.appointments > 0
  }

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
  }

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
  }

  const goToToday = () => {
    setCurrentDate(new Date())
    setSelectedDate(today)
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
          <div className="mx-auto max-w-5xl space-y-6">
            {/* Header */}
            <div className="pt-12 lg:pt-0">
              <h1 className="text-2xl font-bold text-foreground">Calendário</h1>
              <p className="text-muted-foreground">
                Visualize todos os seus compromissos
              </p>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
              {/* Calendar */}
              <Card className="lg:col-span-2 bg-card border-border">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="flex items-center gap-2 text-card-foreground">
                    <Calendar className="h-5 w-5 text-primary" />
                    {MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={goToToday}
                      className="border-border text-foreground"
                    >
                      Hoje
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={goToPreviousMonth}
                      className="text-foreground"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={goToNextMonth}
                      className="text-foreground"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Weekdays header */}
                  <div className="grid grid-cols-7 gap-1 mb-2">
                    {WEEKDAYS.map((day) => (
                      <div
                        key={day}
                        className="text-center text-xs font-medium text-muted-foreground py-2"
                      >
                        {day}
                      </div>
                    ))}
                  </div>

                  {/* Calendar grid */}
                  <div className="grid grid-cols-7 gap-1">
                    {calendarDays.map((day, index) => {
                      const isSelected = day.dateString === selectedDate
                      const hasEvents = hasEventsOnDate(day)

                      return (
                        <button
                          key={index}
                          onClick={() => setSelectedDate(day.dateString)}
                          className={cn(
                            "relative aspect-square p-1 rounded-lg text-sm font-medium transition-colors",
                            day.isCurrentMonth
                              ? "text-card-foreground"
                              : "text-muted-foreground/50",
                            day.isToday && "ring-2 ring-primary",
                            isSelected && "bg-primary text-primary-foreground",
                            !isSelected && "hover:bg-secondary"
                          )}
                        >
                          <span>{day.date.getDate()}</span>
                          {hasEvents && !isSelected && (
                            <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-0.5">
                              {day.events.tasks > 0 && (
                                <div className={cn("h-1 w-1 rounded-full bg-primary", day.events.isHighPriority && "ring-1 ring-primary ring-offset-1")} />
                              )}
                              {day.events.bills > 0 && (
                                <div className="h-1 w-1 rounded-full bg-destructive" />
                              )}
                              {day.events.appointments > 0 && (
                                <div className="h-1 w-1 rounded-full bg-chart-3" />
                              )}
                            </div>
                          )}
                          {day.events.isHighPriority && !isSelected && (
                            <div className="absolute top-1 right-1 h-1.5 w-1.5 rounded-full bg-destructive animate-pulse" />
                          )}
                        </button>
                      )
                    })}
                  </div>

                  {/* Legend */}
                  <div className="flex items-center justify-center gap-4 mt-4 pt-4 border-t border-border">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <div className="h-2 w-2 rounded-full bg-primary" />
                      Tarefas
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <div className="h-2 w-2 rounded-full bg-destructive" />
                      Contas
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <div className="h-2 w-2 rounded-full bg-chart-3" />
                      Consultas
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Selected Day Details */}
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-card-foreground">
                    {new Date(selectedDate + "T12:00:00").toLocaleDateString("pt-BR", {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                    })}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Tasks */}
                  {selectedDateEvents.tasks.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="flex items-center gap-2 text-sm font-medium text-card-foreground">
                        <CheckSquare className="h-4 w-4 text-primary" />
                        Tarefas
                      </h4>
                      {selectedDateEvents.tasks.map((task) => (
                        <div
                          key={task.id}
                          className={cn(
                            "text-sm rounded-lg bg-secondary/50 p-2",
                            task.completed && "line-through text-muted-foreground"
                          )}
                        >
                          <p className="font-medium">{task.title}</p>
                          {task.dueTime && (
                            <p className="text-xs text-muted-foreground">
                              às {task.dueTime}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Bills */}
                  {selectedDateEvents.bills.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="flex items-center gap-2 text-sm font-medium text-card-foreground">
                        <Wallet className="h-4 w-4 text-destructive" />
                        Contas
                      </h4>
                      {selectedDateEvents.bills.map((bill) => (
                        <div
                          key={bill.id}
                          className="text-sm rounded-lg bg-secondary/50 p-2"
                        >
                          <div className="flex items-center justify-between">
                            <p className="font-medium">{bill.description}</p>
                            <span className="text-destructive">
                              {formatCurrency(bill.value)}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {bill.paid ? "Pago" : "Pendente"}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Appointments */}
                  {selectedDateEvents.appointments.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="flex items-center gap-2 text-sm font-medium text-card-foreground">
                        <Stethoscope className="h-4 w-4 text-chart-3" />
                        Consultas
                      </h4>
                      {selectedDateEvents.appointments.map((apt) => (
                        <div
                          key={apt.id}
                          className="text-sm rounded-lg bg-secondary/50 p-2"
                        >
                          <p className="font-medium">{apt.title}</p>
                          {apt.doctor && (
                            <p className="text-xs text-muted-foreground">
                              {apt.doctor}
                            </p>
                          )}
                          <p className="text-xs text-primary">às {apt.time}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Medications */}
                  {medications.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="flex items-center gap-2 text-sm font-medium text-card-foreground">
                        <Pill className="h-4 w-4 text-primary" />
                        Medicamentos
                      </h4>
                      {medications.map((med) => (
                        <div
                          key={med.id}
                          className="text-sm rounded-lg bg-secondary/50 p-2"
                        >
                          <p className="font-medium">{med.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {med.dosage} - {med.times.join(", ")}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Empty state */}
                  {selectedDateEvents.tasks.length === 0 &&
                    selectedDateEvents.bills.length === 0 &&
                    selectedDateEvents.appointments.length === 0 &&
                    medications.length === 0 && (
                      <p className="text-center text-muted-foreground py-8">
                        Nenhum evento para este dia
                      </p>
                    )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
