"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Menu, Bell, ChevronDown, ChevronLeft, ChevronRight, Plus, Clock, Database, FileText } from "lucide-react"
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
import { Loader2, UploadCloud, X } from "lucide-react"

type UserRole = "professor" | "student"

interface CalendarEvent {
  id: string
  title: string
  date: Date
  type: "exercise" | "deadline" | "evaluation"
  description: string
}

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
}

export default function CalendarPage() {
  // State
  const [userRole, setUserRole] = useState<UserRole>("professor")
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [events, setEvents] = useState<CalendarEvent[]>([
    {
      id: "1",
      title: "Requêtes SQL avancées",
      date: new Date(2025, 2, 15), // March 15, 2025
      type: "exercise",
      description: "Publication de l'exercice sur les requêtes SQL avancées",
    },
    {
      id: "2",
      title: "Date limite: Requêtes SQL avancées",
      date: new Date(2025, 2, 25), // March 25, 2025
      type: "deadline",
      description: "Date limite pour soumettre l'exercice sur les requêtes SQL avancées",
    },
    {
      id: "3",
      title: "Modélisation de données",
      date: new Date(2025, 2, 10), // March 10, 2025
      type: "exercise",
      description: "Publication de l'exercice sur la modélisation de données",
    },
    {
      id: "4",
      title: "Évaluation: Normalisation",
      date: new Date(2025, 2, 7), // March 7, 2025
      type: "evaluation",
      description: "Évaluation des soumissions pour l'exercice sur la normalisation",
    },
  ])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  // Ajouter cette variable d'état après la déclaration de uploadedFile
  const [correctionFile, setCorrectionFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const correctionFileInputRef = useRef<HTMLInputElement>(null)
  const [dragActive, setDragActive] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [notification, setNotification] = useState<{
    type: "success" | "error"
    message: string
  } | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [currentEvent, setCurrentEvent] = useState<CalendarEvent | null>(null)
  const [editedEvent, setEditedEvent] = useState({
    title: "",
    description: "",
    type: "exercise" as "exercise" | "deadline" | "evaluation",
  })
  const [newExercise, setNewExercise] = useState({
    title: "",
    subtitle: "",
    category: "",
    deadline: "",
    description: "",
  })

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

  // Charger les sujets depuis l'API
  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        setIsLoading(true)
        // Essayons différents chemins d'API possibles
        // Vous pouvez ajuster cette URL en fonction de votre configuration d'API
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
        const response = await fetch(`${apiUrl}/sujets`)

        if (!response.ok) {
          throw new Error(`Erreur: ${response.status}`)
        }

        const subjects: Subject[] = await response.json()

        // Convertir les sujets en événements du calendrier
        const subjectEvents: CalendarEvent[] = subjects.map((subject) => ({
          id: `subject-${subject.id_Sujet}`,
          title: `Date limite: ${subject.Titre}`,
          date: new Date(subject.Delai),
          type: "deadline",
          description: `Date limite pour soumettre: ${subject.sousTitre || subject.Titre}`,
        }))

        // Combiner avec les événements statiques existants
        setEvents((prev) => {
          const staticEvents = prev.filter((event) => !event.id.startsWith("subject-"))
          return [...staticEvents, ...subjectEvents]
        })

        setIsLoading(false)
      } catch (err) {
        console.error("Erreur lors du chargement des sujets:", err)
        setError("Impossible de charger les dates limites des sujets. L'API pourrait être inaccessible.")

        // Ne pas bloquer l'affichage du calendrier en cas d'erreur
        setIsLoading(false)
      }
    }

    fetchSubjects()
  }, []) // Se déclenche uniquement au montage du composant

  // Calendar navigation
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
  }

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
  }

  const goToToday = () => {
    setCurrentDate(new Date())
    setSelectedDate(new Date())
  }

  // Calendar helpers
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay()
  }

  const formatMonth = (date: Date) => {
    return date.toLocaleDateString("fr-FR", { month: "long", year: "numeric" })
  }

  const isSameDay = (date1: Date, date2: Date) => {
    return (
      date1.getDate() === date2.getDate() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getFullYear() === date2.getFullYear()
    )
  }

  const getEventsForDate = (date: Date) => {
    return events.filter((event) => isSameDay(event.date, date))
  }

  const isToday = (date: Date) => {
    const today = new Date()
    return isSameDay(date, today)
  }

  // Generate calendar days
  const generateCalendarDays = () => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()

    const daysInMonth = getDaysInMonth(year, month)
    const firstDayOfMonth = getFirstDayOfMonth(year, month)

    const days = []

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(null)
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day)
      days.push(date)
    }

    return days
  }

  // Get event type color
  const getEventTypeColor = (type: string) => {
    switch (type) {
      case "exercise":
        return "bg-blue-500"
      case "deadline":
        return "bg-red-500"
      case "evaluation":
        return "bg-green-500"
      default:
        return "bg-gray-500"
    }
  }

  // Check system preference for dark mode on mount
  useEffect(() => {
    if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
      setIsDarkMode(true)
      document.documentElement.classList.add("dark")
    }
  }, [])

  // Fonction pour afficher une notification
  const showNotification = (type: "success" | "error", message: string) => {
    setNotification({ type, message })
    // Masquer la notification après 5 secondes
    setTimeout(() => {
      setNotification(null)
    }, 5000)
  }

  const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

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

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

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

  const removeFile = () => {
    setUploadedFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  // Ajouter ces fonctions après la fonction removeFile

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

  const handleCorrectionBrowseClick = () => {
    correctionFileInputRef.current?.click()
  }

  const removeCorrectionFile = () => {
    setCorrectionFile(null)
    if (correctionFileInputRef.current) {
      correctionFileInputRef.current.value = ""
    }
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
      formData.append("statut", "Publié") // Par défaut, le statut est "publié"
      formData.append("description", newExercise.description)

      if (newExercise.deadline) {
        formData.append("dateLimite", new Date(newExercise.deadline).toISOString())
      }

      // Ajouter le fichier d'exercice
      formData.append("fichier", uploadedFile)

      // Modifier la fonction handleSubmit pour inclure le fichier de correction
      // Ajouter ce code après la ligne formData.append("fichier", uploadedFile)
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
          showNotification("success", "L'exercice a été ajouté avec succès")

          // Modifier la partie qui réinitialise le formulaire pour inclure le fichier de correction
          // Remplacer la partie qui réinitialise le formulaire par ceci:
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

          // Rafraîchir les événements du calendrier
          const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
          const response = await fetch(`${apiUrl}/sujets`)
          if (response.ok) {
            const subjects: Subject[] = await response.json()

            // Convertir les sujets en événements du calendrier
            const subjectEvents: CalendarEvent[] = subjects.map((subject) => ({
              id: `subject-${subject.id_Sujet}`,
              title: `Date limite: ${subject.Titre}`,
              date: new Date(subject.Delai),
              type: "deadline",
              description: `Date limite pour soumettre: ${subject.sousTitre || subject.Titre}`,
            }))

            // Combiner avec les événements statiques existants
            setEvents((prev) => {
              const staticEvents = prev.filter((event) => !event.id.startsWith("subject-"))
              return [...staticEvents, ...subjectEvents]
            })
          }
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
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
      xhr.open("POST", `${apiUrl}/sujets`)
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

  const handleEditEvent = (event: CalendarEvent) => {
    setCurrentEvent(event)
    setEditedEvent({
      title: event.title,
      description: event.description,
      type: event.type,
    })
    setIsEditModalOpen(true)
  }

  const handleDeleteEvent = (event: CalendarEvent) => {
    setCurrentEvent(event)
    setIsDeleteModalOpen(true)
  }

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!currentEvent) return

    // Mettre à jour l'événement dans la liste
    setEvents(
      events.map((event) =>
        event.id === currentEvent.id
          ? { ...event, title: editedEvent.title, description: editedEvent.description, type: editedEvent.type }
          : event,
      ),
    )

    // Si c'est un événement lié à un sujet, mettre à jour via l'API
    if (currentEvent.id.startsWith("subject-")) {
      const subjectId = currentEvent.id.replace("subject-", "")
      // Ici, vous pourriez appeler votre API pour mettre à jour le sujet
      // Cette partie dépend de votre implémentation d'API
      showNotification("success", "Événement mis à jour avec succès")
    } else {
      showNotification("success", "Événement mis à jour avec succès")
    }

    setIsEditModalOpen(false)
  }

  const handleDeleteSubmit = () => {
    if (!currentEvent) return

    // Supprimer l'événement de la liste
    setEvents(events.filter((event) => event.id !== currentEvent.id))

    // Si c'est un événement lié à un sujet, supprimer via l'API
    if (currentEvent.id.startsWith("subject-")) {
      const subjectId = currentEvent.id.replace("subject-", "")
      // Ici, vous pourriez appeler votre API pour supprimer le sujet
      // Cette partie dépend de votre implémentation d'API
      showNotification("success", "Événement supprimé avec succès")
    } else {
      showNotification("success", "Événement supprimé avec succès")
    }

    setIsDeleteModalOpen(false)
  }

  const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setEditedEvent({
      ...editedEvent,
      [name]: value,
    })
  }

  const handleEditTypeChange = (value: string) => {
    setEditedEvent({
      ...editedEvent,
      type: value as "exercise" | "deadline" | "evaluation",
    })
  }

  const calendarDays = generateCalendarDays()
  const selectedDateEvents = selectedDate ? getEventsForDate(selectedDate) : []

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
                <h1 className="text-lg font-semibold text-gray-800 dark:text-white">Calendrier</h1>
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
              {isLoading && (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-6 border border-gray-100 dark:border-gray-700 flex justify-center">
                  <div className="text-gray-500 dark:text-gray-400">Chargement des événements...</div>
                </div>
              )}

              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 rounded-xl shadow-sm p-4 mb-6 border border-red-100 dark:border-red-800">
                  <div className="text-red-600 dark:text-red-400">{error}</div>
                </div>
              )}

              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-6 border border-gray-100 dark:border-gray-700">
                {/* Calendar Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
                  <div className="flex items-center mb-4 sm:mb-0">
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-white">{formatMonth(currentDate)}</h2>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={goToPreviousMonth}
                      className="p-2 rounded-lg border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>

                    <button
                      onClick={goToToday}
                      className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      Aujourd'hui
                    </button>

                    <button
                      onClick={goToNextMonth}
                      className="p-2 rounded-lg border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>

                    {userRole === "professor" && (
                      <button
                        className="flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors ml-2"
                        onClick={() => setIsModalOpen(true)}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        <span>Ajouter</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-px bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden">
                  {/* Day Headers */}
                  {["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"].map((day, index) => (
                    <div
                      key={index}
                      className="bg-gray-100 dark:bg-gray-800 p-2 text-center text-sm font-medium text-gray-500 dark:text-gray-400"
                    >
                      {day}
                    </div>
                  ))}

                  {/* Calendar Days */}
                  {calendarDays.map((date, index) => {
                    if (!date) {
                      return <div key={`empty-${index}`} className="bg-white dark:bg-gray-800 p-2 h-24 md:h-32"></div>
                    }

                    const dayEvents = getEventsForDate(date)
                    const isSelected = selectedDate && isSameDay(date, selectedDate)

                    return (
                      <div
                        key={`day-${index}`}
                        className={`bg-white dark:bg-gray-800 p-2 h-24 md:h-32 cursor-pointer transition-colors ${
                          isSelected ? "ring-2 ring-indigo-500 dark:ring-indigo-400 z-10 relative" : ""
                        } ${isToday(date) ? "bg-indigo-50 dark:bg-indigo-900/20" : ""}`}
                        onClick={() => setSelectedDate(date)}
                      >
                        <div className="flex justify-between items-start">
                          <span
                            className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-sm ${
                              isToday(date) ? "bg-indigo-600 text-white" : "text-gray-700 dark:text-gray-300"
                            }`}
                          >
                            {date.getDate()}
                          </span>
                        </div>

                        <div className="mt-2 space-y-1 overflow-y-auto max-h-[calc(100%-2rem)]">
                          {dayEvents.slice(0, 2).map((event, eventIndex) => (
                            <div
                              key={`event-${event.id}`}
                              className="flex items-center text-xs rounded px-1 py-0.5 bg-opacity-10 dark:bg-opacity-20"
                            >
                              <div className={`w-2 h-2 rounded-full mr-1 ${getEventTypeColor(event.type)}`}></div>
                              <span className="truncate text-gray-700 dark:text-gray-300">{event.title}</span>
                            </div>
                          ))}

                          {dayEvents.length > 2 && (
                            <div className="text-xs text-gray-500 dark:text-gray-400 pl-3">
                              +{dayEvents.length - 2} plus
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Selected Day Events */}
              {selectedDate && (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                    Événements du{" "}
                    {selectedDate.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
                  </h3>

                  {selectedDateEvents.length === 0 ? (
                    <p className="text-gray-500 dark:text-gray-400">Aucun événement prévu pour cette date</p>
                  ) : (
                    <div className="space-y-4">
                      {selectedDateEvents.map((event) => (
                        <div
                          key={event.id}
                          className="flex items-start p-3 rounded-lg border border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
                        >
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center ${
                              event.type === "exercise"
                                ? "bg-blue-100 dark:bg-blue-900/30"
                                : event.type === "deadline"
                                  ? "bg-red-100 dark:bg-red-900/30"
                                  : "bg-green-100 dark:bg-green-900/30"
                            }`}
                          >
                            {event.type === "exercise" ? (
                              <Database
                                className={`w-5 h-5 ${
                                  event.type === "exercise"
                                    ? "text-blue-600 dark:text-blue-400"
                                    : event.type === "deadline"
                                      ? "text-red-600 dark:text-red-400"
                                      : "text-green-600 dark:text-green-400"
                                }`}
                              />
                            ) : event.type === "deadline" ? (
                              <Clock className="w-5 h-5 text-red-600 dark:text-red-400" />
                            ) : (
                              <FileText className="w-5 h-5 text-green-600 dark:text-green-400" />
                            )}
                          </div>

                          <div className="ml-4 flex-1">
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-medium text-gray-800 dark:text-white">{event.title}</p>
                              <span
                                className={`text-xs px-2 py-1 rounded-full ${
                                  event.type === "exercise"
                                    ? "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300"
                                    : event.type === "deadline"
                                      ? "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300"
                                      : "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300"
                                }`}
                              >
                                {event.type === "exercise"
                                  ? "Exercice"
                                  : event.type === "deadline"
                                    ? "Date limite"
                                    : "Évaluation"}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{event.description}</p>

                            {/* Boutons d'action */}
                            <div className="flex justify-end mt-3 space-x-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleEditEvent(event)
                                }}
                                className="px-2 py-1 text-xs bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 rounded-md hover:bg-amber-200 dark:hover:bg-amber-800/50 transition-colors flex items-center"
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-3 w-3 mr-1"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                  />
                                </svg>
                                Modifier
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleDeleteEvent(event)
                                }}
                                className="px-2 py-1 text-xs bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 rounded-md hover:bg-red-200 dark:hover:bg-red-800/50 transition-colors flex items-center"
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-3 w-3 mr-1"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                  />
                                </svg>
                                Supprimer
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
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

      {/* Modal pour éditer un événement */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Modifier l'événement</DialogTitle>
            <DialogDescription>Modifiez les détails de l'événement sélectionné.</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleEditSubmit} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-title">Titre</Label>
              <Input
                id="edit-title"
                name="title"
                value={editedEvent.title}
                onChange={handleEditInputChange}
                placeholder="Titre de l'événement"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-type">Type</Label>
              <Select value={editedEvent.type} onValueChange={(value) => handleEditTypeChange(value)}>
                <SelectTrigger id="edit-type">
                  <SelectValue placeholder="Sélectionner un type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="exercise">Exercice</SelectItem>
                  <SelectItem value="deadline">Date limite</SelectItem>
                  <SelectItem value="evaluation">Évaluation</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                name="description"
                value={editedEvent.description}
                onChange={handleEditInputChange}
                placeholder="Description de l'événement"
                className="min-h-[100px]"
              />
            </div>

            <DialogFooter>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
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

      {/* Modal pour supprimer un événement */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Supprimer l'événement</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer cet événement ? Cette action est irréversible.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            {currentEvent && (
              <div className="p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                <p className="font-medium text-gray-800 dark:text-white">{currentEvent.title}</p>
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{currentEvent.description}</p>
              </div>
            )}
          </div>

          <DialogFooter>
            <button
              type="button"
              onClick={() => setIsDeleteModalOpen(false)}
              className="px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-800 dark:text-white rounded-lg transition-colors mr-2"
            >
              Annuler
            </button>
            <button
              type="button"
              onClick={handleDeleteSubmit}
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
