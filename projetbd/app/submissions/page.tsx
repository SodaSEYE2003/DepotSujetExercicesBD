"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Menu, Bell, ChevronDown, FileText, Clock, Check, Eye, Download, UploadCloud } from "lucide-react"
import Sidebar from "../../src/components/Sidebar"
import Link from "next/link"

type UserRole = "professor" | "student"

type Submission = {
  title: string
  date: string
  status: string
  statusColor: string
  grade: string | null
  student?: {
    name: string
    avatar: string | null
    id: string
    initials: string
  }
}

export default function SubmissionsPage() {
  // State
  const [userRole, setUserRole] = useState<UserRole>("professor")
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [dragActive, setDragActive] = useState(false)
  const [submissions, setSubmissions] = useState<Submission[]>([
    {
      title: "Requêtes SQL avancées - Réponse.pdf",
      date: "Soumis le 16 mars 2025",
      status: "Évalué",
      statusColor: "bg-green-500",
      grade: "17",
      student: {
        name: "Emma Dupont",
        avatar: "/placeholder.svg?height=40&width=40",
        id: "ED2025",
        initials: "ED",
      },
    },
    {
      title: "Modélisation de données - Réponse.pdf",
      date: "Soumis le 12 mars 2025",
      status: "En attente",
      statusColor: "bg-yellow-500",
      grade: null,
      student: {
        name: "Lucas Martin",
        avatar: null,
        id: "LM2025",
        initials: "LM",
      },
    },
    {
      title: "Normalisation et optimisation - Réponse.pdf",
      date: "Soumis le 7 mars 2025",
      status: "Évalué",
      statusColor: "bg-green-500",
      grade: "15",
      student: {
        name: "Chloé Bernard",
        avatar: null,
        id: "CB2025",
        initials: "CB",
      },
    },
  ])

  const fileInputRef = useRef<HTMLInputElement>(null)

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

  // Check system preference for dark mode on mount
  useEffect(() => {
    if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
      setIsDarkMode(true)
      document.documentElement.classList.add("dark")
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
                  <div
                    className={`mb-6 border ${dragActive ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20" : "border-dashed border-gray-300 dark:border-gray-600"} rounded-lg p-8`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                  >
                    <div className="flex flex-col items-center justify-center text-center">
                      <UploadCloud className="w-12 h-12 text-gray-400 dark:text-gray-500 mb-4" />
                      <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-2">
                        Déposer un nouveau fichier
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                        Glissez-déposez votre fichier PDF ici ou cliquez pour parcourir
                      </p>
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept=".pdf"
                        className="hidden"
                      />
                      <button
                        onClick={handleBrowseClick}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
                      >
                        Parcourir les fichiers
                      </button>
                    </div>
                  </div>
                )}

                {userRole === "student" && uploadedFile && (
                  <div className="mb-6">
                    <div className="flex items-center p-3 rounded-lg bg-gray-50 dark:bg-gray-700/30 border border-gray-200 dark:border-gray-600">
                      <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                        <FileText className="w-5 h-5 text-red-600 dark:text-red-400" />
                      </div>
                      <div className="ml-4 flex-1">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-gray-800 dark:text-white">{uploadedFile.name}</p>
                          <button
                            onClick={removeFile}
                            className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <line x1="18" y1="6" x2="6" y2="18"></line>
                              <line x1="6" y1="6" x2="18" y2="18"></line>
                            </svg>
                          </button>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {formatFileSize(uploadedFile.size)}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 flex justify-end">
                      <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors">
                        Soumettre le fichier
                      </button>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {submissions.map((submission, index) => (
                    <div
                      key={index}
                      className="bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow overflow-hidden"
                    >
                      <div className="p-4 border-b border-gray-100 dark:border-gray-700">
                        <div className="flex items-center">
                          {userRole === "professor" && submission.student && (
                            <>
                              {submission.student.avatar ? (
                                <img
                                  src={submission.student.avatar || "/placeholder.svg"}
                                  alt={submission.student.name}
                                  className="w-10 h-10 rounded-full mr-3"
                                />
                              ) : (
                                <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-medium mr-3">
                                  {submission.student.initials}
                                </div>
                              )}
                              <div>
                                <p className="font-medium text-gray-800 dark:text-white">{submission.student.name}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">ID: {submission.student.id}</p>
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
                          <h3 className="text-sm font-medium text-gray-800 dark:text-white">{submission.title}</h3>
                        </div>
                        <div className="flex items-center mb-3 ml-10">
                          <Clock className="w-4 h-4 text-gray-400 mr-1" />
                          <span className="text-xs text-gray-500 dark:text-gray-400">{submission.date}</span>
                        </div>

                        <div className="flex items-center justify-between ml-10">
                          <div className="flex items-center">
                            <div className={`w-2 h-2 rounded-full mr-2 ${submission.statusColor}`}></div>
                            <span className="text-sm text-gray-600 dark:text-gray-300">{submission.status}</span>
                          </div>
                          {submission.grade && (
                            <div className="text-sm font-medium text-gray-800 dark:text-white">
                              Note: {submission.grade}/20
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="bg-gray-50 dark:bg-gray-700/30 p-3 flex justify-end space-x-2">
                        <button className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                          <Download className="w-5 h-5" />
                        </button>
                        {userRole === "professor" && submission.status === "En attente" && (
                          <button className="p-2 text-green-600 dark:text-green-400 hover:text-green-900 dark:hover:text-green-100 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors">
                            <Check className="w-5 h-5" />
                          </button>
                        )}
                        <Link
                          href={`/submission-detail`}
                          className="p-2 text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-100 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors inline-flex"
                        >
                          <Eye className="w-5 h-5" />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>

                {submissions.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-gray-500 dark:text-gray-400">Aucune soumission trouvée</p>
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

