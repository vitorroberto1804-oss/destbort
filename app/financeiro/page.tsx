"use client"

import { useState, useMemo } from "react"
import { Sidebar } from "@/components/dashboard/sidebar"
import { useData } from "@/lib/data-context"
import { formatCurrency, getDaysUntil, defaultCategories } from "@/lib/types"
import type { Transaction } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
import {
  Plus,
  Pencil,
  Trash2,
  Wallet,
  TrendingUp,
  TrendingDown,
  AlertCircle,
} from "lucide-react"
import { cn } from "@/lib/utils"

export default function FinanceiroPage() {
  const { transactions, addTransaction, updateTransaction, deleteTransaction, togglePaid, settings, isLoading } = useData()
  const [isOpen, setIsOpen] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)
  const [activeTab, setActiveTab] = useState("all")

  // Form state
  const [description, setDescription] = useState("")
  const [value, setValue] = useState("")
  const [category, setCategory] = useState("")
  const [type, setType] = useState<"income" | "expense">("expense")
  const [date, setDate] = useState(new Date().toISOString().split("T")[0])
  const [dueDate, setDueDate] = useState("")
  const [paid, setPaid] = useState(true)
  const [recurring, setRecurring] = useState<"none" | "monthly" | "weekly">("none")

  // Cálculos
  const balance = useMemo(() => {
    const income = transactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + t.value, 0)
    const expense = transactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + t.value, 0)
    return { income, expense, total: income - expense }
  }, [transactions])

  // Contas a pagar (não pagas)
  const upcomingBills = useMemo(() => {
    return transactions
      .filter((t) => t.type === "expense" && !t.paid)
      .sort((a, b) => {
        if (!a.dueDate) return 1
        if (!b.dueDate) return -1
        return a.dueDate.localeCompare(b.dueDate)
      })
  }, [transactions])

  // Histórico filtrado
  const filteredTransactions = useMemo(() => {
    let filtered = [...transactions]

    if (activeTab === "income") {
      filtered = filtered.filter((t) => t.type === "income")
    } else if (activeTab === "expense") {
      filtered = filtered.filter((t) => t.type === "expense")
    }

    return filtered.sort((a, b) => b.date.localeCompare(a.date))
  }, [transactions, activeTab])

  const resetForm = () => {
    setDescription("")
    setValue("")
    setCategory("")
    setType("expense")
    setDate(new Date().toISOString().split("T")[0])
    setDueDate("")
    setPaid(true)
    setRecurring("none")
    setEditingTransaction(null)
  }

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open)
    if (!open) {
      resetForm()
    }
  }

  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction)
    setDescription(transaction.description)
    setValue(transaction.value.toString())
    setCategory(transaction.category)
    setType(transaction.type)
    setDate(transaction.date)
    setDueDate(transaction.dueDate || "")
    setPaid(transaction.paid)
    setRecurring(transaction.recurring || "none")
    setIsOpen(true)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!description.trim() || !value || !category) return

    const transactionData = {
      description,
      value: parseFloat(value),
      category,
      type,
      date,
      dueDate: dueDate || undefined,
      paid,
      recurring,
    }

    if (editingTransaction) {
      updateTransaction(editingTransaction.id, transactionData)
    } else {
      addTransaction(transactionData)
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
          <div className="mx-auto max-w-5xl space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-4 pt-12 lg:pt-0 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-2xl font-bold text-foreground">Financeiro</h1>
                <p className="text-muted-foreground">Controle suas finanças</p>
              </div>

              <Dialog open={isOpen} onOpenChange={handleOpenChange}>
                <DialogTrigger asChild>
                  <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                    <Plus className="h-4 w-4 mr-2" />
                    Nova Transação
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-card border-border">
                  <DialogHeader>
                    <DialogTitle className="text-card-foreground">
                      {editingTransaction ? "Editar Transação" : "Nova Transação"}
                    </DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-card-foreground">Tipo</Label>
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant={type === "income" ? "default" : "outline"}
                          className={cn(
                            "flex-1",
                            type === "income"
                              ? "bg-primary text-primary-foreground"
                              : "border-border text-foreground"
                          )}
                          onClick={() => setType("income")}
                        >
                          <TrendingUp className="h-4 w-4 mr-2" />
                          Receita
                        </Button>
                        <Button
                          type="button"
                          variant={type === "expense" ? "default" : "outline"}
                          className={cn(
                            "flex-1",
                            type === "expense"
                              ? "bg-destructive text-destructive-foreground"
                              : "border-border text-foreground"
                          )}
                          onClick={() => setType("expense")}
                        >
                          <TrendingDown className="h-4 w-4 mr-2" />
                          Despesa
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description" className="text-card-foreground">
                        Descrição
                      </Label>
                      <Input
                        id="description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Ex: Salário, Aluguel..."
                        className="bg-secondary border-border text-foreground"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="value" className="text-card-foreground">
                          Valor
                        </Label>
                        <Input
                          id="value"
                          type="number"
                          step="0.01"
                          min="0"
                          value={value}
                          onChange={(e) => setValue(e.target.value)}
                          placeholder="0,00"
                          className="bg-secondary border-border text-foreground"
                          required
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
                            {defaultCategories.map((cat) => (
                              <SelectItem key={cat} value={cat}>
                                {cat}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="date" className="text-card-foreground">
                          Data
                        </Label>
                        <Input
                          id="date"
                          type="date"
                          value={date}
                          onChange={(e) => setDate(e.target.value)}
                          className="bg-secondary border-border text-foreground"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="recurring" className="text-card-foreground">
                          Recorrência
                        </Label>
                        <Select value={recurring} onValueChange={(v: any) => setRecurring(v)}>
                          <SelectTrigger className="bg-secondary border-border text-foreground">
                            <SelectValue placeholder="Selecione" />
                          </SelectTrigger>
                          <SelectContent className="bg-card border-border">
                            <SelectItem value="none">Nenhuma</SelectItem>
                            <SelectItem value="weekly">Semanal</SelectItem>
                            <SelectItem value="monthly">Mensal</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="dueDate" className="text-card-foreground">
                        Data de Vencimento (Lembrete)
                      </Label>
                      <Input
                        id="dueDate"
                        type="date"
                        value={dueDate}
                        onChange={(e) => setDueDate(e.target.value)}
                        className="bg-secondary border-border text-foreground"
                      />
                    </div>

                    {type === "expense" && (
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="paid"
                          checked={paid}
                          onCheckedChange={(checked) => setPaid(checked as boolean)}
                          className="border-primary data-[state=checked]:bg-primary"
                        />
                        <Label htmlFor="paid" className="text-card-foreground">
                          Já foi pago
                        </Label>
                      </div>
                    )}

                    <Button
                      type="submit"
                      className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                    >
                      {editingTransaction ? "Salvar Alterações" : "Adicionar"}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 sm:grid-cols-3">
              <Card className="bg-card border-border">
                <CardContent className="flex items-center gap-4 p-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                    <Wallet className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Saldo Total</p>
                    <p
                      className={cn(
                        "text-xl font-bold",
                        balance.total >= 0 ? "text-primary" : "text-destructive"
                      )}
                    >
                      {formatCurrency(balance.total)}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card border-border">
                <CardContent className="flex items-center gap-4 p-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                    <TrendingUp className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Receitas</p>
                    <p className="text-xl font-bold text-primary">
                      {formatCurrency(balance.income)}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card border-border">
                <CardContent className="flex items-center gap-4 p-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-destructive/10">
                    <TrendingDown className="h-6 w-6 text-destructive" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Despesas</p>
                    <p className="text-xl font-bold text-destructive">
                      {formatCurrency(balance.expense)}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Contas a Pagar */}
            {upcomingBills.length > 0 && (
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-card-foreground">
                    <AlertCircle className="h-5 w-5 text-destructive" />
                    Contas a Pagar
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {upcomingBills.map((bill) => {
                    const days = bill.dueDate ? getDaysUntil(bill.dueDate) : null
                    const isOverdue = days !== null && days < 0
                    const isDueSoon = days !== null && days >= 0 && days <= 3

                    return (
                      <div
                        key={bill.id}
                        className="flex items-center justify-between rounded-lg bg-secondary/50 p-3"
                      >
                        <div className="flex items-center gap-3">
                          <Checkbox
                            checked={bill.paid}
                            onCheckedChange={() => togglePaid(bill.id)}
                            className="border-primary data-[state=checked]:bg-primary"
                          />
                          <div>
                            <p className="text-sm font-medium text-card-foreground">
                              {bill.description}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {bill.category}
                              {bill.dueDate && (
                                <span
                                  className={cn(
                                    "ml-2",
                                    isOverdue && "text-destructive",
                                    isDueSoon && "text-primary"
                                  )}
                                >
                                  {isOverdue
                                    ? `Venceu há ${Math.abs(days!)} dia(s)`
                                    : days === 0
                                    ? "Vence hoje"
                                    : `Vence em ${days} dia(s)`}
                                </span>
                              )}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-destructive">
                            {formatCurrency(bill.value)}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(bill)}
                            className="h-8 w-8 text-muted-foreground hover:text-foreground"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )
                  })}
                </CardContent>
              </Card>
            )}

            {/* Histórico */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-card-foreground">Histórico de Transações</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="bg-secondary mb-4">
                    <TabsTrigger value="all" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                      Todas
                    </TabsTrigger>
                    <TabsTrigger value="income" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                      Receitas
                    </TabsTrigger>
                    <TabsTrigger value="expense" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                      Despesas
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value={activeTab} className="space-y-2">
                    {filteredTransactions.length === 0 ? (
                      <p className="text-center text-muted-foreground py-8">
                        Nenhuma transação encontrada
                      </p>
                    ) : (
                      filteredTransactions.map((transaction) => (
                        <div
                          key={transaction.id}
                          className="flex items-center justify-between rounded-lg bg-secondary/50 p-3"
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={cn(
                                "flex h-10 w-10 items-center justify-center rounded-lg",
                                transaction.type === "income"
                                  ? "bg-primary/10"
                                  : "bg-destructive/10"
                              )}
                            >
                              {transaction.type === "income" ? (
                                <TrendingUp className="h-5 w-5 text-primary" />
                              ) : (
                                <TrendingDown className="h-5 w-5 text-destructive" />
                              )}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-card-foreground">
                                {transaction.description}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {transaction.category} •{" "}
                                {new Date(transaction.date).toLocaleDateString("pt-BR")}
                                {transaction.type === "expense" && !transaction.paid && (
                                  <span className="ml-2 text-destructive">Pendente</span>
                                )}
                                {transaction.recurring && transaction.recurring !== "none" && (
                                  <span className="ml-2 text-primary">({transaction.recurring})</span>
                                )}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span
                              className={cn(
                                "text-sm font-semibold",
                                transaction.type === "income"
                                  ? "text-primary"
                                  : "text-destructive"
                              )}
                            >
                              {transaction.type === "income" ? "+" : "-"}
                              {formatCurrency(transaction.value)}
                            </span>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEdit(transaction)}
                              className="h-8 w-8 text-muted-foreground hover:text-foreground"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => deleteTransaction(transaction.id)}
                              className="h-8 w-8 text-muted-foreground hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
