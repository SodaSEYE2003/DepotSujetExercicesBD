"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import {
  Database,
  Sun,
  Moon,
  ChevronDown,
  Home,
  ChevronRight,
  Clock,
  User,
  FileText,
  Download,
  LinkIcon,
  ExternalLink,
  UploadCloud,
  X,
  Check,
  Award,
  Brain,
} from "lucide-react"

export default function ExerciseSubmission() {
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)

  // Methods
  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode)
    if (!isDarkMode) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }

  const removeFile = () => {
    setUploadedFile(null)
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  // Handle file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadedFile(e.target.files[0])
    }
  }

  // Lifecycle hooks
  useEffect(() => {
    if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
      setIsDarkMode(true)
      document.documentElement.classList.add("dark")
    }
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 transition-colors duration-500">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link href="/dashboard" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                  <Database className="w-5 h-5 text-white" />
                </div>
                <span className="text-lg font-semibold text-gray-800 dark:text-white">DB Eval</span>
              </Link>
            </div>

            <div className="flex items-center space-x-4">
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
                <button className="flex items-center space-x-1 text-sm text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors">
                  <Image
                    src="https://i.pravatar.cc/32?img=8"
                    alt="Avatar"
                    width={32}
                    height={32}
                    className="w-8 h-8 rounded-full border-2 border-indigo-500"
                  />
                  <ChevronDown className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumbs */}
        <nav className="flex mb-6" aria-label="Breadcrumb">
          <ol className="inline-flex items-center space-x-1 md:space-x-3">
            <li className="inline-flex items-center">
              <Link
                href="/dashboard"
                className="inline-flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400"
              >
                <Home className="w-4 h-4 mr-2" />
                Accueil
              </Link>
            </li>
            <li>
              <div className="flex items-center">
                <ChevronRight className="w-5 h-5 text-gray-400" />
                <Link
                  href="/exercises"
                  className="ml-1 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400"
                >
                  Exercices
                </Link>
              </div>
            </li>
            <li aria-current="page">
              <div className="flex items-center">
                <ChevronRight className="w-5 h-5 text-gray-400" />
                <span className="ml-1 text-sm font-medium text-gray-500 dark:text-gray-400">Requêtes SQL avancées</span>
              </div>
            </li>
          </ol>
        </nav>

        {/* Exercise Header */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-6 border border-gray-100 dark:border-gray-700">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <div className="flex items-center mb-2">
                <span className="px-2 py-1 text-xs rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 mr-2">
                  SQL
                </span>
                <span className="px-2 py-1 text-xs rounded-full bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300">
                  Niveau intermédiaire
                </span>
              </div>
              <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Requêtes SQL avancées</h1>
              <p className="text-gray-600 dark:text-gray-300">
                Jointures, sous-requêtes et fonctions d&apos;agrégation
              </p>
            </div>

            <div className="mt-4 md:mt-0 flex flex-col items-end">
              <div className="flex items-center space-x-2 mb-2">
                <Clock className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                <span className="text-sm text-gray-600 dark:text-gray-300">Date limite: 25 mars 2025</span>
              </div>
              <div className="flex items-center space-x-2">
                <User className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                <span className="text-sm text-gray-600 dark:text-gray-300">Prof. Sarah Martin</span>
              </div>
            </div>
          </div>
        </div>

        {/* Exercise Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Exercise Description */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Description</h2>

              <div className="prose dark:prose-invert max-w-none">
                <p>
                  Dans cet exercice, vous allez travailler avec une base de données de commerce électronique comprenant
                  plusieurs tables interconnectées. Vous devrez écrire des requêtes SQL avancées pour extraire des
                  informations pertinentes et résoudre des problèmes d&apos;analyse de données.
                </p>

                <h3>Objectifs d&apos;apprentissage</h3>
                <ul>
                  <li>Maîtriser les jointures complexes (INNER, LEFT, RIGHT, FULL)</li>
                  <li>Utiliser des sous-requêtes efficacement</li>
                  <li>Appliquer des fonctions d&apos;agrégation et de fenêtrage</li>
                  <li>Optimiser les requêtes pour de meilleures performances</li>
                </ul>

                <h3>Schéma de la base de données</h3>
                <p>La base de données comprend les tables suivantes :</p>

                <div className="overflow-x-auto">
                  <table className="min-w-full border border-gray-200 dark:border-gray-700">
                    <thead>
                      <tr>
                        <th className="border border-gray-200 dark:border-gray-700 px-4 py-2 bg-gray-50 dark:bg-gray-700/50 text-left">
                          Table
                        </th>
                        <th className="border border-gray-200 dark:border-gray-700 px-4 py-2 bg-gray-50 dark:bg-gray-700/50 text-left">
                          Description
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="border border-gray-200 dark:border-gray-700 px-4 py-2 font-medium">customers</td>
                        <td className="border border-gray-200 dark:border-gray-700 px-4 py-2">
                          Informations sur les clients
                        </td>
                      </tr>
                      <tr>
                        <td className="border border-gray-200 dark:border-gray-700 px-4 py-2 font-medium">products</td>
                        <td className="border border-gray-200 dark:border-gray-700 px-4 py-2">Catalogue de produits</td>
                      </tr>
                      <tr>
                        <td className="border border-gray-200 dark:border-gray-700 px-4 py-2 font-medium">orders</td>
                        <td className="border border-gray-200 dark:border-gray-700 px-4 py-2">
                          Commandes passées par les clients
                        </td>
                      </tr>
                      <tr>
                        <td className="border border-gray-200 dark:border-gray-700 px-4 py-2 font-medium">
                          order_items
                        </td>
                        <td className="border border-gray-200 dark:border-gray-700 px-4 py-2">
                          Produits inclus dans chaque commande
                        </td>
                      </tr>
                      <tr>
                        <td className="border border-gray-200 dark:border-gray-700 px-4 py-2 font-medium">
                          categories
                        </td>
                        <td className="border border-gray-200 dark:border-gray-700 px-4 py-2">
                          Catégories de produits
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <h3>Exercices</h3>
                <ol>
                  <li>
                    <strong>Jointure simple :</strong> Écrivez une requête pour obtenir la liste de tous les clients
                    avec leurs commandes, y compris les clients qui n&apos;ont pas encore passé de commande.
                  </li>
                  <li>
                    <strong>Sous-requête :</strong> Trouvez les produits qui n&apos;ont jamais été commandés.
                  </li>
                  <li>
                    <strong>Agrégation :</strong> Calculez le montant total des ventes par catégorie de produit, trié
                    par ordre décroissant.
                  </li>
                  <li>
                    <strong>Requête complexe :</strong> Identifiez les 5 clients qui ont dépensé le plus, avec le nombre
                    de commandes passées et le montant total.
                  </li>
                  <li>
                    <strong>Optimisation :</strong> Réécrivez la requête suivante pour améliorer ses performances :
                    <pre>
                      <code>{`SELECT c.customer_name, COUNT(o.order_id) 
FROM customers c 
LEFT JOIN orders o ON c.customer_id = o.customer_id 
WHERE (SELECT COUNT(*) FROM order_items oi WHERE oi.order_id = o.order_id) > 5 
GROUP BY c.customer_name;`}</code>
                    </pre>
                  </li>
                </ol>

                <h3>Consignes de soumission</h3>
                <p>Soumettez vos réponses dans un fichier PDF contenant :</p>
                <ul>
                  <li>Les requêtes SQL pour chaque exercice</li>
                  <li>Une explication de votre approche pour chaque requête</li>
                  <li>Les résultats attendus (vous pouvez utiliser des exemples fictifs)</li>
                  <li>
                    Pour l&apos;exercice d&apos;optimisation, expliquez pourquoi votre solution est plus performante
                  </li>
                </ul>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Ressources supplémentaires</h2>

              <div className="space-y-4">
                <div className="flex items-center p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                  <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                    <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="ml-4 flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-800 dark:text-white">Schema_BDD_Ecommerce.pdf</p>
                      <button className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300">
                        <Download className="w-5 h-5" />
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Schéma détaillé de la base de données
                    </p>
                  </div>
                </div>

                <div className="flex items-center p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                  <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                    <Database className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="ml-4 flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-800 dark:text-white">Données_exemple.sql</p>
                      <button className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300">
                        <Download className="w-5 h-5" />
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Script SQL avec données d&apos;exemple
                    </p>
                  </div>
                </div>

                <div className="flex items-center p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                  <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                    <LinkIcon className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div className="ml-4 flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-800 dark:text-white">Guide d&apos;optimisation SQL</p>
                      <a
                        href="#"
                        className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300"
                      >
                        <ExternalLink className="w-5 h-5" />
                      </a>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Ressource externe sur l&apos;optimisation des requêtes
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Submission and Status */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Soumettre votre réponse</h2>

              <div className="mb-6 border border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6">
                <div className="flex flex-col items-center justify-center text-center">
                  <UploadCloud className="w-12 h-12 text-gray-400 dark:text-gray-500 mb-4" />
                  <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-2">Déposer votre fichier</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                    Glissez-déposez votre fichier PDF ici ou cliquez pour parcourir
                  </p>
                  <label
                    htmlFor="file-upload"
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors cursor-pointer"
                  >
                    Parcourir les fichiers
                    <input id="file-upload" type="file" accept=".pdf" className="hidden" onChange={handleFileUpload} />
                  </label>
                </div>
              </div>

              {uploadedFile && (
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
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {formatFileSize(uploadedFile.size)}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="mb-4">
                <label htmlFor="comments" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Commentaires (optionnel)
                </label>
                <textarea
                  id="comments"
                  rows={3}
                  placeholder="Ajoutez des commentaires ou des questions pour votre professeur..."
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400"
                />
              </div>

              <button  className={`w-full py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors duration-300 flex items-center justify-center ${!uploadedFile ? "opacity-70 cursor-not-allowed" : ""}`}  disabled={!uploadedFile}>
                <span>Soumettre</span>
                </button>

            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Statut</h2>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                      <Check className="w-4 h-4 text-green-600 dark:text-green-400" />
                    </div>
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Exercice publié</span>
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">15 mars 2025</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
                      <Clock className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                    </div>
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Date limite</span>
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">25 mars 2025</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                      <FileText className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                    </div>
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Soumission</span>
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">En attente</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                      <Award className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                    </div>
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Évaluation</span>
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">En attente</span>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <h3 className="text-md font-medium text-gray-800 dark:text-white mb-3">Progression</h3>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mb-2">
                  <div className="bg-indigo-600 h-2.5 rounded-full" style={{ width: "25%" }}></div>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">1 étape sur 4 complétée</p>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Aide IA</h2>

              <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                Besoin d&apos;aide pour comprendre cet exercice ? Notre assistant IA peut vous guider sans vous donner
                directement les réponses.
              </p>

              <button className="w-full py-2 px-4 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-800 dark:text-white rounded-lg transition-colors duration-300 flex items-center justify-center">
                <Brain className="w-5 h-5 mr-2" />
                <span>Demander de l&apos;aide</span>
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}