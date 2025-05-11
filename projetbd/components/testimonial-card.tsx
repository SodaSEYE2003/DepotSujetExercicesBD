"use client"

import { motion } from "framer-motion"
import { Quote } from "lucide-react"

interface TestimonialCardProps {
  quote: string
  author: string
  role: string
  delay: number
}

export function TestimonialCard({ quote, author, role, delay }: TestimonialCardProps) {
  return (
    <motion.div
      className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
    >
      <Quote className="h-8 w-8 text-indigo-400 mb-4" />
      <p className="text-gray-700 dark:text-gray-300 mb-4 italic">{quote}</p>
      <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
        <p className="font-semibold text-gray-900 dark:text-white">{author}</p>
        <p className="text-gray-500 dark:text-gray-400 text-sm">{role}</p>
      </div>
    </motion.div>
  )
}
