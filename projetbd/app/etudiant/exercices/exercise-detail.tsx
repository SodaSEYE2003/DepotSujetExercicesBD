"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  Database,
  Sun,
  Moon,
  ChevronDown,
  Home,
  ChevronRight,
  Clock,
  User,
  FileText,
  Download,
  LinkIcon,
  ExternalLink,
  UploadCloud,
  X,
  Check,
  Loader2,
  ArrowLeft,
  Edit,
  Trash2,
  AlertTriangle,
  ChevronUp,
} from "lucide-react"

interface Subject {
  id: number
  Titre: string
  sousTitre: string | null
  Delai: string
  TypeDeSujet: string
  Description: string | null
  status: string
  file: string | null
  correctionUrl: string | null
  DateDeDepot: string
  idProfesseur: number | null
  professeurNom?: string
  professeurPrenom?: string
}

export default function ExerciseDetail({ params }: { params: { id: string } }) {
  const router = useRouter()
  const isEmbedded = !router.isReady // Si le router n'est pas prêt, c'est qu'on est en mode intégré
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [subject, setSubject] = useState<Subject | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [comment, setComment] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [existingSubmission, setExistingSubmission] = useState<any>(null)
  const [isCheckingSubmission, setIsCheckingSubmission] = useState(true)
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [showExerciseContent, setShowExerciseContent] = useState(true)
  const [isDeadlinePassed, setIsDeadlinePassed] = useState(false)

  // Remplacer cette ligne:
  // const etudiantId = "E12345" // Ceci devrait venir de l'authentification

  // Par ce code qui récupère l'ID de l'utilisateur connecté:
  const [etudiantId, setEtudiantId] = useState<number | null>(null)

  // Ajouter un useEffect pour récupérer l'ID de l'utilisateur connecté
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const session = await fetch("/api/auth/session")
        const sessionData = await session.json()

        if (sessionData && sessionData.user && sessionData.user.id) {
          setEtudiantId(sessionData.user.id)
          console.log("ID de l'étudiant connecté:", sessionData.user.id)
        } else {
          console.error("Impossible de récupérer l'ID de l'utilisateur connecté")
          setError("Vous devez être connecté pour soumettre un exercice")
        }
      } catch (err) {
        console.error("Erreur lors de la récupération des données utilisateur:", err)
        setError("Erreur lors de la récupération des données utilisateur")
      }
    }

    fetchUserData()
  }, [])

  // Methods
  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode)
    if (!isDarkMode) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadedFile(e.target.files[0])
    }
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setUploadedFile(e.dataTransfer.files[0])
    }
  }

  const removeFile = () => {
    setUploadedFile(null)
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  // Format date
  const formatDate = (dateString: string) => {
    if (!dateString) return "Date non définie"
    const date = new Date(dateString)
    return date.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })
  }

  // Calculate days until deadline
  const getDaysUntilDeadline = (deadlineDate: string) => {
    if (!deadlineDate) return 0

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const deadline = new Date(deadlineDate)
    deadline.setHours(0, 0, 0, 0)

    const diffTime = deadline.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    return diffDays
  }

  // Vérifier si la date limite est dépassée
  const checkDeadlinePassed = (deadlineDate: string) => {
    if (!deadlineDate) return false

    const today = new Date()
    const deadline = new Date(deadlineDate)
    return today > deadline
  }

  // Fonction pour vérifier si une soumission existe déjà
  // Remplacer:
  // const checkExistingSubmission = async (sujetId: string, etudiantId: string) => {

  // Par:
  const checkExistingSubmission = async (sujetId: string, studentId: number | null) => {
    if (!studentId) {
      console.log("ID étudiant non disponible, impossible de vérifier les soumissions existantes")
      return
    }
    try {
      setIsCheckingSubmission(true)
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
      const response = await fetch(`${apiUrl}/soumissions/check/${sujetId}/${studentId}`)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `Erreur: ${response.status}`)
      }

      const data = await response.json()
      if (data.exists) {
        setExistingSubmission(data.submission)
      }
    } catch (error) {
      console.error("Erreur lors de la vérification des soumissions:", error)
      // Don't set an error state here, just log it
    } finally {
      setIsCheckingSubmission(false)
    }
  }

  // Fonction pour annuler une soumission
  const handleCancelSubmission = async () => {
    if (!existingSubmission) return

    try {
      setIsDeleting(true)
      setDeleteError(null)

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
      const response = await fetch(`${apiUrl}/soumissions/${existingSubmission.id_soumission}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Erreur lors de la suppression de la soumission")
      }

      // Réinitialiser les états
      setExistingSubmission(null)
      setSubmitSuccess("Votre soumission a été annulée avec succès.")
      setTimeout(() => {
        setSubmitSuccess(null)
      }, 5000)
    } catch (error) {
      console.error("Erreur:", error)
      setDeleteError(error instanceof Error ? error.message : "Une erreur est survenue lors de l'annulation")
    } finally {
      setIsDeleting(false)
    }
  }

  // Fonction pour passer en mode édition
  const handleEditSubmission = () => {
    if (!existingSubmission) return

    setIsEditing(true)
    setComment(existingSubmission.commentaire || "")
  }

  // Fonction pour annuler l'édition
  const handleCancelEdit = () => {
    setIsEditing(false)
    setUploadedFile(null)
    setComment(existingSubmission?.commentaire || "")
  }

  // Fonction pour mettre à jour une soumission
  const handleUpdateSubmission = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!existingSubmission) return

    setIsSubmitting(true)
    setSubmitError(null)
    setSubmitSuccess(null)
    setUploadProgress(0)

    try {
      // Créer un FormData pour envoyer les fichiers
      const formData = new FormData()

      // Ajouter le commentaire
      formData.append("commentaire", comment)

      // Ajouter le fichier de soumission s'il y en a un nouveau
      if (uploadedFile) {
        formData.append("fichier", uploadedFile)
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
          setSubmitSuccess("Votre soumission a été mise à jour avec succès !")

          // Mettre à jour l'état pour refléter la soumission mise à jour
          setExistingSubmission({
            ...existingSubmission,
            fichier: data.fichierUrl,
            commentaire: comment,
            dateSoumission: new Date().toISOString(),
          })

          // Réinitialiser le formulaire
          setUploadedFile(null)
          setIsEditing(false)
        } else {
          const errorData = JSON.parse(xhr.responseText)
          throw new Error(errorData.error || "Erreur lors de la mise à jour")
        }
        setIsSubmitting(false)
        setUploadProgress(0)
      })

      xhr.addEventListener("error", () => {
        setSubmitError("Une erreur est survenue lors de l'envoi de votre mise à jour")
        setIsSubmitting(false)
        setUploadProgress(0)
      })

      // Envoyer la requête au backend
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
      xhr.open("PUT", `${apiUrl}/soumissions/${existingSubmission.id_soumission}`)
      xhr.send(formData)
    } catch (error) {
      console.error("Erreur:", error)
      setSubmitError(error instanceof Error ? error.message : "Une erreur est survenue lors de la mise à jour")
      setIsSubmitting(false)
      setUploadProgress(0)
    }
  }

  // Handle file browse click
  const handleBrowseClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  // Fetch subject data
  useEffect(() => {
    const fetchSubject = async () => {
      try {
        setIsLoading(true)
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
        const response = await fetch(`${apiUrl}/sujets/${params.id}`)

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(errorData.message || `Erreur: ${response.status}`)
        }

        const data: Subject = await response.json()
        console.log("Données du sujet récupérées:", data)
        setSubject(data)

        // Vérifier si la date limite est dépassée
        setIsDeadlinePassed(checkDeadlinePassed(data.Delai))

        // Vérifier si une soumission existe déjà pour cet étudiant et ce sujet
        // Remplacer:
        // await checkExistingSubmission(params.id, etudiantId)
        // Par:
        if (etudiantId) {
          await checkExistingSubmission(params.id, etudiantId)
        }

        setIsLoading(false)
      } catch (err) {
        console.error("Erreur lors du chargement du sujet:", err)
        setError(
          err instanceof Error
            ? err.message
            : "Impossible de charger les détails de l'exercice. L'API pourrait être inaccessible.",
        )
        setIsLoading(false)
      }
    }

    if (params.id) {
      fetchSubject()
    }
  }, [params.id, etudiantId])

  // Check system preference for dark mode on mount
  useEffect(() => {
    if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
      setIsDarkMode(true)
      document.documentElement.classList.add("dark")
    }
  }, [])

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Si une soumission existe déjà, empêcher une nouvelle soumission
    if (existingSubmission) {
      setSubmitError("Vous avez déjà soumis une réponse pour cet exercice")
      return
    }

    if (!uploadedFile || !subject) {
      setSubmitError("Veuillez sélectionner un fichier à soumettre")
      return
    }

    setIsSubmitting(true)
    setSubmitError(null)
    setSubmitSuccess(null)
    setUploadProgress(0)

    try {
      // Créer un FormData pour envoyer les fichiers
      const formData = new FormData()

      // Ajouter les métadonnées avec les noms de champs corrects
      formData.append("id_sujet", subject.id.toString()) // Sera mappé à idSujet dans le backend
      // Dans la fonction handleSubmit, remplacer:
      // formData.append("id_etudiant", etudiantId)
      // Par:
      if (!etudiantId) {
        setSubmitError("Impossible de soumettre: ID étudiant non disponible")
        setIsSubmitting(false)
        return
      }
      formData.append("etudiant_id", etudiantId.toString()) // Utiliser le nom de colonne correct
      console.log("ID étudiant envoyé dans la soumission:", etudiantId)
      formData.append("commentaire", comment)

      // Ajouter le fichier de soumission
      formData.append("fichier", uploadedFile)

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
          setSubmitSuccess(
            "Votre soumission a été envoyée avec succès ! Vous pouvez la modifier ou l'annuler avant la date limite.",
          )

          // Mettre à jour l'état pour indiquer qu'une soumission existe maintenant
          setExistingSubmission({
            id_soumission: data.id,
            fichier: data.fichierUrl,
            commentaire: comment,
            dateSoumission: new Date().toISOString(),
          })

          // Réinitialiser le formulaire
          setUploadedFile(null)
          setComment("")
        } else {
          const errorData = JSON.parse(xhr.responseText)

          // Si l'erreur est due à une soumission existante, mettre à jour l'état
          if (errorData.existingSubmission) {
            setExistingSubmission(errorData.existingSubmission)
            setSubmitError("Vous avez déjà soumis une réponse pour cet exercice")
          } else {
            throw new Error(errorData.error || "Erreur lors de la soumission")
          }
        }
        setIsSubmitting(false)
        setUploadProgress(0)
      })

      xhr.addEventListener("error", () => {
        setSubmitError("Une erreur est survenue lors de l'envoi de votre soumission")
        setIsSubmitting(false)
        setUploadProgress(0)
      })

      // Envoyer la requête au backend
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
      xhr.open("POST", `${apiUrl}/soumissions`)
      xhr.send(formData)
    } catch (error) {
      console.error("Erreur:", error)
      setSubmitError(error instanceof Error ? error.message : "Une erreur est survenue lors de la soumission")
      setIsSubmitting(false)
      setUploadProgress(0)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 transition-colors duration-500 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mb-4" />
          <p className="text-gray-600 dark:text-gray-300">Chargement de l'exercice...</p>
        </div>
      </div>
    )
  }

  if (error || !subject) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 transition-colors duration-500 flex items-center justify-center">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-8 max-w-md mx-auto text-center border border-gray-100 dark:border-gray-700">
          <div className="text-red-600 dark:text-red-400 mb-4 text-xl">{error || "Exercice non trouvé"}</div>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Impossible de charger les détails de cet exercice. Veuillez réessayer plus tard.
          </p>
          <button
            onClick={() => router.push("/subjects-gallery")}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors inline-flex items-center"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour aux exercices
          </button>
        </div>
      </div>
    )
  }

  const daysUntilDeadline = getDaysUntilDeadline(subject.Delai)
  const deadlineStatus =
    daysUntilDeadline < 0
      ? "Terminé"
      : daysUntilDeadline === 0
        ? "Dernier jour !"
        : `${daysUntilDeadline} jour${daysUntilDeadline > 1 ? "s" : ""} restant${daysUntilDeadline > 1 ? "s" : ""}`

  return (
    <div
      className={
        isEmbedded
          ? ""
          : "min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 transition-colors duration-500"
      }
    >
      {/* Header - only show if not embedded */}
      {!isEmbedded && (
        <header className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center">
                <Link href="/subjects-gallery" className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                    <Database className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-lg font-semibold text-gray-800 dark:text-white">DB Eval</span>
                </Link>
              </div>

              <div className="flex items-center space-x-4">
                <button
                  onClick={toggleDarkMode}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  {isDarkMode ? (
                    <Sun className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  ) : (
                    <Moon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  )}
                </button>

                <div className="relative">
                  <button className="flex items-center space-x-1 text-sm text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors">
                    <Image
                      src="https://i.pravatar.cc/32?img=8"
                      alt="Avatar"
                      width={32}
                      height={32}
                      className="w-8 h-8 rounded-full border-2 border-indigo-500"
                    />
                    <ChevronDown className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </header>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumbs - only show if not embedded */}
        {!isEmbedded && (
          <nav className="flex mb-6" aria-label="Breadcrumb">
            <ol className="inline-flex items-center space-x-1 md:space-x-3">
              <li className="inline-flex items-center">
                <Link
                  href="/dashboard"
                  className="inline-flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400"
                >
                  <Home className="w-4 h-4 mr-2" />
                  Accueil
                </Link>
              </li>
              <li>
                <div className="flex items-center">
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                  <Link
                    href="/subjects-gallery"
                    className="ml-1 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400"
                  >
                    Exercices
                  </Link>
                </div>
              </li>
              <li aria-current="page">
                <div className="flex items-center">
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                  <span className="ml-1 text-sm font-medium text-gray-500 dark:text-gray-400">
                    {subject.Titre || "Sans titre"}
                  </span>
                </div>
              </li>
            </ol>
          </nav>
        )}

        {/* Exercise Header */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-6 border border-gray-100 dark:border-gray-700">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <div className="flex items-center mb-2">
                <span className="px-2 py-1 text-xs rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 mr-2">
                  {subject.TypeDeSujet}
                </span>
                <span
                  className={`px-2 py-1 text-xs rounded-full ${
                    daysUntilDeadline < 0
                      ? "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300"
                      : daysUntilDeadline <= 3
                        ? "bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300"
                        : "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300"
                  }`}
                >
                  {deadlineStatus}
                </span>
              </div>
              <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">{subject.Titre || "Sans titre"}</h1>
              <p className="text-gray-600 dark:text-gray-300">{subject.sousTitre || ""}</p>
            </div>

            <div className="mt-4 md:mt-0 flex flex-col items-end">
              <div className="flex items-center space-x-2 mb-2">
                <Clock className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  Date limite: {formatDate(subject.Delai)}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <User className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  {subject.professeurNom && subject.professeurPrenom
                    ? `Prof. ${subject.professeurPrenom} ${subject.professeurNom}`
                    : subject.idProfesseur
                      ? `Professeur ID: ${subject.idProfesseur}`
                      : "Professeur non assigné"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Exercise Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Exercise Description */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Description</h2>

              <div className="prose dark:prose-invert max-w-none">
                {subject.Description ? (
                  <div dangerouslySetInnerHTML={{ __html: subject.Description }} />
                ) : (
                  <p>
                    Dans cet exercice, vous allez travailler avec une base de données comprenant plusieurs tables
                    interconnectées. Vous devrez écrire des requêtes SQL avancées pour extraire des informations
                    pertinentes et résoudre des problèmes d&apos;analyse de données.
                  </p>
                )}

                {/* Default content if no specific description is provided */}
                {!subject.Description && (
                  <>
                    <h3>Objectifs d&apos;apprentissage</h3>
                    <ul>
                      <li>Maîtriser les jointures complexes (INNER, LEFT, RIGHT, FULL)</li>
                      <li>Utiliser des sous-requêtes efficacement</li>
                      <li>Appliquer des fonctions d&apos;agrégation et de fenêtrage</li>
                      <li>Optimiser les requêtes pour de meilleures performances</li>
                    </ul>

                    <h3>Consignes de soumission</h3>
                    <p>Soumettez vos réponses dans un fichier PDF contenant :</p>
                    <ul>
                      <li>Les requêtes SQL pour chaque exercice</li>
                      <li>Une explication de votre approche pour chaque requête</li>
                      <li>Les résultats attendus (vous pouvez utiliser des exemples fictifs)</li>
                      <li>
                        Pour l&apos;exercice d&apos;optimisation, expliquez pourquoi votre solution est plus performante
                      </li>
                    </ul>
                  </>
                )}
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Ressources supplémentaires</h2>

              <div className="space-y-4">
                {subject.file && (
                  <div className="flex items-center p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                    <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                      <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="ml-4 flex-1">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-800 dark:text-white">Fichier d'exercice</p>
                        <a
                          href={subject.file}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300"
                        >
                          <Download className="w-5 h-5" />
                        </a>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Télécharger le fichier d'exercice</p>
                    </div>
                  </div>
                )}

                {subject.correctionUrl && (
                  <div className="flex items-center p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                    <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                      <Database className="w-5 h-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div className="ml-4 flex-1">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-800 dark:text-white">Modèle de correction</p>
                        <a
                          href={subject.correctionUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300"
                        >
                          <Download className="w-5 h-5" />
                        </a>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Télécharger le modèle de correction
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex items-center p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                  <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                    <LinkIcon className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div className="ml-4 flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-800 dark:text-white">Guide d&apos;optimisation SQL</p>
                      <a
                        href="#"
                        className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300"
                      >
                        <ExternalLink className="w-5 h-5" />
                      </a>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Ressource externe sur l&apos;optimisation des requêtes
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Submission and Status */}
          <div className="space-y-6">
            {/* Section de soumission */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Soumettre votre réponse</h2>
                <button
                  onClick={() => setShowExerciseContent(!showExerciseContent)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  {showExerciseContent ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </button>
              </div>

              {/* Contenu de l'exercice (collapsible) */}
              {showExerciseContent && (
                <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700/30 rounded-lg border border-gray-200 dark:border-gray-600">
                  <h3 className="text-md font-medium text-gray-800 dark:text-white mb-2">Contenu de l'exercice</h3>
                  <div className="prose dark:prose-invert prose-sm max-h-60 overflow-y-auto">
                    {subject.Description ? (
                      <div dangerouslySetInnerHTML={{ __html: subject.Description }} />
                    ) : (
                      <p>
                        Dans cet exercice, vous allez travailler avec une base de données comprenant plusieurs tables
                        interconnectées. Vous devrez écrire des requêtes SQL avancées pour extraire des informations
                        pertinentes et résoudre des problèmes d&apos;analyse de données.
                      </p>
                    )}
                  </div>
                  {subject.file && (
                    <div className="mt-2">
                      <a
                        href={subject.file}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline flex items-center"
                      >
                        <Download className="w-3 h-3 mr-1" />
                        Télécharger le fichier d'exercice
                      </a>
                    </div>
                  )}
                </div>
              )}

              {isCheckingSubmission ? (
                <div className="flex items-center justify-center p-6">
                  <Loader2 className="w-6 h-6 text-indigo-600 animate-spin mr-2" />
                  <span className="text-gray-600 dark:text-gray-300">Vérification des soumissions...</span>
                </div>
              ) : existingSubmission && !isEditing ? (
                <div className="mb-6">
                  <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800/30 rounded-lg">
                    <div className="flex items-center mb-2">
                      <Check className="w-5 h-5 text-green-600 dark:text-green-400 mr-2" />
                      <h3 className="text-lg font-medium text-green-700 dark:text-green-300">Exercice déjà soumis</h3>
                    </div>
                    <p className="text-green-700 dark:text-green-300 mb-4">
                      Vous avez soumis une réponse pour cet exercice le{" "}
                      {new Date(existingSubmission.dateSoumission).toLocaleDateString("fr-FR", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                      .
                    </p>

                    <div className="flex items-center p-3 rounded-lg bg-white dark:bg-gray-700 border border-green-200 dark:border-green-800/30">
                      <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                        <FileText className="w-5 h-5 text-green-600 dark:text-green-400" />
                      </div>
                      <div className="ml-4 flex-1">
                        <p className="text-sm font-medium text-gray-800 dark:text-white">Votre soumission</p>
                        <a
                          href={existingSubmission.fichier}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline flex items-center mt-1"
                        >
                          <Download className="w-3 h-3 mr-1" />
                          Télécharger votre fichier
                        </a>
                      </div>
                    </div>

                    {existingSubmission.commentaire && (
                      <div className="mt-4">
                        <h4 className="text-sm font-medium text-green-700 dark:text-green-300 mb-1">
                          Votre commentaire:
                        </h4>
                        <p className="text-sm text-green-700 dark:text-green-300 bg-white dark:bg-gray-700 p-3 rounded-lg border border-green-200 dark:border-green-800/30">
                          {existingSubmission.commentaire}
                        </p>
                      </div>
                    )}

                    {/* Boutons d'action pour modifier/annuler la soumission */}
                    {!isDeadlinePassed && (
                      <div className="mt-4 flex flex-col sm:flex-row gap-2">
                        <button
                          onClick={handleEditSubmission}
                          className="flex-1 py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors flex items-center justify-center"
                          disabled={isDeleting}
                        >
                          <Edit className="w-4 h-4 mr-2" />
                          Modifier
                        </button>
                        <button
                          onClick={handleCancelSubmission}
                          className="flex-1 py-2 px-4 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors flex items-center justify-center"
                          disabled={isDeleting}
                        >
                          {isDeleting ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Annulation...
                            </>
                          ) : (
                            <>
                              <Trash2 className="w-4 h-4 mr-2" />
                              Annuler
                            </>
                          )}
                        </button>
                      </div>
                    )}

                    {isDeadlinePassed && (
                      <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800/30 rounded-lg">
                        <div className="flex items-start">
                          <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mr-2 flex-shrink-0" />
                          <p className="text-sm text-yellow-700 dark:text-yellow-300">
                            La date limite est dépassée. Vous ne pouvez plus modifier ou annuler votre soumission.
                          </p>
                        </div>
                      </div>
                    )}

                    {deleteError && (
                      <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30 rounded-lg text-red-700 dark:text-red-300">
                        {deleteError}
                      </div>
                    )}

                    <div className="mt-4">
                      <Link
                        href="/submissions"
                        className="inline-flex items-center text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300"
                      >
                        <ChevronRight className="w-4 h-4 mr-1" />
                        Voir toutes vos soumissions
                      </Link>
                    </div>
                  </div>
                </div>
              ) : existingSubmission && isEditing ? (
                // Formulaire de modification
                <>
                  {submitSuccess && (
                    <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800/30 rounded-lg text-green-700 dark:text-green-300">
                      {submitSuccess}
                    </div>
                  )}

                  {submitError && (
                    <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30 rounded-lg text-red-700 dark:text-red-300">
                      {submitError}
                    </div>
                  )}

                  <form onSubmit={handleUpdateSubmission}>
                    <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800/30 rounded-lg">
                      <div className="flex items-start">
                        <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mr-2 flex-shrink-0" />
                        <div>
                          <h4 className="text-sm font-medium text-yellow-800 dark:text-yellow-300">
                            Modification de votre soumission
                          </h4>
                          <p className="text-xs text-yellow-700 dark:text-yellow-200 mt-1">
                            Vous êtes en train de modifier votre soumission existante. Si vous ne téléchargez pas un
                            nouveau fichier, votre fichier actuel sera conservé.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div
                      className="mb-6 border border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6"
                      onDragOver={handleDragOver}
                      onDrop={handleDrop}
                    >
                      <div className="flex flex-col items-center justify-center text-center">
                        <UploadCloud className="w-12 h-12 text-gray-400 dark:text-gray-500 mb-4" />
                        <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-2">
                          Déposer un nouveau fichier (optionnel)
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                          Glissez-déposez votre fichier PDF ici ou cliquez pour parcourir
                        </p>
                        <input
                          type="file"
                          ref={fileInputRef}
                          onChange={handleFileUpload}
                          className="hidden"
                          accept=".pdf,.doc,.docx,.zip"
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

                    {uploadedFile && (
                      <div className="mb-6">
                        <div className="flex items-center p-3 rounded-lg bg-gray-50 dark:bg-gray-700/30 border border-gray-200 dark:border-gray-600">
                          <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                            <FileText className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
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
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              {formatFileSize(uploadedFile.size)}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {isSubmitting && (
                      <div className="mb-6">
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                          <div
                            className="bg-indigo-600 h-2.5 rounded-full transition-all duration-300"
                            style={{ width: `${uploadProgress}%` }}
                          ></div>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
                          Envoi en cours... {uploadProgress}%
                        </p>
                      </div>
                    )}

                    <div className="mb-4">
                      <label
                        htmlFor="comments"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                      >
                        Commentaires (optionnel)
                      </label>
                      <textarea
                        id="comments"
                        rows={3}
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Ajoutez des commentaires ou des questions pour votre professeur..."
                        className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400"
                      />
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2">
                      <button
                        type="submit"
                        className="flex-1 py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors duration-300 flex items-center justify-center"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Mise à jour...
                          </>
                        ) : (
                          <>
                            <Check className="w-4 h-4 mr-2" />
                            Mettre à jour
                          </>
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={handleCancelEdit}
                        className="flex-1 py-2 px-4 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-white rounded-lg transition-colors duration-300"
                        disabled={isSubmitting}
                      >
                        Annuler
                      </button>
                    </div>
                  </form>
                </>
              ) : (
                // Formulaire de soumission initial
                <>
                  {submitSuccess && (
                    <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800/30 rounded-lg text-green-700 dark:text-green-300">
                      {submitSuccess}
                    </div>
                  )}

                  {submitError && (
                    <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30 rounded-lg text-red-700 dark:text-red-300">
                      {submitError}
                    </div>
                  )}

                  {isDeadlinePassed ? (
                    <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30 rounded-lg">
                      <div className="flex items-start">
                        <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 mr-2 flex-shrink-0" />
                        <div>
                          <h4 className="text-sm font-medium text-red-800 dark:text-red-300">Date limite dépassée</h4>
                          <p className="text-xs text-red-700 dark:text-red-200 mt-1">
                            La date limite de soumission pour cet exercice est dépassée. Vous ne pouvez plus soumettre
                            de réponse.
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit}>
                      <div
                        className="mb-6 border border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6"
                        onDragOver={handleDragOver}
                        onDrop={handleDrop}
                      >
                        <div className="flex flex-col items-center justify-center text-center">
                          <UploadCloud className="w-12 h-12 text-gray-400 dark:text-gray-500 mb-4" />
                          <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-2">
                            Déposer votre fichier
                          </h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                            Glissez-déposez votre fichier PDF ici ou cliquez pour parcourir
                          </p>
                          <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileUpload}
                            className="hidden"
                            accept=".pdf,.doc,.docx,.zip"
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

                      {uploadedFile && (
                        <div className="mb-6">
                          <div className="flex items-center p-3 rounded-lg bg-gray-50 dark:bg-gray-700/30 border border-gray-200 dark:border-gray-600">
                            <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                              <FileText className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
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
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                {formatFileSize(uploadedFile.size)}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {isSubmitting && (
                        <div className="mb-6">
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                            <div
                              className="bg-indigo-600 h-2.5 rounded-full transition-all duration-300"
                              style={{ width: `${uploadProgress}%` }}
                            ></div>
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
                            Envoi en cours... {uploadProgress}%
                          </p>
                        </div>
                      )}

                      <div className="mb-4">
                        <label
                          htmlFor="comments"
                          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                        >
                          Commentaires (optionnel)
                        </label>
                        <textarea
                          id="comments"
                          rows={3}
                          value={comment}
                          onChange={(e) => setComment(e.target.value)}
                          placeholder="Ajoutez des commentaires ou des questions pour votre professeur..."
                          className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400"
                        />
                      </div>

                      <button
                        type="submit"
                        className="w-full py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors duration-300 flex items-center justify-center"
                        disabled={isSubmitting || !uploadedFile}
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Soumission en cours...
                          </>
                        ) : (
                          <>
                            <UploadCloud className="w-4 h-4 mr-2" />
                            Soumettre
                          </>
                        )}
                      </button>
                    </form>
                  )}
                </>
              )}
            </div>

            {/* Informations sur la date limite */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Informations</h2>

              <div className="space-y-4">
                <div className="flex items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      daysUntilDeadline < 0
                        ? "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400"
                        : daysUntilDeadline <= 3
                          ? "bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400"
                          : "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400"
                    }`}
                  >
                    <Clock className="w-5 h-5" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-800 dark:text-white">Date limite</p>
                    <p
                      className={`text-xs ${
                        daysUntilDeadline < 0
                          ? "text-red-600 dark:text-red-400"
                          : daysUntilDeadline <= 3
                            ? "text-orange-600 dark:text-orange-400"
                            : "text-green-600 dark:text-green-400"
                      }`}
                    >
                      {formatDate(subject.Delai)} ({deadlineStatus})
                    </p>
                  </div>
                </div>

                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                    <Database className="w-5 h-5" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-800 dark:text-white">Type d'exercice</p>
                    <p className="text-xs text-blue-600 dark:text-blue-400">{subject.TypeDeSujet}</p>
                  </div>
                </div>

                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                    <User className="w-5 h-5" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-800 dark:text-white">Professeur</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {subject.professeurNom && subject.professeurPrenom
                        ? `${subject.professeurPrenom} ${subject.professeurNom}`
                        : subject.idProfesseur
                          ? `ID: ${subject.idProfesseur}`
                          : "Non assigné"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
