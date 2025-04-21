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
  Loader2,
} from "lucide-react"
import Sidebar from "../../../src/components/Sidebar"
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
  id?: string
  title: string
  subtitle: string
  category: string
  categoryClass: string
  date: string
  status: string
  statusClass: string
  correctionModel?: string
  fileUrl?: string
  correctionUrl?: string
  deadline?: string
  description?: string
}

export default function ExercisesPage() {
  // Add this constant at the top of your component
  const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
  // State
  const [userRole, setUserRole] = useState<UserRole>("professor")
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [notification, setNotification] = useState<{
    type: "success" | "error"
    message: string
  } | null>(null)

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
    description: "",
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
    description: "",
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

  // Fonction pour afficher une notification
  const showNotification = (type: "success" | "error", message: string) => {
    setNotification({ type, message })
    // Masquer la notification après 5 secondes
    setTimeout(() => {
      setNotification(null)
    }, 5000)
  }

  // Fonction pour décoder les URLs hexadécimales (si nécessaire côté client)
  const decodeHexString = (hexString: string | null | undefined): string | undefined => {
    if (!hexString) return undefined

    // Si c'est déjà une URL, la retourner telle quelle
    if (typeof hexString === "string" && (hexString.startsWith("http://") || hexString.startsWith("https://"))) {
      return hexString
    }

    // Vérifier si c'est une chaîne hexadécimale (commence par 0x)
    if (typeof hexString === "string" && hexString.startsWith("0x")) {
      // Supprimer le préfixe 0x et convertir en chaîne de caractères
      const hex = hexString.substring(2)
      let str = ""
      for (let i = 0; i < hex.length; i += 2) {
        const charCode = Number.parseInt(hex.substr(i, 2), 16)
        str += String.fromCharCode(charCode)
      }
      return str
    }

    return hexString as string // Retourner la valeur d'origine
  }

  // Fetch exercises from backend
  useEffect(() => {
    fetchExercises()
  }, [])

  const fetchExercises = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("http://localhost:5000/sujets")
      if (!response.ok) {
        throw new Error("Erreur lors de la récupération des exercices")
      }
      const data = await response.json()

      // Transform backend data to match our frontend format
      const formattedExercises = data.map((exercise: any) => ({
        id: exercise.id_Sujet,
        title: exercise.Titre || "Sans titre",
        subtitle: exercise.sousTitre || "Pas de sous-titre",
        category: exercise.TypeDeSujet || "Non catégorisé",
        categoryClass: getCategoryClass(exercise.TypeDeSujet),
        date: new Date(exercise.DateDeDepot).toLocaleDateString("fr-FR", {
          day: "numeric",
          month: "long",
          year: "numeric",
        }),
        status: exercise.status === "publier" ? "Publié" : "Brouillon",
        statusClass: getStatusClass(exercise.status === "publier" ? "Publié" : "Brouillon"),
        fileUrl: decodeHexString(exercise.file),
        correctionUrl: decodeHexString(exercise.correctionUrl),
        deadline: exercise.Delai ? new Date(exercise.Delai).toISOString().split("T")[0] : "",
        description: exercise.Description || "",
      }))

      setExercises(formattedExercises)
    } catch (error) {
      console.error("Erreur:", error)
      showNotification("error", "Impossible de charger les exercices. Veuillez réessayer plus tard.")
    } finally {
      setIsLoading(false)
    }
  }

  const getCategoryClass = (category: string) => {
    const categoryMap: Record<string, string> = {
      SQL: "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300",
      Modélisation: "bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300",
      Optimisation: "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300",
      Avancé: "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300",
      NoSQL: "bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300",
    }
    return categoryMap[category] || "bg-gray-100 dark:bg-gray-900/30 text-gray-800 dark:text-gray-300"
  }

  const getStatusClass = (status: string) => {
    const statusMap: Record<string, string> = {
      Publié: "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300",
      Brouillon: "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300",
    }
    return statusMap[status] || "bg-gray-100 dark:bg-gray-900/30 text-gray-800 dark:text-gray-300"
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

  // Add this function after your existing functions
  const validateFileSize = (file: File): boolean => {
    if (file.size > MAX_FILE_SIZE) {
      showNotification("error", `La taille du fichier ne doit pas dépasser ${formatFileSize(MAX_FILE_SIZE)}`)
      return false
    }
    return true
  }

  // Then update your validateFileType function to also check size
  const validateFile = (file: File): boolean => {
    const allowedTypes = ["application/pdf"]
    if (!allowedTypes.includes(file.type)) {
      showNotification("error", "Seuls les fichiers PDF sont acceptés")
      return false
    }

    if (file.size > MAX_FILE_SIZE) {
      showNotification("error", `La taille du fichier ne doit pas dépasser ${formatFileSize(MAX_FILE_SIZE)}`)
      return false
    }

    return true
  }

  // Update your handleFileChange and handleDrop functions to use validateFile instead of validateFileType
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      if (validateFile(file)) {
        setUploadedFile(file)
      } else if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  const handleCorrectionFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      if (validateFile(file)) {
        setCorrectionFile(file)
      } else if (correctionFileInputRef.current) {
        correctionFileInputRef.current.value = ""
      }
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
      const file = e.dataTransfer.files[0]
      if (validateFile(file)) {
        setUploadedFile(file)
      }
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

  // Add a new state for upload progress
  const [uploadProgress, setUploadProgress] = useState(0)

  // Modify the handleSubmit function to track progress
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!uploadedFile) {
      showNotification("error", "Veuillez sélectionner un fichier d'exercice")
      return
    }

    if (!newExercise.title || !newExercise.category) {
      showNotification("error", "Veuillez remplir tous les champs obligatoires")
      return
    }

    setIsSubmitting(true)
    setUploadProgress(0)

    try {
      // Créer un FormData pour envoyer les fichiers
      const formData = new FormData()
      formData.append("titre", newExercise.title)
      formData.append("sousTitre", newExercise.subtitle)
      formData.append("categorie", newExercise.category)
      formData.append("statut", "Publié") // Par défaut, le statut est "brouillon"
      formData.append("description", newExercise.description)

      if (newExercise.deadline) {
        formData.append("dateLimite", new Date(newExercise.deadline).toISOString())
      }

      // Ajouter le fichier d'exercice
      formData.append("fichier", uploadedFile)

      // Ajouter le fichier de correction si disponible
      if (correctionFile) {
        formData.append("correction", correctionFile)
      }

      // Use XMLHttpRequest for progress tracking
      const xhr = new XMLHttpRequest()

      xhr.upload.addEventListener("progress", (event) => {
        if (event.lengthComputable) {
          const percentComplete = Math.round((event.loaded / event.total) * 100)
          setUploadProgress(percentComplete)
        }
      })

      xhr.addEventListener("load", async () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          const data = JSON.parse(xhr.responseText)
          showNotification("success", "L'exercice a été ajouté avec succès")

          // Réinitialiser le formulaire
          setUploadedFile(null)
          setCorrectionFile(null)
          setNewExercise({
            title: "",
            subtitle: "",
            category: "",
            deadline: "",
            description: "",
          })

          // Fermer la modale
          setIsModalOpen(false)

          // Rafraîchir la liste des exercices
          fetchExercises()
        } else {
          throw new Error("Erreur lors de l'ajout de l'exercice")
        }
        setIsSubmitting(false)
        setUploadProgress(0)
      })

      xhr.addEventListener("error", () => {
        showNotification("error", "Une erreur est survenue lors de l'ajout de l'exercice")
        setIsSubmitting(false)
        setUploadProgress(0)
      })

      // Modifier l'URL pour pointer vers la nouvelle route
      xhr.open("POST", "http://localhost:5000/sujets")
      xhr.send(formData)
    } catch (error) {
      console.error("Erreur:", error)
      showNotification(
        "error",
        error instanceof Error ? error.message : "Une erreur est survenue lors de l'ajout de l'exercice",
      )
      setIsSubmitting(false)
      setUploadProgress(0)
    }
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
      deadline: exercise.deadline || "",
      description: exercise.description || "",
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

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!editExercise) return

    setIsSubmitting(true)

    try {
      // Créer un FormData pour envoyer les données mises à jour
      const formData = new FormData()
      formData.append("titre", editFormData.title)
      formData.append("sousTitre", editFormData.subtitle)
      formData.append("categorie", editFormData.category)
      formData.append("description", editFormData.description)

      if (editFormData.deadline) {
        formData.append("dateLimite", new Date(editFormData.deadline).toISOString())
      }

      // Envoyer la requête au backend
      const response = await fetch(`http://localhost:5000/sujets/${editExercise.id}`, {
        method: "PUT",
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Erreur lors de la modification de l'exercice")
      }

      showNotification("success", "L'exercice a été modifié avec succès")

      // Fermer la modale
      setEditExercise(null)

      // Rafraîchir la liste des exercices
      fetchExercises()
    } catch (error) {
      console.error("Erreur:", error)
      showNotification(
        "error",
        error instanceof Error ? error.message : "Une erreur est survenue lors de la modification de l'exercice",
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  const confirmDeleteExercise = async () => {
    if (!deleteExercise) return

    setIsSubmitting(true)

    try {
      // Envoyer la requête au backend
      const response = await fetch(`http://localhost:5000/sujets/${deleteExercise.id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Erreur lors de la suppression de l'exercice")
      }

      showNotification("success", "L'exercice a été supprimé avec succès")

      // Fermer la modale
      setDeleteExercise(null)

      // Rafraîchir la liste des exercices
      fetchExercises()
    } catch (error) {
      console.error("Erreur:", error)
      showNotification(
        "error",
        error instanceof Error ? error.message : "Une erreur est survenue lors de la suppression de l'exercice",
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
                        ? `Aucun exercice ne correspond à votre recherche "${searchQuery}"`
                        : "Aucun exercice n'est disponible pour le moment"}
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
              <Label htmlFor="file">
                Fichier d'exercice (PDF) <span className="text-red-500">*</span>
              </Label>

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
              <Label htmlFor="correction-file">
                Modèle de correction (PDF) <span className="text-gray-500 text-sm">(optionnel)</span>
              </Label>

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
                  <Label htmlFor="title">
                    Titre de l'exercice <span className="text-red-500">*</span>
                  </Label>
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
                    <Label htmlFor="category">
                      Catégorie <span className="text-red-500">*</span>
                    </Label>
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
                    value={newExercise.description}
                    onChange={handleInputChange}
                    placeholder="Description détaillée de l'exercice..."
                    className="min-h-[100px]"
                  />
                </div>
              </div>
            </div>

            {isSubmitting && (
              <div className="mb-4">
                <Label>Progression de l'upload</Label>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mt-2">
                  <div
                    className="bg-indigo-600 h-2.5 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 text-right">{uploadProgress}%</p>
              </div>
            )}

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
                disabled={isSubmitting || !uploadedFile || !newExercise.title || !newExercise.category}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    <span>Création en cours...</span>
                  </>
                ) : (
                  <span>Créer l'exercice</span>
                )}
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
                {viewExercise?.description ||
                  `Cet exercice porte sur ${viewExercise?.subtitle}. Les étudiants devront démontrer leur compréhension des concepts clés et appliquer leurs connaissances pour résoudre des problèmes pratiques.`}
              </p>
            </div>

            {/* PDF Viewer for Exercise File */}
            <div className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-700/30 mb-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-md font-medium text-gray-800 dark:text-white">Fichier d'exercice</h3>
                {viewExercise?.fileUrl && (
                  <a
                    href={viewExercise.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300 flex items-center"
                  >
                    <Download className="w-4 h-4 mr-1" />
                    <span className="text-sm">Télécharger</span>
                  </a>
                )}
              </div>

              {viewExercise?.fileUrl ? (
                <div className="pdf-container">
                  <div className="w-full h-[500px] border border-gray-200 dark:border-gray-600 rounded-lg overflow-hidden">
                    <iframe src={viewExercise.fileUrl} className="w-full h-full" title="Fichier d'exercice" />
                  </div>
                </div>
              ) : (
                <div className="aspect-[16/9] bg-gray-200 dark:bg-gray-600 rounded-lg flex items-center justify-center">
                  <FileText className="w-16 h-16 text-gray-400 dark:text-gray-500" />
                  <span className="ml-2 text-gray-600 dark:text-gray-300">Aucun fichier disponible</span>
                </div>
              )}
            </div>

            {/* PDF Viewer for Correction File */}
            {viewExercise?.correctionUrl && (
              <div className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-700/30 mt-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-md font-medium text-gray-800 dark:text-white">Modèle de correction</h3>
                  <a
                    href={viewExercise.correctionUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300 flex items-center"
                  >
                    <Download className="w-4 h-4 mr-1" />
                    <span className="text-sm">Télécharger</span>
                  </a>
                </div>

                <div className="pdf-container">
                  <div className="w-full h-[500px] border border-gray-200 dark:border-gray-600 rounded-lg overflow-hidden">
                    <iframe src={viewExercise.correctionUrl} className="w-full h-full" title="Modèle de correction" />
                  </div>
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
            <DialogDescription>Mettez à jour les informations de l'exercice.</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleEditSubmit} className="space-y-6 py-4">
            {/* Informations de l'exercice */}
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-title">
                    Titre de l'exercice <span className="text-red-500">*</span>
                  </Label>
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
                    <Label htmlFor="edit-category">
                      Catégorie <span className="text-red-500">*</span>
                    </Label>
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
                    value={editFormData.description}
                    onChange={handleEditFormChange}
                    placeholder="Description détaillée de l'exercice..."
                    className="min-h-[100px]"
                  />
                </div>
              </div>
            </div>

            <DialogFooter>
              <button
                type="button"
                onClick={() => setEditExercise(null)}
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
                    <span>Modification en cours...</span>
                  </>
                ) : (
                  <span>Modifier l'exercice</span>
                )}
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal pour confirmer la suppression d'un exercice */}
      <Dialog open={!!deleteExercise} onOpenChange={() => setDeleteExercise(null)}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Supprimer l'exercice</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer cet exercice ? Cette action est irréversible.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <p className="text-gray-600 dark:text-gray-300">
              Vous êtes sur le point de supprimer l'exercice :{" "}
              <span className="font-medium">{deleteExercise?.title}</span>.
            </p>
          </div>

          <DialogFooter>
            <button
              type="button"
              onClick={() => setDeleteExercise(null)}
              className="px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-800 dark:text-white rounded-lg transition-colors mr-2"
              disabled={isSubmitting}
            >
              Annuler
            </button>
            <button
              type="button"
              onClick={confirmDeleteExercise}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors flex items-center"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  <span>Suppression en cours...</span>
                </>
              ) : (
                <span>Supprimer</span>
              )}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

