"use client"

import { useState, useEffect, useRef } from "react"
import { motion, useInView } from "framer-motion"

interface AnimatedCounterProps {
  value: string
  label: string
}

export function AnimatedCounter({ value, label }: AnimatedCounterProps) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })
  const [displayValue, setDisplayValue] = useState("0")

  useEffect(() => {
    if (!isInView) return

    // Handle numeric values with "+" suffix
    const numericPart = value.replace(/[^0-9]/g, "")
    const suffix = value.replace(numericPart, "")
    const targetNumber = Number.parseInt(numericPart, 10)

    if (isNaN(targetNumber)) {
      setDisplayValue(value)
      return
    }

    let startValue = 0
    const duration = 2000 // 2 seconds
    const increment = Math.ceil(targetNumber / (duration / 16)) // 60fps

    const timer = setInterval(() => {
      startValue += increment
      if (startValue >= targetNumber) {
        setDisplayValue(numericPart + suffix)
        clearInterval(timer)
      } else {
        setDisplayValue(startValue + suffix)
      }
    }, 16)

    return () => clearInterval(timer)
  }, [isInView, value])

  return (
    <div ref={ref} className="text-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-3xl md:text-4xl font-bold text-indigo-600 dark:text-indigo-400 mb-2">{displayValue}</div>
        <div className="text-gray-600 dark:text-gray-300">{label}</div>
      </motion.div>
    </div>
  )
}
