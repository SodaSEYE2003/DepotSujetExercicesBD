"use client"

import { useState, useEffect, useRef } from "react"
import {
  Menu,
  Bell,
  ChevronDown,
  Search,
  Filter,
  Clock,
  Calendar,
  BookOpen,
  Brain,
  Lightbulb,
  Database,
  Code,
  BarChart,
  Loader2,
  X,
  ChevronRight,
  ChevronLeft,
} from "lucide-react"
import Sidebar from "../../../components/Sidebar-etudiant"
import ExerciseDetail from "./exercise-detail"

type UserRole = "professor" | "student"

interface Subject {
  id_Sujet: number
  Titre: string
  sousTitre: string
  Delai: string
  TypeDeSujet: string
  Description: string
  status: string
  file: string
  correctionUrl: string | null
  DateDeDepot: string
}

export default function SubjectsGallery() {
  // State
  const [userRole, setUserRole] = useState<UserRole>("student")
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<"grid" | "cards" | "timeline">("cards")
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)
  const [isLanguageDropdownOpen, setIsLanguageDropdownOpen] = useState(false)
  const notificationsRef = useRef<HTMLDivElement>(null)
  const languageDropdownRef = useRef<HTMLDivElement>(null)
  const [currentLanguage, setCurrentLanguage] = useState("FR")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 6
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null)
  const [showExerciseDetail, setShowExerciseDetail] = useState(false)

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

  // Fetch subjects from API
  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        setIsLoading(true)
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
        const response = await fetch(`${apiUrl}/sujets`)

        if (!response.ok) {
          throw new Error(`Erreur: ${response.status}`)
        }

        const data: Subject[] = await response.json()
        setSubjects(data)
        setIsLoading(false)
      } catch (err) {
        console.error("Erreur lors du chargement des sujets:", err)
        setError("Impossible de charger les sujets. L'API pourrait être inaccessible.")
        setIsLoading(false)
      }
    }

    fetchSubjects()
  }, [])

  // Extract unique categories
  const categories = Array.from(new Set(subjects.map((subject) => subject.TypeDeSujet)))

  // Filter subjects based on search and category
  const filteredSubjects = subjects.filter((subject) => {
    const matchesSearch =
      searchQuery === "" ||
      subject.Titre.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (subject.sousTitre && subject.sousTitre.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (subject.Description && subject.Description.toLowerCase().includes(searchQuery.toLowerCase()))

    const matchesCategory = activeCategory === null || subject.TypeDeSujet === activeCategory

    return matchesSearch && matchesCategory
  })

  // Pagination
  const totalPages = Math.ceil(filteredSubjects.length / itemsPerPage)
  const paginatedSubjects = filteredSubjects.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })
  }

  // Calculate days until deadline
  const getDaysUntilDeadline = (deadlineDate: string) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const deadline = new Date(deadlineDate)
    deadline.setHours(0, 0, 0, 0)

    const diffTime = deadline.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    return diffDays
  }

  // Get icon based on subject type
  const getSubjectIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case "sql":
        return <Database className="w-6 h-6" />
      case "nosql":
        return <Database className="w-6 h-6" />
      case "modélisation":
        return <BarChart className="w-6 h-6" />
      case "optimisation":
        return <Lightbulb className="w-6 h-6" />
      case "avancé":
        return <Brain className="w-6 h-6" />
      default:
        return <Code className="w-6 h-6" />
    }
  }

  // Get color based on subject type
  const getSubjectColor = (type: string) => {
    switch (type.toLowerCase()) {
      case "sql":
        return "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
      case "nosql":
        return "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400"
      case "modélisation":
        return "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"
      case "optimisation":
        return "bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400"
      case "avancé":
        return "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"
      default:
        return "bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400"
    }
  }

  // Check system preference for dark mode on mount
  useEffect(() => {
    if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
      setIsDarkMode(true)
      document.documentElement.classList.add("dark")
    }
  }, [])

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false)
      }
      if (languageDropdownRef.current && !languageDropdownRef.current.contains(event.target as Node)) {
        setIsLanguageDropdownOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

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
                <h1 className="text-lg font-semibold text-gray-800 dark:text-white">Exercices disponibles</h1>
              </div>

              <div className="flex items-center space-x-3">
                <div className="relative" ref={notificationsRef}>
                  <button
                    className="relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                  >
                    <Bell className="w-6 h-6 text-gray-500 dark:text-gray-400" />
                    <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                  </button>

                  {isNotificationsOpen && (
                    <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50 overflow-hidden">
                      <div className="p-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                        <h3 className="font-medium text-gray-800 dark:text-white">Notifications</h3>
                        <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full">
                          2 non lues
                        </span>
                      </div>

                      <div className="max-h-96 overflow-y-auto">
                        <div className="p-3 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors bg-indigo-50 dark:bg-indigo-900/10">
                          <div className="flex items-start">
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 dark:text-white">
                                Nouvel exercice disponible
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                "Requêtes SQL avancées" a été publié
                              </p>
                              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Il y a 2 heures</p>
                            </div>
                            <div className="ml-2 flex-shrink-0">
                              <span className="inline-block w-2 h-2 bg-indigo-500 rounded-full"></span>
                            </div>
                          </div>
                        </div>
                        <div className="p-3 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                          <div className="flex items-start">
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 dark:text-white">Rappel de date limite</p>
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                "Modélisation de données" est à rendre dans 3 jours
                              </p>
                              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Hier</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="p-2 border-t border-gray-200 dark:border-gray-700">
                        <button className="w-full py-2 text-xs text-center text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 font-medium">
                          Voir toutes les notifications
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="relative" ref={languageDropdownRef}>
                  <button
                    className="flex items-center space-x-1 text-sm text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
                    onClick={() => setIsLanguageDropdownOpen(!isLanguageDropdownOpen)}
                  >
                    <span>{currentLanguage}</span>
                    <ChevronDown className="w-4 h-4" />
                  </button>

                  {isLanguageDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50 overflow-hidden">
                      <div className="p-1">
                        {["FR", "EN", "ES", "DE"].map((lang) => (
                          <button
                            key={lang}
                            className={`w-full text-left px-3 py-2 text-sm rounded-md ${
                              currentLanguage === lang
                                ? "bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400"
                                : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                            }`}
                            onClick={() => {
                              setCurrentLanguage(lang)
                              setIsLanguageDropdownOpen(false)
                            }}
                          >
                            {lang === "FR" && "Français"}
                            {lang === "EN" && "English"}
                            {lang === "ES" && "Español"}
                            {lang === "DE" && "Deutsch"}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </header>

          {/* Page Content */}
          <main className="p-4 md:p-6">
            <div className="animate-fade-in">
              {/* Search and Filters */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-6 border border-gray-100 dark:border-gray-700">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="relative flex-1">
                    <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Rechercher un exercice..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 pr-4 py-2 w-full rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400"
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

                  <div className="flex items-center space-x-2">
                    <div className="relative">
                      <button className="flex items-center px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                        <Filter className="w-4 h-4 mr-2" />
                        <span>Catégorie</span>
                        <ChevronDown className="w-4 h-4 ml-2" />
                      </button>
                      <div className="absolute left-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-10 overflow-hidden hidden group-focus-within:block">
                        <div className="p-1">
                          <button
                            className={`w-full text-left px-3 py-2 text-sm rounded-md ${
                              activeCategory === null
                                ? "bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400"
                                : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                            }`}
                            onClick={() => setActiveCategory(null)}
                          >
                            Toutes les catégories
                          </button>
                          {categories.map((category) => (
                            <button
                              key={category}
                              className={`w-full text-left px-3 py-2 text-sm rounded-md ${
                                activeCategory === category
                                  ? "bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400"
                                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                              }`}
                              onClick={() => setActiveCategory(category)}
                            >
                              {category}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-1 border border-gray-200 dark:border-gray-600 rounded-lg overflow-hidden">
                      <button
                        className={`p-2 ${
                          viewMode === "grid"
                            ? "bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400"
                            : "text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"
                        }`}
                        onClick={() => setViewMode("grid")}
                        title="Vue grille"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <rect x="3" y="3" width="7" height="7" />
                          <rect x="14" y="3" width="7" height="7" />
                          <rect x="14" y="14" width="7" height="7" />
                          <rect x="3" y="14" width="7" height="7" />
                        </svg>
                      </button>
                      <button
                        className={`p-2 ${
                          viewMode === "cards"
                            ? "bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400"
                            : "text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"
                        }`}
                        onClick={() => setViewMode("cards")}
                        title="Vue cartes"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                          <line x1="3" y1="9" x2="21" y2="9" />
                          <line x1="9" y1="21" x2="9" y2="9" />
                        </svg>
                      </button>
                      <button
                        className={`p-2 ${
                          viewMode === "timeline"
                            ? "bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400"
                            : "text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"
                        }`}
                        onClick={() => setViewMode("timeline")}
                        title="Vue chronologique"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <line x1="12" y1="3" x2="12" y2="21" />
                          <circle cx="12" cy="8" r="2" />
                          <circle cx="12" cy="16" r="2" />
                          <path d="M20 8h-8" />
                          <path d="M4 16h8" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Category Pills */}
                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                      activeCategory === null
                        ? "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300"
                        : "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                    }`}
                    onClick={() => setActiveCategory(null)}
                  >
                    Tous
                  </button>
                  {categories.map((category) => (
                    <button
                      key={category}
                      className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                        activeCategory === category
                          ? "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300"
                          : "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                      }`}
                      onClick={() => setActiveCategory(category)}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>

              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
                  <span className="ml-2 text-gray-600 dark:text-gray-300">Chargement des exercices...</span>
                </div>
              ) : error ? (
                <div className="bg-red-50 dark:bg-red-900/20 rounded-xl shadow-sm p-4 mb-6 border border-red-100 dark:border-red-800">
                  <div className="text-red-600 dark:text-red-400">{error}</div>
                </div>
              ) : filteredSubjects.length === 0 ? (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-12 border border-gray-100 dark:border-gray-700 text-center">
                  <BookOpen className="w-16 h-16 mx-auto text-gray-400 dark:text-gray-500 mb-4" />
                  <h3 className="text-xl font-medium text-gray-800 dark:text-white mb-2">Aucun exercice trouvé</h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-6">
                    {searchQuery
                      ? `Aucun exercice ne correspond à votre recherche "${searchQuery}"`
                      : activeCategory
                        ? `Aucun exercice dans la catégorie "${activeCategory}"`
                        : "Aucun exercice n'est disponible pour le moment"}
                  </p>
                  {(searchQuery || activeCategory) && (
                    <button
                      onClick={() => {
                        setSearchQuery("")
                        setActiveCategory(null)
                      }}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
                    >
                      Réinitialiser les filtres
                    </button>
                  )}
                </div>
              ) : (
                <>
                  {/* Grid View */}
                  {viewMode === "grid" && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {paginatedSubjects.map((subject) => {
                        const daysUntil = getDaysUntilDeadline(subject.Delai)
                        const isUrgent = daysUntil >= 0 && daysUntil <= 3

                        return (
                          <div
                            key={subject.id_Sujet}
                            className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm border overflow-hidden transition-all duration-300 hover:shadow-md transform hover:-translate-y-1 ${
                              isUrgent ? "border-red-200 dark:border-red-800" : "border-gray-100 dark:border-gray-700"
                            }`}
                          >
                            <div className="h-3 bg-gradient-to-r from-indigo-500 to-purple-600"></div>
                            <div className="p-6">
                              <div className="flex justify-between items-start mb-4">
                                <div
                                  className={`w-12 h-12 rounded-lg ${getSubjectColor(subject.TypeDeSujet)} flex items-center justify-center`}
                                >
                                  {getSubjectIcon(subject.TypeDeSujet)}
                                </div>
                                <span
                                  className={`text-xs px-2 py-1 rounded-full ${getSubjectColor(subject.TypeDeSujet)}`}
                                >
                                  {subject.TypeDeSujet}
                                </span>
                              </div>

                              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2 line-clamp-2">
                                {subject.Titre}
                              </h3>

                              {subject.sousTitre && (
                                <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">
                                  {subject.sousTitre}
                                </p>
                              )}

                              <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-4">
                                <Calendar className="w-4 h-4 mr-1" />
                                <span>Publié le {formatDate(subject.DateDeDepot)}</span>
                              </div>

                              <div
                                className={`flex items-center text-sm mb-6 ${
                                  daysUntil < 0
                                    ? "text-red-600 dark:text-red-400"
                                    : daysUntil <= 3
                                      ? "text-orange-600 dark:text-orange-400"
                                      : "text-green-600 dark:text-green-400"
                                }`}
                              >
                                <Clock className="w-4 h-4 mr-1" />
                                <span>
                                  {daysUntil < 0
                                    ? `En retard de ${Math.abs(daysUntil)} jour${Math.abs(daysUntil) > 1 ? "s" : ""}`
                                    : daysUntil === 0
                                      ? "Dernier jour pour soumettre !"
                                      : `Date limite: ${formatDate(subject.Delai)} (${daysUntil} jour${daysUntil > 1 ? "s" : ""})`}
                                </span>
                              </div>

                              <button
                                onClick={() => {
                                  setSelectedSubject(subject)
                                  setShowExerciseDetail(true)
                                }}
                                className="block w-full py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors text-center"
                              >
                                Voir l'exercice
                              </button>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}

                  {/* Cards View */}
                  {viewMode === "cards" && (
                    <div className="space-y-6">
                      {paginatedSubjects.map((subject) => {
                        const daysUntil = getDaysUntilDeadline(subject.Delai)
                        const isUrgent = daysUntil >= 0 && daysUntil <= 3

                        return (
                          <div
                            key={subject.id_Sujet}
                            className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm border overflow-hidden transition-all duration-300 hover:shadow-md ${
                              isUrgent ? "border-red-200 dark:border-red-800" : "border-gray-100 dark:border-gray-700"
                            }`}
                          >
                            <div className="flex flex-col md:flex-row">
                              <div
                                className={`w-full md:w-1/4 p-6 flex items-center justify-center ${getSubjectColor(subject.TypeDeSujet)}`}
                              >
                                <div className="text-center">
                                  {getSubjectIcon(subject.TypeDeSujet)}
                                  <h4 className="mt-2 font-medium">{subject.TypeDeSujet}</h4>
                                </div>
                              </div>

                              <div className="p-6 flex-1">
                                <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
                                  {subject.Titre}
                                </h3>

                                {subject.sousTitre && (
                                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">{subject.sousTitre}</p>
                                )}

                                <div className="flex flex-wrap gap-4 mb-4">
                                  <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                                    <Calendar className="w-4 h-4 mr-1" />
                                    <span>Publié le {formatDate(subject.DateDeDepot)}</span>
                                  </div>

                                  <div
                                    className={`flex items-center text-sm ${
                                      daysUntil < 0
                                        ? "text-red-600 dark:text-red-400"
                                        : daysUntil <= 3
                                          ? "text-orange-600 dark:text-orange-400"
                                          : "text-green-600 dark:text-green-400"
                                    }`}
                                  >
                                    <Clock className="w-4 h-4 mr-1" />
                                    <span>
                                      {daysUntil < 0
                                        ? `En retard de ${Math.abs(daysUntil)} jour${Math.abs(daysUntil) > 1 ? "s" : ""}`
                                        : daysUntil === 0
                                          ? "Dernier jour pour soumettre !"
                                          : `Date limite: ${formatDate(subject.Delai)}`}
                                    </span>
                                  </div>
                                </div>

                                {subject.Description && (
                                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">
                                    {subject.Description}
                                  </p>
                                )}

                                <div className="flex justify-end">
                                  <button
                                    onClick={() => {
                                      setSelectedSubject(subject)
                                      setShowExerciseDetail(true)
                                    }}
                                    className="py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors text-center"
                                  >
                                    Voir l'exercice
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}

                  {/* Timeline View */}
                  {viewMode === "timeline" && (
                    <div className="relative">
                      {/* Timeline line */}
                      <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700"></div>

                      <div className="space-y-8 pl-12">
                        {paginatedSubjects.map((subject) => {
                          const daysUntil = getDaysUntilDeadline(subject.Delai)
                          const isUrgent = daysUntil >= 0 && daysUntil <= 3

                          return (
                            <div
                              key={subject.id_Sujet}
                              className={`relative bg-white dark:bg-gray-800 rounded-xl shadow-sm border p-6 transition-all duration-300 hover:shadow-md ${
                                isUrgent ? "border-red-200 dark:border-red-800" : "border-gray-100 dark:border-gray-700"
                              }`}
                            >
                              {/* Timeline dot */}
                              <div
                                className={`absolute left-0 top-6 transform -translate-x-16 w-8 h-8 rounded-full ${getSubjectColor(subject.TypeDeSujet)} flex items-center justify-center border-4 border-white dark:border-gray-900`}
                              >
                                {getSubjectIcon(subject.TypeDeSujet)}
                              </div>

                              <div className="flex justify-between items-start mb-4">
                                <h3 className="text-lg font-semibold text-gray-800 dark:text-white">{subject.Titre}</h3>
                                <span
                                  className={`text-xs px-2 py-1 rounded-full ${getSubjectColor(subject.TypeDeSujet)}`}
                                >
                                  {subject.TypeDeSujet}
                                </span>
                              </div>

                              {subject.sousTitre && (
                                <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">{subject.sousTitre}</p>
                              )}

                              <div className="flex flex-wrap gap-4 mb-4">
                                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                                  <Calendar className="w-4 h-4 mr-1" />
                                  <span>Publié le {formatDate(subject.DateDeDepot)}</span>
                                </div>

                                <div
                                  className={`flex items-center text-sm ${
                                    daysUntil < 0
                                      ? "text-red-600 dark:text-red-400"
                                      : daysUntil <= 3
                                        ? "text-orange-600 dark:text-orange-400"
                                        : "text-green-600 dark:text-green-400"
                                  }`}
                                >
                                  <Clock className="w-4 h-4 mr-1" />
                                  <span>
                                    {daysUntil < 0
                                      ? `En retard de ${Math.abs(daysUntil)} jour${Math.abs(daysUntil) > 1 ? "s" : ""}`
                                      : daysUntil === 0
                                        ? "Dernier jour pour soumettre !"
                                        : `Date limite: ${formatDate(subject.Delai)}`}
                                  </span>
                                </div>
                              </div>

                              <div className="flex justify-end">
                                <button
                                  onClick={() => {
                                    setSelectedSubject(subject)
                                    setShowExerciseDetail(true)
                                  }}
                                  className="py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors text-center"
                                >
                                  Voir l'exercice
                                </button>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="mt-8 flex justify-center">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                          disabled={currentPage === 1}
                          className={`p-2 rounded-md border border-gray-200 dark:border-gray-600 ${
                            currentPage === 1
                              ? "opacity-50 cursor-not-allowed"
                              : "hover:bg-gray-50 dark:hover:bg-gray-700"
                          }`}
                        >
                          <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                        </button>

                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                          <button
                            key={page}
                            onClick={() => setCurrentPage(page)}
                            className={`w-10 h-10 rounded-md ${
                              currentPage === page
                                ? "bg-indigo-600 text-white"
                                : "border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                            }`}
                          >
                            {page}
                          </button>
                        ))}

                        <button
                          onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                          disabled={currentPage === totalPages}
                          className={`p-2 rounded-md border border-gray-200 dark:border-gray-600 ${
                            currentPage === totalPages
                              ? "opacity-50 cursor-not-allowed"
                              : "hover:bg-gray-50 dark:hover:bg-gray-700"
                          }`}
                        >
                          <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </main>
        </div>
      </div>
      {showExerciseDetail && selectedSubject && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center overflow-y-auto">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg max-w-7xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white dark:bg-gray-800 p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-800 dark:text-white">{selectedSubject.Titre}</h2>
              <button
                onClick={() => setShowExerciseDetail(false)}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <X className="w-6 h-6 text-gray-500 dark:text-gray-400" />
              </button>
            </div>
            <div className="p-4">
              <ExerciseDetail params={{ id: selectedSubject.id_Sujet.toString() }} />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
