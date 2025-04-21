import React, { useState, useEffect } from "react";
import { FileText } from 'lucide-react';

interface DirectPdfViewerProps {
  url?: string | null;
  title: string;
}

const DirectPdfViewer: React.FC<DirectPdfViewerProps> = ({ url, title }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!url) {
      setLoading(false);
      return;
    }

    // Vérifier si l'URL est valide
    const checkUrl = async () => {
      try {
        const response = await fetch(url, { method: 'HEAD' });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        setLoading(false);
      } catch (err) {
        console.error("Erreur lors de la vérification de l'URL:", err);
        setError(true);
        setLoading(false);
      }
    };

    checkUrl();
  }, [url]);

  if (!url) {
    return (
      <div className="aspect-[16/9] bg-gray-200 dark:bg-gray-600 rounded-lg flex items-center justify-center">
        <FileText className="w-16 h-16 text-gray-400 dark:text-gray-500" />
        <span className="ml-2 text-gray-600 dark:text-gray-300">Aucun fichier disponible</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="aspect-[16/9] bg-gray-200 dark:bg-gray-600 rounded-lg flex items-center justify-center">
        <span className="text-red-600 dark:text-red-300">Erreur lors du chargement du PDF</span>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="w-full h-[500px] flex items-center justify-center border border-gray-200 dark:border-gray-600 rounded-lg">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="pdf-container">
      <div className="w-full h-[500px] border border-gray-200 dark:border-gray-600 rounded-lg overflow-hidden">
        <object
          data={url}
          type="application/pdf"
          className="w-full h-full"
          title={title}
        >
          <div className="w-full h-full flex flex-col items-center justify-center">
            <FileText className="w-16 h-16 text-gray-400 dark:text-gray-500 mb-4" />
            <p className="text-gray-600 dark:text-gray-300">
              Impossible d'afficher le PDF directement.
            </p>
            <a 
              href={url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
            >
              Ouvrir le PDF
            </a>
          </div>
        </object>
      </div>
    </div>
  );
};

export default DirectPdfViewer;
