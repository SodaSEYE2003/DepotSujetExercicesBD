"use client"

import { useState, useRef } from "react"
import {
  Menu,
  Bell,
  ChevronDown,
  Database,
  Search,
  Upload,
  FileText,
  Download,
  Eye,
  CheckCircle,
  Clock,
  AlertCircle,
  X,
  BookOpen,
  TrendingUp,
  TrendingDown,
  Users,
  Award,
  Calendar
} from "lucide-react"
import Sidebar from "@/components/Sidebar-etudiant";

type UserRole = 'professor' | 'student'

type Exercise = {
  id: string
  title: string
  description: string
  category: string
  dueDate: string
  status: 'à faire' | 'en cours' | 'rendu' | 'corrigé'
  submissionDate?: string
  grade?: number
  teacherComment?: string
}

export default function Dashboard() {
  const [userRole] = useState<UserRole>('student')
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null)
  const [submissionFile, setSubmissionFile] = useState<File | null>(null)

  const [exercises, setExercises] = useState<Exercise[]>([
    {
      id: "1",
      title: "Requêtes SQL avancées",
      description: "Création de requêtes avec jointures et sous-requêtes",
      category: "Base de données",
      dueDate: "15/03/2025",
      status: "rendu",
      submissionDate: "10/03/2025",
      grade: 16,
      teacherComment: "Bon travail sur les jointures, quelques erreurs sur les sous-requêtes"
    },
    {
      id: "2",
      title: "Modélisation UML",
      description: "Diagramme de classes pour un système de gestion",
      category: "Conception",
      dueDate: "20/03/2025",
      status: "en cours"
    },
    {
      id: "3",
      title: "Algorithmes de tri",
      description: "Implémentation des algorithmes de tri classiques",
      category: "Algorithmie",
      dueDate: "25/03/2025",
      status: "à faire"
    },
    {
      id: "4",
      title: "Programmation web",
      description: "Création d'une application React avec API",
      category: "Développement",
      dueDate: "05/04/2025",
      status: "corrigé",
      submissionDate: "01/04/2025",
      grade: 18,
      teacherComment: "Excellente implémentation, code bien structuré"
    }
  ])

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

  const filteredExercises = exercises.filter(exercise => 
    exercise.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    exercise.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    exercise.category.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSubmissionFile(e.target.files[0])
    }
  }

  const submitExercise = () => {
    if (!selectedExercise || !submissionFile) return
    
    const updatedExercises = exercises.map(ex => 
      ex.id === selectedExercise.id 
        ? { 
            ...ex, 
            status: 'rendu' as const, 
            
            submissionDate: new Date().toLocaleDateString('fr-FR')
          } 
        : ex
    )
    
    setExercises(updatedExercises)
    setSelectedExercise(null)
    setSubmissionFile(null)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'rendu': return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'en cours': return <Clock className="w-5 h-5 text-yellow-500" />
      case 'corrigé': return <FileText className="w-5 h-5 text-blue-500" />
      default: return <AlertCircle className="w-5 h-5 text-red-500" />
    }
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
        <div className="flex-1 flex flex-col md:ml-64 transition-all duration-300">
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
                <h1 className="text-lg font-semibold text-gray-800 dark:text-white">Mes exercices</h1>
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

          {/* Page Content - Prend toute la largeur et hauteur disponible */}
          <main className="flex-1 p-4 md:p-6 overflow-auto">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-6 border border-gray-100 dark:border-gray-700">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
                  Liste des exercices
                </h2>

                <div className="mt-4 md:mt-0">
                  <div className="relative">
                    <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Rechercher un exercice..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 pr-4 py-2 w-full sm:w-64 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400"
                    />
                  </div>
                </div>
              </div>

              {filteredExercises.length === 0 ? (
                <div className="text-center py-12">
                  <Search className="w-12 h-12 mx-auto text-gray-400 dark:text-gray-500 mb-4" />
                  <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-2">
                    Aucun exercice trouvé
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    Aucun exercice ne correspond à votre recherche
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredExercises.map((exercise) => (
                    <div 
                      key={exercise.id}
                      className="p-4 border rounded-lg hover:shadow-md transition-shadow bg-white dark:bg-gray-800 dark:border-gray-700"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-medium text-lg text-gray-800 dark:text-white">
                            {exercise.title}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                            {exercise.description}
                          </p>
                          <div className="flex items-center mt-3 space-x-3">
                            <span className="text-xs px-2 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300">
                              {exercise.category}
                            </span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              À rendre le {exercise.dueDate}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          <span className="flex items-center">
                            {getStatusIcon(exercise.status)}
                            <span className="ml-1 text-sm capitalize">
                              {exercise.status}
                            </span>
                          </span>

                          <button
                            onClick={() => setSelectedExercise(exercise)}
                            className="p-2 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg"
                          >
                            <Eye className="w-5 h-5" />
                          </button>
                        </div>
                      </div>

                      {exercise.status === 'corrigé' && exercise.grade && (
                        <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                          <div className="flex items-center">
                            <span className="font-medium text-gray-800 dark:text-white">
                              Note: {exercise.grade}/20
                            </span>
                            {exercise.teacherComment && (
                              <span className="ml-4 text-sm text-gray-600 dark:text-gray-300">
                                {exercise.teacherComment}
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </main>
        </div>
      </div>

      {/* Modal pour voir/soumettre un exercice */}
      {selectedExercise && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                    {selectedExercise.title}
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                    {selectedExercise.category} • À rendre le {selectedExercise.dueDate}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedExercise(null)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="mt-6">
                <h3 className="font-medium text-gray-800 dark:text-white mb-2">Description</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {selectedExercise.description}
                </p>
              </div>

              <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-4">
                <h3 className="font-medium text-gray-800 dark:text-white mb-4">Documents</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                    <div className="flex items-center">
                      <FileText className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                      <span className="ml-3 text-gray-700 dark:text-gray-300">
                        {selectedExercise.title}.pdf
                      </span>
                    </div>
                    <button className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 flex items-center">
                      <Download className="w-4 h-4 mr-1" />
                      <span className="text-sm">Télécharger</span>
                    </button>
                  </div>

                  {selectedExercise.status === 'corrigé' && (
                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                      <div className="flex items-center">
                        <FileText className="w-5 h-5 text-blue-500 dark:text-blue-400" />
                        <span className="ml-3 text-gray-700 dark:text-gray-300">
                          Correction_{selectedExercise.title}.pdf
                        </span>
                      </div>
                      <button className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 flex items-center">
                        <Download className="w-4 h-4 mr-1" />
                        <span className="text-sm">Télécharger</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {selectedExercise.status !== 'corrigé' && (
                <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-4">
                  <h3 className="font-medium text-gray-800 dark:text-white mb-4">
                    {selectedExercise.status === 'rendu' 
                      ? "Votre soumission" 
                      : "Soumettre votre travail"}
                  </h3>

                  {selectedExercise.status === 'rendu' ? (
                    <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/10 rounded-lg border border-green-200 dark:border-green-800/30">
                      <div className="flex items-center">
                        <CheckCircle className="w-5 h-5 text-green-500 dark:text-green-400" />
                        <span className="ml-3 text-gray-700 dark:text-gray-300">
                          Soumis le {selectedExercise.submissionDate}
                        </span>
                      </div>
                      <button className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 flex items-center">
                        <Download className="w-4 h-4 mr-1" />
                        <span className="text-sm">Télécharger</span>
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center">
                        {submissionFile ? (
                          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                            <div className="flex items-center">
                              <FileText className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                              <span className="ml-3 text-gray-700 dark:text-gray-300">
                                {submissionFile.name}
                              </span>
                            </div>
                            <button 
                              onClick={() => setSubmissionFile(null)}
                              className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
                            >
                              <X className="w-5 h-5" />
                            </button>
                          </div>
                        ) : (
                          <>
                            <Upload className="w-12 h-12 mx-auto text-gray-400 dark:text-gray-500 mb-4" />
                            <p className="text-gray-600 dark:text-gray-300 mb-4">
                              Glissez-déposez votre fichier ici ou cliquez pour sélectionner
                            </p>
                            <input
                              type="file"
                              id="file-upload"
                              className="hidden"
                              onChange={handleFileUpload}
                            />
                            <label
                              htmlFor="file-upload"
                              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors cursor-pointer"
                            >
                              Sélectionner un fichier
                            </label>
                          </>
                        )}
                      </div>

                      <div className="mt-4 flex justify-end">
                        <button
                          onClick={submitExercise}
                          disabled={!submissionFile}
                          className={`px-4 py-2 rounded-lg transition-colors ${
                            submissionFile
                              ? "bg-indigo-600 hover:bg-indigo-700 text-white"
                              : "bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed"
                          }`}
                        >
                          Soumettre
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}