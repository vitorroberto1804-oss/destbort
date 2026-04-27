// Tipos compartilhados para todo o dashboard

export interface Task {
  id: string
  title: string
  description?: string
  completed: boolean
  priority: "low" | "medium" | "high"
  dueDate?: string
  dueTime?: string
  category?: string
  reminder?: boolean
  createdAt: string
}

export interface Transaction {
  id: string
  description: string
  value: number
  category: string
  type: "income" | "expense"
  date: string
  paid: boolean
  dueDate?: string
  recurring?: "none" | "monthly" | "weekly"
  jobId?: string // Referência ao trabalho, se for receita de trabalho
}

export interface Goal {
  id: string
  title: string
  description?: string
  targetValue: number
  currentValue: number
  deadline?: string
  status: "in-progress" | "completed"
  createdAt: string
}

export interface Medication {
  id: string
  name: string
  dosage: string
  times: string[]
  takenToday: string[]
  createdAt: string
}

export interface Appointment {
  id: string
  title: string
  doctor?: string
  date: string
  time: string
  notes?: string
  createdAt: string
}

export interface Habit {
  id: string
  title: string
  completedDates: string[]
  createdAt: string
}

// Trabalho autônomo
export interface Job {
  id: string
  title: string
  dailyRate: number
  workedDates: string[] // Datas que trabalhou
  createdAt: string
}

// Configurações do usuário
export interface UserSettings {
  name: string
  profileImage?: string // Base64 ou URL
  backgroundImage?: string // Base64 ou URL
}

export interface DashboardData {
  tasks: Task[]
  transactions: Transaction[]
  goals: Goal[]
  medications: Medication[]
  appointments: Appointment[]
  habits: Habit[]
  jobs: Job[]
  settings: UserSettings
}

export const defaultCategories = [
  "Alimentação",
  "Transporte",
  "Moradia",
  "Lazer",
  "Saúde",
  "Educação",
  "Salário",
  "Freelance",
  "Trabalho",
  "Investimentos",
  "Outros",
]

export function generateId(): string {
  return Math.random().toString(36).substring(2, 9)
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value)
}

export function formatDate(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(d)
}

export function formatDateShort(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
  }).format(d)
}

export function isToday(date: string): boolean {
  const today = new Date().toISOString().split("T")[0]
  return date === today
}

export function isSameDay(date1: string | Date, date2: string | Date): boolean {
  const d1 = typeof date1 === "string" ? date1 : date1.toISOString().split("T")[0]
  const d2 = typeof date2 === "string" ? date2 : date2.toISOString().split("T")[0]
  return d1 === d2
}

export function getDaysUntil(date: string): number {
  const target = new Date(date)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  target.setHours(0, 0, 0, 0)
  const diff = target.getTime() - today.getTime()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}
