  "use client"

  import type React from "react"

  import { useState, useEffect } from "react"
  import { Menu, Bell, ChevronDown, User, Mail, Lock, Globe, Moon, Sun } from "lucide-react"
  import Sidebar from "../../../components/Sidebar-etudiant"

  type SettingsSection = {
    id: string
    title: string
    icon: any
  }

  type UserRole = "professor" | "student"

  // Type pour les données de l'étudiant
  type StudentData = {
    id: number
    email: string
    nom: string
    prenom: string
    Num_Etudiant: string | null
    date_creation: string
    derniere_connexion: string | null
    actif: number
  }

  // Données simulées pour l'étudiant connecté
  const MOCK_STUDENT_DATA: StudentData = {
    id: 5,
    email: "etudiant1@example.com",
    nom: "Étudiant",
    prenom: "Numéro 1",
    Num_Etudiant: "ETU1001",
    date_creation: "2025-04-18 11:07:13.839",
    derniere_connexion: null,
    actif: 1,
  }

  export default function SettingsPage() {
    // State
    const [userRole, setUserRole] = useState<UserRole>("student")
    const [isDarkMode, setIsDarkMode] = useState(false)
    const [isSidebarOpen, setIsSidebarOpen] = useState(false)
    const [activeSection, setActiveSection] = useState("profile")
    const [emailNotifications, setEmailNotifications] = useState(true)
    const [appNotifications, setAppNotifications] = useState(true)
    const [language, setLanguage] = useState("fr")
    const [isLoading, setIsLoading] = useState(true)
    const [studentData, setStudentData] = useState<StudentData | null>(null)

    // Form state
    const [formData, setFormData] = useState({
      firstName: "",
      lastName: "",
      email: "",
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    })

    // Utiliser les données simulées au lieu d'appeler une API
    useEffect(() => {
      const fetchStudentData = async () => {
        setIsLoading(true)
        try {
          // Simuler un délai de chargement
          await new Promise((resolve) => setTimeout(resolve, 500))

          // Utiliser les données simulées
          setStudentData(MOCK_STUDENT_DATA)
          setFormData({
            firstName: MOCK_STUDENT_DATA.prenom,
            lastName: MOCK_STUDENT_DATA.nom,
            email: MOCK_STUDENT_DATA.email,
            currentPassword: "",
            newPassword: "",
            confirmPassword: "",
          })
        } catch (error) {
          console.error("Erreur lors de la récupération des données de l'étudiant:", error)
        } finally {
          setIsLoading(false)
        }
      }

      fetchStudentData()
    }, [])

    // Settings sections adaptées pour étudiant
    const sections: SettingsSection[] = [
      { id: "profile", title: "Profil", icon: User },
      { id: "notifications", title: "Notifications", icon: Bell },
      { id: "security", title: "Sécurité", icon: Lock },
      { id: "appearance", title: "Apparence", icon: Moon },
      { id: "language", title: "Langue", icon: Globe },
    ]

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

    // Form handlers
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const { name, value } = e.target
      setFormData({
        ...formData,
        [name]: value,
      })
    }

    // Simuler la mise à jour du profil
    const handleProfileSubmit = async (e: React.FormEvent) => {
      e.preventDefault()
      try {
        // Simuler un délai de traitement
        await new Promise((resolve) => setTimeout(resolve, 500))

        // Mettre à jour les données locales
        if (studentData) {
          const updatedData = {
            ...studentData,
            prenom: formData.firstName,
            nom: formData.lastName,
            email: formData.email,
          }
          setStudentData(updatedData)
        }

        alert("Profil mis à jour avec succès")
      } catch (error) {
        console.error("Erreur:", error)
        alert(`Erreur: ${error instanceof Error ? error.message : "Erreur inconnue"}`)
      }
    }

    // Simuler la mise à jour du mot de passe
    const handlePasswordSubmit = async (e: React.FormEvent) => {
      e.preventDefault()
      if (formData.newPassword !== formData.confirmPassword) {
        alert("Les mots de passe ne correspondent pas")
        return
      }

      try {
        // Simuler un délai de traitement
        await new Promise((resolve) => setTimeout(resolve, 500))

        setFormData({
          ...formData,
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        })

        alert("Mot de passe mis à jour avec succès")
      } catch (error) {
        console.error("Erreur:", error)
        alert(`Erreur: ${error instanceof Error ? error.message : "Erreur inconnue"}`)
      }
    }

    // Générer les initiales de l'étudiant
    const getInitials = () => {
      if (!studentData) return ""
      return `${studentData.prenom.charAt(0)}${studentData.nom.charAt(0)}`
    }

    // Générer une couleur de fond basée sur le nom
    const getAvatarColor = () => {
      if (!studentData) return "#4f46e5" // Couleur par défaut

      // Générer une couleur basée sur le nom
      const hash = studentData.prenom.charCodeAt(0) + studentData.nom.charCodeAt(0)
      const colors = [
        "#4f46e5", // indigo
        "#8b5cf6", // violet
        "#ec4899", // rose
        "#f97316", // orange
        "#10b981", // emerald
        "#06b6d4", // cyan
      ]

      return colors[hash % colors.length]
    }

    useEffect(() => {
      if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
        setIsDarkMode(true)
        document.documentElement.classList.add("dark")
      }
    }, [])

    if (isLoading) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      )
    }

    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 transition-colors duration-500">
        <div className="flex">
          {/* Sidebar Étudiant */}
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
                  <h1 className="text-lg font-semibold text-gray-800 dark:text-white">Paramètres</h1>
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
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
                  <div className="flex flex-col md:flex-row md:space-x-6">
                    {/* Settings Navigation */}
                    <div className="w-full md:w-64 mb-6 md:mb-0">
                      <div className="space-y-1">
                        {sections.map((section) => (
                          <button
                            key={section.id}
                            onClick={() => setActiveSection(section.id)}
                            className={`flex items-center w-full px-3 py-2 text-sm rounded-lg transition-colors duration-150 ${
                              activeSection === section.id
                                ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300"
                                : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/30"
                            }`}
                          >
                            <section.icon className="w-5 h-5 mr-3" />
                            <span>{section.title}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Settings Content */}
                    <div className="flex-1">
                      {/* Profile Section */}
                      {activeSection === "profile" && (
                        <div>
                          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-6">Profil Étudiant</h2>
                          <form onSubmit={handleProfileSubmit}>
                            <div className="mb-6">
                              <div className="flex items-center mb-4">
                                <div className="relative mr-4">
                                  {/* Avatar avec initiales au lieu d'une image */}
                                  <div
                                    className="w-20 h-20 rounded-full border-2 border-indigo-500 flex items-center justify-center text-white font-bold text-xl"
                                    style={{ backgroundColor: getAvatarColor() }}
                                  >
                                    {getInitials()}
                                  </div>
                                  <div className="absolute bottom-0 right-0 w-5 h-5 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></div>
                                </div>
                                <div>
                                  <button
                                    type="button"
                                    className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white text-sm rounded-lg transition-colors"
                                  >
                                    Changer la photo
                                  </button>
                                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    JPG, GIF ou PNG. 1MB max.
                                  </p>
                                </div>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Prénom
                                  </label>
                                  <input
                                    type="text"
                                    name="firstName"
                                    value={formData.firstName}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400"
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Nom
                                  </label>
                                  <input
                                    type="text"
                                    name="lastName"
                                    value={formData.lastName}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400"
                                  />
                                </div>
                              </div>

                              <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                  Email
                                </label>
                                <div className="relative">
                                  <Mail className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                                  <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    className="pl-10 pr-4 py-2 w-full rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400"
                                  />
                                </div>
                              </div>

                              <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                  Rôle
                                </label>
                                <input
                                  type="text"
                                  value="Étudiant"
                                  disabled
                                  className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-100 dark:bg-gray-600 text-gray-800 dark:text-white cursor-not-allowed"
                                />
                              </div>
                            </div>

                            <div className="flex justify-end">
                              <button
                                type="submit"
                                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
                              >
                                Enregistrer
                              </button>
                            </div>
                          </form>
                        </div>
                      )}

                      {/* Notifications Section */}
                      {activeSection === "notifications" && (
                        <div>
                          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-6">Notifications</h2>

                          <div className="space-y-6">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                  Notifications par email
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                  Recevoir des notifications par email
                                </p>
                              </div>
                              <button
                                onClick={() => setEmailNotifications(!emailNotifications)}
                                className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none ${
                                  emailNotifications ? "bg-indigo-600" : "bg-gray-200 dark:bg-gray-700"
                                }`}
                              >
                                <span
                                  className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${
                                    emailNotifications ? "translate-x-6" : "translate-x-1"
                                  }`}
                                ></span>
                              </button>
                            </div>

                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                  Notifications dans l'application
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                  Recevoir des notifications dans l'application
                                </p>
                              </div>
                              <button
                                onClick={() => setAppNotifications(!appNotifications)}
                                className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none ${
                                  appNotifications ? "bg-indigo-600" : "bg-gray-200 dark:bg-gray-700"
                                }`}
                              >
                                <span
                                  className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${
                                    appNotifications ? "translate-x-6" : "translate-x-1"
                                  }`}
                                ></span>
                              </button>
                            </div>

                            <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
                              <h3 className="text-md font-medium text-gray-800 dark:text-white mb-4">
                                Types de notifications
                              </h3>

                              <div className="space-y-4">
                                <div className="flex items-center">
                                  <input
                                    id="notifications-exercises"
                                    type="checkbox"
                                    defaultChecked
                                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                  />
                                  <label
                                    htmlFor="notifications-exercises"
                                    className="ml-2 block text-sm text-gray-700 dark:text-gray-300"
                                  >
                                    Nouveaux exercices
                                  </label>
                                </div>

                                <div className="flex items-center">
                                  <input
                                    id="notifications-grades"
                                    type="checkbox"
                                    defaultChecked
                                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                  />
                                  <label
                                    htmlFor="notifications-grades"
                                    className="ml-2 block text-sm text-gray-700 dark:text-gray-300"
                                  >
                                    Notes reçues
                                  </label>
                                </div>

                                <div className="flex items-center">
                                  <input
                                    id="notifications-deadlines"
                                    type="checkbox"
                                    defaultChecked
                                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                  />
                                  <label
                                    htmlFor="notifications-deadlines"
                                    className="ml-2 block text-sm text-gray-700 dark:text-gray-300"
                                  >
                                    Rappels de deadlines
                                  </label>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="mt-8 flex justify-end">
                            <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors">
                              Enregistrer les préférences
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Security Section */}
                      {activeSection === "security" && (
                        <div>
                          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-6">Sécurité</h2>

                          <form onSubmit={handlePasswordSubmit}>
                            <div className="space-y-4 mb-6">
                              <div>
                                <label
                                  htmlFor="currentPassword"
                                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                                >
                                  Mot de passe actuel
                                </label>
                                <div className="relative">
                                  <Lock className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                                  <input
                                    type="password"
                                    id="currentPassword"
                                    name="currentPassword"
                                    value={formData.currentPassword}
                                    onChange={handleInputChange}
                                    className="pl-10 pr-4 py-2 w-full rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400"
                                    required
                                  />
                                </div>
                              </div>

                              <div>
                                <label
                                  htmlFor="newPassword"
                                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                                >
                                  Nouveau mot de passe
                                </label>
                                <div className="relative">
                                  <Lock className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                                  <input
                                    type="password"
                                    id="newPassword"
                                    name="newPassword"
                                    value={formData.newPassword}
                                    onChange={handleInputChange}
                                    className="pl-10 pr-4 py-2 w-full rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400"
                                    required
                                  />
                                </div>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                  Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule et un
                                  chiffre.
                                </p>
                              </div>

                              <div>
                                <label
                                  htmlFor="confirmPassword"
                                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                                >
                                  Confirmer le mot de passe
                                </label>
                                <div className="relative">
                                  <Lock className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                                  <input
                                    type="password"
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleInputChange}
                                    className="pl-10 pr-4 py-2 w-full rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400"
                                    required
                                  />
                                </div>
                              </div>
                            </div>

                            <div className="mt-8 flex justify-end">
                              <button
                                type="submit"
                                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
                              >
                                Mettre à jour le mot de passe
                              </button>
                            </div>
                          </form>
                        </div>
                      )}

                      {/* Appearance Section */}
                      {activeSection === "appearance" && (
                        <div>
                          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-6">Apparence</h2>

                          <div className="space-y-6">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Mode sombre</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                  Activer le mode sombre pour l'interface
                                </p>
                              </div>
                              <button
                                onClick={toggleDarkMode}
                                className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none ${
                                  isDarkMode ? "bg-indigo-600" : "bg-gray-200 dark:bg-gray-700"
                                }`}
                              >
                                <span
                                  className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${
                                    isDarkMode ? "translate-x-6" : "translate-x-1"
                                  }`}
                                ></span>
                              </button>
                            </div>

                            <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
                              <h3 className="text-md font-medium text-gray-800 dark:text-white mb-4">Thème</h3>

                              <div className="grid grid-cols-2 gap-4">
                                <div
                                  className={`p-4 rounded-lg border ${
                                    !isDarkMode
                                      ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20"
                                      : "border-gray-200 dark:border-gray-700"
                                  } cursor-pointer transition-colors`}
                                  onClick={() => setIsDarkMode(false)}
                                >
                                  <div className="flex justify-center mb-2">
                                    <Sun className="w-6 h-6 text-gray-800" />
                                  </div>
                                  <p className="text-sm text-center font-medium text-gray-800 dark:text-white">Clair</p>
                                </div>

                                <div
                                  className={`p-4 rounded-lg border ${
                                    isDarkMode
                                      ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20"
                                      : "border-gray-200 dark:border-gray-700"
                                  } cursor-pointer transition-colors`}
                                  onClick={() => setIsDarkMode(true)}
                                >
                                  <div className="flex justify-center mb-2">
                                    <Moon className="w-6 h-6 text-gray-800 dark:text-white" />
                                  </div>
                                  <p className="text-sm text-center font-medium text-gray-800 dark:text-white">Sombre</p>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="mt-8 flex justify-end">
                            <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors">
                              Enregistrer les préférences
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Language Section */}
                      {activeSection === "language" && (
                        <div>
                          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-6">Langue</h2>

                          <div className="mb-6">
                            <label
                              htmlFor="language"
                              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                            >
                              Langue de l'interface
                            </label>
                            <select
                              id="language"
                              name="language"
                              value={language}
                              onChange={(e) => setLanguage(e.target.value)}
                              className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400"
                            >
                              <option value="fr">Français</option>
                              <option value="en">English</option>
                            </select>
                          </div>

                          <div className="mt-8 flex justify-end">
                            <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors">
                              Enregistrer les préférences
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </main>
          </div>
        </div>
      </div>
    )
  }
