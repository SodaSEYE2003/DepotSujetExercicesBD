"use client"

import { useState, useEffect } from "react"
import { AnimatedCounter } from "./animated-counter"

interface StatsData {
  exercisesCount: string
  studentsCount: string
  submissionsCount: string
  accuracyValue: string
}

export function StatsSection() {
  const [stats, setStats] = useState<StatsData>({
    exercisesCount: "0",
    studentsCount: "0",
    submissionsCount: "0",
    accuracyValue: "0%",
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true)

        // Récupérer les statistiques des exercices
        const exercisesResponse = await fetch("/api/sujets/stats")
        const exercisesData = await exercisesResponse.json()

        // Récupérer les statistiques des étudiants
        const studentsResponse = await fetch("/api/etudiants/stats")
        const studentsData = await studentsResponse.json()

        // Mettre à jour les statistiques
        setStats({
          exercisesCount: `${exercisesData.totalSubjects}+`,
          studentsCount: `${studentsData.totalStudents.toLocaleString()}+`,
          submissionsCount: "15,000+", // À remplacer par l'API réelle quand disponible
          accuracyValue: "98%", // À remplacer par l'API réelle quand disponible
        })

        setIsLoading(false)
      } catch (err) {
        console.error("Erreur lors de la récupération des statistiques:", err)
        setError("Impossible de charger les statistiques")
        setIsLoading(false)

        // Utiliser des valeurs par défaut en cas d'erreur
        setStats({
          exercisesCount: "500+",
          studentsCount: "2,000+",
          submissionsCount: "15,000+",
          accuracyValue: "98%",
        })
      }
    }

    fetchStats()
  }, [])

  if (isLoading) {
    return (
      <div className="py-16 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-gray-900 dark:to-indigo-950">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[...Array(4)].map((_, index) => (
              <div key={index} className="text-center">
                <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse mb-2 mx-auto w-24"></div>
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse w-32 mx-auto"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    console.warn("Affichage des statistiques par défaut en raison d'une erreur:", error)
  }

  return (
    <section className="py-16 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-gray-900 dark:to-indigo-950">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <AnimatedCounter value={stats.exercisesCount} label="Exercices disponibles" />
          <AnimatedCounter value={stats.studentsCount} label="Étudiants actifs" />
          <AnimatedCounter value={stats.submissionsCount} label="Soumissions évaluées" />
          <AnimatedCounter value={stats.accuracyValue} label="Précision d'évaluation" />
        </div>
      </div>
    </section>
  )
}
