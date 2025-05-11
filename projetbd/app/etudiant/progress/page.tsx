"use client"

import type React from "react"

import { useState, useEffect } from "react"
import {
  Menu,
  Bell,
  ChevronDown,
  Search,
  Upload,
  FileText,
  Download,
  Eye,
  CheckCircle,
  Clock,
  AlertCircle,
  X,
  Award,
  Calendar,
  BarChart4,
  BookMarked,
  GraduationCap,
  Loader2,
} from "lucide-react"
import Sidebar from "@/components/Sidebar-etudiant"
import axios from "axios"
import Link from "next/link"

type UserRole = "professor" | "student"

type Exercise = {
  id: string
  title: string
  description: string
  category: string
  dueDate: string
  status: "à faire" | "en cours" | "rendu" | "corrigé"
  submissionDate?: string
  grade?: number
  teacherComment?: string
  fileUrl?: string
}

type ProgressStats = {
  completed: number
  inProgress: number
  pending: number
  total: number
  averageGrade: number
}

type SubjectProgress = {
  name: string
  completed: number
  inProgress: number
  pending: number
  total: number
}

export default function Dashboard() {
  // État pour l'utilisateur connecté
  const [user, setUser] = useState<{ id: number; prenom: string; nom: string } | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  const [userRole] = useState<UserRole>("student")
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null)
  const [submissionFile, setSubmissionFile] = useState<File | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [useMockData, setUseMockData] = useState(false)
  const [progressStats, setProgressStats] = useState<ProgressStats>({
    completed: 0,
    inProgress: 0,
    pending: 0,
    total: 0,
    averageGrade: 0,
  })
  const [subjectProgress, setSubjectProgress] = useState<SubjectProgress[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"

  // Récupérer les informations de l'utilisateur connecté
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setIsLoading(true)

        // Essayer de récupérer les données de session
        const sessionResponse = await fetch("/api/auth/session")
        if (!sessionResponse.ok) {
          throw new Error("Erreur lors de la récupération de la session")
        }

        const sessionData = await sessionResponse.json()

        if (sessionData && sessionData.user && sessionData.user.id) {
          setUser({
            id: sessionData.user.id,
            prenom: sessionData.user.prenom || "Prénom",
            nom: sessionData.user.nom || "Nom",
          })
          setIsAuthenticated(true)
        } else {
          // Fallback à un utilisateur de démonstration si aucune session n'est trouvée
          console.log("Aucune session trouvée, utilisation d'un utilisateur de démonstration")
          setUser({ id: 1, prenom: "John", nom: "Doe" })
          setIsAuthenticated(true)
          setUseMockData(true)
        }
      } catch (error) {
        console.error("Erreur lors de la récupération des données utilisateur:", error)
        // Fallback à un utilisateur de démonstration en cas d'erreur
        setUser({ id: 1, prenom: "John", nom: "Doe" })
        setIsAuthenticated(true)
        setUseMockData(true)
      } finally {
        setIsLoading(false)
      }
    }

    fetchUserData()
  }, [])

  // Récupérer les exercices depuis l'API
  useEffect(() => {
    if (isAuthenticated && user) {
      fetchExercises()
    }
  }, [isAuthenticated, user])

  // Calculer les statistiques de progression
  useEffect(() => {
    if (exercises.length > 0) {
      calculateProgressStats()
      calculateSubjectProgress()
    }
  }, [exercises])

  // Calculer les statistiques de progression
  const calculateProgressStats = () => {
    const completed = exercises.filter((ex) => ex.status === "corrigé").length
    const inProgress = exercises.filter((ex) => ex.status === "en cours" || ex.status === "rendu").length
    const pending = exercises.filter((ex) => ex.status === "à faire").length
    const total = exercises.length

    // Calculer la moyenne des notes (uniquement pour les exercices corrigés avec une note)
    const gradedExercises = exercises.filter((ex) => ex.status === "corrigé" && ex.grade !== undefined)
    const averageGrade =
      gradedExercises.length > 0
        ? gradedExercises.reduce((sum, ex) => sum + (ex.grade || 0), 0) / gradedExercises.length
        : 0

    setProgressStats({
      completed,
      inProgress,
      pending,
      total,
      averageGrade,
    })
  }

  // Calculer la progression par matière
  const calculateSubjectProgress = () => {
    // Regrouper les exercices par catégorie
    const subjectGroups: Record<string, Exercise[]> = {}

    exercises.forEach((exercise) => {
      if (!subjectGroups[exercise.category]) {
        subjectGroups[exercise.category] = []
      }
      subjectGroups[exercise.category].push(exercise)
    })

    // Calculer les statistiques pour chaque matière
    const progress: SubjectProgress[] = Object.keys(subjectGroups).map((category) => {
      const exercises = subjectGroups[category]
      const total = exercises.length
      const completed = exercises.filter((ex) => ex.status === "corrigé").length
      const inProgress = exercises.filter((ex) => ex.status === "en cours" || ex.status === "rendu").length
      const pending = exercises.filter((ex) => ex.status === "à faire").length

      return {
        name: category,
        completed,
        inProgress,
        pending,
        total,
      }
    })

    setSubjectProgress(progress)
  }

  const fetchExercises = async () => {
    try {
      setIsLoading(true)
      setError(null)

      // Essayer de récupérer les données depuis l'API
      try {
        console.log("Tentative de connexion à l'API:", `${API_BASE_URL}/sujets`)

        // Récupérer les sujets
        const subjectsResponse = await axios.get(`${API_BASE_URL}/sujets`)

        if (subjectsResponse.data && Array.isArray(subjectsResponse.data)) {
          // Récupérer les soumissions de l'étudiant
          const submissionsResponse = await axios.get(`${API_BASE_URL}/soumissions/etudiant/${user?.id}`)
          const submissions = submissionsResponse.data || []

          // Créer un map des soumissions par sujet_id pour un accès rapide
          const submissionMap = new Map()
          submissions.forEach((submission: any) => {
            submissionMap.set(submission.sujet_id, submission)
          })

          // Transformer les données de l'API en format Exercise
          const formattedExercises = subjectsResponse.data.map((subject: any) => {
            const submission = submissionMap.get(subject.id)

            // Déterminer le statut en fonction de la soumission
            let status: "à faire" | "en cours" | "rendu" | "corrigé" = "à faire"
            if (submission) {
              if (submission.note !== null && submission.note !== undefined) {
                status = "corrigé"
              } else {
                status = "rendu"
              }
            }

            return {
              id: subject.id.toString(),
              title: subject.Titre || "Sans titre",
              description: subject.Description || "Aucune description disponible",
              category: subject.TypeDeSujet || "Non catégorisé",
              dueDate: subject.Delai ? new Date(subject.Delai).toLocaleDateString("fr-FR") : "Pas de date limite",
              status,
              submissionDate: submission?.dateSoumission
                ? new Date(submission.dateSoumission).toLocaleDateString("fr-FR")
                : undefined,
              grade: submission?.note !== null ? submission?.note : undefined,
              teacherComment: submission?.feedback || undefined,
              fileUrl: subject.file || undefined,
            }
          })

          // Si on a réussi à récupérer des données, on les utilise
          if (formattedExercises.length > 0) {
            setUseMockData(false)
            setExercises(formattedExercises)
            setIsLoading(false)
            return
          }
        }

        // Si on arrive ici, c'est qu'on n'a pas pu récupérer de données valides
        throw new Error("Aucune donnée valide récupérée")
      } catch (apiError) {
        console.log("API non disponible ou erreur, utilisation des données de démonstration", apiError)
        // On continue avec les données de démonstration
        setUseMockData(true)
        setExercises(getMockExercises())
      }
    } catch (err: any) {
      console.error("Erreur lors de la récupération des exercices:", err)
      setError("Une erreur est survenue lors du chargement des exercices. Utilisation des données de démonstration.")

      // Utiliser les données de démonstration en cas d'erreur
      setUseMockData(true)
      setExercises(getMockExercises())
    } finally {
      setIsLoading(false)
    }
  }

  // Données de démonstration
  const getMockExercises = () => {
    return [
      {
        id: "1",
        title: "Requêtes SQL avancées",
        description: "Création de requêtes avec jointures et sous-requêtes",
        category: "Base de données",
        dueDate: "15/03/2025",
        status: "rendu" as const,
        submissionDate: "10/03/2025",
        grade: 16,
        teacherComment: "Bon travail sur les jointures, quelques erreurs sur les sous-requêtes",
        fileUrl: "/documents/sql-avance.pdf",
      },
      {
        id: "2",
        title: "Modélisation UML",
        description: "Diagramme de classes pour un système de gestion",
        category: "Conception",
        dueDate: "20/03/2025",
        status: "en cours" as const,
        fileUrl: "/documents/uml-modelisation.pdf",
      },
      {
        id: "3",
        title: "Algorithmes de tri",
        description: "Implémentation des algorithmes de tri classiques",
        category: "Algorithmie",
        dueDate: "25/03/2025",
        status: "à faire" as const,
        fileUrl: "/documents/algo-tri.pdf",
      },
      {
        id: "4",
        title: "Programmation web",
        description: "Création d'une application React avec API",
        category: "Développement",
        dueDate: "05/04/2025",
        status: "corrigé" as const,
        submissionDate: "01/04/2025",
        grade: 18,
        teacherComment: "Excellente implémentation, code bien structuré",
        fileUrl: "/documents/prog-web.pdf",
      },
      {
        id: "5",
        title: "Sécurité des applications",
        description: "Analyse des vulnérabilités et mise en place de protections",
        category: "Sécurité",
        dueDate: "12/04/2025",
        status: "à faire" as const,
        fileUrl: "/documents/securite-app.pdf",
      },
      {
        id: "6",
        title: "Architecture microservices",
        description: "Conception d'une architecture distribuée",
        category: "Architecture",
        dueDate: "18/04/2025",
        status: "à faire" as const,
        fileUrl: "/documents/microservices.pdf",
      },
    ]
  }

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

  const filteredExercises = exercises.filter(
    (exercise) =>
      exercise.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exercise.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exercise.category.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSubmissionFile(e.target.files[0])
    }
  }

  const submitExercise = async () => {
    if (!selectedExercise || !submissionFile || !user) return

    try {
      setIsSubmitting(true)

      if (useMockData) {
        // Simuler une soumission réussie
        await new Promise((resolve) => setTimeout(resolve, 1000))

        const updatedExercises = exercises.map((ex) =>
          ex.id === selectedExercise.id
            ? {
                ...ex,
                status: "rendu" as const,
                submissionDate: new Date().toLocaleDateString("fr-FR"),
              }
            : ex,
        )

        setExercises(updatedExercises)
      } else {
        // Envoyer la soumission à l'API
        const formData = new FormData()
        formData.append("fichier", submissionFile)
        formData.append("id_sujet", selectedExercise.id)
        formData.append("etudiant_id", user.id.toString())

        await axios.post(`${API_BASE_URL}/soumissions`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        })

        // Rafraîchir les exercices
        await fetchExercises()
      }
    } catch (error) {
      console.error("Erreur lors de la soumission:", error)
      setError("Une erreur est survenue lors de la soumission de l'exercice.")
    } finally {
      setIsSubmitting(false)
      setSelectedExercise(null)
      setSubmissionFile(null)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "rendu":
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case "en cours":
        return <Clock className="w-5 h-5 text-yellow-500" />
      case "corrigé":
        return <FileText className="w-5 h-5 text-blue-500" />
      default:
        return <AlertCircle className="w-5 h-5 text-red-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "rendu":
        return "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300"
      case "en cours":
        return "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300"
      case "corrigé":
        return "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300"
      default:
        return "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300"
    }
  }

  // Check system preference for dark mode on mount
  useEffect(() => {
    if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
      setIsDarkMode(true)
      document.documentElement.classList.add("dark")
    }
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 transition-colors duration-500">
      <div className="flex">
        {/* Sidebar */}
        <Sidebar
          userRole="student"
          isDarkMode={isDarkMode}
          toggleDarkMode={toggleDarkMode}
          isSidebarOpen={isSidebarOpen}
          toggleSidebar={toggleSidebar}
        />

        {/* Main Content */}
        <div className="flex-1 flex flex-col md:ml-64 transition-all duration-300">
          {/* Top Navigation */}
          <header className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-40">
            <div className="flex items-center justify-between h-16 px-4 md:px-6">
              <div className="flex items-center">
                <button
                  onClick={toggleSidebar}
                  className="md:hidden text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 mr-4"
                >
                  <Menu className="w-6 h-6" />
                </button>
                <h1 className="text-lg font-semibold text-gray-800 dark:text-white">Ma progression</h1>
              </div>

              <div className="flex items-center space-x-3">
                {useMockData && (
                  <div className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 text-xs rounded-full">
                    Mode démo
                  </div>
                )}
                <button className="relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                  <Bell className="w-6 h-6 text-gray-500 dark:text-gray-400" />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                </button>

                <div className="relative">
                  <button className="flex items-center space-x-1 text-sm text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors">
                    <span>FR</span>
                    <ChevronDown className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </header>

          {/* Page Content */}
          <main className="flex-1 p-4 md:p-6 overflow-auto">
            {error && (
              <div className="mb-6 p-4 bg-red-100 dark:bg-red-900/30 border-l-4 border-red-500 text-red-700 dark:text-red-300 rounded">
                <div className="flex">
                  <AlertCircle className="h-5 w-5 mr-2" />
                  <p>{error}</p>
                </div>
              </div>
            )}

            {/* Statistiques de progression */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-indigo-100 dark:bg-indigo-900/30 mr-4">
                    <BookMarked className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Total des exercices</p>
                    <h3 className="text-2xl font-bold text-gray-800 dark:text-white">{progressStats.total}</h3>
                  </div>
                </div>
                <div className="mt-4 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-indigo-600 dark:bg-indigo-500 rounded-full"
                    style={{
                      width:
                        progressStats.total > 0 ? `${(progressStats.completed / progressStats.total) * 100}%` : "0%",
                    }}
                  ></div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-green-100 dark:bg-green-900/30 mr-4">
                    <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Exercices terminés</p>
                    <h3 className="text-2xl font-bold text-gray-800 dark:text-white">
                      {progressStats.completed}{" "}
                      <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
                        / {progressStats.total}
                      </span>
                    </h3>
                  </div>
                </div>
                <div className="mt-4 flex items-center">
                  <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-600 dark:bg-green-500 rounded-full"
                      style={{
                        width:
                          progressStats.total > 0 ? `${(progressStats.completed / progressStats.total) * 100}%` : "0%",
                      }}
                    ></div>
                  </div>
                  <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
                    {progressStats.total > 0 ? Math.round((progressStats.completed / progressStats.total) * 100) : 0}%
                  </span>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-yellow-100 dark:bg-yellow-900/30 mr-4">
                    <Clock className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">En cours</p>
                    <h3 className="text-2xl font-bold text-gray-800 dark:text-white">
                      {progressStats.inProgress}{" "}
                      <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
                        / {progressStats.total}
                      </span>
                    </h3>
                  </div>
                </div>
                <div className="mt-4 flex items-center">
                  <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-yellow-600 dark:bg-yellow-500 rounded-full"
                      style={{
                        width:
                          progressStats.total > 0 ? `${(progressStats.inProgress / progressStats.total) * 100}%` : "0%",
                      }}
                    ></div>
                  </div>
                  <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
                    {progressStats.total > 0 ? Math.round((progressStats.inProgress / progressStats.total) * 100) : 0}%
                  </span>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/30 mr-4">
                    <Award className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Note moyenne</p>
                    <h3 className="text-2xl font-bold text-gray-800 dark:text-white">
                      {progressStats.averageGrade.toFixed(1)}{" "}
                      <span className="text-sm font-normal text-gray-500 dark:text-gray-400">/ 20</span>
                    </h3>
                  </div>
                </div>
                <div className="mt-4 flex items-center">
                  <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-600 dark:bg-blue-500 rounded-full"
                      style={{ width: `${(progressStats.averageGrade / 20) * 100}%` }}
                    ></div>
                  </div>
                  <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
                    {Math.round((progressStats.averageGrade / 20) * 100)}%
                  </span>
                </div>
              </div>
            </div>

            {/* Graphique de progression par matière */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-6 border border-gray-100 dark:border-gray-700">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-white flex items-center">
                  <BarChart4 className="w-5 h-5 mr-2 text-indigo-600 dark:text-indigo-400" />
                  Progression par matière
                </h2>
                <div className="mt-4 md:mt-0 flex space-x-2">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300">
                    <span className="w-2 h-2 mr-1 rounded-full bg-green-500"></span>
                    Terminé
                  </span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300">
                    <span className="w-2 h-2 mr-1 rounded-full bg-yellow-500"></span>
                    En cours
                  </span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300">
                    <span className="w-2 h-2 mr-1 rounded-full bg-red-500"></span>À faire
                  </span>
                </div>
              </div>

              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
                  <span className="ml-2 text-gray-600 dark:text-gray-300">Chargement des données...</span>
                </div>
              ) : subjectProgress.length === 0 ? (
                <div className="text-center py-12">
                  <BarChart4 className="w-12 h-12 mx-auto text-gray-400 dark:text-gray-500 mb-4" />
                  <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-2">Aucune donnée disponible</h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    Les statistiques par matière seront disponibles lorsque vous aurez des exercices.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {subjectProgress.map((subject, index) => (
                    <div key={index}>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{subject.name}</span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {subject.total > 0 ? Math.round((subject.completed / subject.total) * 100) : 0}%
                        </span>
                      </div>
                      <div className="w-full h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div className="flex h-full">
                          <div
                            className="h-full bg-green-500 dark:bg-green-600"
                            style={{
                              width: subject.total > 0 ? `${(subject.completed / subject.total) * 100}%` : "0%",
                            }}
                          ></div>
                          <div
                            className="h-full bg-yellow-500 dark:bg-yellow-600"
                            style={{
                              width: subject.total > 0 ? `${(subject.inProgress / subject.total) * 100}%` : "0%",
                            }}
                          ></div>
                          <div
                            className="h-full bg-red-500 dark:bg-red-600"
                            style={{ width: subject.total > 0 ? `${(subject.pending / subject.total) * 100}%` : "0%" }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Liste des exercices */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-6 border border-gray-100 dark:border-gray-700">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-white flex items-center">
                  <GraduationCap className="w-5 h-5 mr-2 text-indigo-600 dark:text-indigo-400" />
                  Liste des exercices
                </h2>

                <div className="mt-4 md:mt-0">
                  <div className="relative">
                    <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Rechercher un exercice..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 pr-4 py-2 w-full sm:w-64 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400"
                    />
                  </div>
                </div>
              </div>

              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
                  <span className="ml-2 text-gray-600 dark:text-gray-300">Chargement des exercices...</span>
                </div>
              ) : filteredExercises.length === 0 ? (
                <div className="text-center py-12">
                  <Search className="w-12 h-12 mx-auto text-gray-400 dark:text-gray-500 mb-4" />
                  <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-2">Aucun exercice trouvé</h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    {searchQuery
                      ? "Aucun exercice ne correspond à votre recherche"
                      : "Vous n'avez pas encore d'exercices assignés"}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredExercises.map((exercise) => (
                    <div
                      key={exercise.id}
                      className="p-4 border rounded-lg hover:shadow-md transition-shadow bg-white dark:bg-gray-800 dark:border-gray-700"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-medium text-lg text-gray-800 dark:text-white">{exercise.title}</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{exercise.description}</p>
                          <div className="flex flex-wrap items-center mt-3 gap-2">
                            <span className="text-xs px-2 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300">
                              {exercise.category}
                            </span>
                            <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
                              <Calendar className="w-3 h-3 mr-1" />À rendre le {exercise.dueDate}
                            </span>
                            <span
                              className={`text-xs px-2 py-1 rounded-full capitalize ${getStatusColor(exercise.status)}`}
                            >
                              {exercise.status}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          <span className="flex items-center">{getStatusIcon(exercise.status)}</span>

                          <button
                            onClick={() => setSelectedExercise(exercise)}
                            className="p-2 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg"
                          >
                            <Eye className="w-5 h-5" />
                          </button>
                        </div>
                      </div>

                      {exercise.status === "corrigé" && exercise.grade && (
                        <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                          <div className="flex items-center">
                            <span className="font-medium text-gray-800 dark:text-white">Note: {exercise.grade}/20</span>
                            {exercise.teacherComment && (
                              <span className="ml-4 text-sm text-gray-600 dark:text-gray-300">
                                {exercise.teacherComment}
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </main>
        </div>
      </div>

      {/* Modal pour voir/soumettre un exercice */}
      {selectedExercise && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-bold text-gray-800 dark:text-white">{selectedExercise.title}</h2>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                    {selectedExercise.category} • À rendre le {selectedExercise.dueDate}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedExercise(null)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="mt-6">
                <h3 className="font-medium text-gray-800 dark:text-white mb-2">Description</h3>
                <p className="text-gray-600 dark:text-gray-300">{selectedExercise.description}</p>
              </div>

              <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-4">
                <h3 className="font-medium text-gray-800 dark:text-white mb-4">Documents</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                    <div className="flex items-center">
                      <FileText className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                      <span className="ml-3 text-gray-700 dark:text-gray-300">{selectedExercise.title}.pdf</span>
                    </div>
                    <a
                      href={selectedExercise.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 flex items-center"
                    >
                      <Download className="w-4 h-4 mr-1" />
                      <span className="text-sm">Télécharger</span>
                    </a>
                  </div>

                  {selectedExercise.status === "corrigé" && (
                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                      <div className="flex items-center">
                        <FileText className="w-5 h-5 text-blue-500 dark:text-blue-400" />
                        <span className="ml-3 text-gray-700 dark:text-gray-300">
                          Correction_{selectedExercise.title}.pdf
                        </span>
                      </div>
                      <button className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 flex items-center">
                        <Download className="w-4 h-4 mr-1" />
                        <span className="text-sm">Télécharger</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {selectedExercise.status !== "corrigé" && (
                <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-4">
                  <h3 className="font-medium text-gray-800 dark:text-white mb-4">
                    {selectedExercise.status === "rendu" ? "Votre soumission" : "Soumettre votre travail"}
                  </h3>

                  {selectedExercise.status === "rendu" ? (
                    <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/10 rounded-lg border border-green-200 dark:border-green-800/30">
                      <div className="flex items-center">
                        <CheckCircle className="w-5 h-5 text-green-500 dark:text-green-400" />
                        <span className="ml-3 text-gray-700 dark:text-gray-300">
                          Soumis le {selectedExercise.submissionDate}
                        </span>
                      </div>
                      <button className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 flex items-center">
                        <Download className="w-4 h-4 mr-1" />
                        <span className="text-sm">Télécharger</span>
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center">
                        {submissionFile ? (
                          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                            <div className="flex items-center">
                              <FileText className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                              <span className="ml-3 text-gray-700 dark:text-gray-300">{submissionFile.name}</span>
                            </div>
                            <button
                              onClick={() => setSubmissionFile(null)}
                              className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
                            >
                              <X className="w-5 h-5" />
                            </button>
                          </div>
                        ) : (
                          <>
                            <Upload className="w-12 h-12 mx-auto text-gray-400 dark:text-gray-500 mb-4" />
                            <p className="text-gray-600 dark:text-gray-300 mb-4">
                              Glissez-déposez votre fichier ici ou cliquez pour sélectionner
                            </p>
                            <input type="file" id="file-upload" className="hidden" onChange={handleFileUpload} />
                            <label
                              htmlFor="file-upload"
                              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors cursor-pointer"
                            >
                              Sélectionner un fichier
                            </label>
                          </>
                        )}
                      </div>

                      <div className="mt-4 flex justify-end">
                        <button
                          onClick={submitExercise}
                          disabled={!submissionFile || isSubmitting}
                          className={`px-4 py-2 rounded-lg transition-colors flex items-center ${
                            submissionFile && !isSubmitting
                              ? "bg-indigo-600 hover:bg-indigo-700 text-white"
                              : "bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed"
                          }`}
                        >
                          {isSubmitting ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Soumission en cours...
                            </>
                          ) : (
                            "Soumettre"
                          )}
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Lien vers la page de détails pour les exercices corrigés */}
              {selectedExercise.status === "corrigé" && (
                <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-4">
                  <Link
                    href={`/copies/${selectedExercise.id}`}
                    className="w-full flex items-center justify-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Voir les détails de la correction
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
