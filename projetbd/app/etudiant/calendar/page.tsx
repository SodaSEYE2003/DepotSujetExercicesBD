"use client"

import { useState, useEffect } from "react"
import { Menu, Bell, ChevronDown, ChevronLeft, ChevronRight, Plus, Clock, Database, FileText } from "lucide-react"
import Sidebar from "@/components/Sidebar-etudiant";

type UserRole = "professor" | "student"

interface CalendarEvent {
  id: string
  title: string
  date: Date
  type: "exercise" | "deadline" | "evaluation"
  description: string
}

export default function CalendarPage() {
  // State
  const [userRole, setUserRole] = useState<UserRole>("student")
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [events, setEvents] = useState<CalendarEvent[]>([
    {
      id: "1",
      title: "Requêtes SQL avancées",
      date: new Date(2025, 2, 15), // March 15, 2025
      type: "exercise",
      description: "Publication de l'exercice sur les requêtes SQL avancées",
    },
    {
      id: "2",
      title: "Date limite: Requêtes SQL avancées",
      date: new Date(2025, 2, 25), // March 25, 2025
      type: "deadline",
      description: "Date limite pour soumettre l'exercice sur les requêtes SQL avancées",
    },
    {
      id: "3",
      title: "Modélisation de données",
      date: new Date(2025, 2, 10), // March 10, 2025
      type: "exercise",
      description: "Publication de l'exercice sur la modélisation de données",
    },
    {
      id: "4",
      title: "Évaluation: Normalisation",
      date: new Date(2025, 2, 7), // March 7, 2025
      type: "evaluation",
      description: "Évaluation des soumissions pour l'exercice sur la normalisation",
    },
  ])

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

  // Calendar navigation
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
  }

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
  }

  const goToToday = () => {
    setCurrentDate(new Date())
    setSelectedDate(new Date())
  }

  // Calendar helpers
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay()
  }

  const formatMonth = (date: Date) => {
    return date.toLocaleDateString("fr-FR", { month: "long", year: "numeric" })
  }

  const isSameDay = (date1: Date, date2: Date) => {
    return (
      date1.getDate() === date2.getDate() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getFullYear() === date2.getFullYear()
    )
  }

  const getEventsForDate = (date: Date) => {
    return events.filter((event) => isSameDay(event.date, date))
  }

  const isToday = (date: Date) => {
    const today = new Date()
    return isSameDay(date, today)
  }

  // Generate calendar days
  const generateCalendarDays = () => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()

    const daysInMonth = getDaysInMonth(year, month)
    const firstDayOfMonth = getFirstDayOfMonth(year, month)

    const days = []

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(null)
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day)
      days.push(date)
    }

    return days
  }

  // Get event type color
  const getEventTypeColor = (type: string) => {
    switch (type) {
      case "exercise":
        return "bg-blue-500"
      case "deadline":
        return "bg-red-500"
      case "evaluation":
        return "bg-green-500"
      default:
        return "bg-gray-500"
    }
  }

  // Check system preference for dark mode on mount
  useEffect(() => {
    if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
      setIsDarkMode(true)
      document.documentElement.classList.add("dark")
    }
  }, [])

  const calendarDays = generateCalendarDays()
  const selectedDateEvents = selectedDate ? getEventsForDate(selectedDate) : []

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
                <h1 className="text-lg font-semibold text-gray-800 dark:text-white">Calendrier</h1>
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
                {/* Calendar Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
                  <div className="flex items-center mb-4 sm:mb-0">
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-white">{formatMonth(currentDate)}</h2>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={goToPreviousMonth}
                      className="p-2 rounded-lg border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>

                    <button
                      onClick={goToToday}
                      className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      Aujourd'hui
                    </button>

                    <button
                      onClick={goToNextMonth}
                      className="p-2 rounded-lg border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>

                    {userRole === "professor" && (
                      <button className="flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors ml-2">
                        <Plus className="w-4 h-4 mr-2" />
                        <span>Ajouter</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-px bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden">
                  {/* Day Headers */}
                  {["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"].map((day, index) => (
                    <div
                      key={index}
                      className="bg-gray-100 dark:bg-gray-800 p-2 text-center text-sm font-medium text-gray-500 dark:text-gray-400"
                    >
                      {day}
                    </div>
                  ))}

                  {/* Calendar Days */}
                  {calendarDays.map((date, index) => {
                    if (!date) {
                      return <div key={`empty-${index}`} className="bg-white dark:bg-gray-800 p-2 h-24 md:h-32"></div>
                    }

                    const dayEvents = getEventsForDate(date)
                    const isSelected = selectedDate && isSameDay(date, selectedDate)

                    return (
                      <div
                        key={`day-${index}`}
                        className={`bg-white dark:bg-gray-800 p-2 h-24 md:h-32 cursor-pointer transition-colors ${
                          isSelected ? "ring-2 ring-indigo-500 dark:ring-indigo-400 z-10 relative" : ""
                        } ${isToday(date) ? "bg-indigo-50 dark:bg-indigo-900/20" : ""}`}
                        onClick={() => setSelectedDate(date)}
                      >
                        <div className="flex justify-between items-start">
                          <span
                            className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-sm ${
                              isToday(date) ? "bg-indigo-600 text-white" : "text-gray-700 dark:text-gray-300"
                            }`}
                          >
                            {date.getDate()}
                          </span>
                        </div>

                        <div className="mt-2 space-y-1 overflow-y-auto max-h-[calc(100%-2rem)]">
                          {dayEvents.slice(0, 2).map((event, eventIndex) => (
                            <div
                              key={`event-${event.id}`}
                              className="flex items-center text-xs rounded px-1 py-0.5 bg-opacity-10 dark:bg-opacity-20"
                            >
                              <div className={`w-2 h-2 rounded-full mr-1 ${getEventTypeColor(event.type)}`}></div>
                              <span className="truncate text-gray-700 dark:text-gray-300">{event.title}</span>
                            </div>
                          ))}

                          {dayEvents.length > 2 && (
                            <div className="text-xs text-gray-500 dark:text-gray-400 pl-3">
                              +{dayEvents.length - 2} plus
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Selected Day Events */}
              {selectedDate && (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                    Événements du{" "}
                    {selectedDate.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
                  </h3>

                  {selectedDateEvents.length === 0 ? (
                    <p className="text-gray-500 dark:text-gray-400">Aucun événement prévu pour cette date</p>
                  ) : (
                    <div className="space-y-4">
                      {selectedDateEvents.map((event) => (
                        <div
                          key={event.id}
                          className="flex items-start p-3 rounded-lg border border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
                        >
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center ${
                              event.type === "exercise"
                                ? "bg-blue-100 dark:bg-blue-900/30"
                                : event.type === "deadline"
                                  ? "bg-red-100 dark:bg-red-900/30"
                                  : "bg-green-100 dark:bg-green-900/30"
                            }`}
                          >
                            {event.type === "exercise" ? (
                              <Database
                                className={`w-5 h-5 ${
                                  event.type === "exercise"
                                    ? "text-blue-600 dark:text-blue-400"
                                    : event.type === "deadline"
                                      ? "text-red-600 dark:text-red-400"
                                      : "text-green-600 dark:text-green-400"
                                }`}
                              />
                            ) : event.type === "deadline" ? (
                              <Clock className="w-5 h-5 text-red-600 dark:text-red-400" />
                            ) : (
                              <FileText className="w-5 h-5 text-green-600 dark:text-green-400" />
                            )}
                          </div>

                          <div className="ml-4 flex-1">
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-medium text-gray-800 dark:text-white">{event.title}</p>
                              <span
                                className={`text-xs px-2 py-1 rounded-full ${
                                  event.type === "exercise"
                                    ? "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300"
                                    : event.type === "deadline"
                                      ? "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300"
                                      : "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300"
                                }`}
                              >
                                {event.type === "exercise"
                                  ? "Exercice"
                                  : event.type === "deadline"
                                    ? "Date limite"
                                    : "Évaluation"}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{event.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}

