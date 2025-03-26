"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import {
  Menu,
  Bell,
  ChevronDown,
  Database,
  Search,
  Plus,
  Eye,
  Edit,
  Trash,
  Upload,
  FileText,
  Download,
} from "lucide-react"
import Sidebar from "../../src/components/Sidebar"
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
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { UploadCloud, X } from "lucide-react"

type UserRole = "professor" | "student"

type Exercise = {
  title: string
  subtitle: string
  category: string
  categoryClass: string
  date: string
  status: string
  statusClass: string
  correctionModel?: string // Add this new field
}

export default function ExercisesPage() {
  // State
  const [userRole, setUserRole] = useState<UserRole>("professor")
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [exercises, setExercises] = useState<Exercise[]>([
    {
      title: "Requêtes SQL avancées",
      subtitle: "Jointures et sous-requêtes",
      category: "SQL",
      categoryClass: "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300",
      date: "15 mars 2025",
      status: "Publié",
      statusClass: "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300",
    },
    {
      title: "Modélisation de données",
      subtitle: "Conception de schémas",
      category: "Modélisation",
      categoryClass: "bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300",
      date: "10 mars 2025",
      status: "Brouillon",
      statusClass: "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300",
    },
    {
      title: "Normalisation et optimisation",
      subtitle: "Formes normales",
      category: "Optimisation",
      categoryClass: "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300",
      date: "5 mars 2025",
      status: "Publié",
      statusClass: "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300",
    },
    {
      title: "Transactions et concurrence",
      subtitle: "ACID et verrouillage",
      category: "Avancé",
      categoryClass: "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300",
      date: "1 mars 2025",
      status: "Publié",
      statusClass: "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300",
    },
    {
      title: "Introduction aux bases NoSQL",
      subtitle: "MongoDB et Redis",
      category: "NoSQL",
      categoryClass: "bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300",
      date: "25 février 2025",
      status: "Publié",
      statusClass: "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300",
    },
  ])

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [correctionFile, setCorrectionFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const correctionFileInputRef = useRef<HTMLInputElement>(null)
  const [dragActive, setDragActive] = useState(false)
  const [newExercise, setNewExercise] = useState({
    title: "",
    subtitle: "",
    category: "",
    deadline: "",
    correctionModel: "", // Add this new field
  })

  // Ajoutez ces nouveaux états après les états existants
  const [viewExercise, setViewExercise] = useState<Exercise | null>(null)
  const [editExercise, setEditExercise] = useState<Exercise | null>(null)
  const [deleteExercise, setDeleteExercise] = useState<Exercise | null>(null)
  const [editFormData, setEditFormData] = useState({
    title: "",
    subtitle: "",
    category: "",
    deadline: "",
    correctionModel: "", // Add this new field
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
      title: "Nouvel exercice disponible",
      message: "Un nouvel exercice de SQL a été publié",
      time: "Il y a 5 minutes",
      read: false,
    },
    {
      id: 2,
      title: "Rappel de date limite",
      message: "L'exercice 'Modélisation de données' est à rendre demain",
      time: "Il y a 2 heures",
      read: false,
    },
    {
      id: 3,
      title: "Correction disponible",
      message: "La correction de l'exercice 'Normalisation' est disponible",
      time: "Hier",
      read: true,
    },
  ])

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
  const filteredExercises = exercises.filter((exercise) => {
    if (!searchQuery.trim()) return true

    const query = searchQuery.toLowerCase().trim()

    // Recherche dans plusieurs champs
    return (
      exercise.title.toLowerCase().includes(query) ||
      exercise.subtitle.toLowerCase().includes(query) ||
      exercise.category.toLowerCase().includes(query) ||
      exercise.status.toLowerCase().includes(query) ||
      exercise.date.toLowerCase().includes(query)
    )
  })

  // Réinitialiser la page courante lorsque la requête de recherche change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery])

  // Pagination
  const exercisesPerPage = 5
  const totalPages = Math.ceil(filteredExercises.length / exercisesPerPage)
  const paginatedExercises = filteredExercises.slice(
    (currentPage - 1) * exercisesPerPage,
    currentPage * exercisesPerPage,
  )

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadedFile(e.target.files[0])
    }
  }

  const handleCorrectionFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setCorrectionFile(e.target.files[0])
    }
  }

  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()

    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setUploadedFile(e.dataTransfer.files[0])
    }
  }

  const handleBrowseClick = () => {
    fileInputRef.current?.click()
  }

  const handleCorrectionBrowseClick = () => {
    correctionFileInputRef.current?.click()
  }

  const removeFile = () => {
    setUploadedFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const removeCorrectionFile = () => {
    setCorrectionFile(null)
    if (correctionFileInputRef.current) {
      correctionFileInputRef.current.value = ""
    }
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setNewExercise({
      ...newExercise,
      [name]: value,
    })
  }

  const handleSelectChange = (value: string, name: string) => {
    setNewExercise({
      ...newExercise,
      [name]: value,
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Ici, vous pourriez implémenter la logique pour envoyer le fichier et les métadonnées au serveur
    console.log("Nouvel exercice:", newExercise)
    console.log("Fichier:", uploadedFile)
    console.log("Fichier de correction:", correctionFile)

    // Simuler l'ajout d'un nouvel exercice
    const newExerciseItem = {
      title: newExercise.title,
      subtitle: newExercise.subtitle,
      category: newExercise.category,
      categoryClass: "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300",
      date: new Date().toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" }),
      status: "Brouillon",
      statusClass: "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300",
      correctionModel: correctionFile ? correctionFile.name : undefined,
    }

    setExercises([newExerciseItem, ...exercises])

    // Réinitialiser le formulaire
    setUploadedFile(null)
    setCorrectionFile(null)
    setNewExercise({
      title: "",
      subtitle: "",
      category: "",
      deadline: "",
      correctionModel: "",
    })

    // Fermer la modale
    setIsModalOpen(false)
  }

  // Ajoutez ces nouvelles fonctions après les fonctions existantes
  const handleViewExercise = (exercise: Exercise) => {
    setViewExercise(exercise)
  }

  const handleEditExercise = (exercise: Exercise) => {
    setEditExercise(exercise)
    setEditFormData({
      title: exercise.title,
      subtitle: exercise.subtitle,
      category: exercise.category,
      deadline: "", // Normalement, vous auriez une date limite dans votre objet Exercise
      correctionModel: exercise.correctionModel || "", // Add this new field
    })
  }

  const handleDeleteExercise = (exercise: Exercise) => {
    setDeleteExercise(exercise)
  }

  const handleEditFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setEditFormData({
      ...editFormData,
      [name]: value,
    })
  }

  const handleEditSelectChange = (value: string, name: string) => {
    setEditFormData({
      ...editFormData,
      [name]: value,
    })
  }

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!editExercise) return

    // Mettre à jour l'exercice dans la liste
    const updatedExercises = exercises.map((ex) =>
      ex.title === editExercise.title
        ? {
            ...ex,
            title: editFormData.title,
            subtitle: editFormData.subtitle,
            category: editFormData.category,
            correctionModel: editFormData.correctionModel, // Add this new field
            // Mettre à jour d'autres champs si nécessaire
          }
        : ex,
    )

    setExercises(updatedExercises)
    setEditExercise(null)
  }

  const confirmDeleteExercise = () => {
    if (!deleteExercise) return

    // Supprimer l'exercice de la liste
    const updatedExercises = exercises.filter((ex) => ex.title !== deleteExercise.title)
    setExercises(updatedExercises)
    setDeleteExercise(null)
  }

  // Function to mark a single notification as read
  const markAsRead = (id: number) => {
    setNotifications(
      notifications.map((notification) => (notification.id === id ? { ...notification, read: true } : notification)),
    )
  }

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
                <h1 className="text-lg font-semibold text-gray-800 dark:text-white">
                  {userRole === "professor" ? "Gestion des exercices" : "Exercices disponibles"}
                </h1>
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
                  <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
                    {userRole === "professor" ? "Gestion des exercices" : "Exercices disponibles"}
                  </h2>

                  <div className="mt-4 md:mt-0 flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
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

                    {userRole === "professor" && (
                      <button
                        className="flex items-center justify-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
                        onClick={() => setIsModalOpen(true)}
                      >
                        <Plus className="w-5 h-5 mr-2" />
                        <span>Nouvel exercice</span>
                      </button>
                    )}
                  </div>
                </div>

                {filteredExercises.length === 0 ? (
                  <div className="text-center py-12">
                    <Search className="w-12 h-12 mx-auto text-gray-400 dark:text-gray-500 mb-4" />
                    <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-2">Aucun exercice trouvé</h3>
                    <p className="text-gray-500 dark:text-gray-400">
                      Aucun exercice ne correspond à votre recherche "{searchQuery}"
                    </p>
                    <button
                      onClick={() => setSearchQuery("")}
                      className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
                    >
                      Effacer la recherche
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead>
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                              Titre
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                              Catégorie
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                              Date
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                              Statut
                            </th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                          {paginatedExercises.map((exercise, index) => (
                            <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                              <td className="px-4 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                                    <Database className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                                  </div>
                                  <div className="ml-4">
                                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                                      {exercise.title}
                                    </div>
                                    <div className="text-sm text-gray-500 dark:text-gray-400">{exercise.subtitle}</div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-4 py-4 whitespace-nowrap">
                                <span className={`px-2 py-1 text-xs rounded-full ${exercise.categoryClass}`}>
                                  {exercise.category}
                                </span>
                              </td>
                              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                {exercise.date}
                              </td>
                              <td className="px-4 py-4 whitespace-nowrap">
                                <span className={`px-2 py-1 text-xs rounded-full ${exercise.statusClass}`}>
                                  {exercise.status}
                                </span>
                              </td>
                              {/* Remplacez le code des boutons d'action dans la table par celui-ci */}
                              <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <button
                                  className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300 mr-3"
                                  onClick={() => handleViewExercise(exercise)}
                                >
                                  <Eye className="w-5 h-5" />
                                </button>
                                {userRole === "professor" && (
                                  <>
                                    <button
                                      className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300 mr-3"
                                      onClick={() => handleEditExercise(exercise)}
                                    >
                                      <Edit className="w-5 h-5" />
                                    </button>
                                    <button
                                      className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300"
                                      onClick={() => handleDeleteExercise(exercise)}
                                    >
                                      <Trash className="w-5 h-5" />
                                    </button>
                                  </>
                                )}
                                {userRole === "student" && (
                                  <button className="text-green-600 dark:text-green-400 hover:text-green-900 dark:hover:text-green-300">
                                    <Upload className="w-5 h-5" />
                                  </button>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <div className="mt-6 flex items-center justify-between">
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        Affichage de <span className="font-medium">{(currentPage - 1) * exercisesPerPage + 1}</span> à{" "}
                        <span className="font-medium">
                          {Math.min(currentPage * exercisesPerPage, filteredExercises.length)}
                        </span>{" "}
                        sur <span className="font-medium">{filteredExercises.length}</span> exercices
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
                              } transition-colors`}
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
      {/* Modal pour ajouter un nouvel exercice */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Ajouter un nouvel exercice</DialogTitle>
            <DialogDescription>
              Téléchargez un fichier PDF et renseignez les informations de l'exercice.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6 py-4">
            {/* Zone de dépôt de fichier */}
            <div className="space-y-2">
              <Label htmlFor="file">Fichier d'exercice (PDF)</Label>

              {!uploadedFile ? (
                <div
                  className={`border-2 ${
                    dragActive
                      ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20"
                      : "border-dashed border-gray-300 dark:border-gray-600"
                  } rounded-lg p-8 transition-colors`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <div className="flex flex-col items-center justify-center text-center">
                    <UploadCloud className="w-12 h-12 text-gray-400 dark:text-gray-500 mb-4" />
                    <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-2">Déposer un fichier PDF</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                      Glissez-déposez votre fichier PDF ici ou cliquez pour parcourir
                    </p>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      accept=".pdf"
                      className="hidden"
                      id="file"
                    />
                    <button
                      type="button"
                      onClick={handleBrowseClick}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
                    >
                      Parcourir les fichiers
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center p-3 rounded-lg bg-gray-50 dark:bg-gray-700/30 border border-gray-200 dark:border-gray-600">
                  <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                    <FileText className="w-5 h-5 text-red-600 dark:text-red-400" />
                  </div>
                  <div className="ml-4 flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-800 dark:text-white">{uploadedFile.name}</p>
                      <button
                        type="button"
                        onClick={removeFile}
                        className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{formatFileSize(uploadedFile.size)}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Zone de dépôt du modèle de correction */}
            <div className="space-y-2 mt-6">
              <Label htmlFor="correction-file">Modèle de correction (PDF)</Label>

              {!correctionFile ? (
                <div
                  className={`border-2 ${
                    dragActive
                      ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20"
                      : "border-dashed border-gray-300 dark:border-gray-600"
                  } rounded-lg p-8 transition-colors`}
                >
                  <div className="flex flex-col items-center justify-center text-center">
                    <UploadCloud className="w-12 h-12 text-gray-400 dark:text-gray-500 mb-4" />
                    <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-2">
                      Déposer un modèle de correction
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                      Glissez-déposez votre fichier PDF ici ou cliquez pour parcourir
                    </p>
                    <input
                      type="file"
                      ref={correctionFileInputRef}
                      onChange={handleCorrectionFileChange}
                      accept=".pdf"
                      className="hidden"
                      id="correction-file"
                    />
                    <button
                      type="button"
                      onClick={handleCorrectionBrowseClick}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
                    >
                      Parcourir les fichiers
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center p-3 rounded-lg bg-gray-50 dark:bg-gray-700/30 border border-gray-200 dark:border-gray-600">
                  <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                    <FileText className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="ml-4 flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-800 dark:text-white">{correctionFile.name}</p>
                      <button
                        type="button"
                        onClick={removeCorrectionFile}
                        className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {formatFileSize(correctionFile.size)}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Informations de l'exercice */}
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Titre de l'exercice</Label>
                  <Input
                    id="title"
                    name="title"
                    value={newExercise.title}
                    onChange={handleInputChange}
                    placeholder="Ex: Requêtes SQL avancées"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subtitle">Sous-titre / Description courte</Label>
                  <Input
                    id="subtitle"
                    name="subtitle"
                    value={newExercise.subtitle}
                    onChange={handleInputChange}
                    placeholder="Ex: Jointures et sous-requêtes"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="category">Catégorie</Label>
                    <Select
                      value={newExercise.category}
                      onValueChange={(value) => handleSelectChange(value, "category")}
                    >
                      <SelectTrigger id="category">
                        <SelectValue placeholder="Sélectionner une catégorie" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="SQL">SQL</SelectItem>
                        <SelectItem value="Modélisation">Modélisation</SelectItem>
                        <SelectItem value="Optimisation">Optimisation</SelectItem>
                        <SelectItem value="Avancé">Avancé</SelectItem>
                        <SelectItem value="NoSQL">NoSQL</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="deadline">Date limite</Label>
                    <Input
                      id="deadline"
                      name="deadline"
                      type="date"
                      value={newExercise.deadline}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description détaillée (optionnel)</Label>
                  <Textarea
                    id="description"
                    name="description"
                    placeholder="Description détaillée de l'exercice..."
                    className="min-h-[100px]"
                  />
                </div>
              </div>
            </div>

            <DialogFooter>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-800 dark:text-white rounded-lg transition-colors mr-2"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
                disabled={!uploadedFile || !newExercise.title || !newExercise.category}
              >
                Créer l'exercice
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal pour visualiser un exercice */}
      <Dialog open={!!viewExercise} onOpenChange={() => setViewExercise(null)}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{viewExercise?.title}</DialogTitle>
            <DialogDescription>{viewExercise?.subtitle}</DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <div className="flex items-center mb-4">
              <span className={`px-2 py-1 text-xs rounded-full mr-2 ${viewExercise?.categoryClass}`}>
                {viewExercise?.category}
              </span>
              <span className={`px-2 py-1 text-xs rounded-full ${viewExercise?.statusClass}`}>
                {viewExercise?.status}
              </span>
              <span className="ml-auto text-sm text-gray-500 dark:text-gray-400">{viewExercise?.date}</span>
            </div>

            <div className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-700/30 mb-4">
              <h3 className="text-md font-medium text-gray-800 dark:text-white mb-2">Description</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Cet exercice porte sur {viewExercise?.subtitle}. Les étudiants devront démontrer leur compréhension des
                concepts clés et appliquer leurs connaissances pour résoudre des problèmes pratiques.
              </p>
            </div>

            <div className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-700/30">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-md font-medium text-gray-800 dark:text-white">Fichier d'exercice</h3>
                <button className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300 flex items-center">
                  <Download className="w-4 h-4 mr-1" />
                  <span className="text-sm">Télécharger</span>
                </button>
              </div>

              <div className="aspect-[16/9] bg-gray-200 dark:bg-gray-600 rounded-lg flex items-center justify-center">
                <FileText className="w-16 h-16 text-gray-400 dark:text-gray-500" />
                <span className="ml-2 text-gray-600 dark:text-gray-300">Aperçu du PDF</span>
              </div>
            </div>

            {viewExercise?.correctionModel && (
              <div className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-700/30 mt-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-md font-medium text-gray-800 dark:text-white">Modèle de correction</h3>
                  <button className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300 flex items-center">
                    <Download className="w-4 h-4 mr-1" />
                    <span className="text-sm">Télécharger</span>
                  </button>
                </div>

                <div className="aspect-[16/9] bg-gray-200 dark:bg-gray-600 rounded-lg flex items-center justify-center">
                  <FileText className="w-16 h-16 text-gray-400 dark:text-gray-500" />
                  <span className="ml-2 text-gray-600 dark:text-gray-300">Aperçu du modèle de correction</span>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <button
              type="button"
              onClick={() => setViewExercise(null)}
              className="px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-800 dark:text-white rounded-lg transition-colors"
            >
              Fermer
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal pour modifier un exercice */}
      <Dialog open={!!editExercise} onOpenChange={() => setEditExercise(null)}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Modifier l'exercice</DialogTitle>
            <DialogDescription>Modifiez les informations de l'exercice.</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleEditSubmit} className="space-y-6 py-4">
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-title">Titre de l'exercice</Label>
                  <Input
                    id="edit-title"
                    name="title"
                    value={editFormData.title}
                    onChange={handleEditFormChange}
                    placeholder="Ex: Requêtes SQL avancées"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-subtitle">Sous-titre / Description courte</Label>
                  <Input
                    id="edit-subtitle"
                    name="subtitle"
                    value={editFormData.subtitle}
                    onChange={handleEditFormChange}
                    placeholder="Ex: Jointures et sous-requêtes"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-category">Catégorie</Label>
                    <Select
                      value={editFormData.category}
                      onValueChange={(value) => handleEditSelectChange(value, "category")}
                    >
                      <SelectTrigger id="edit-category">
                        <SelectValue placeholder="Sélectionner une catégorie" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="SQL">SQL</SelectItem>
                        <SelectItem value="Modélisation">Modélisation</SelectItem>
                        <SelectItem value="Optimisation">Optimisation</SelectItem>
                        <SelectItem value="Avancé">Avancé</SelectItem>
                        <SelectItem value="NoSQL">NoSQL</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="edit-deadline">Date limite</Label>
                    <Input
                      id="edit-deadline"
                      name="deadline"
                      type="date"
                      value={editFormData.deadline}
                      onChange={handleEditFormChange}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-description">Description détaillée (optionnel)</Label>
                  <Textarea
                    id="edit-description"
                    name="description"
                    placeholder="Description détaillée de l'exercice..."
                    className="min-h-[100px]"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Fichier d'exercice actuel</Label>
              <div className="flex items-center p-3 rounded-lg bg-gray-50 dark:bg-gray-700/30 border border-gray-200 dark:border-gray-600">
                <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-red-600 dark:text-red-400" />
                </div>
                <div className="ml-4 flex-1">
                  <p className="text-sm font-medium text-gray-800 dark:text-white">{editExercise?.title}.pdf</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Remplacer le fichier (optionnel)</p>
                </div>
                <button
                  type="button"
                  className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs rounded-lg transition-colors"
                >
                  Parcourir
                </button>
              </div>
            </div>

            <div className="space-y-2 mt-4">
              <Label>Modèle de correction actuel</Label>
              {editExercise?.correctionModel ? (
                <div className="flex items-center p-3 rounded-lg bg-gray-50 dark:bg-gray-700/30 border border-gray-200 dark:border-gray-600">
                  <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                    <FileText className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="ml-4 flex-1">
                    <p className="text-sm font-medium text-gray-800 dark:text-white">{editExercise.correctionModel}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Remplacer le fichier (optionnel)</p>
                  </div>
                  <button
                    type="button"
                    className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs rounded-lg transition-colors"
                  >
                    Parcourir
                  </button>
                </div>
              ) : (
                <div className="flex items-center p-3 rounded-lg bg-gray-50 dark:bg-gray-700/30 border border-gray-200 dark:border-gray-600">
                  <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                    <FileText className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                  </div>
                  <div className="ml-4 flex-1">
                    <p className="text-sm font-medium text-gray-800 dark:text-white">Aucun modèle de correction</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Ajouter un fichier (optionnel)</p>
                  </div>
                  <button
                    type="button"
                    className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs rounded-lg transition-colors"
                  >
                    Parcourir
                  </button>
                </div>
              )}
            </div>

            <DialogFooter>
              <button
                type="button"
                onClick={() => setEditExercise(null)}
                className="px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-800 dark:text-white rounded-lg transition-colors mr-2"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
              >
                Enregistrer les modifications
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal de confirmation de suppression */}
      <Dialog open={!!deleteExercise} onOpenChange={() => setDeleteExercise(null)}>
        <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Confirmer la suppression</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer cet exercice ? Cette action est irréversible.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <div className="flex items-center p-3 rounded-lg bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800/30">
              <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <FileText className="w-5 h-5 text-red-600 dark:text-red-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-800 dark:text-white">{deleteExercise?.title}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{deleteExercise?.subtitle}</p>
              </div>
            </div>
          </div>

          <DialogFooter>
            <button
              type="button"
              onClick={() => setDeleteExercise(null)}
              className="px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-800 dark:text-white rounded-lg transition-colors mr-2"
            >
              Annuler
            </button>
            <button
              type="button"
              onClick={confirmDeleteExercise}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
            >
              Supprimer
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

