"use client"

interface ProgressProps {
  value?: number
  max?: number
  className?: string
}

export function Progress({ value = 0, max = 100, className = "" }: ProgressProps) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100))

  return (
    <div className={`relative h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700 ${className}`}>
      <div
        className="h-full w-full flex-1 bg-indigo-600 dark:bg-indigo-400 transition-all duration-300 ease-in-out"
        style={{ width: `${percentage}%` }}
      />
    </div>
  )
}
