"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { signOut, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { usePathname } from "next/navigation"
import { X, Sun, Moon, LogOut, Database, Home, BookOpen, FileText, BarChart2, Settings, Calendar } from "lucide-react"

type UserRole = "professor" | "student"

interface SidebarProps {
  userRole: UserRole
  isDarkMode: boolean
  toggleDarkMode: () => void
  isSidebarOpen: boolean
  toggleSidebar: () => void
}

export default function Sidebar({ userRole, isDarkMode, toggleDarkMode, isSidebarOpen, toggleSidebar }: SidebarProps) {
  const pathname = usePathname()
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  const { data: session, status } = useSession();

  const navigationItems = [
    { id: "dashboard", name: "Tableau de bord", icon: Home, path: "/dashboard" },
    { id: "exercises", name: "Exercices", icon: BookOpen, path: "/exercises" },
    {
      id: "submissions",
      name: userRole === "professor" ? "Soumissions" : "Mes soumissions",
      icon: FileText,
      path: "/submissions",
    },
    { id: "calendar", name: "Calendrier", icon: Calendar, path: "/calendar" },
    { id: "analytics", name: "Analyses", icon: BarChart2, path: "/analytics" },
    { id: "settings", name: "Paramètres", icon: Settings, path: "/settings" },
  ]

  // Close logout confirmation when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showLogoutConfirm) {
        setShowLogoutConfirm(false)
      }
    }

    // Add event listener only when the confirmation is shown
    if (showLogoutConfirm) {
      document.addEventListener("mousedown", handleClickOutside)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [showLogoutConfirm])

  const handleLogout = async () => {
    try {
      // Afficher un toast avant la déconnexion (optionnel)
      toast.loading('Déconnexion en cours...', { id: 'logout' });
      
      // Déconnecter l'utilisateur
      await signOut({ 
        redirect: false,
        callbackUrl: '/auth/login'
      });
      
      // Afficher un message de succès
      toast.success('Vous êtes déconnecté', { id: 'logout' });
      
      // Rediriger vers la page de connexion
      // Notez que cette redirection est déjà gérée par NextAuth si vous utilisez { redirect: true }
      window.location.href = '/auth/login';
    } catch (error) {
      // Gérer toute erreur qui pourrait survenir
      console.error('Erreur lors de la déconnexion:', error);
      toast.error('Un problème est survenu lors de la déconnexion', { id: 'logout' });
    }
  };

  return (
    <div
      className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 shadow-lg transition-all duration-300 transform ${
        isSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      }`}
    >
      <div className="flex items-center justify-between h-16 px-4 border-b dark:border-gray-700">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <Database className="w-5 h-5 text-white" />
          </div>
          <span className="text-lg font-semibold text-gray-800 dark:text-white">DB Eval</span>
        </div>
        <button
          onClick={toggleSidebar}
          className="md:hidden text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      <div className="py-4 px-2">
        <div className="px-4 mb-6">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <img
                src="https://i.pravatar.cc/40?img=8"
                alt="Avatar"
                className="w-10 h-10 rounded-full border-2 border-indigo-500"
              />
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></div>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-800 dark:text-white">
                {session?.user?.email}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {session?.user?.role}
              </p>
            </div>
          </div>
        </div>

        <nav className="space-y-1 px-3">
          {navigationItems.map((item) => (
            <Link
              key={item.id}
              href={item.path}
              className={`flex items-center w-full px-3 py-2 text-sm rounded-lg transition-colors duration-150 ${
                pathname === item.path
                  ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/30"
              }`}
            >
              <item.icon className="w-5 h-5 mr-3" />
              <span>{item.name}</span>
            </Link>
          ))}
        </nav>
      </div>

      <div className="absolute bottom-0 w-full p-4 border-t dark:border-gray-700">
        <div className="flex items-center justify-between">
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
            <button
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              onClick={() => setShowLogoutConfirm(!showLogoutConfirm)}
            >
              <LogOut className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>

            {showLogoutConfirm && (
              <div className="absolute bottom-full right-0 mb-2 w-40 bg-white dark:bg-gray-700 rounded-lg shadow-lg border border-gray-200 dark:border-gray-600 overflow-hidden">
                <div className="p-2">
                  <p className="text-sm text-gray-800 dark:text-white mb-2 font-medium">Se déconnecter ?</p>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setShowLogoutConfirm(false)}
                      className="px-3 py-1 text-xs bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-500 transition-colors"
                    >
                      Annuler
                    </button>
                    <button
                      onClick={handleLogout}
                      className="px-3 py-1 text-xs bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors"
                    >
                      Confirmer
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

