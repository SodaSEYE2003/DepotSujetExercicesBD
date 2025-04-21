"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Menu, Bell, ChevronDown, Search, Plus, Eye, Loader2, X, User, Mail, Hash, GraduationCap } from "lucide-react"
import Sidebar from "../../../src/components/Sidebar"
import Link from "next/link"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"

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

export default function StudentsPage() {
  // State
  const [userRole, setUserRole] = useState<UserRole>("professor")
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [students, setStudents] = useState<Student[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [notification, setNotification] = useState<{
    type: "success" | "error"
    message: string
  } | null>(null)

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [newStudent, setNewStudent] = useState({
    Num_Etudiant: "",
    nom: "",
    prenom: "",
    email: "",
    classe: "",
  })

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

  // Fetch students from backend
  useEffect(() => {
    fetchStudents()
  }, [])

  const fetchStudents = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("http://localhost:5000/etudiants")
      if (!response.ok) {
        throw new Error("Erreur lors de la récupération des étudiants")
      }
      const data = await response.json()

      // Ajouter des propriétés supplémentaires pour l'affichage
      const enhancedData = data.map((student: Student) => ({
        ...student,
        dateInscription: new Date().toLocaleDateString("fr-FR"),
        exercicesCompletes: Math.floor(Math.random() * 15),
        exercicesEnCours: Math.floor(Math.random() * 5),
        noteMoyenne: (10 + Math.random() * 10).toFixed(1),
        classe: "Informatique B2",
      }))

      setStudents(enhancedData)
      setIsLoading(false)
    } catch (error) {
      console.error("Erreur:", error)
      showNotification("error", "Impossible de charger les étudiants. Veuillez réessayer plus tard.")
      setIsLoading(false)
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

  // Fonction de recherche améliorée
  const filteredStudents = students.filter((student) => {
    if (!searchQuery.trim()) return true

    const query = searchQuery.toLowerCase().trim()

    // Recherche dans plusieurs champs
    return (
      student.nom.toLowerCase().includes(query) ||
      student.prenom.toLowerCase().includes(query) ||
      student.email.toLowerCase().includes(query) ||
      student.Num_Etudiant.toLowerCase().includes(query) ||
      (student.classe && student.classe.toLowerCase().includes(query))
    )
  })

  // Réinitialiser la page courante lorsque la requête de recherche change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery])

  // Pagination
  const studentsPerPage = 8
  const totalPages = Math.ceil(filteredStudents.length / studentsPerPage)
  const paginatedStudents = filteredStudents.slice((currentPage - 1) * studentsPerPage, currentPage * studentsPerPage)

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setNewStudent({
      ...newStudent,
      [name]: value,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!newStudent.Num_Etudiant || !newStudent.nom || !newStudent.prenom || !newStudent.email) {
      showNotification("error", "Veuillez remplir tous les champs obligatoires")
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch("http://localhost:5000/etudiants", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          Num_Etudiant: newStudent.Num_Etudiant,
          nom: newStudent.nom,
          prenom: newStudent.prenom,
          email: newStudent.email,
        }),
      })

      if (!response.ok) {
        throw new Error("Erreur lors de l'ajout de l'étudiant")
      }

      showNotification("success", "L'étudiant a été ajouté avec succès")

      // Réinitialiser le formulaire
      setNewStudent({
        Num_Etudiant: "",
        nom: "",
        prenom: "",
        email: "",
        classe: "",
      })

      // Fermer la modale
      setIsModalOpen(false)

      // Rafraîchir la liste des étudiants
      fetchStudents()
    } catch (error) {
      console.error("Erreur:", error)
      showNotification(
        "error",
        error instanceof Error ? error.message : "Une erreur est survenue lors de l'ajout de l'étudiant",
      )
    } finally {
      setIsSubmitting(false)
    }
  }

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
    const index = name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length
    return colors[index]
  }

  // Check if user is admin (for demonstration purposes)
  const isAdmin = userRole !== "professor"

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
                <h1 className="text-lg font-semibold text-gray-800 dark:text-white">Gestion des étudiants</h1>
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
            <div className="animate-fade-in">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-6 border border-gray-100 dark:border-gray-700">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Liste des étudiants</h2>

                  <div className="mt-4 md:mt-0 flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
                    <div className="relative">
                      <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Rechercher un étudiant..."
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

                    {isAdmin && (
                      <button
                        className="flex items-center justify-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
                        onClick={() => setIsModalOpen(true)}
                      >
                        <Plus className="w-5 h-5 mr-2" />
                        <span>Nouvel étudiant</span>
                      </button>
                    )}
                  </div>
                </div>

                {isLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
                    <span className="ml-2 text-gray-600 dark:text-gray-300">Chargement des étudiants...</span>
                  </div>
                ) : filteredStudents.length === 0 ? (
                  <div className="text-center py-12">
                    <Search className="w-12 h-12 mx-auto text-gray-400 dark:text-gray-500 mb-4" />
                    <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-2">Aucun étudiant trouvé</h3>
                    <p className="text-gray-500 dark:text-gray-400">
                      {searchQuery
                        ? `Aucun étudiant ne correspond à votre recherche "${searchQuery}"`
                        : "Aucun étudiant n'est disponible pour le moment"}
                    </p>
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery("")}
                        className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
                      >
                        Effacer la recherche
                      </button>
                    )}
                  </div>
                ) : (
                  <>
                    {/* Affichage des étudiants sous forme de cartes */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                      {paginatedStudents.map((student) => (
                        <div
                          key={student.Num_Etudiant}
                          className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow overflow-hidden"
                        >
                          <div className="p-4">
                            <div className="flex flex-col items-center">
                              <div
                                className={`w-20 h-20 rounded-full ${getRandomColor(student.nom)} flex items-center justify-center text-xl font-medium mb-3`}
                              >
                                {student.prenom.charAt(0)}
                                {student.nom.charAt(0)}
                              </div>
                              <h3 className="text-lg font-medium text-gray-800 dark:text-white text-center">
                                {student.prenom} {student.nom}
                              </h3>
                              <p className="text-sm text-gray-500 dark:text-gray-400 text-center">{student.email}</p>
                              <p className="text-xs text-gray-400 dark:text-gray-500 text-center mt-1">
                                {student.classe}
                              </p>
                            </div>

                            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                              <div className="flex justify-between items-center mb-2">
                                <span className="text-xs text-gray-500 dark:text-gray-400">Numéro:</span>
                                <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                                  {student.Num_Etudiant}
                                </span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-xs text-gray-500 dark:text-gray-400">Note moyenne:</span>
                                <span className="text-xs font-medium text-green-600 dark:text-green-400">
                                  {student.noteMoyenne}/20
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="bg-gray-50 dark:bg-gray-700/30 p-3 flex justify-center">
                            <Link
                              href={`/students/${student.Num_Etudiant}`}
                              className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300 flex items-center text-sm"
                            >
                              <Eye className="w-4 h-4 mr-1" />
                              <span>Voir le profil</span>
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-6 flex items-center justify-between">
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        Affichage de <span className="font-medium">{(currentPage - 1) * studentsPerPage + 1}</span> à{" "}
                        <span className="font-medium">
                          {Math.min(currentPage * studentsPerPage, filteredStudents.length)}
                        </span>{" "}
                        sur <span className="font-medium">{filteredStudents.length}</span> étudiants
                      </div>

                      {totalPages > 1 && (
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                            className={`px-3 py-1 rounded-md border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                              currentPage === 1 ? "opacity-50 cursor-not-allowed" : ""
                            }`}
                          >
                            Précédent
                          </button>

                          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                            <button
                              key={page}
                              onClick={() => setCurrentPage(page)}
                              className={`px-3 py-1 rounded-md ${
                                currentPage === page
                                  ? "bg-indigo-600 text-white hover:bg-indigo-700"
                                  : "border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                              }`}
                            >
                              {page}
                            </button>
                          ))}

                          <button
                            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages}
                            className={`px-3 py-1 rounded-md border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                              currentPage === totalPages ? "opacity-50 cursor-not-allowed" : ""
                            }`}
                          >
                            Suivant
                          </button>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          </main>
        </div>
      </div>

      {/* Modal pour ajouter un nouvel étudiant (visible uniquement pour les administrateurs) */}
      {isAdmin && (
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Ajouter un nouvel étudiant</DialogTitle>
              <DialogDescription>
                Renseignez les informations de l'étudiant pour l'ajouter à la base de données.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-6 py-4">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="Num_Etudiant">
                      Numéro d'étudiant <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                      <Hash className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <Input
                        id="Num_Etudiant"
                        name="Num_Etudiant"
                        value={newStudent.Num_Etudiant}
                        onChange={handleInputChange}
                        placeholder="Ex: E2025008"
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="classe">Classe</Label>
                    <div className="relative">
                      <GraduationCap className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <Input
                        id="classe"
                        name="classe"
                        value={newStudent.classe}
                        onChange={handleInputChange}
                        placeholder="Ex: Informatique B2"
                        className="pl-10"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="nom">
                      Nom <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                      <User className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <Input
                        id="nom"
                        name="nom"
                        value={newStudent.nom}
                        onChange={handleInputChange}
                        placeholder="Ex: Dupont"
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="prenom">
                      Prénom <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                      <User className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <Input
                        id="prenom"
                        name="prenom"
                        value={newStudent.prenom}
                        onChange={handleInputChange}
                        placeholder="Ex: Marie"
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">
                    Email <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <Mail className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={newStudent.email}
                      onChange={handleInputChange}
                      placeholder="Ex: marie.dupont@etudiant.fr"
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
              </div>

              <DialogFooter>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-800 dark:text-white rounded-lg transition-colors mr-2"
                  disabled={isSubmitting}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors flex items-center"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      <span>Création en cours...</span>
                    </>
                  ) : (
                    <span>Créer l'étudiant</span>
                  )}
                </button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
