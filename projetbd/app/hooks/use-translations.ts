"use client"

import { useState, useEffect } from "react"
import { fr } from "../i18n/translations"

export function useTranslations() {
  const [translations, setTranslations] = useState(fr)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    setIsLoaded(true)
  }, [])

  const t = (key: string) => {
    if (!isLoaded) return ""

    const keys = key.split(".")
    let value: any = translations

    for (const k of keys) {
      if (value === undefined) return key
      value = value[k]
    }

    return value || key
  }

  return { t, isLoaded }
}
