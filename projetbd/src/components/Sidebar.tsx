"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { signOut, useSession } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { X, Sun, Moon, LogOut, Database, Home, BookOpen, FileText, BarChart2, Settings, Calendar, Users, PersonStandingIcon } from "lucide-react"

type UserRole = "professeur" | "admin";

interface SidebarProps {
  userRole: UserRole
  isDarkMode: boolean
  toggleDarkMode: () => void
  isSidebarOpen: boolean
  toggleSidebar: () => void
  onLogout?: () => void
}

export default function Sidebar({ userRole, isDarkMode, toggleDarkMode, isSidebarOpen, toggleSidebar, onLogout }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { data: session, status } = useSession();

  // Rediriger si l'utilisateur n'est pas connecté
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    }
  }, [status, router]);

  const navigationItems = [
    { id: "dashboard", name: "Tableau de bord", icon: Home, path: "/professeur" },
    { id: "exercises", name: "Exercices", icon: BookOpen, path: "/professeur/exercices" },
    { 
      id: "submissions", 
      name: "Soumissions", 
      icon: FileText, 
      path: "/professeur/submissions" 
    },
    // Nouvel élément pour la gestion des étudiants
    
    { id: "students", name: "Étudiants", icon: Users, path: "/professeur/students" },
    { id: "analytics", name: "Analyses", icon: BarChart2, path: "/professeur/analytics" },
    { id: "calendar", name: "Calendrier", icon: Calendar, path: "/professeur/calendar" },
    { id: "settings", name: "Paramètres", icon: Settings, path: "/professeur/settings" },
  ]

  // Gestionnaire pour ouvrir/fermer le modal de confirmation
  const toggleLogoutConfirm = (e) => {
    e.stopPropagation();
    setShowLogoutConfirm(!showLogoutConfirm);
  };

  // Gestionnaire pour annuler la déconnexion
  const cancelLogout = (e) => {
    e.stopPropagation();
    setShowLogoutConfirm(false);
  };

  // Gestionnaire pour la déconnexion
  const handleLogout = async (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    // Éviter les déconnexions multiples
    if (isLoggingOut) return;
    
    setIsLoggingOut(true);
    
    try {
      // Afficher un toast de chargement
      toast.loading('Déconnexion en cours...', { id: 'logout' });
      
      // Déconnecter sans redirection immédiate
      await signOut({ 
        redirect: false 
      });
      
      // Afficher un message de succès
      toast.success('Vous êtes déconnecté', { id: 'logout' });
      
      // Fermer le modal
      setShowLogoutConfirm(false);
      
      // Exécuter le callback onLogout si fourni
      if (onLogout) {
        onLogout();
      }
      
      // Rediriger vers la page de connexion après un court délai
      setTimeout(() => {
        router.push('/auth/login');
      }, 500);
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
      toast.error('Un problème est survenu lors de la déconnexion', { id: 'logout' });
      setIsLoggingOut(false);
    }
  };

  // Gestionnaire pour les clics à l'extérieur du modal
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Ne pas fermer si une déconnexion est en cours
      if (isLoggingOut) return;
      
      const modal = document.querySelector('.logout-confirm-modal');
      if (showLogoutConfirm && modal && !modal.contains(event.target)) {
        setShowLogoutConfirm(false);
      }
    };
    
    if (showLogoutConfirm) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showLogoutConfirm, isLoggingOut]);

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
          <span className="text-lg font-semibold text-gray-800 dark:text-white">DBEVAL</span>
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
              <PersonStandingIcon className="w-10 h-10 rounded-full border-2 border-indigo-500"/>
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></div>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-800 dark:text-white">
                {session?.user?.email || 'professeur@example.com'}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {session?.user?.role || userRole}
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
              onClick={toggleLogoutConfirm}
              disabled={isLoggingOut}
            >
              <LogOut className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>

            {showLogoutConfirm && (
              <div 
                className="absolute bottom-full right-0 mb-2 w-40 bg-white dark:bg-gray-700 rounded-lg shadow-lg border border-gray-200 dark:border-gray-600 overflow-hidden logout-confirm-modal"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-2">
                  <p className="text-sm text-gray-800 dark:text-white mb-2 font-medium">Se déconnecter ?</p>
                  <div className="flex space-x-2">
                    <button
                      onClick={cancelLogout}
                      disabled={isLoggingOut}
                      className="px-3 py-1 text-xs bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-500 transition-colors"
                    >
                      Annuler
                    </button>
                    <button
                      onClick={handleLogout}
                      disabled={isLoggingOut}
                      className="px-3 py-1 text-xs bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors"
                    >
                      {isLoggingOut ? 'En cours...' : 'Confirmer'}
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