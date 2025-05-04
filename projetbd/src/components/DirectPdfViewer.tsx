"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { FileText } from "lucide-react"

interface DirectPdfViewerProps {
  url?: string | null
  title: string
}

const DirectPdfViewer: React.FC<DirectPdfViewerProps> = ({ url, title }) => {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [processedUrl, setProcessedUrl] = useState<string | null>(null)

  useEffect(() => {
    if (!url) {
      setLoading(false)
      return
    }

    console.log("DirectPdfViewer - URL reçue:", url)

    // Traiter l'URL si nécessaire
    const processUrl = (inputUrl: string): string => {
      // Si l'URL est déjà correcte, la retourner telle quelle
      if (inputUrl.startsWith("http://") || inputUrl.startsWith("https://")) {
        return inputUrl
      }

      // Si c'est une chaîne hexadécimale (commence par 0x)
      if (inputUrl.startsWith("0x")) {
        try {
          // Supprimer le préfixe 0x et convertir en chaîne de caractères
          const hex = inputUrl.substring(2)
          let str = ""
          for (let i = 0; i < hex.length; i += 2) {
            const charCode = Number.parseInt(hex.substr(i, 2), 16)
            str += String.fromCharCode(charCode)
          }
          console.log("URL décodée depuis hex:", str)
          return str
        } catch (err) {
          console.error("Erreur lors du décodage de l'URL hexadécimale:", err)
          return inputUrl
        }
      }

      return inputUrl
    }

    const finalUrl = processUrl(url)
    console.log("DirectPdfViewer - URL traitée:", finalUrl)
    setProcessedUrl(finalUrl)

    // Vérifier si l'URL est valide
    const checkUrl = async () => {
      try {
        // Pour éviter les problèmes CORS, nous n'utilisons pas fetch pour vérifier l'URL
        // Au lieu de cela, nous supposons que l'URL est valide et nous laissons l'iframe gérer l'erreur
        setLoading(false)
      } catch (err) {
        console.error("Erreur lors de la vérification de l'URL:", err)
        setError(true)
        setLoading(false)
      }
    }

    checkUrl()
  }, [url])

  if (!url) {
    return (
      <div className="aspect-[16/9] bg-gray-200 dark:bg-gray-600 rounded-lg flex items-center justify-center">
        <FileText className="w-16 h-16 text-gray-400 dark:text-gray-500" />
        <span className="ml-2 text-gray-600 dark:text-gray-300">Aucun fichier disponible</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="aspect-[16/9] bg-gray-200 dark:bg-gray-600 rounded-lg flex items-center justify-center">
        <span className="text-red-600 dark:text-red-300">Erreur lors du chargement du PDF</span>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="w-full h-[500px] flex items-center justify-center border border-gray-200 dark:border-gray-600 rounded-lg">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    )
  }

  return (
    <div className="pdf-container">
      <div className="w-full h-[500px] border border-gray-200 dark:border-gray-600 rounded-lg overflow-hidden">
        <iframe
          src={processedUrl || ""}
          className="w-full h-full"
          title={title}
          sandbox="allow-scripts allow-same-origin"
        >
          <div className="w-full h-full flex flex-col items-center justify-center">
            <FileText className="w-16 h-16 text-gray-400 dark:text-gray-500 mb-4" />
            <p className="text-gray-600 dark:text-gray-300">Impossible d'afficher le PDF directement.</p>
            <a
              href={processedUrl || ""}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
            >
              Ouvrir le PDF
            </a>
          </div>
        </iframe>
      </div>
    </div>
  )
}

export default DirectPdfViewer
