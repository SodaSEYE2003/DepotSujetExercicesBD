import type React from "react"

// Fonction utilitaire pour combiner des classes conditionnellement
function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ")
}

// Composant Card
interface CardProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Card({ className, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-lg border border-gray-200 bg-white text-gray-950 shadow-sm dark:border-gray-800 dark:bg-gray-950 dark:text-gray-50",
        className,
      )}
      {...props}
    />
  )
}

// Composant CardHeader
interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {}

export function CardHeader({ className, ...props }: CardHeaderProps) {
  return <div className={cn("flex flex-col space-y-1.5 p-6", className)} {...props} />
}

// Composant CardTitle
interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {}

export function CardTitle({ className, ...props }: CardTitleProps) {
  return <h3 className={cn("text-2xl font-semibold leading-none tracking-tight", className)} {...props} />
}

// Composant CardDescription
interface CardDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {}

export function CardDescription({ className, ...props }: CardDescriptionProps) {
  return <p className={cn("text-sm text-gray-500 dark:text-gray-400", className)} {...props} />
}

// Composant CardContent
interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {}

export function CardContent({ className, ...props }: CardContentProps) {
  return <div className={cn("p-6 pt-0", className)} {...props} />
}

// Composant CardFooter
interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {}

export function CardFooter({ className, ...props }: CardFooterProps) {
  return <div className={cn("flex items-center p-6 pt-0", className)} {...props} />
}
