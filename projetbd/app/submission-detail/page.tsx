"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, Download, Check, X, MessageSquare } from "lucide-react"
import Link from "next/link"

type SubmissionDetail = {
  id: string
  title: string
  date: string
  status: string
  statusColor: string
  grade: string | null
  maxGrade: string
  student: {
    name: string
    avatar: string | null
    id: string
    initials: string
    class: string
  }
  exercise: {
    title: string
    questions: {
      id: number
      text: string
      points: number
      maxPoints: number
      studentAnswer: string
      correction: string
      feedback: string
      isCorrect: boolean
    }[]
  }
  generalFeedback: string
  teacherName: string
}

export default function SubmissionDetailPage() {
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [submission, setSubmission] = useState<SubmissionDetail>({
    id: "sub123",
    title: "Requêtes SQL avancées - Réponse.pdf",
    date: "Soumis le 16 mars 2025",
    status: "Évalué",
    statusColor: "bg-green-500",
    grade: "17",
    maxGrade: "20",
    student: {
      name: "Emma Dupont",
      avatar: null,
      id: "ED2025",
      initials: "ED",
      class: "Classe B2 - Informatique",
    },
    exercise: {
      title: "Requêtes SQL avancées",
      questions: [
        {
          id: 1,
          text: "Écrivez une requête SQL qui permet de récupérer les noms et prénoms des clients qui ont effectué plus de 5 commandes en 2024.",
          points: 3,
          maxPoints: 3,
          studentAnswer:
            "SELECT c.nom, c.prenom FROM clients c JOIN commandes cmd ON c.id = cmd.client_id WHERE YEAR(cmd.date_commande) = 2024 GROUP BY c.id HAVING COUNT(cmd.id) > 5;",
          correction:
            "SELECT c.nom, c.prenom FROM clients c JOIN commandes cmd ON c.id = cmd.client_id WHERE YEAR(cmd.date_commande) = 2024 GROUP BY c.id HAVING COUNT(cmd.id) > 5;",
          feedback: "Parfait ! La requête est correcte et optimisée.",
          isCorrect: true,
        },
        {
          id: 2,
          text: "Écrivez une requête SQL qui calcule le montant total des commandes par mois pour l'année 2024, trié par mois.",
          points: 2.5,
          maxPoints: 3,
          studentAnswer:
            "SELECT MONTH(date_commande) as mois, SUM(montant) as total FROM commandes WHERE YEAR(date_commande) = 2024 GROUP BY mois ORDER BY mois;",
          correction:
            "SELECT MONTH(date_commande) as mois, SUM(montant) as total FROM commandes WHERE YEAR(date_commande) = 2024 GROUP BY MONTH(date_commande) ORDER BY mois;",
          feedback: "Presque parfait. Le GROUP BY devrait utiliser MONTH(date_commande) et non l'alias 'mois'.",
          isCorrect: false,
        },
        {
          id: 3,
          text: "Écrivez une requête avec une CTE qui trouve les produits qui n'ont jamais été commandés.",
          points: 4,
          maxPoints: 4,
          studentAnswer:
            "WITH produits_commandes AS (SELECT DISTINCT produit_id FROM lignes_commande) SELECT p.id, p.nom FROM produits p LEFT JOIN produits_commandes pc ON p.id = pc.produit_id WHERE pc.produit_id IS NULL;",
          correction:
            "WITH produits_commandes AS (SELECT DISTINCT produit_id FROM lignes_commande) SELECT p.id, p.nom FROM produits p LEFT JOIN produits_commandes pc ON p.id = pc.produit_id WHERE pc.produit_id IS NULL;",
          feedback: "Excellente utilisation de la CTE et du LEFT JOIN pour trouver les produits non commandés.",
          isCorrect: true,
        },
        {
          id: 4,
          text: "Écrivez une requête qui utilise une fonction de fenêtrage pour calculer le rang des produits par catégorie en fonction de leur prix.",
          points: 3.5,
          maxPoints: 5,
          studentAnswer:
            "SELECT p.nom, p.prix, c.nom as categorie, RANK() OVER (PARTITION BY p.categorie_id ORDER BY p.prix DESC) as rang FROM produits p JOIN categories c ON p.categorie_id = c.id;",
          correction:
            "SELECT p.nom, p.prix, c.nom as categorie, RANK() OVER (PARTITION BY p.categorie_id ORDER BY p.prix DESC) as rang FROM produits p JOIN categories c ON p.categorie_id = c.id;",
          feedback:
            "Bonne utilisation de RANK(). Pour améliorer, vous pourriez ajouter une clause WHERE pour filtrer les produits inactifs.",
          isCorrect: true,
        },
        {
          id: 5,
          text: "Écrivez une requête qui utilise des sous-requêtes pour trouver les clients qui ont dépensé plus que la moyenne de tous les clients en 2024.",
          points: 4,
          maxPoints: 5,
          studentAnswer:
            "SELECT c.nom, c.prenom, SUM(cmd.montant) as total_depense FROM clients c JOIN commandes cmd ON c.id = cmd.client_id WHERE YEAR(cmd.date_commande) = 2024 GROUP BY c.id HAVING total_depense > (SELECT AVG(montant) FROM commandes WHERE YEAR(date_commande) = 2024);",
          correction:
            "SELECT c.nom, c.prenom, SUM(cmd.montant) as total_depense FROM clients c JOIN commandes cmd ON c.id = cmd.client_id WHERE YEAR(cmd.date_commande) = 2024 GROUP BY c.id HAVING SUM(cmd.montant) > (SELECT AVG(total) FROM (SELECT client_id, SUM(montant) as total FROM commandes WHERE YEAR(date_commande) = 2024 GROUP BY client_id) as client_totals);",
          feedback:
            "Votre requête compare avec la moyenne des montants individuels des commandes, pas avec la moyenne des dépenses totales par client. Voir la correction.",
          isCorrect: false,
        },
      ],
    },
    generalFeedback:
      "Très bon travail dans l'ensemble. Vous maîtrisez bien les jointures et les fonctions d'agrégation. Attention aux subtilités des sous-requêtes et des GROUP BY avec les alias. Continuez à pratiquer les fonctions de fenêtrage qui sont très bien comprises.",
    teacherName: "Prof. Martin Dubois",
  })

  // Check if dark mode is enabled on page load
  useEffect(() => {
    if (document.documentElement.classList.contains("dark")) {
      setIsDarkMode(true)
    }
  }, [])

  // Calculate total points
  const totalPoints = submission.exercise.questions.reduce((sum, q) => sum + q.points, 0)
  const totalMaxPoints = submission.exercise.questions.reduce((sum, q) => sum + q.maxPoints, 0)

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-4 md:p-6">
      <div className="max-w-5xl mx-auto">
        {/* Navigation */}
        <div className="mb-6">
          <Link
            href="/submissions"
            className="inline-flex items-center text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour aux soumissions
          </Link>
        </div>

        {/* Copy header */}
        <div className="bg-white dark:bg-gray-800 rounded-t-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-800 dark:text-white">{submission.exercise.title}</h1>
              <p className="text-gray-500 dark:text-gray-400 mt-1">{submission.date}</p>
            </div>
            <div className="flex items-center gap-4">
              <button className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center">
                <Download className="w-4 h-4 mr-2" />
                Télécharger
              </button>
            </div>
          </div>

          <div className="mt-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-t border-gray-200 dark:border-gray-700 pt-4">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-medium mr-3">
                {submission.student.initials}
              </div>
              <div>
                <p className="font-medium text-gray-800 dark:text-white">{submission.student.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {submission.student.class} • ID: {submission.student.id}
                </p>
              </div>
            </div>

            <div className="flex flex-col items-end">
              <div className="flex items-center">
                <div className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">
                  {submission.grade}/{submission.maxGrade}
                </div>
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {totalPoints}/{totalMaxPoints} points
              </div>
            </div>
          </div>
        </div>

        {/* Copy content - looks like paper */}
        <div className="bg-white dark:bg-gray-800 shadow-sm border-x border-gray-200 dark:border-gray-700">
          {/* Questions and answers */}
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {submission.exercise.questions.map((question) => (
              <div key={question.id} className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-gray-800 dark:text-white">Question {question.id}</h3>
                    <p className="text-gray-600 dark:text-gray-300 mt-1">{question.text}</p>
                  </div>
                  <div className="ml-4 flex items-center">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold ${question.isCorrect ? "bg-green-500" : "bg-red-500"}`}
                    >
                      {question.points}/{question.maxPoints}
                    </div>
                  </div>
                </div>

                {/* Student answer */}
                <div className="mt-4 mb-4">
                  <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Votre réponse:</div>
                  <div className="bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-md p-4 font-mono text-sm overflow-x-auto">
                    {question.studentAnswer}
                  </div>
                </div>

                {/* Teacher feedback */}
                <div className="mt-4 flex items-start">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-white mr-2 flex-shrink-0 ${question.isCorrect ? "bg-green-500" : "bg-red-500"}`}
                  >
                    {question.isCorrect ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700/50 border-l-4 border-indigo-500 rounded-r-md p-3 flex-1">
                    <p className="text-gray-600 dark:text-gray-300 text-sm">{question.feedback}</p>

                    {!question.isCorrect && (
                      <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                        <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Correction:</div>
                        <div className="font-mono text-sm text-gray-800 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 p-2 rounded">
                          {question.correction}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Teacher's general feedback */}
        <div className="bg-white dark:bg-gray-800 rounded-b-lg shadow-sm border border-t-0 border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-start">
            <MessageSquare className="w-5 h-5 text-indigo-500 mr-2 mt-0.5" />
            <div>
              <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-2">
                Commentaire général de {submission.teacherName}
              </h3>
              <p className="text-gray-600 dark:text-gray-300">{submission.generalFeedback}</p>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <div className="text-sm text-gray-500 dark:text-gray-400">Évalué le 18 mars 2025</div>
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 font-medium mr-2">
                MD
              </div>
              <div className="text-sm font-medium text-gray-700 dark:text-gray-300">{submission.teacherName}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

