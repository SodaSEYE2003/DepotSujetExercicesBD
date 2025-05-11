"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Database, Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"

interface NavbarProps {
  darkMode: boolean
}

export function Navbar({ darkMode }: NavbarProps) {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // Effet pour détecter le défilement
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true)
      } else {
        setIsScrolled(false)
      }
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? "bg-white/90 dark:bg-gray-900/90 backdrop-blur-md shadow-md py-2" : "bg-transparent py-4"
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 text-lg font-semibold">
            <Database className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
            <span className="text-gray-900 dark:text-white">SGBD</span>
          </Link>

          {/* Navigation - Desktop */}
          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="/etudiant/exercises"
              className="text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            >
              Exercices
            </Link>

            <Link
              href="/about"
              className="text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            >
              À propos
            </Link>
          </nav>

          {/* Auth Buttons - Desktop */}
          <div className="hidden md:flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              className="border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400"
            >
              <Link href="/auth/login">Se connecter</Link>
            </Button>
            <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white">
              <Link href="/register">S'inscrire</Link>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-gray-700 dark:text-gray-300"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Menu"
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
          className="md:hidden bg-white dark:bg-gray-900 shadow-lg"
        >
          <div className="container mx-auto px-4 py-4">
            <nav className="flex flex-col gap-4">
              <Link
                href="/exercises"
                className="text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 py-2 transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Exercices
              </Link>

              <Link
                href="/about"
                className="text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 py-2 transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                À propos
              </Link>
              <div className="flex flex-col gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                <Button
                  variant="outline"
                  className="w-full justify-center border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400"
                >
                  <Link href="/auth/login" className="w-full text-center" onClick={() => setIsMobileMenuOpen(false)}>
                    Se connecter
                  </Link>
                </Button>
                <Button className="w-full justify-center bg-indigo-600 hover:bg-indigo-700 text-white">
                  <Link href="/auth/register" className="w-full text-center" onClick={() => setIsMobileMenuOpen(false)}>
                    S'inscrire
                  </Link>
                </Button>
              </div>
            </nav>
          </div>
        </motion.div>
      )}
    </header>
  )
}
