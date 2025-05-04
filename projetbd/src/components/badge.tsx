import type React from "react"

// Fonction utilitaire pour combiner des classes conditionnellement
function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ")
}

// Types de variantes pour le badge
type BadgeVariant = "default" | "secondary" | "destructive" | "outline" | "success" | "warning"

// Props du composant Badge
interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: BadgeVariant
}

// Composant Badge
export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  // Styles de base et variantes
  const variantStyles = {
    default: "bg-primary text-primary-foreground hover:bg-primary/80",
    secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
    destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/80",
    outline: "text-foreground border border-input hover:bg-accent hover:text-accent-foreground",
    success: "bg-green-500 text-white hover:bg-green-600",
    warning: "bg-yellow-500 text-white hover:bg-yellow-600",
  }

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        variantStyles[variant],
        className,
      )}
      {...props}
    />
  )
}
