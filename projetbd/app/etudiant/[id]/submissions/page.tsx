"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import {
  Menu,
  Bell,
  ChevronDown,
  FileText,
  Clock,
  Check,
  Eye,
  Download,
  UploadCloud,
  X,
  Loader2,
  AlertTriangle,
} from "lucide-react"
import Sidebar from "../../../../components/Sidebar-etudiant"
import Link from "next/link"

type UserRole = "professor" | "student"

type Submission = {
  id_soumission: number
  idSujet: number
  idEtudiant: string
  fichier: string
  commentaire: string | null
  dateSoumission: string
  note: number | null
  feedback: string | null
  sujet_titre: string
  etudiant_nom: string | null
  etudiant_prenom: string | null
}

export default function SubmissionsPage() {
  // State
  const [userRole, setUserRole] = useState<UserRole>("student")
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [dragActive, setDragActive] = useState(false)
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedSubject, setSelectedSubject] = useState<string>("")
  const [subjects, setSubjects] = useState<{ id_Sujet: number; Titre: string }[]>([])
  const [comment, setComment] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)

  const fileInputRef = useRef<HTMLInputElement>(null)

  // Simuler un ID d'étudiant (à remplacer par des valeurs réelles)
  const etudiantId = "E12345" // Ceci devrait venir de l'authentification

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

  // Fetch submissions
  const fetchSubmissions = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
      const response = await fetch(`${apiUrl}/soumissions`)

      if (!response.ok) {
        throw new Error(`Erreur: ${response.status}`)
      }

      const data = await response.json()
      setSubmissions(data)
      setIsLoading(false)
    } catch (err) {
      console.error("Erreur lors du chargement des soumissions:", err)
      setError("Impossible de charger les soumissions. Veuillez réessayer plus tard.")
      setIsLoading(false)
    }
  }

  // Fetch subjects for dropdown
  const fetchSubjects = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
      const response = await fetch(`${apiUrl}/sujets`)

      if (!response.ok) {
        throw new Error(`Erreur: ${response.status}`)
      }

      const data = await response.json()
      setSubjects(data)
    } catch (err) {
      console.error("Erreur lors du chargement des sujets:", err)
    }
  }

  // File handling functions
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadedFile(e.target.files[0])
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

  const removeFile = () => {
    setUploadedFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
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

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!uploadedFile || !selectedSubject) {
      setSubmitError("Veuillez sélectionner un fichier et un exercice")
      return
    }

    setIsSubmitting(true)
    setSubmitError(null)
    setSubmitSuccess(null)
    setUploadProgress(0)

    try {
      // Créer un FormData pour envoyer les fichiers
      const formData = new FormData()

      // Ajouter les métadonnées
      formData.append("id_sujet", selectedSubject)
      formData.append("id_etudiant", etudiantId)
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
          setSubmitSuccess("Votre soumission a été envoyée avec succès !")

          // Réinitialiser le formulaire
          setUploadedFile(null)
          setComment("")
          setSelectedSubject("")

          // Rafraîchir la liste des soumissions
          fetchSubmissions()
        } else {
          const errorData = JSON.parse(xhr.responseText)
          throw new Error(errorData.error || "Erreur lors de la soumission")
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

  // Get status color based on evaluation status
  const getStatusColor = (submission: Submission) => {
    if (submission.note !== null) {
      return "bg-green-500" // Évalué
    }
    return "bg-yellow-500" // En attente
  }

  // Get status text based on evaluation status
  const getStatusText = (submission: Submission) => {
    if (submission.note !== null) {
      return "Évalué"
    }
    return "En attente"
  }

  // Check system preference for dark mode on mount
  useEffect(() => {
    if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
      setIsDarkMode(true)
      document.documentElement.classList.add("dark")
    }
  }, [])

  // Fetch data on component mount
  useEffect(() => {
    fetchSubmissions()
    fetchSubjects()
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
                <h1 className="text-lg font-semibold text-gray-800 dark:text-white">
                  {userRole === "professor" ? "Soumissions des étudiants" : "Mes soumissions"}
                </h1>
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
                <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-6">
                  {userRole === "professor" ? "Soumissions des étudiants" : "Mes soumissions"}
                </h2>

                {userRole === "student" && (
                  <div className="mb-8">
                    <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-4">Nouvelle soumission</h3>

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

                    <form onSubmit={handleSubmit}>
                      <div className="mb-4">
                        <label
                          htmlFor="subject"
                          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                        >
                          Sélectionner un exercice
                        </label>
                        <select
                          id="subject"
                          value={selectedSubject}
                          onChange={(e) => setSelectedSubject(e.target.value)}
                          className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400"
                          required
                        >
                          <option value="">Sélectionner un exercice</option>
                          {subjects.map((subject) => (
                            <option key={subject.id_Sujet} value={subject.id_Sujet}>
                              {subject.Titre}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div
                        className={`mb-6 border ${dragActive ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20" : "border-dashed border-gray-300 dark:border-gray-600"} rounded-lg p-8`}
                        onDragEnter={handleDrag}
                        onDragLeave={handleDrag}
                        onDragOver={handleDrag}
                        onDrop={handleDrop}
                      >
                        <div className="flex flex-col items-center justify-center text-center">
                          <UploadCloud className="w-12 h-12 text-gray-400 dark:text-gray-500 mb-4" />
                          <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-2">Déposer un fichier</h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                            Glissez-déposez votre fichier PDF ici ou cliquez pour parcourir
                          </p>
                          <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            accept=".pdf,.doc,.docx,.zip"
                            className="hidden"
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
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                {formatFileSize(uploadedFile.size)}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="mb-4">
                        <label
                          htmlFor="comment"
                          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                        >
                          Commentaires (optionnel)
                        </label>
                        <textarea
                          id="comment"
                          value={comment}
                          onChange={(e) => setComment(e.target.value)}
                          rows={3}
                          className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400"
                          placeholder="Ajoutez des commentaires ou des questions pour votre professeur..."
                        />
                      </div>

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

                      <div className="flex justify-end">
                        <button
                          type="submit"
                          className={`px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors ${
                            !uploadedFile || !selectedSubject || isSubmitting ? "opacity-50 cursor-not-allowed" : ""
                          }`}
                          disabled={!uploadedFile || !selectedSubject || isSubmitting}
                        >
                          {isSubmitting ? "Envoi en cours..." : "Soumettre le fichier"}
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-4">
                  {userRole === "professor" ? "Liste des soumissions" : "Mes soumissions précédentes"}
                </h3>

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
                ) : submissions.length === 0 ? (
                  <div className="text-center py-12 bg-gray-50 dark:bg-gray-700/30 rounded-lg border border-gray-200 dark:border-gray-600">
                    <FileText className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-2">
                      Aucune soumission trouvée
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400">
                      {userRole === "professor"
                        ? "Aucun étudiant n'a encore soumis de réponse."
                        : "Vous n'avez pas encore soumis de réponse à un exercice."}
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {submissions.map((submission) => (
                      <div
                        key={submission.id_soumission}
                        className="bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow overflow-hidden"
                      >
                        <div className="p-4 border-b border-gray-100 dark:border-gray-700">
                          <div className="flex items-center">
                            {userRole === "professor" && (
                              <>
                                <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-medium mr-3">
                                  {submission.etudiant_prenom && submission.etudiant_nom
                                    ? `${submission.etudiant_prenom[0]}${submission.etudiant_nom[0]}`
                                    : "??"}
                                </div>
                                <div>
                                  <p className="font-medium text-gray-800 dark:text-white">
                                    {submission.etudiant_prenom && submission.etudiant_nom
                                      ? `${submission.etudiant_prenom} ${submission.etudiant_nom}`
                                      : "Étudiant inconnu"}
                                  </p>
                                  <p className="text-xs text-gray-500 dark:text-gray-400">
                                    ID: {submission.idEtudiant}
                                  </p>
                                </div>
                              </>
                            )}
                            {userRole === "student" && (
                              <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-medium">
                                Moi
                              </div>
                            )}
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
                            {submission.note !== null && (
                              <div className="text-sm font-medium text-gray-800 dark:text-white">
                                Note: {submission.note}/20
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="bg-gray-50 dark:bg-gray-700/30 p-3 flex justify-end space-x-2">
                          <a
                            href={submission.fichier}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                          >
                            <Download className="w-5 h-5" />
                          </a>
                          {userRole === "professor" && getStatusText(submission) === "En attente" && (
                            <button className="p-2 text-green-600 dark:text-green-400 hover:text-green-900 dark:hover:text-green-100 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors">
                              <Check className="w-5 h-5" />
                            </button>
                          )}
                          <Link
                            href={`/submission-detail/${submission.id_soumission}`}
                            className="p-2 text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-100 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors inline-flex"
                          >
                            <Eye className="w-5 h-5" />
                          </Link>
                        </div>
                      </div>
                    ))}
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
