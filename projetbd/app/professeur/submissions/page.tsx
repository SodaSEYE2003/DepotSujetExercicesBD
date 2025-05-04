"use client"

import { useState, useEffect } from "react"
import {
  Menu,
  Bell,
  ChevronDown,
  FileText,
  Clock,
  Check,
  Eye,
  Download,
  Loader2,
  AlertTriangle,
  Search,
  X,
  Filter,
} from "lucide-react"
import Sidebar from "../../../src/components/Sidebar"
import Link from "next/link"

type UserRole = "professor" | "student"

// Adapter le type Submission à la structure réelle de la base de données
type Submission = {
  id: number
  sujet_id: number
  etudiant_id: string
  fichier: string
  commentaire: string | null
  dateSoumission: string
  note?: number | null
  feedback?: string | null
  sujet_titre: string
  etudiant_nom: string | null
  etudiant_prenom: string | null
}

export default function SubmissionsPage() {
  // State
  const [userRole, setUserRole] = useState<UserRole>("professor")
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterStatus, setFilterStatus] = useState<"all" | "pending" | "evaluated">("all")
  const [sortBy, setSortBy] = useState<"date" | "student" | "subject">("date")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")

  // Ajout d'un état pour stocker l'ID du professeur connecté
  const [professorId, setProfessorId] = useState<number | null>(null)

  // Toggle functions
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

  // Ajoutez cette fonction pour récupérer l'ID du professeur connecté
  const fetchProfessorId = async () => {
    try {
      // Dans un environnement réel, vous récupéreriez l'ID du professeur depuis votre système d'authentification
      // Pour cet exemple, nous utilisons une valeur fixe (1)
      setProfessorId(1)
      console.log("ID du professeur défini à:", 1)
    } catch (error) {
      console.error("Erreur lors de la récupération de l'ID du professeur:", error)
    }
  }

  // Fetch submissions
  const fetchSubmissions = async () => {
    if (!professorId) {
      console.log("Pas d'ID de professeur disponible, impossible de charger les soumissions")
      return
    }

    try {
      setIsLoading(true)
      setError(null)

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
      console.log(`Chargement des soumissions pour le professeur ${professorId}...`)

      // Utiliser la route API pour récupérer les soumissions du professeur
      const response = await fetch(`${apiUrl}/soumissions/professeur/${professorId}`)

      if (!response.ok) {
        const errorText = await response.text()
        console.error(`Erreur HTTP: ${response.status}`, errorText)
        throw new Error(`Erreur: ${response.status} - ${errorText}`)
      }

      const data = await response.json()
      console.log(`${data.length} soumissions récupérées`)
      setSubmissions(data)
      setIsLoading(false)
    } catch (err) {
      console.error("Erreur lors du chargement des soumissions:", err)
      setError(`Impossible de charger les soumissions: ${err instanceof Error ? err.message : String(err)}`)
      setIsLoading(false)

      // En cas d'erreur, essayer de charger toutes les soumissions comme fallback
      try {
        console.log("Tentative de récupération de toutes les soumissions comme fallback...")
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
        const response = await fetch(`${apiUrl}/soumissions`)

        if (response.ok) {
          const data = await response.json()
          console.log(`Fallback: ${data.length} soumissions récupérées`)
          setSubmissions(data)
          setError("Affichage de toutes les soumissions (impossible de filtrer par professeur)")
        }
      } catch (fallbackErr) {
        console.error("Échec du fallback:", fallbackErr)
      }
    }
  }

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  // Get status color based on evaluation status
  const getStatusColor = (submission: Submission) => {
    if (submission.note !== null && submission.note !== undefined) {
      return "bg-green-500" // Évalué
    }
    return "bg-yellow-500" // En attente
  }

  // Get status text based on evaluation status
  const getStatusText = (submission: Submission) => {
    if (submission.note !== null && submission.note !== undefined) {
      return "Évalué"
    }
    return "En attente"
  }

  // Get student initials
  const getStudentInitials = (submission: Submission) => {
    if (submission.etudiant_prenom && submission.etudiant_nom) {
      return `${submission.etudiant_prenom[0]}${submission.etudiant_nom[0]}`
    }
    return "??"
  }

  // Filter and sort submissions
  const filteredAndSortedSubmissions = submissions
    .filter((submission) => {
      // Filter by search query
      const searchLower = searchQuery.toLowerCase()
      const matchesSearch =
        (submission.sujet_titre && submission.sujet_titre.toLowerCase().includes(searchLower)) ||
        (submission.etudiant_nom && submission.etudiant_nom.toLowerCase().includes(searchLower)) ||
        (submission.etudiant_prenom && submission.etudiant_prenom.toLowerCase().includes(searchLower)) ||
        (submission.etudiant_id && submission.etudiant_id.toString().toLowerCase().includes(searchLower))

      // Filter by status
      const matchesStatus =
        filterStatus === "all" ||
        (filterStatus === "pending" && (submission.note === null || submission.note === undefined)) ||
        (filterStatus === "evaluated" && submission.note !== null && submission.note !== undefined)

      return matchesSearch && matchesStatus
    })
    .sort((a, b) => {
      // Sort by selected field
      if (sortBy === "date") {
        return sortOrder === "asc"
          ? new Date(a.dateSoumission).getTime() - new Date(b.dateSoumission).getTime()
          : new Date(b.dateSoumission).getTime() - new Date(a.dateSoumission).getTime()
      } else if (sortBy === "student") {
        const nameA = `${a.etudiant_prenom || ""} ${a.etudiant_nom || ""}`.trim().toLowerCase()
        const nameB = `${b.etudiant_prenom || ""} ${b.etudiant_nom || ""}`.trim().toLowerCase()
        return sortOrder === "asc" ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA)
      } else if (sortBy === "subject") {
        const subjectA = (a.sujet_titre || "").toLowerCase()
        const subjectB = (b.sujet_titre || "").toLowerCase()
        return sortOrder === "asc" ? subjectA.localeCompare(subjectB) : subjectB.localeCompare(subjectA)
      }
      return 0
    })

  // Handle evaluation
  const handleEvaluate = (submissionId: number) => {
    // Redirect to evaluation page
    window.location.href = `/submission-detail/${submissionId}`
  }

  // Check system preference for dark mode on mount
  useEffect(() => {
    if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
      setIsDarkMode(true)
      document.documentElement.classList.add("dark")
    }
  }, [])

  // Fetch professor ID and then submissions
  useEffect(() => {
    fetchProfessorId()
  }, [])

  // Fetch submissions when professorId changes
  useEffect(() => {
    if (professorId !== null) {
      fetchSubmissions()
    }
  }, [professorId])

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
              <div className="flex items-center">
                <button
                  onClick={toggleSidebar}
                  className="md:hidden text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 mr-4"
                >
                  <Menu className="w-6 h-6" />
                </button>
                <h1 className="text-lg font-semibold text-gray-800 dark:text-white">Mes soumissions d'étudiants</h1>
              </div>

              <div className="flex items-center space-x-3">
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
          <main className="p-4 md:p-6">
            <div className="animate-fade-in">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-6 border border-gray-100 dark:border-gray-700">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4 md:mb-0">
                    Soumissions pour mes exercices
                  </h2>

                  <div className="flex flex-col sm:flex-row gap-3">
                    {/* Search */}
                    <div className="relative">
                      <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Rechercher..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 pr-4 py-2 w-full sm:w-64 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400"
                      />
                      {searchQuery && (
                        <button
                          onClick={() => setSearchQuery("")}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    {/* Filter dropdown */}
                    <div className="relative">
                      <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value as "all" | "pending" | "evaluated")}
                        className="pl-10 pr-4 py-2 w-full rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 appearance-none"
                      >
                        <option value="all">Tous les statuts</option>
                        <option value="pending">En attente</option>
                        <option value="evaluated">Évalués</option>
                      </select>
                      <Filter className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    </div>

                    {/* Sort dropdown */}
                    <div className="relative">
                      <select
                        value={`${sortBy}-${sortOrder}`}
                        onChange={(e) => {
                          const [newSortBy, newSortOrder] = e.target.value.split("-") as [
                            "date" | "student" | "subject",
                            "asc" | "desc",
                          ]
                          setSortBy(newSortBy)
                          setSortOrder(newSortOrder)
                        }}
                        className="pl-10 pr-4 py-2 w-full rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 appearance-none"
                      >
                        <option value="date-desc">Date (récent → ancien)</option>
                        <option value="date-asc">Date (ancien → récent)</option>
                        <option value="student-asc">Étudiant (A → Z)</option>
                        <option value="student-desc">Étudiant (Z → A)</option>
                        <option value="subject-asc">Exercice (A → Z)</option>
                        <option value="subject-desc">Exercice (Z → A)</option>
                      </select>
                      <svg
                        className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
                        ></path>
                      </svg>
                    </div>
                  </div>
                </div>

                {isLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mr-2" />
                    <p className="text-gray-600 dark:text-gray-300">Chargement des soumissions...</p>
                  </div>
                ) : error ? (
                  <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30 rounded-lg">
                    <div className="flex items-start">
                      <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 mr-2 flex-shrink-0" />
                      <p className="text-red-700 dark:text-red-300">{error}</p>
                    </div>
                  </div>
                ) : filteredAndSortedSubmissions.length === 0 ? (
                  <div className="text-center py-12 bg-gray-50 dark:bg-gray-700/30 rounded-lg border border-gray-200 dark:border-gray-600">
                    <FileText className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-2">
                      Aucune soumission trouvée
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400">
                      {searchQuery
                        ? "Aucune soumission ne correspond à votre recherche."
                        : "Aucun étudiant n'a encore soumis de réponse à vos exercices."}
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredAndSortedSubmissions.map((submission) => (
                      <div
                        key={submission.id}
                        className="bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow overflow-hidden"
                      >
                        <div className="p-4 border-b border-gray-100 dark:border-gray-700">
                          <div className="flex items-center">
                            <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-medium mr-3">
                              {getStudentInitials(submission)}
                            </div>
                            <div>
                              <p className="font-medium text-gray-800 dark:text-white">
                                {submission.etudiant_prenom && submission.etudiant_nom
                                  ? `${submission.etudiant_prenom} ${submission.etudiant_nom}`
                                  : "Étudiant inconnu"}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">ID: {submission.etudiant_id}</p>
                            </div>
                          </div>
                        </div>

                        <div className="p-4">
                          <div className="flex items-start mb-2">
                            <div className="w-8 h-8 rounded-md bg-red-100 dark:bg-red-900/30 flex items-center justify-center mr-2 flex-shrink-0">
                              <FileText className="w-4 h-4 text-red-600 dark:text-red-400" />
                            </div>
                            <h3 className="text-sm font-medium text-gray-800 dark:text-white">
                              {submission.sujet_titre || "Exercice sans titre"}
                            </h3>
                          </div>
                          <div className="flex items-center mb-3 ml-10">
                            <Clock className="w-4 h-4 text-gray-400 mr-1" />
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              Soumis le {formatDate(submission.dateSoumission)}
                            </span>
                          </div>

                          <div className="flex items-center justify-between ml-10">
                            <div className="flex items-center">
                              <div className={`w-2 h-2 rounded-full mr-2 ${getStatusColor(submission)}`}></div>
                              <span className="text-sm text-gray-600 dark:text-gray-300">
                                {getStatusText(submission)}
                              </span>
                            </div>
                            {submission.note !== null && submission.note !== undefined && (
                              <div className="text-sm font-medium text-gray-800 dark:text-white">
                                Note: {submission.note}/20
                              </div>
                            )}
                          </div>

                          {submission.commentaire && (
                            <div className="mt-3 ml-10 text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                              <span className="font-medium">Commentaire:</span> {submission.commentaire}
                            </div>
                          )}
                        </div>

                        <div className="bg-gray-50 dark:bg-gray-700/30 p-3 flex justify-end space-x-2">
                          <a
                            href={submission.fichier}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                            title="Télécharger"
                          >
                            <Download className="w-5 h-5" />
                          </a>
                          {getStatusText(submission) === "En attente" && (
                            <button
                              onClick={() => handleEvaluate(submission.id)}
                              className="p-2 text-green-600 dark:text-green-400 hover:text-green-900 dark:hover:text-green-100 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors"
                              title="Évaluer"
                            >
                              <Check className="w-5 h-5" />
                            </button>
                          )}
                          <Link
                            href={`/submission-detail/${submission.id}`}
                            className="p-2 text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-100 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors inline-flex"
                            title="Voir les détails"
                          >
                            <Eye className="w-5 h-5" />
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {!isLoading && !error && filteredAndSortedSubmissions.length > 0 && (
                  <div className="mt-6 text-sm text-gray-500 dark:text-gray-400">
                    {filteredAndSortedSubmissions.length} soumission
                    {filteredAndSortedSubmissions.length > 1 ? "s" : ""} trouvée
                    {filteredAndSortedSubmissions.length > 1 ? "s" : ""}
                    {searchQuery && ` pour la recherche "${searchQuery}"`}
                    {filterStatus !== "all" &&
                      ` avec le statut "${filterStatus === "pending" ? "En attente" : "Évalué"}"`}
                  </div>
                )}
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
