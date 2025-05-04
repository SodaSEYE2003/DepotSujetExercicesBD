"use client"

import type React from "react"
import { createContext, useContext, useState } from "react"

// Fonction utilitaire pour combiner des classes conditionnellement
function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ")
}

// Types
type TabsContextValue = {
  value: string
  onValueChange: (value: string) => void
}

// Contexte pour partager l'état entre les composants
const TabsContext = createContext<TabsContextValue | undefined>(undefined)

function useTabs() {
  const context = useContext(TabsContext)
  if (!context) {
    throw new Error("Tabs components must be used within a Tabs provider")
  }
  return context
}

// Composant principal Tabs
interface TabsProps extends React.HTMLAttributes<HTMLDivElement> {
  defaultValue?: string
  value?: string
  onValueChange?: (value: string) => void
  children: React.ReactNode
}

export function Tabs({ defaultValue, value, onValueChange, children, className, ...props }: TabsProps) {
  // État local si aucune valeur n'est fournie
  const [tabValue, setTabValue] = useState(defaultValue || "")

  // Utiliser la valeur fournie ou l'état local
  const currentValue = value !== undefined ? value : tabValue
  const handleValueChange = onValueChange || setTabValue

  return (
    <TabsContext.Provider value={{ value: currentValue, onValueChange: handleValueChange }}>
      <div className={cn("w-full", className)} {...props}>
        {children}
      </div>
    </TabsContext.Provider>
  )
}

// Liste des onglets
interface TabsListProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

export function TabsList({ children, className, ...props }: TabsListProps) {
  return (
    <div
      role="tablist"
      className={cn(
        "inline-flex h-10 items-center justify-center rounded-md bg-gray-100 p-1 text-gray-500 dark:bg-gray-800 dark:text-gray-400",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  )
}

// Déclencheur d'onglet
interface TabsTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string
  children: React.ReactNode
}

export function TabsTrigger({ value, children, className, ...props }: TabsTriggerProps) {
  const { value: selectedValue, onValueChange } = useTabs()
  const isSelected = selectedValue === value

  return (
    <button
      role="tab"
      type="button"
      aria-selected={isSelected}
      data-state={isSelected ? "active" : "inactive"}
      onClick={() => onValueChange(value)}
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 dark:ring-offset-gray-950 dark:focus-visible:ring-gray-800",
        isSelected
          ? "bg-white text-gray-900 shadow-sm dark:bg-gray-950 dark:text-gray-50"
          : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  )
}

// Contenu de l'onglet
interface TabsContentProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string
  children: React.ReactNode
}

export function TabsContent({ value, children, className, ...props }: TabsContentProps) {
  const { value: selectedValue } = useTabs()
  const isSelected = selectedValue === value

  if (!isSelected) return null

  return (
    <div
      role="tabpanel"
      data-state={isSelected ? "active" : "inactive"}
      className={cn(
        "mt-2 ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2 dark:ring-offset-gray-950 dark:focus-visible:ring-gray-800",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  )
}
