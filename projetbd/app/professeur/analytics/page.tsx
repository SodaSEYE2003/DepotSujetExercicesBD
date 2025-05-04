"use client"

import type React from "react"

import { useState, useEffect } from "react"
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import {
  Calendar,
  ChevronDown,
  Download,
  Filter,
  Loader2,
  PieChartIcon,
  TrendingUp,
  Users,
  FileText,
  CheckCircle,
  Clock,
  AlertCircle,
  BarChart3,
  LineChartIcon,
} from "lucide-react"
import Sidebar from "../../../src/components/Sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../src/components/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../src/components/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../src/components/select"
import { Button } from "../../../src/components/button"
import { Progress } from "../../../src/components/progress"
import { Badge } from "../../../src/components/badge"

// Types
type UserRole = "professor" | "student"
type TimeRange = "week" | "month" | "semester" | "year" | "all"
type ChartType = "bar" | "line" | "pie"

// Interfaces
interface StatCard {
  title: string
  value: string | number
  change: number
  icon: React.ReactNode
  trend: "up" | "down" | "neutral"
}

interface Student {
  id: number
  name: string
  submissions: number
  completionRate: number
  averageGrade: number
  lastSubmission: string
}

interface Exercise {
  id: number
  title: string
  category: string
  submissions: number
  averageGrade: number
  completionRate: number
}

interface CategoryData {
  name: string
  count: number
  color: string
}

interface GradeDistribution {
  range: string
  count: number
}

interface SubmissionTrend {
  date: string
  submissions: number
  completions: number
}

// Données de démonstration
const COLORS = ["#4f46e5", "#8b5cf6", "#ec4899", "#f97316", "#10b981", "#06b6d4"]

const mockStudents: Student[] = [
  {
    id: 1,
    name: "Emma Martin",
    submissions: 12,
    completionRate: 92,
    averageGrade: 17.5,
    lastSubmission: "2023-11-15",
  },
  {
    id: 2,
    name: "Thomas Dubois",
    submissions: 10,
    completionRate: 85,
    averageGrade: 15.8,
    lastSubmission: "2023-11-14",
  },
  {
    id: 3,
    name: "Sophie Bernard",
    submissions: 11,
    completionRate: 90,
    averageGrade: 16.2,
    lastSubmission: "2023-11-16",
  },
  {
    id: 4,
    name: "Lucas Petit",
    submissions: 9,
    completionRate: 75,
    averageGrade: 14.5,
    lastSubmission: "2023-11-10",
  },
  {
    id: 5,
    name: "Chloé Leroy",
    submissions: 12,
    completionRate: 95,
    averageGrade: 18.2,
    lastSubmission: "2023-11-17",
  },
]

const mockExercises: Exercise[] = [
  {
    id: 1,
    title: "Requêtes SQL avancées",
    category: "SQL",
    submissions: 25,
    averageGrade: 15.7,
    completionRate: 88,
  },
  {
    id: 2,
    title: "Modélisation de données",
    category: "Modélisation",
    submissions: 22,
    averageGrade: 14.2,
    completionRate: 82,
  },
  {
    id: 3,
    title: "Optimisation de requêtes",
    category: "Optimisation",
    submissions: 18,
    averageGrade: 16.5,
    completionRate: 75,
  },
  {
    id: 4,
    title: "Transactions et concurrence",
    category: "Avancé",
    submissions: 15,
    averageGrade: 13.8,
    completionRate: 65,
  },
  {
    id: 5,
    title: "Introduction à MongoDB",
    category: "NoSQL",
    submissions: 20,
    averageGrade: 15.2,
    completionRate: 80,
  },
]

const mockCategoryData: CategoryData[] = [
  { name: "SQL", count: 35, color: "#4f46e5" },
  { name: "Modélisation", count: 25, color: "#8b5cf6" },
  { name: "Optimisation", count: 15, color: "#ec4899" },
  { name: "Avancé", count: 10, color: "#f97316" },
  { name: "NoSQL", count: 15, color: "#10b981" },
]

const mockGradeDistribution: GradeDistribution[] = [
  { range: "0-5", count: 3 },
  { range: "6-8", count: 7 },
  { range: "9-10", count: 12 },
  { range: "11-12", count: 18 },
  { range: "13-14", count: 25 },
  { range: "15-16", count: 30 },
  { range: "17-18", count: 15 },
  { range: "19-20", count: 5 },
]

