"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import {
  Search,
  Filter,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Download,
  Eye,
  Calendar,
  Loader2,
  GraduationCap,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Navbar } from "../../../components/navbar"

// Types pour les soumissions
interface Soumission {
  id: number
  fichier: string
  etudiant_id: number
  sujet_id: number
  commentaire: string | null
  dateSoumission: string
  note?: number | null
  feedback?: string | null
  sujet_titre?: string
  typeDeSujet?: string
  delai?: string
  etudiant_nom?: string
  etudiant_prenom?: string
  professeurNom?: string
  professeurPrenom?: string
}

export default function MesCopiesPage() {
  const [darkMode, setDarkMode] = useState(false)
  const [soumissions, setSoumissions] = useState<Soumission[]>([])
  const [filteredSoumissions, setFilteredSoumissions] = useState<Soumission[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("Tous")
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Soumission
    direction: "ascending" | "descending"
  }>({
    key: "dateSoumission",
    direction: "descending",
  })

  // Effet pour détecter le mode sombre du système
  useEffect(() => {
    if (typeof window !== "undefined") {
      const isDarkMode = window.matchMedia("(prefers-color-scheme: dark)").matches
      setDarkMode(isDarkMode)

      // Observer les changements de préférence
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")
      const handleChange = (e: MediaQueryListEvent) => setDarkMode(e.matches)
      mediaQuery.addEventListener("change", handleChange)

      return () => mediaQuery.removeEventListener("change", handleChange)
    }
  }, [])

  // Récupérer les soumissions de l'étudiant connecté
  useEffect(() => {
    const fetchSoumissions = async () => {
      setIsLoading(true)
      setError(null)

      try {
        // Récupérer l'ID de l'étudiant connecté
        const sessionResponse = await fetch("/api/auth/session")
        const sessionData = await sessionResponse.json()

        if (!sessionData || !sessionData.user || !sessionData.user.id) {
          throw new Error("Vous devez être connecté pour voir vos soumissions")
        }

        const etudiantId = sessionData.user.id

        // Récupérer les soumissions de l'étudiant
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
        const response = await fetch(`${apiUrl}/soumissions/etudiant/${etudiantId}`)

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(errorData.message || `Erreur: ${response.status}`)
        }

        const data = await response.json()
        console.log("Données reçues:", data)

        // Utiliser directement les données de la base de données
        setSoumissions(data)
        setFilteredSoumissions(data)
      } catch (err) {
        console.error("Erreur lors de la récupération des soumissions:", err)
        setError(err instanceof Error ? err.message : "Une erreur est survenue")
      } finally {
        setIsLoading(false)
      }
    }

    fetchSoumissions()
  }, [])

  // Effet pour filtrer et trier les soumissions
  useEffect(() => {
    let result = [...soumissions]

    // Appliquer le filtre de recherche
    if (searchTerm) {
      result = result.filter(
        (item) =>
          (item.sujet_titre && item.sujet_titre.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (item.typeDeSujet && item.typeDeSujet.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (item.id && item.id.toString().includes(searchTerm.toLowerCase())),
      )
    }

    // Appliquer le filtre de statut
    if (statusFilter !== "Tous") {
      const getStatus = (soumission: Soumission) => {
        if (soumission.note !== undefined && soumission.note !== null) return "Corrigé"
        // Vous pouvez ajouter d'autres conditions pour déterminer le statut
        return "En correction"
      }

      result = result.filter((item) => getStatus(item) === statusFilter)
    }

    // Appliquer le tri
    result.sort((a, b) => {
      const aValue = a[sortConfig.key]
      const bValue = b[sortConfig.key]

      if (aValue === undefined || bValue === undefined) return 0

      if (aValue < bValue) {
        return sortConfig.direction === "ascending" ? -1 : 1
      }
      if (aValue > bValue) {
        return sortConfig.direction === "ascending" ? 1 : -1
      }
      return 0
    })

    setFilteredSoumissions(result)
  }, [soumissions, searchTerm, statusFilter, sortConfig])

  // Fonction pour déterminer le statut d'une soumission
  const getStatus = (soumission: Soumission) => {
    if (soumission.note !== undefined && soumission.note !== null) return "Corrigé"
    // Vous pouvez ajouter d'autres conditions pour déterminer le statut
    return "En correction"
  }

  // Fonction pour formater la date
  const formatDate = (dateString: string) => {
    if (!dateString) return "Date non disponible"
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
  }

  // Fonction pour obtenir l'icône de statut
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Corrigé":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case "En correction":
        return <Clock className="h-5 w-5 text-amber-500" />
      case "Problème":
        return <XCircle className="h-5 w-5 text-red-500" />
      default:
        return <AlertCircle className="h-5 w-5 text-gray-500" />
    }
  }

  // Fonction pour obtenir la couleur de badge selon le statut
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "Corrigé":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
      case "En correction":
        return "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400"
      case "Problème":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
    }
  }

  // Fonction pour obtenir la couleur de bordure selon le statut
  const getBorderColorClass = (status: string) => {
    switch (status) {
      case "Corrigé":
        return "border-green-500 dark:border-green-700"
      case "En correction":
        return "border-amber-500 dark:border-amber-700"
      case "Problème":
        return "border-red-500 dark:border-red-700"
      default:
        return "border-gray-300 dark:border-gray-700"
    }
  }

  // Fonction pour obtenir la couleur de note
  const getNoteColorClass = (note: number) => {
    if (note >= 15) return "text-green-600 dark:text-green-400"
    if (note >= 10) return "text-amber-600 dark:text-amber-400"
    return "text-red-600 dark:text-red-400"
  }

  // Fonction pour obtenir le nom du professeur
  const getProfesseurNom = (soumission: Soumission) => {
    if (soumission.professeurNom && soumission.professeurPrenom) {
      return `Prof. ${soumission.professeurPrenom} ${soumission.professeurNom}`
    }
    return "Professeur non assigné"
  }

  // Fonction pour générer un ID de copie formaté
  const getFormattedCopyId = (soumission: Soumission) => {
    return `BDD-${new Date(soumission.dateSoumission).getFullYear()}-S${
      Math.floor(new Date(soumission.dateSoumission).getMonth() / 6) + 1
    }-${String(soumission.id).padStart(3, "0")}`
  }

  // Fonction pour déterminer la durée de l'examen (basée sur le type d'examen)
  const getExamDuration = (soumission: Soumission) => {
    const type = soumission.typeDeSujet?.toLowerCase() || ""
    if (type.includes("final") || type.includes("examen")) return "3 heures"
    if (type.includes("partiel")) return "2 heures"
    return "1 heure 30"
  }

  return (
    <div
      className={`min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 ${
        darkMode ? "dark:from-gray-900 dark:via-gray-800 dark:to-indigo-950 dark" : ""
      }`}
    >
      {/* Navbar */}
      <Navbar darkMode={darkMode} />

      {/* Page Content */}
      <div className="container mx-auto px-4 pt-24 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">Mes Soumissions</h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Consultez l'historique et les résultats de vos examens de bases de données
          </p>
        </motion.div>

        {/* Filtres et recherche */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-8 bg-white dark:bg-gray-800 rounded-xl shadow-md p-4"
        >
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Rechercher par matière, intitulé ou numéro..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="flex items-center gap-2">
              <Filter className="text-gray-500 dark:text-gray-400 h-5 w-5" />
              <select
                className="border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="Tous">Tous les statuts</option>
                <option value="Corrigé">Corrigé</option>
                <option value="En correction">En correction</option>
                <option value="Problème">Problème</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <Calendar className="text-gray-500 dark:text-gray-400 h-5 w-5" />
              <select
                className="border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={`${sortConfig.key}-${sortConfig.direction}`}
                onChange={(e) => {
                  const [key, direction] = e.target.value.split("-")
                  setSortConfig({
                    key: key as keyof Soumission,
                    direction: direction as "ascending" | "descending",
                  })
                }}
              >
                <option value="dateSoumission-descending">Date de soumission (plus récent)</option>
                <option value="dateSoumission-ascending">Date de soumission (plus ancien)</option>
                <option value="sujet_titre-ascending">Matière (A-Z)</option>
                <option value="sujet_titre-descending">Matière (Z-A)</option>
              </select>
            </div>
          </div>
        </motion.div>

        {/* Liste des copies en format carte */}
        {isLoading ? (
          <div className="p-8 flex flex-col items-center justify-center bg-white dark:bg-gray-800 rounded-xl shadow-md">
            <Loader2 className="h-8 w-8 text-indigo-600 dark:text-indigo-400 animate-spin mb-4" />
            <p className="text-gray-600 dark:text-gray-300">Chargement de vos copies d'examen...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center bg-white dark:bg-gray-800 rounded-xl shadow-md">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Erreur</h3>
            <p className="text-gray-600 dark:text-gray-300">{error}</p>
            <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>
              Réessayer
            </Button>
          </div>
        ) : filteredSoumissions.length === 0 ? (
          <div className="p-8 text-center bg-white dark:bg-gray-800 rounded-xl shadow-md">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Aucune copie trouvée</h3>
            <p className="text-gray-600 dark:text-gray-300">
              {searchTerm || statusFilter !== "Tous"
                ? "Aucune copie ne correspond à vos critères de recherche."
                : "Vous n'avez pas encore soumis d'exercices."}
            </p>
            {(searchTerm || statusFilter !== "Tous") && (
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => {
                  setSearchTerm("")
                  setStatusFilter("Tous")
                }}
              >
                Réinitialiser les filtres
              </Button>
            )}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredSoumissions.map((soumission, index) => {
              const status = getStatus(soumission)
              return (
                <motion.div
                  key={soumission.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 * index }}
                  className={`relative bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden border-l-4 ${getBorderColorClass(
                    status,
                  )} hover:shadow-lg transition-shadow`}
                >
                  {/* En-tête de la copie */}
                  <div className="bg-gray-50 dark:bg-gray-750 p-4 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-bold text-gray-900 dark:text-white text-lg line-clamp-1">
                          {soumission.sujet_titre || "Sans titre"}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-1">
                          {soumission.typeDeSujet || "Contrôle Continu"}
                        </p>
                      </div>
                      <div
                        className={`flex items-center ${getStatusBadgeClass(
                          status,
                        )} px-2 py-1 rounded-full text-xs font-medium`}
                      >
                        {getStatusIcon(status)}
                        <span className="ml-1">{status}</span>
                      </div>
                    </div>
                    <div className="mt-2 flex items-center">
                      <GraduationCap className="h-4 w-4 text-indigo-600 dark:text-indigo-400 mr-1" />
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        Semestre {Math.floor(new Date(soumission.dateSoumission).getMonth() / 6) + 1} -{" "}
                        {new Date(soumission.dateSoumission).getFullYear()}
                      </span>
                    </div>
                  </div>

                  {/* Corps de la copie */}
                  <div className="p-4">
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div className="flex flex-col">
                        <span className="text-xs text-gray-500 dark:text-gray-400">Date de soumission</span>
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          {formatDate(soumission.dateSoumission)}
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs text-gray-500 dark:text-gray-400">Notes</span>
                        <span className="text-sm text-gray-700 dark:text-gray-300">??</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs text-gray-500 dark:text-gray-400">Professeur</span>
                        <span className="text-sm text-gray-700 dark:text-gray-300">{getProfesseurNom(soumission)}</span>
                      </div>

                    </div>

                    {/* Note et commentaire */}
                    <div className="mt-4 mb-4">
                      {soumission.note !== undefined && soumission.note !== null ? (
                        <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-750 p-3 rounded-lg">
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Note finale:</span>
                          <span className={`text-xl font-bold ${getNoteColorClass(soumission.note)}`}>
                            {soumission.note}/20
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center bg-gray-50 dark:bg-gray-750 p-3 rounded-lg">
                          <Clock className="h-4 w-4 text-amber-500 mr-2" />
                          <span className="text-sm text-amber-600 dark:text-amber-400">En attente de correction</span>
                        </div>
                      )}
                    </div>

                    {/* Tampon "CORRIGÉ" pour les copies corrigées */}
                    {status === "Corrigé" && (
                      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rotate-[-30deg] opacity-10">
                        <div className="border-4 border-green-600 dark:border-green-500 rounded-lg px-4 py-2">
                          <span className="text-3xl font-bold text-green-600 dark:text-green-500">CORRIGÉ</span>
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex justify-between mt-4">
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-indigo-600 dark:text-indigo-400 border-indigo-600 dark:border-indigo-400"
                      >
                        <Link href={`/etudiant/submissions/${soumission.id}`} className="flex items-center">
                          <Eye className="h-4 w-4 mr-1" />
                          Détails
                        </Link>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-gray-600 dark:text-gray-400 border-gray-600 dark:border-gray-400"
                      >
                        <a
                          href={soumission.fichier}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center"
                        >
                          <Download className="h-4 w-4 mr-1" />
                          Télécharger
                        </a>
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </motion.div>
        )}

        {/* Pagination (si nécessaire) */}
        {!isLoading && !error && filteredSoumissions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-6 flex justify-between items-center"
          >
            <div className="text-sm text-gray-600 dark:text-gray-300">
              Affichage de {filteredSoumissions.length} soumission{filteredSoumissions.length > 1 ? "s" : ""}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled>
                Précédent
              </Button>
              <Button variant="outline" size="sm" disabled>
                Suivant
              </Button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
