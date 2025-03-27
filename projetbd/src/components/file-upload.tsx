"use client"

import type React from "react"

import { useState } from "react"
import { UploadCloud, FileText, X } from "lucide-react"

interface FileUploadProps {
  onFileChange: (file: File | null) => void
  acceptedTypes?: string
}

export default function FileUpload({ onFileChange, acceptedTypes = ".pdf" }: FileUploadProps) {
  const [file, setFile] = useState<File | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0]
      setFile(selectedFile)
      onFileChange(selectedFile)
    }
  }

  const removeFile = () => {
    setFile(null)
    onFileChange(null)
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  return (
    <div>
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
            <input id="file-upload" type="file" accept={acceptedTypes} className="hidden" onChange={handleFileChange} />
          </label>
        </div>
      </div>

      {file && (
        <div className="mb-6">
          <div className="flex items-center p-3 rounded-lg bg-gray-50 dark:bg-gray-700/30 border border-gray-200 dark:border-gray-600">
            <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
              <FileText className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
            <div className="ml-4 flex-1">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-800 dark:text-white">{file.name}</p>
                <button
                  onClick={removeFile}
                  className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{formatFileSize(file.size)}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}