const mockSubmissionTrends: SubmissionTrend[] = [
  { date: "Semaine 1", submissions: 45, completions: 40 },
  { date: "Semaine 2", submissions: 52, completions: 48 },
  { date: "Semaine 3", submissions: 48, completions: 45 },
  { date: "Semaine 4", submissions: 70, completions: 65 },
  { date: "Semaine 5", submissions: 55, completions: 50 },
  { date: "Semaine 6", submissions: 60, completions: 55 },
  { date: "Semaine 7", submissions: 75, completions: 70 },
  { date: "Semaine 8", submissions: 80, completions: 75 },
]

export default function AnalyticsPage() {
  // États
  const [userRole, setUserRole] = useState<UserRole>("professor")
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [timeRange, setTimeRange] = useState<TimeRange>("month")
  const [chartType, setChartType] = useState<ChartType>("bar")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")

  // Statistiques
  const [statCards, setStatCards] = useState<StatCard[]>([
    {
      title: "Exercices",
      value: 115,
      change: 12,
      icon: <FileText className="h-8 w-8 text-indigo-500" />,
      trend: "up",
    },
    {
      title: "Étudiants actifs",
      value: 87,
      change: 8,
      icon: <Users className="h-8 w-8 text-purple-500" />,
      trend: "up",
    },
    {
      title: "Taux de complétion",
      value: "82%",
      change: 5,
      icon: <CheckCircle className="h-8 w-8 text-green-500" />,
      trend: "up",
    },
    {
      title: "Note moyenne",
      value: 15.4,
      change: 0.8,
      icon: <TrendingUp className="h-8 w-8 text-pink-500" />,
      trend: "up",
    },
  ])

  // Fonctions
  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode)
    if (!isDarkMode) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen)
  }

  // Vérifier la préférence système pour le mode sombre au montage
  useEffect(() => {
    if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
      setIsDarkMode(true)
      document.documentElement.classList.add("dark")
    }

    // Simuler un chargement des données
    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
    }, 1000)
  }, [])

  // Fonction pour formater les nombres
  const formatNumber = (num: number): string => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ")
  }

  // Fonction pour exporter les données
  const exportData = (format: "csv" | "pdf" | "excel") => {
    // Logique d'exportation à implémenter
    console.log(`Exporting data in ${format} format...`)
  }

  // Rendu
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 transition-colors duration-500">
      <div className="flex">
        {/* Sidebar */}
        <Sidebar
          userRole={userRole}
          isDarkMode={isDarkMode}
          toggleDarkMode={toggleDarkMode}
          isSidebarOpen={isSidebarOpen}
          toggleSidebar={toggleSidebar}
        />

        {/* Main Content */}
        <div className="flex-1 md:ml-64 transition-all duration-300">
          {/* Top Navigation */}
          <header className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-40">
            <div className="flex items-center justify-between h-16 px-4 md:px-6">
              <h1 className="text-xl font-bold text-gray-800 dark:text-white">Tableau de bord analytique</h1>

              <div className="flex items-center space-x-4">
                <Select value={timeRange} onValueChange={(value) => setTimeRange(value as TimeRange)}>
                  <SelectTrigger className="w-[180px]">
                    <div className="flex items-center">
                      <Calendar className="mr-2 h-4 w-4" />
                      <SelectValue placeholder="Période" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="week">Cette semaine</SelectItem>
                    <SelectItem value="month">Ce mois</SelectItem>
                    <SelectItem value="semester">Ce semestre</SelectItem>
                    <SelectItem value="year">Cette année</SelectItem>
                    <SelectItem value="all">Toutes les données</SelectItem>
                  </SelectContent>
                </Select>

                <div className="relative">
                  <Button variant="outline" className="flex items-center">
                    <Download className="mr-2 h-4 w-4" />
                    Exporter
                    <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </header>

          {/* Page Content */}
          <main className="p-4 md:p-6">
            {isLoading ? (
              <div className="flex items-center justify-center h-[80vh]">
                <div className="text-center">
                  <Loader2 className="h-12 w-12 animate-spin text-indigo-600 mx-auto mb-4" />
                  <p className="text-lg text-gray-600 dark:text-gray-300">Chargement des données analytiques...</p>
                </div>
              </div>
            ) : (
              <div className="space-y-6 animate-fade-in">
                {/* Statistiques principales */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {statCards.map((stat, index) => (
                    <Card key={index} className="border-none shadow-md hover:shadow-lg transition-shadow duration-300">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{stat.title}</p>
                            <h3 className="text-3xl font-bold mt-2 text-gray-800 dark:text-white">{stat.value}</h3>
                            <div
                              className={`flex items-center mt-2 ${
                                stat.trend === "up"
                                  ? "text-green-600 dark:text-green-400"
                                  : stat.trend === "down"
                                    ? "text-red-600 dark:text-red-400"
                                    : "text-gray-600 dark:text-gray-400"
                              }`}
                            >
                              {stat.trend === "up" ? (
                                <TrendingUp className="h-4 w-4 mr-1" />
                              ) : stat.trend === "down" ? (
                                <TrendingUp className="h-4 w-4 mr-1 transform rotate-180" />
                              ) : null}
                              <span className="text-sm font-medium">
                                {stat.change > 0 ? "+" : ""}
                                {stat.change}%
                              </span>
                              <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">vs période préc.</span>
                            </div>
                          </div>
                          <div className="p-3 rounded-full bg-indigo-50 dark:bg-indigo-900/20">{stat.icon}</div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Graphiques principaux */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Tendances des soumissions */}
                  <Card className="border-none shadow-md">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle>Tendances des soumissions</CardTitle>
                          <CardDescription>Évolution des soumissions et complétion</CardDescription>
                        </div>
                        <Select value={chartType} onValueChange={(value) => setChartType(value as ChartType)}>
                          <SelectTrigger className="w-[130px]">
                            <div className="flex items-center">
                              {chartType === "bar" ? (
                                <BarChart3 className="mr-2 h-4 w-4" />
                              ) : chartType === "line" ? (
                                <LineChartIcon className="mr-2 h-4 w-4" />
                              ) : (
                                <PieChartIcon className="mr-2 h-4 w-4" />
                              )}
                              <SelectValue placeholder="Type" />
                            </div>
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="bar">Barres</SelectItem>
                            <SelectItem value="line">Lignes</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-4">
                      <div className="h-[350px]">
                        <ResponsiveContainer width="100%" height="100%">
                          {chartType === "bar" ? (
                            <BarChart data={mockSubmissionTrends}>
                              <CartesianGrid strokeDasharray="3 3" vertical={false} />
                              <XAxis dataKey="date" />
                              <YAxis />
                              <Tooltip
                                contentStyle={{
                                  backgroundColor: isDarkMode ? "#1f2937" : "#fff",
                                  borderColor: isDarkMode ? "#374151" : "#e5e7eb",
                                  color: isDarkMode ? "#f9fafb" : "#111827",
                                }}
                              />
                              <Legend />
                              <Bar
                                dataKey="submissions"
                                name="Soumissions"
                                fill="#4f46e5"
                                radius={[4, 4, 0, 0]}
                                barSize={30}
                              />
                              <Bar
                                dataKey="completions"
                                name="Complétions"
                                fill="#8b5cf6"
                                radius={[4, 4, 0, 0]}
                                barSize={30}
                              />
                            </BarChart>
                          ) : (
                            <LineChart data={mockSubmissionTrends}>
                              <CartesianGrid strokeDasharray="3 3" vertical={false} />
                              <XAxis dataKey="date" />
                              <YAxis />
                              <Tooltip
                                contentStyle={{
                                  backgroundColor: isDarkMode ? "#1f2937" : "#fff",
                                  borderColor: isDarkMode ? "#374151" : "#e5e7eb",
                                  color: isDarkMode ? "#f9fafb" : "#111827",
                                }}
                              />
                              <Legend />
                              <Line
                                type="monotone"
                                dataKey="submissions"
                                name="Soumissions"
                                stroke="#4f46e5"
                                strokeWidth={3}
                                dot={{ r: 4 }}
                                activeDot={{ r: 6 }}
                              />
                              <Line
                                type="monotone"
                                dataKey="completions"
                                name="Complétions"
                                stroke="#8b5cf6"
                                strokeWidth={3}
                                dot={{ r: 4 }}
                                activeDot={{ r: 6 }}
                              />
                            </LineChart>
                          )}
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Distribution des notes */}
                  <Card className="border-none shadow-md">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle>Distribution des notes</CardTitle>
                          <CardDescription>Répartition des notes obtenues</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-4">
                      <div className="h-[350px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={mockGradeDistribution}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="range" />
                            <YAxis />
                            <Tooltip
                              contentStyle={{
                                backgroundColor: isDarkMode ? "#1f2937" : "#fff",
                                borderColor: isDarkMode ? "#374151" : "#e5e7eb",
                                color: isDarkMode ? "#f9fafb" : "#111827",
                              }}
                              formatter={(value) => [`${value} étudiants`, "Nombre"]}
                            />
                            <Bar dataKey="count" name="Étudiants" fill="#ec4899" radius={[4, 4, 0, 0]} barSize={30} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Onglets pour les données détaillées */}
                <Tabs defaultValue="students" className="w-full">
                  <div className="flex justify-between items-center mb-4">
                    <TabsList>
                      <TabsTrigger
                        value="students"
                        className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white"
                      >
                        Étudiants
                      </TabsTrigger>
                      <TabsTrigger
                        value="exercises"
                        className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white"
                      >
                        Exercices
                      </TabsTrigger>
                      <TabsTrigger
                        value="categories"
                        className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white"
                      >
                        Catégories
                      </TabsTrigger>
                    </TabsList>

                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm" className="flex items-center">
                        <Filter className="mr-2 h-4 w-4" />
                        Filtrer
                      </Button>
                      <Button variant="outline" size="sm" className="flex items-center">
                        <Download className="mr-2 h-4 w-4" />
                        Exporter
                      </Button>
                    </div>
                  </div>

                  <TabsContent value="students" className="mt-0">
                    <Card className="border-none shadow-md">
                      <CardContent className="p-0">
                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead>
                              <tr className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                  Étudiant
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                  Soumissions
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                  Taux de complétion
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                  Note moyenne
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                  Dernière soumission
                                </th>
                              </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                              {mockStudents.map((student) => (
                                <tr
                                  key={student.id}
                                  className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
                                >
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                      <div className="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                                        <span className="text-indigo-600 dark:text-indigo-400 font-medium">
                                          {student.name
                                            .split(" ")
                                            .map((n) => n[0])
                                            .join("")}
                                        </span>
                                      </div>
                                      <div className="ml-4">
                                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                                          {student.name}
                                        </div>
                                      </div>
                                    </div>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                    {student.submissions}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                      <div className="w-full max-w-[100px] mr-2">
                                        <Progress value={student.completionRate} className="h-2" />
                                      </div>
                                      <span className="text-sm text-gray-500 dark:text-gray-400">
                                        {student.completionRate}%
                                      </span>
                                    </div>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <span
                                      className={`px-2 py-1 text-xs rounded-full ${
                                        student.averageGrade >= 16
                                          ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300"
                                          : student.averageGrade >= 12
                                            ? "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300"
                                            : student.averageGrade >= 10
                                              ? "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300"
                                              : "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300"
                                      }`}
                                    >
                                      {student.averageGrade.toFixed(1)} / 20
                                    </span>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                    {new Date(student.lastSubmission).toLocaleDateString("fr-FR", {
                                      day: "numeric",
                                      month: "long",
                                      year: "numeric",
                                    })}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="exercises" className="mt-0">
                    <Card className="border-none shadow-md">
                      <CardContent className="p-0">
                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead>
                              <tr className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                  Exercice
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                  Catégorie
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                  Soumissions
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                  Note moyenne
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                  Taux de complétion
                                </th>
                              </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                              {mockExercises.map((exercise) => (
                                <tr
                                  key={exercise.id}
                                  className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
                                >
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                                      {exercise.title}
                                    </div>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <span
                                      className={`px-2 py-1 text-xs rounded-full ${
                                        exercise.category === "SQL"
                                          ? "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300"
                                          : exercise.category === "Modélisation"
                                            ? "bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300"
                                            : exercise.category === "Optimisation"
                                              ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300"
                                              : exercise.category === "Avancé"
                                                ? "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300"
                                                : "bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300"
                                      }`}
                                    >
                                      {exercise.category}
                                    </span>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                    {exercise.submissions}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <span
                                      className={`px-2 py-1 text-xs rounded-full ${
                                        exercise.averageGrade >= 16
                                          ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300"
                                          : exercise.averageGrade >= 12
                                            ? "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300"
                                            : exercise.averageGrade >= 10
                                              ? "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300"
                                              : "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300"
                                      }`}
                                    >
                                      {exercise.averageGrade.toFixed(1)} / 20
                                    </span>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                      <div className="w-full max-w-[100px] mr-2">
                                        <Progress value={exercise.completionRate} className="h-2" />
                                      </div>
                                      <span className="text-sm text-gray-500 dark:text-gray-400">
                                        {exercise.completionRate}%
                                      </span>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="categories" className="mt-0">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <Card className="border-none shadow-md">
                        <CardHeader>
                          <CardTitle>Répartition par catégorie</CardTitle>
                          <CardDescription>Distribution des exercices par catégorie</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                              <PieChart>
                                <Pie
                                  data={mockCategoryData}
                                  cx="50%"
                                  cy="50%"
                                  labelLine={false}
                                  outerRadius={120}
                                  fill="#8884d8"
                                  dataKey="count"
                                  nameKey="name"
                                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                >
                                  {mockCategoryData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                  ))}
                                </Pie>
                                <Tooltip
                                  contentStyle={{
                                    backgroundColor: isDarkMode ? "#1f2937" : "#fff",
                                    borderColor: isDarkMode ? "#374151" : "#e5e7eb",
                                    color: isDarkMode ? "#f9fafb" : "#111827",
                                  }}
                                  formatter={(value) => [`${value} exercices`, "Nombre"]}
                                />
                              </PieChart>
                            </ResponsiveContainer>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="border-none shadow-md">
                        <CardHeader>
                          <CardTitle>Performance par catégorie</CardTitle>
                          <CardDescription>Notes moyennes par catégorie d'exercice</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            {mockCategoryData.map((category, index) => (
                              <div key={index}>
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    {category.name}
                                  </span>
                                  <span className="text-sm text-gray-500 dark:text-gray-400">
                                    {(12 + Math.random() * 8).toFixed(1)} / 20
                                  </span>
                                </div>
                                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                                  <div
                                    className="h-2.5 rounded-full"
                                    style={{
                                      width: `${60 + Math.random() * 30}%`,
                                      backgroundColor: category.color,
                                    }}
                                  ></div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>
                </Tabs>

                {/* Statistiques supplémentaires */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <Card className="border-none shadow-md">
                    <CardHeader>
                      <CardTitle>Statut des soumissions</CardTitle>
                      <CardDescription>Répartition par statut</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <Badge className="bg-green-500 mr-2" />
                            <span className="text-sm text-gray-700 dark:text-gray-300">Complétées</span>
                          </div>
                          <span className="text-sm font-medium">82%</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <Badge className="bg-yellow-500 mr-2" />
                            <span className="text-sm text-gray-700 dark:text-gray-300">En cours</span>
                          </div>
                          <span className="text-sm font-medium">12%</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <Badge className="bg-red-500 mr-2" />
                            <span className="text-sm text-gray-700 dark:text-gray-300">Non commencées</span>
                          </div>
                          <span className="text-sm font-medium">6%</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mt-2">
                          <div className="flex h-2.5 rounded-full overflow-hidden">
                            <div className="bg-green-500 h-2.5" style={{ width: "82%" }}></div>
                            <div className="bg-yellow-500 h-2.5" style={{ width: "12%" }}></div>
                            <div className="bg-red-500 h-2.5" style={{ width: "6%" }}></div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-none shadow-md">
                    <CardHeader>
                      <CardTitle>Temps de soumission</CardTitle>
                      <CardDescription>Délai moyen avant la date limite</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-col items-center justify-center h-[180px]">
                        <div className="text-5xl font-bold text-indigo-600 dark:text-indigo-400">2.4</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400 mt-2">jours avant la date limite</div>
                        <div className="flex items-center mt-4 text-green-600 dark:text-green-400">
                          <TrendingUp className="h-4 w-4 mr-1" />
                          <span className="text-sm font-medium">+0.8 jour</span>
                          <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">vs période préc.</span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center mt-4">
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 text-yellow-500 mr-1" />
                          <span className="text-xs text-gray-500 dark:text-gray-400">15% soumis le dernier jour</span>
                        </div>
                        <div className="flex items-center">
                          <AlertCircle className="h-4 w-4 text-red-500 mr-1" />
                          <span className="text-xs text-gray-500 dark:text-gray-400">5% en retard</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-none shadow-md">
                    <CardHeader>
                      <CardTitle>Activité récente</CardTitle>
                      <CardDescription>Dernières actions sur la plateforme</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-start">
                          <div className="flex-shrink-0 h-8 w-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                            <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                          </div>
                          <div className="ml-3">
                            <p className="text-sm font-medium text-gray-900 dark:text-white">Soumission évaluée</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              Emma Martin - Requêtes SQL avancées
                            </p>
                            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Il y a 35 minutes</p>
                          </div>
                        </div>
                        <div className="flex items-start">
                          <div className="flex-shrink-0 h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                            <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div className="ml-3">
                            <p className="text-sm font-medium text-gray-900 dark:text-white">Nouvel exercice publié</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Transactions et verrouillage</p>
                            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Il y a 2 heures</p>
                          </div>
                        </div>
                        <div className="flex items-start">
                          <div className="flex-shrink-0 h-8 w-8 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                            <Users className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                          </div>
                          <div className="ml-3">
                            <p className="text-sm font-medium text-gray-900 dark:text-white">Nouvel étudiant inscrit</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              Lucas Petit a rejoint la plateforme
                            </p>
                            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Il y a 5 heures</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}
