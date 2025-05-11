"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut, useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import {
  Menu,
  X,
  Sun,
  Moon,
  LogOut,
  Database,
  Home,
  BookOpen,
  FileText,
  Settings,
  Calendar,
  TrendingUp,
  Bell,
  ChevronDown,
} from "lucide-react"
import { toast } from "react-hot-toast"

type UserRole = "etudiant" | "professeur" | "admin"

interface NavbarProps {
  userRole: UserRole
  isDarkMode: boolean
  toggleDarkMode: () => void
  onLogout?: () => void
}

export default function Navbar({ userRole, isDarkMode, toggleDarkMode, onLogout }: NavbarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const { data: session, status } = useSession()

  const userMenuRef = useRef<HTMLDivElement>(null)
  const logoutConfirmRef = useRef<HTMLDivElement>(null)
  const notificationsRef = useRef<HTMLDivElement>(null)

  // Rediriger si l'utilisateur n'est pas connecté
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login")
    }
  }, [status, router])

  const navigationItems = [
    { id: "dashboard", name: "Tableau de bord", icon: Home, path: "/etudiant" },
    { id: "exercises", name: "Exercices", icon: BookOpen, path: "/etudiant/exercices" },
    { id: "submissions", name: "Mes soumissions", icon: FileText, path: "/etudiant/submissions" },
    { id: "progress", name: "Ma progression", icon: TrendingUp, path: "/etudiant/progress" },
    { id: "calendar", name: "Calendrier", icon: Calendar, path: "/etudiant/calendar" },
    { id: "settings", name: "Paramètres", icon: Settings, path: "/etudiant/settings" },
  ]

  // Gestionnaire pour ouvrir/fermer le menu utilisateur
  const toggleUserMenu = () => {
    setShowUserMenu(!showUserMenu)
    // Fermer les autres menus si ouverts
    if (showLogoutConfirm) setShowLogoutConfirm(false)
    if (showNotifications) setShowNotifications(false)
  }

  // Gestionnaire pour ouvrir/fermer les notifications
  const toggleNotifications = () => {
    setShowNotifications(!showNotifications)
    // Fermer les autres menus si ouverts
    if (showUserMenu) setShowUserMenu(false)
    if (showLogoutConfirm) setShowLogoutConfirm(false)
  }

  // Gestionnaire pour ouvrir/fermer le modal de confirmation
  const toggleLogoutConfirm = (e: React.MouseEvent) => {
    e.stopPropagation()
    setShowLogoutConfirm(!showLogoutConfirm)
  }

  // Gestionnaire pour annuler la déconnexion
  const cancelLogout = (e: React.MouseEvent) => {
    e.stopPropagation()
    setShowLogoutConfirm(false)
  }

  // Gestionnaire pour la déconnexion
  const handleLogout = async (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }

    // Éviter les déconnexions multiples
    if (isLoggingOut) return

    setIsLoggingOut(true)

    try {
      // Afficher un toast de chargement
      toast.loading("Déconnexion en cours...", { id: "logout" })

      // Déconnecter sans redirection immédiate
      await signOut({
        redirect: false,
      })

      // Afficher un message de succès
      toast.success("Vous êtes déconnecté", { id: "logout" })

      // Fermer le modal
      setShowLogoutConfirm(false)

      // Exécuter le callback onLogout si fourni
      if (onLogout) {
        onLogout()
      }

      // Rediriger vers la page de connexion après un court délai
      setTimeout(() => {
        router.push("/auth/login")
      }, 500)
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error)
      toast.error("Un problème est survenu lors de la déconnexion", { id: "logout" })
      setIsLoggingOut(false)
    }
  }

  // Gestionnaire pour les clics à l'extérieur des menus
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Ne pas fermer si une déconnexion est en cours
      if (isLoggingOut) return

      // Fermer le menu utilisateur si cliqué en dehors
      if (showUserMenu && userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false)
      }

      // Fermer le modal de déconnexion si cliqué en dehors
      if (showLogoutConfirm && logoutConfirmRef.current && !logoutConfirmRef.current.contains(event.target as Node)) {
        setShowLogoutConfirm(false)
      }

      // Fermer les notifications si cliqué en dehors
      if (showNotifications && notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setShowNotifications(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [showUserMenu, showLogoutConfirm, showNotifications, isLoggingOut])

  // Générer les initiales de l'utilisateur
  const getUserInitials = () => {
    if (session?.user?.name) {
      const nameParts = session.user.name.split(" ")
      if (nameParts.length >= 2) {
        return `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase()
      }
      return session.user.name.substring(0, 2).toUpperCase()
    }
    return "ET" // Étudiant par défaut
  }

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo et navigation desktop */}
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center mr-2">
                <Database className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-semibold text-gray-800 dark:text-white">DB Eval</span>
            </div>

            {/* Navigation desktop */}
            <div className="hidden md:ml-6 md:flex md:space-x-2">
              {navigationItems.map((item) => (
                <Link
                  key={item.id}
                  href={item.path}
                  className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                    pathname === item.path
                      ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/30"
                  }`}
                >
                  <item.icon className="w-4 h-4 mr-1.5" />
                  <span>{item.name}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Actions à droite */}
          <div className="flex items-center">
            {/* Bouton mode sombre/clair */}
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-md text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none"
              aria-label={isDarkMode ? "Activer le mode clair" : "Activer le mode sombre"}
            >
              {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>

            {/* Notifications */}
            <div className="relative ml-3" ref={notificationsRef}>
              <button
                onClick={toggleNotifications}
                className="relative p-2 rounded-md text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none"
                aria-label="Notifications"
              >
                <Bell className="h-5 w-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>

              {/* Dropdown notifications */}
              {showNotifications && (
                <div className="origin-top-right absolute right-0 mt-2 w-80 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                  <div className="p-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                    <h3 className="font-medium text-gray-800 dark:text-white">Notifications</h3>
                    <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full">
                      2 non lues
                    </span>
                  </div>

                  <div className="max-h-96 overflow-y-auto">
                    <div className="p-3 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors bg-indigo-50 dark:bg-indigo-900/10">
                      <div className="flex items-start">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            Nouvel exercice disponible
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            "Requêtes SQL avancées" a été publié
                          </p>
                          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Il y a 2 heures</p>
                        </div>
                        <div className="ml-2 flex-shrink-0">
                          <span className="inline-block w-2 h-2 bg-indigo-500 rounded-full"></span>
                        </div>
                      </div>
                    </div>
                    <div className="p-3 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                      <div className="flex items-start">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">Rappel de date limite</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            "Modélisation de données" est à rendre dans 3 jours
                          </p>
                          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Hier</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-2 border-t border-gray-200 dark:border-gray-700">
                    <button className="w-full py-2 text-xs text-center text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 font-medium">
                      Voir toutes les notifications
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Menu utilisateur */}
            <div className="ml-3 relative">
              <div>
                <button
                  onClick={toggleUserMenu}
                  className="flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  aria-expanded={showUserMenu}
                  aria-haspopup="true"
                >
                  <span className="sr-only">Ouvrir le menu utilisateur</span>
                  <div className="flex items-center space-x-2 p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700">
                    <div className="relative">
                      <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white font-medium">
                        {getUserInitials()}
                      </div>
                      <div className="absolute bottom-0 right-0 w-2 h-2 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></div>
                    </div>
                    <div className="hidden md:block text-left">
                      <p className="text-sm font-medium text-gray-800 dark:text-white">
                        {session?.user?.name || session?.user?.email || "Étudiant"}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{userRole}</p>
                    </div>
                    <ChevronDown className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                  </div>
                </button>
              </div>

              {/* Dropdown menu utilisateur */}
              {showUserMenu && (
                <div
                  ref={userMenuRef}
                  className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 focus:outline-none z-50"
                >
                  <div className="py-1">
                    <Link
                      href="/etudiant/settings"
                      className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <Settings className="w-4 h-4 inline mr-2" />
                      Paramètres
                    </Link>
                    <button
                      onClick={toggleLogoutConfirm}
                      className="w-full text-left block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <LogOut className="w-4 h-4 inline mr-2" />
                      Se déconnecter
                    </button>

                    {/* Modal de confirmation de déconnexion */}
                    {showLogoutConfirm && (
                      <div
                        ref={logoutConfirmRef}
                        className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden z-50"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="p-3">
                          <p className="text-sm text-gray-800 dark:text-white mb-3 font-medium">
                            Confirmer la déconnexion ?
                          </p>
                          <div className="flex space-x-2">
                            <button
                              onClick={cancelLogout}
                              disabled={isLoggingOut}
                              className="flex-1 px-3 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                            >
                              Annuler
                            </button>
                            <button
                              onClick={handleLogout}
                              disabled={isLoggingOut}
                              className="flex-1 px-3 py-1 text-xs bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors"
                            >
                              {isLoggingOut ? "En cours..." : "Confirmer"}
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Bouton menu mobile */}
            <div className="flex md:hidden ml-2">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none"
                aria-expanded={isMenuOpen}
              >
                <span className="sr-only">{isMenuOpen ? "Fermer le menu" : "Ouvrir le menu"}</span>
                {isMenuOpen ? <X className="block h-6 w-6" /> : <Menu className="block h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Menu mobile */}
      <div className={`${isMenuOpen ? "block" : "hidden"} md:hidden`}>
        <div className="pt-2 pb-3 space-y-1">
          {navigationItems.map((item) => (
            <Link
              key={item.id}
              href={item.path}
              className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                pathname === item.path
                  ? "border-indigo-500 text-indigo-700 bg-indigo-50 dark:bg-indigo-900/30 dark:text-indigo-300"
                  : "border-transparent text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              <div className="flex items-center">
                <item.icon className="w-5 h-5 mr-3" />
                {item.name}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </nav>
  )
}
