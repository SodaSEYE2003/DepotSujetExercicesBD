"use client"

import * as React from "react"

// Fonction utilitaire simplifiée pour combiner des classes CSS
function cn(...classes: (string | undefined | boolean)[]) {
  return classes.filter(Boolean).join(" ")
}

const SelectContext = React.createContext<{
  value: string
  onValueChange: (value: string) => void
  open: boolean
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
} | null>(null)

export interface SelectProps {
  value: string
  onValueChange: (value: string) => void
  children: React.ReactNode
  defaultValue?: string
}

export function Select({ children, value, onValueChange, defaultValue }: SelectProps) {
  const [open, setOpen] = React.useState(false)
  const initialValue = React.useRef(defaultValue)
  const initialValueRef = React.useRef(defaultValue)

  React.useEffect(() => {
    if (initialValueRef.current !== undefined) {
      onValueChange(initialValueRef.current)
      initialValueRef.current = undefined
    }
  }, [onValueChange])

  return (
    <SelectContext.Provider value={{ value, onValueChange, open, setOpen }}>
      <div className="relative">{children}</div>
    </SelectContext.Provider>
  )
}

export interface SelectTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  className?: string
  children?: React.ReactNode
}

export function SelectTrigger({ className, children, ...props }: SelectTriggerProps) {
  const context = React.useContext(SelectContext)

  if (!context) {
    throw new Error("SelectTrigger must be used within a Select")
  }

  return (
    <button
      type="button"
      className={cn(
        "flex h-10 w-full items-center justify-between rounded-md border border-gray-200 bg-white px-3 py-2 text-sm ring-offset-white focus:outline-none focus:ring-2 focus:ring-gray-950 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-800 dark:bg-gray-950 dark:ring-offset-gray-950 dark:focus:ring-gray-300",
        className,
      )}
      onClick={() => context.setOpen(!context.open)}
      aria-expanded={context.open}
      {...props}
    >
      {children}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-4 w-4 opacity-50"
      >
        <path d="m6 9 6 6 6-6" />
      </svg>
    </button>
  )
}

export function SelectValue({ placeholder, className }: { placeholder?: string; className?: string }) {
  const context = React.useContext(SelectContext)

  if (!context) {
    throw new Error("SelectValue must be used within a Select")
  }

  return <span className={cn("text-sm", className)}>{context.value || placeholder}</span>
}

export interface SelectContentProps {
  className?: string
  children?: React.ReactNode
}

export function SelectContent({ className, children }: SelectContentProps) {
  const context = React.useContext(SelectContext)

  if (!context) {
    throw new Error("SelectContent must be used within a Select")
  }

  if (!context.open) {
    return null
  }

  // Close the dropdown when clicking outside
  React.useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (!(event.target as Node).closest(".select-content") && !(event.target as Node).closest("button")) {
        context.setOpen(false)
      }
    }

    document.addEventListener("mousedown", handleOutsideClick)
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick)
    }
  }, [context])

  return (
    <div
      className={cn(
        "select-content absolute z-50 min-w-[8rem] overflow-hidden rounded-md border border-gray-200 bg-white text-gray-950 shadow-md animate-in fade-in-80 mt-1 w-full dark:border-gray-800 dark:bg-gray-950 dark:text-gray-50",
        className,
      )}
      style={{ top: "100%", left: 0, right: 0 }}
    >
      <div className="p-1">{children}</div>
    </div>
  )
}

export interface SelectItemProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string
  className?: string
  children?: React.ReactNode
}

export function SelectItem({ className, children, value, ...props }: SelectItemProps) {
  const context = React.useContext(SelectContext)

  if (!context) {
    throw new Error("SelectItem must be used within a Select")
  }

  const isSelected = context.value === value

  return (
    <button
      type="button"
      className={cn(
        "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 px-2 text-sm outline-none hover:bg-gray-100 hover:text-gray-900 focus:bg-gray-100 focus:text-gray-900 data-[disabled]:pointer-events-none data-[disabled]:opacity-50 dark:hover:bg-gray-800 dark:hover:text-gray-50 dark:focus:bg-gray-800 dark:focus:text-gray-50",
        isSelected && "bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-50",
        className,
      )}
      onClick={() => {
        context.onValueChange(value)
        context.setOpen(false)
      }}
      {...props}
    >
      {children}
    </button>
  )
}
