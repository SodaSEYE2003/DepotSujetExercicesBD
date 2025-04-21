import React, { useState, useEffect } from "react";

interface PdfViewerProps {
  url?: string | null;
  title: string;
}

const PdfViewer: React.FC<PdfViewerProps> = ({ url, title }) => {
  const [decodedUrl, setDecodedUrl] = useState<string | null>(null);
  const [error, setError] = useState<boolean>(false);

  useEffect(() => {
    if (!url) {
      setDecodedUrl(null);
      return;
    }

    try {
      // Si c'est une chaîne hexadécimale (commence par 0x)
      if (typeof url === 'string' && url.startsWith('0x')) {
        // Supprimer le préfixe 0x et convertir en chaîne de caractères
        const hex = url.substring(2);
        let str = '';
        for (let i = 0; i < hex.length; i += 2) {
          const charCode = parseInt(hex.substr(i, 2), 16);
          str += String.fromCharCode(charCode);
        }
        setDecodedUrl(str);
      } else {
        // Si ce n'est pas une chaîne hexadécimale, utiliser l'URL telle quelle
        setDecodedUrl(typeof url === 'string' ? url : null);
      }
    } catch (err) {
      console.error("Erreur lors du décodage de l'URL:", err);
      setError(true);
    }
  }, [url]);

  if (!url) {
    return (
      <div className="aspect-[16/9] bg-gray-200 dark:bg-gray-600 rounded-lg flex items-center justify-center">
        <span className="text-gray-600 dark:text-gray-300">Aucun fichier disponible</span>
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

  return (
    <div className="pdf-container">
      <div className="w-full h-[500px] border border-gray-200 dark:border-gray-600 rounded-lg overflow-hidden">
        {decodedUrl ? (
          <iframe 
            src={decodedUrl} 
            className="w-full h-full" 
            title={title}
            sandbox="allow-scripts" // Retiré allow-same-origin pour éviter l'avertissement de sécurité
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PdfViewer;
