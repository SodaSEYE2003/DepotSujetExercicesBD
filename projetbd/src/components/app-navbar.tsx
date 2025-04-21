"use client"

import { useRef, useState } from "react"
import Link from "next/link"
import { Bell, ChevronDown, Menu, Search, User, X } from 'lucide-react'

interface NavbarProps {
  toggleSidebar: () => void
  searchQuery: string
  setSearchQuery: (query: string) => void
  currentLanguage: string
  setCurrentLanguage: (lang: string) => void
}

export default function AppNavbar({ 
  toggleSidebar, 
  searchQuery, 
  setSearchQuery,
  currentLanguage,
  setCurrentLanguage
}: NavbarProps) {
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)
  const [isLanguageDropdownOpen, setIsLanguageDropdownOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  
  const notificationsRef = useRef<HTMLDivElement>(null)
  const languageDropdownRef = useRef<HTMLDivElement>(null)
  const userMenuRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)

  const toggleSearch = () => {
    setIsSearchOpen(!isSearchOpen)
    if (!isSearchOpen) {
      setTimeout(() => {
        searchInputRef.current?.focus()
      }, 100)
    }
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-white dark:bg-gray-800 shadow-sm">
      <div className="flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-2 md:gap-4">
          <button
            onClick={toggleSidebar}
            className="md:hidden text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
          >
            <Menu className="w-6 h-6" />
          </button>

          <div className="hidden md:flex">
            <Link href="/" className="flex items-center space-x-2">
              <span className="text-xl font-bold text-gray-800 dark:text-white">EduPortal</span>
            </Link>
          </div>

          <div className="relative hidden md:flex">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" />
            <input
              type="search"
              placeholder="Rechercher..."
              className="pl-10 pr-4 py-2 w-[250px] lg:w-[350px] rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {/* Mobile Search */}
          <div className="relative md:hidden">
            {isSearchOpen ? (
              <div className="absolute right-0 top-0 flex w-full max-w-[300px] items-center">
                <input
                  ref={searchInputRef}
                  type="search"
                  placeholder="Rechercher..."
                  className="w-full pr-8 pl-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button 
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  onClick={toggleSearch}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <button 
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                onClick={toggleSearch}
              >
                <Search className="h-5 w-5 text-gray-500 dark:text-gray-400" />
              </button>
            )}
          </div>

          {/* Notifications */}
          <div className="relative" ref={notificationsRef}>
            <button
              className="relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            >
              <Bell className="w-6 h-6 text-gray-500 dark:text-gray-400" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            {isNotificationsOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50 overflow-hidden">
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

          {/* Language Selector */}
          <div className="relative" ref={languageDropdownRef}>
            <button
              className="flex items-center space-x-1 text-sm text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
              onClick={() => setIsLanguageDropdownOpen(!isLanguageDropdownOpen)}
            >
              <span>{currentLanguage}</span>
              <ChevronDown className="w-4 h-4" />
            </button>

            {isLanguageDropdownOpen && (
              <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50 overflow-hidden">
                <div className="p-1">
                  {["FR", "EN", "ES", "DE"].map((lang) => (
                    <button
                      key={lang}
                      className={`w-full text-left px-3 py-2 text-sm rounded-md ${
                        currentLanguage === lang
                          ? "bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400"
                          : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      }`}
                      onClick={() => {
                        setCurrentLanguage(lang)
                        setIsLanguageDropdownOpen(false)
                      }}
                    >
                      {lang === "FR" && "Français"}
                      {lang === "EN" && "English"}
                      {lang === "ES" && "Español"}
                      {lang === "DE" && "Deutsch"}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* User Menu */}
          <div className="relative" ref={userMenuRef}>
            <button
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            >
              <User className="w-6 h-6 text-gray-500 dark:text-gray-400" />
            </button>

            {isUserMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50 overflow-hidden">
                <div className="p-3 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="font-medium text-gray-800 dark:text-white">Mon compte</h3>
                </div>
                <div className="p-1">
                  <button className="w-full text-left px-3 py-2 text-sm rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                    Profil
                  </button>
                  <button className="w-full text-left px-3 py-2 text-sm rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                    Paramètres
                  </button>
                  <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>
                  <button className="w-full text-left px-3 py-2 text-sm rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                    Déconnexion
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
