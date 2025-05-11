"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import type { LucideIcon } from "lucide-react"

interface FeatureCardProps {
  title: string
  description: string
  cta: string
  ctaLink: string
  imageSrc: string
  icon: LucideIcon
  color: string
  delay: number
}

export function FeatureCard({
  title,
  description,
  cta,
  ctaLink,
  imageSrc,
  icon: Icon,
  color,
  delay,
}: FeatureCardProps) {
  const colorClasses = {
    indigo: {
      bg: "from-indigo-50 to-white dark:from-gray-700 dark:to-gray-800",
      overlay: "bg-indigo-600/20",
      iconBg: "bg-indigo-100 dark:bg-indigo-900/30",
      iconColor: "text-indigo-600 dark:text-indigo-400",
      link: "text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300",
    },
    purple: {
      bg: "from-purple-50 to-white dark:from-gray-700 dark:to-gray-800",
      overlay: "bg-purple-600/20",
      iconBg: "bg-purple-100 dark:bg-purple-900/30",
      iconColor: "text-purple-600 dark:text-purple-400",
      link: "text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300",
    },
    blue: {
      bg: "from-blue-50 to-white dark:from-gray-700 dark:to-gray-800",
      overlay: "bg-blue-600/20",
      iconBg: "bg-blue-100 dark:bg-blue-900/30",
      iconColor: "text-blue-600 dark:text-blue-400",
      link: "text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300",
    },
  }

  const classes = colorClasses[color as keyof typeof colorClasses]

  return (
    <motion.div
      className={`bg-gradient-to-br ${classes.bg} rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow`}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
    >
      <div className="relative h-48">
        <Image src={imageSrc || "/placeholder.svg?height=192&width=384"} alt={title} fill className="object-cover" />
        <div className={`absolute inset-0 ${classes.overlay}`}></div>
      </div>
      <div className="p-6">
        <div className={`w-12 h-12 ${classes.iconBg} rounded-lg flex items-center justify-center mb-4`}>
          <Icon className={`h-6 w-6 ${classes.iconColor}`} />
        </div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{title}</h3>
        <p className="text-gray-600 dark:text-gray-300 mb-4">{description}</p>
        <Link href={ctaLink} className={`inline-flex items-center ${classes.link} font-medium`}>
          {cta}
          <ArrowRight className="ml-2 h-4 w-4" />
        </Link>
      </div>
    </motion.div>
  )
}
