"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { FileText } from "lucide-react"

interface PdfViewerProps {
  url?: string | null
  title: string
}

const PdfViewer: React.FC<PdfViewerProps> = ({ url, title }) => {
  const [processedUrl, setProcessedUrl] = useState<string | null>(null)
  const [error, setError] = useState<boolean>(false)
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    if (!url) {
      setProcessedUrl(null)
      setLoading(false)
      return
    }

    console.log("PdfViewer - URL reçue:", url)

    try {
      // Si c'est une URL MinIO ou une URL standard, l'utiliser directement
      if (
        typeof url === "string" &&
        (url.startsWith("http://") || url.startsWith("https://") || url.includes("minio"))
      ) {
        console.log("PdfViewer - URL standard détectée:", url)
        setProcessedUrl(url)
        setLoading(false)
        return
      }

      // Si c'est une chaîne hexadécimale (commence par 0x)
      if (typeof url === "string" && url.startsWith("0x")) {
        // Supprimer le préfixe 0x et convertir en chaîne de caractères
        const hex = url.substring(2)
        let str = ""
        for (let i = 0; i < hex.length; i += 2) {
          const charCode = Number.parseInt(hex.substr(i, 2), 16)
          str += String.fromCharCode(charCode)
        }
        console.log("PdfViewer - URL décodée depuis hex:", str)
        setProcessedUrl(str)
      } else {
        // Si ce n'est pas une chaîne hexadécimale, utiliser l'URL telle quelle
        setProcessedUrl(typeof url === "string" ? url : null)
      }
    } catch (err) {
      console.error("PdfViewer - Erreur lors du décodage de l'URL:", err)
      setError(true)
    } finally {
      setLoading(false)
    }
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
        {processedUrl ? (
          <iframe
            src={processedUrl}
            className="w-full h-full"
            title={title}
            sandbox="allow-scripts allow-same-origin"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        )}
      </div>

      {/* Ajouter un lien de téléchargement direct */}
      {processedUrl && (
        <div className="mt-2 text-center">
          <a
            href={processedUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            Si le PDF ne s'affiche pas correctement, cliquez ici pour l'ouvrir dans un nouvel onglet
          </a>
        </div>
      )}
    </div>
  )
}

export default PdfViewer
