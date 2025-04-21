"use client"

import { useState, useEffect, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import {
  Menu,
  Bell,
  ChevronDown,
  ArrowLeft,
  Mail,
  Hash,
  GraduationCap,
  FileText,
  BookOpen,
  CheckCircle,
  Calendar,
  Clock,
  Award,
  Loader2,
  X,
} from "lucide-react"
import Sidebar from "../../../../src/components/Sidebar"

type UserRole = "professor" | "student"

type Student = {
  Num_Etudiant: string
  nom: string
  prenom: string
  email: string
  classe?: string
  dateInscription?: string
  exercicesCompletes?: number
  exercicesEnCours?: number
  noteMoyenne?: number
  avatar?: string | null
}

type Exercise = {
  id: string
  title: string
  status: string
  statusClass: string
  date: string
  grade?: string
}

export default function StudentDetailPage() {
  const params = useParams()
  const router = useRouter()
  const studentId = params.id as string

  // State
  const [userRole, setUserRole] = useState<UserRole>("professor")
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [student, setStudent] = useState<Student | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [notification, setNotification] = useState<{
    type: "success" | "error"
    message: string
  } | null>(null)

  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)
  const notificationsRef = useRef<HTMLDivElement>(null)

  const [isLanguageDropdownOpen, setIsLanguageDropdownOpen] = useState(false)
  const languageDropdownRef = useRef<HTMLDivElement>(null)
  const [currentLanguage, setCurrentLanguage] = useState("FR")

  // Sample notifications data
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: "Nouvel étudiant inscrit",
      message: "Thomas Dubois s'est inscrit au cours",
      time: "Il y a 5 minutes",
      read: false,
    },
    {
      id: 2,
      title: "Soumission d'exercice",
      message: "Emma Dupont a soumis l'exercice 'Requêtes SQL avancées'",
      time: "Il y a 2 heures",
      read: false,
    },
    {
      id: 3,
      title: "Mise à jour de profil",
      message: "Lucas Martin a mis à jour son profil",
      time: "Hier",
      read: true,
    },
  ])

  // Fonction pour afficher une notification
  const showNotification = (type: "success" | "error", message: string) => {
    setNotification({ type, message })
    // Masquer la notification après 5 secondes
    setTimeout(() => {
      setNotification(null)
    }, 5000)
  }

  // Fetch student data
  useEffect(() => {
    fetchStudentData()
  }, [studentId])

  const fetchStudentData = async () => {
    setIsLoading(true)
    try {
      // Fetch student data
      const response = await fetch(`http://localhost:5000/etudiants`)
      if (!response.ok) {
        throw new Error("Erreur lors de la récupération des données de l'étudiant")
      }

      const data = await response.json()
      const foundStudent = data.find((s: Student) => s.Num_Etudiant === studentId)

      if (!foundStudent) {
        throw new Error("Étudiant non trouvé")
      }

      // Ajouter des propriétés supplémentaires pour l'affichage
      const enhancedStudent = {
        ...foundStudent,
        dateInscription: new Date().toLocaleDateString("fr-FR"),
        exercicesCompletes: Math.floor(Math.random() * 15),
        exercicesEnCours: Math.floor(Math.random() * 5),
        noteMoyenne: (10 + Math.random() * 10).toFixed(1),
        classe: "Informatique B2",
      }

      setStudent(enhancedStudent)

      // Générer des exercices fictifs pour l'étudiant
      const mockExercises: Exercise[] = [
        {
          id: "1",
          title: "Requêtes SQL avancées",
          status: "Complété",
          statusClass: "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300",
          date: "15/03/2025",
          grade: "17/20",
        },
        {
          id: "2",
          title: "Modélisation de données",
          status: "En cours",
          statusClass: "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300",
          date: "10/03/2025",
        },
        {
          id: "3",
          title: "Normalisation et optimisation",
          status: "À faire",
          statusClass: "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300",
          date: "05/03/2025",
        },
      ]

      setExercises(mockExercises)
      setIsLoading(false)
    } catch (error) {
      console.error("Erreur:", error)
      showNotification("error", "Impossible de charger les données de l'étudiant. Veuillez réessayer plus tard.")
      setIsLoading(false)
      // Rediriger vers la liste des étudiants après un délai
      setTimeout(() => {
        router.push("/students")
      }, 3000)
    }
  }

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

  // Check system preference for dark mode on mount
  useEffect(() => {
    if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
      setIsDarkMode(true)
      document.documentElement.classList.add("dark")
    }
  }, [])

  // Add this useEffect to close notifications when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  // Add this useEffect to close language dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (languageDropdownRef.current && !languageDropdownRef.current.contains(event.target as Node)) {
        setIsLanguageDropdownOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  // Function to mark a single notification as read
  const markAsRead = (id: number) => {
    setNotifications(
      notifications.map((notification) => (notification.id === id ? { ...notification, read: true } : notification)),
    )
  }

  // Fonction pour générer une couleur aléatoire pour l'avatar
  const getRandomColor = (name: string) => {
    const colors = [
      "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
      "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400",
      "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400",
      "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400",
      "bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400",
      "bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400",
    ]

    // Utiliser le nom pour générer un index cohérent
    const index = name ? name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length : 0
    return colors[index]
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 transition-colors duration-500">
      {/* Notification */}
      {notification && (
        <div
          className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg ${
            notification.type === "success"
              ? "bg-green-100 border-l-4 border-green-500 text-green-700 dark:bg-green-900/50 dark:text-green-300"
              : "bg-red-100 border-l-4 border-red-500 text-red-700 dark:bg-red-900/50 dark:text-red-300"
          }`}
        >
          <div className="flex items-center">
            <div className="flex-shrink-0">
              {notification.type === "success" ? (
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              ) : (
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </div>
            <div className="ml-3">
              <p className="text-sm">{notification.message}</p>
            </div>
            <div className="ml-auto pl-3">
              <div className="-mx-1.5 -my-1.5">
                <button
                  onClick={() => setNotification(null)}
                  className={`inline-flex rounded-md p-1.5 ${
                    notification.type === "success"
                      ? "text-green-500 hover:bg-green-200 dark:hover:bg-green-800"
                      : "text-red-500 hover:bg-red-200 dark:hover:bg-red-800"
                  }`}
                >
                  <span className="sr-only">Dismiss</span>
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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
                <div className="flex items-center">
                  <Link
                    href="/students"
                    className="flex items-center text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors mr-4"
                  >
                    <ArrowLeft className="w-5 h-5 mr-1" />
                    <span>Retour</span>
                  </Link>
                  <h1 className="text-lg font-semibold text-gray-800 dark:text-white">Profil de l'étudiant</h1>
                </div>
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
                          {notifications.filter((n) => !n.read).length} non lues
                        </span>
                      </div>

                      <div className="max-h-96 overflow-y-auto">
                        {notifications.length === 0 ? (
                          <div className="p-4 text-center text-gray-500 dark:text-gray-400">Aucune notification</div>
                        ) : (
                          notifications.map((notification) => (
                            <div
                              key={notification.id}
                              className={`p-3 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors ${
                                !notification.read ? "bg-indigo-50 dark:bg-indigo-900/10" : ""
                              }`}
                            >
                              <div className="flex items-start">
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                                    {notification.title}
                                  </p>
                                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    {notification.message}
                                  </p>
                                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{notification.time}</p>
                                </div>
                                {!notification.read && (
                                  <div className="ml-2 flex-shrink-0">
                                    <span className="inline-block w-2 h-2 bg-indigo-500 rounded-full"></span>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))
                        )}
                      </div>

                      <div className="p-2 border-t border-gray-200 dark:border-gray-700">
                        <button
                          className="w-full py-2 text-xs text-center text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 font-medium"
                          onClick={() => {
                            setNotifications(notifications.map((n) => ({ ...n, read: true })))
                          }}
                        >
                          Marquer tout comme lu
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
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
                <span className="ml-2 text-gray-600 dark:text-gray-300">Chargement des données de l'étudiant...</span>
              </div>
            ) : student ? (
              <div className="animate-fade-in">
                {/* Profil de l'étudiant */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-6 border border-gray-100 dark:border-gray-700">
                  <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                    <div
                      className={`w-24 h-24 rounded-full ${getRandomColor(student.nom)} flex items-center justify-center text-2xl font-medium`}
                    >
                      {student.prenom.charAt(0)}
                      {student.nom.charAt(0)}
                    </div>

                    <div className="flex-1">
                      <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-1">
                        {student.prenom} {student.nom}
                      </h2>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-gray-500 dark:text-gray-400 mb-4">
                        <div className="flex items-center">
                          <Mail className="w-4 h-4 mr-1" />
                          <span>{student.email}</span>
                        </div>
                        <div className="flex items-center">
                          <Hash className="w-4 h-4 mr-1" />
                          <span>{student.Num_Etudiant}</span>
                        </div>
                        <div className="flex items-center">
                          <GraduationCap className="w-4 h-4 mr-1" />
                          <span>{student.classe}</span>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-4">
                        <div className="bg-indigo-50 dark:bg-indigo-900/20 px-4 py-2 rounded-lg">
                          <div className="flex items-center text-indigo-600 dark:text-indigo-400 font-medium">
                            <BookOpen className="w-4 h-4 mr-2" />
                            <span>Exercices complétés: {student.exercicesCompletes}</span>
                          </div>
                        </div>

                        <div className="bg-yellow-50 dark:bg-yellow-900/20 px-4 py-2 rounded-lg">
                          <div className="flex items-center text-yellow-600 dark:text-yellow-400 font-medium">
                            <Clock className="w-4 h-4 mr-2" />
                            <span>Exercices en cours: {student.exercicesEnCours}</span>
                          </div>
                        </div>

                        <div className="bg-green-50 dark:bg-green-900/20 px-4 py-2 rounded-lg">
                          <div className="flex items-center text-green-600 dark:text-green-400 font-medium">
                            <Award className="w-4 h-4 mr-2" />
                            <span>Note moyenne: {student.noteMoyenne}/20</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Statistiques */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Progression</h3>
                    <div className="space-y-4">
                    {/*<div>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm text-gray-600 dark:text-gray-300">Exercices complétés</span>
                          <span className="text-sm font-medium text-gray-800 dark:text-white">
                            {student.exercicesCompletes}/{student.exercicesCompletes + student.exercicesEnCours + 3}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div
                            className="bg-green-500 h-2 rounded-full"
                            style={{
                              width: `${(student.exercicesCompletes / (student.exercicesCompletes + student.exercicesEnCours + 3)) * 100}%`,
                            }}
                          ></div>
                        </div>
                      </div>*/}

                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm text-gray-600 dark:text-gray-300">Performance</span>
                          <span className="text-sm font-medium text-gray-800 dark:text-white">
                            {student.noteMoyenne}/20
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div
                            className="bg-indigo-500 h-2 rounded-full"
                            style={{ width: `${(Number.parseFloat(student.noteMoyenne as unknown as string) / 20) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Activité récente</h3>
                    <div className="space-y-3">
                      <div className="flex items-start">
                        <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 mr-3 mt-0.5">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-800 dark:text-white">A soumis un exercice</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Requêtes SQL avancées</p>
                          <p className="text-xs text-gray-400 dark:text-gray-500">Il y a 2 jours</p>
                        </div>
                      </div>

                      <div className="flex items-start">
                        <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 dark:text-green-400 mr-3 mt-0.5">
                          <CheckCircle className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-800 dark:text-white">A complété un exercice</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Modélisation de données</p>
                          <p className="text-xs text-gray-400 dark:text-gray-500">Il y a 5 jours</p>
                        </div>
                      </div>

                      <div className="flex items-start">
                        <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400 mr-3 mt-0.5">
                          <Calendar className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-800 dark:text-white">S'est inscrit au cours</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Bases de données avancées</p>
                          <p className="text-xs text-gray-400 dark:text-gray-500">Il y a 2 semaines</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Informations</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500 dark:text-gray-400">Date d'inscription:</span>
                        <span className="text-sm font-medium text-gray-800 dark:text-white">
                          {student.dateInscription}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500 dark:text-gray-400">Dernière connexion:</span>
                        <span className="text-sm font-medium text-gray-800 dark:text-white">Aujourd'hui</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500 dark:text-gray-400">Statut:</span>
                        <span className="text-sm font-medium text-green-600 dark:text-green-400">Actif</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500 dark:text-gray-400">Groupe:</span>
                        <span className="text-sm font-medium text-gray-800 dark:text-white">Groupe A</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Liste des exercices */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Exercices</h3>

                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                      <thead>
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Titre
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Date
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Statut
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Note
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {exercises.map((exercise) => (
                          <tr
                            key={exercise.id}
                            className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
                          >
                            <td className="px-4 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900 dark:text-white">{exercise.title}</div>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                              {exercise.date}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap">
                              <span className={`px-2 py-1 text-xs rounded-full ${exercise.statusClass}`}>
                                {exercise.status}
                              </span>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                              {exercise.grade || "-"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <X className="w-8 h-8 text-red-600 dark:text-red-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-2">Étudiant non trouvé</h3>
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  L'étudiant que vous recherchez n'existe pas ou a été supprimé.
                </p>
                <Link
                  href="/students"
                  className="inline-flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  <span>Retour à la liste des étudiants</span>
                </Link>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}

