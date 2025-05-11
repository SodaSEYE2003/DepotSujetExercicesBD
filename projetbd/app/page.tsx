"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import {
  Database,
  Users,
  CheckCircle,
  ChevronRight,
  Code,
  Server,
  BookOpen,
  Sparkles,
  Brain,
  FileText,
  Upload,
  CheckCheck,
  Moon,
  Sun,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTranslations } from "./hooks/use-translations"
import { AnimatedCounter } from "../components/animated-counter"
import { TestimonialCard } from "../components/testimonial-card"
import { FeatureCard } from "../components/feature-card"
import { AIAnimation } from "../components/ai-animation"
import { Navbar } from "../components/navbar"

// Images pour la page d'accueil
const HERO_IMAGE = "/images/database-hero.png"
const FEATURE_1_IMAGE = "/images/sql-code.png"
const FEATURE_2_IMAGE = "/images/dbms-icon.jpg"
const FEATURE_3_IMAGE = "/images/progression.jpg"

export default function HomePage() {
  const { t, isLoaded } = useTranslations()
  const [darkMode, setDarkMode] = useState(false)
  const [activeTestimonial, setActiveTestimonial] = useState(0)
  const [isVisible, setIsVisible] = useState(false)

  // Effet pour détecter le mode sombre du système
  useEffect(() => {
    if (typeof window !== "undefined") {
      const isDarkMode = window.matchMedia("(prefers-color-scheme: dark)").matches
      setDarkMode(isDarkMode)

      // Observer les changements de préférence
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")
      const handleChange = (e: MediaQueryListEvent) => setDarkMode(e.matches)
      mediaQuery.addEventListener("change", handleChange)

      return () => mediaQuery.removeEventListener("change", handleChange)
    }
  }, [])

  // Effet pour faire défiler les témoignages
  useEffect(() => {
    if (!isLoaded) return

    const interval = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % t("testimonials.items").length)
    }, 8000)

    return () => clearInterval(interval)
  }, [isLoaded, t])

  // Effet pour l'animation d'apparition
  useEffect(() => {
    setIsVisible(true)
  }, [])

  // Fonction pour basculer le mode sombre
  const toggleDarkMode = () => {
    setDarkMode(!darkMode)
    document.documentElement.classList.toggle("dark")
  }

  // Si les traductions ne sont pas encore chargées, afficher un loader
  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  return (
    <div
      className={`min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 ${darkMode ? "dark:from-gray-900 dark:via-gray-800 dark:to-indigo-950 dark" : ""}`}
    >
      {/* Navbar */}
      <Navbar darkMode={darkMode} />

      {/* Bouton de basculement du mode sombre */}
      <button
        onClick={toggleDarkMode}
        className="fixed top-20 right-4 z-40 p-2 rounded-full bg-white dark:bg-gray-800 shadow-md"
        aria-label={darkMode ? "Activer le mode clair" : "Activer le mode sombre"}
      >
        {darkMode ? <Sun className="h-5 w-5 text-yellow-500" /> : <Moon className="h-5 w-5 text-indigo-600" />}
      </button>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-24">
        {/* Cercles décoratifs */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-purple-200 dark:bg-purple-900/20 rounded-full filter blur-3xl opacity-50"></div>
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-indigo-200 dark:bg-indigo-900/20 rounded-full filter blur-3xl opacity-50"></div>

        {/* Animation IA */}
        <AIAnimation />

        <div className="container mx-auto px-4 py-20 md:py-32 relative z-10">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="md:w-1/2 space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
                transition={{ duration: 0.5 }}
              >
                <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white leading-tight">
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">
                    SGBD
                  </span>{" "}
                  <br />
                  {t("hero.title")}
                </h1>
              </motion.div>

              <motion.p
                className="text-xl text-gray-600 dark:text-gray-300"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                {t("hero.subtitle")}
              </motion.p>

              <motion.div
                className="flex flex-wrap gap-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white border-none"
                >
                  <Link href="/etudiant" className="flex items-center">
                    {t("hero.cta.primary")}
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="border-indigo-600 text-indigo-600 hover:bg-indigo-50 dark:border-indigo-400 dark:text-indigo-400 dark:hover:bg-indigo-950"
                >
                  <Link href="/etudiant/exercices">{t("hero.cta.secondary")}</Link>
                </Button>
              </motion.div>

              <motion.div
                className="flex items-center gap-2 text-gray-500 dark:text-gray-400"
                initial={{ opacity: 0 }}
                animate={{ opacity: isVisible ? 1 : 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span>{t("hero.features.feature1")}</span>
              </motion.div>
              <motion.div
                className="flex items-center gap-2 text-gray-500 dark:text-gray-400"
                initial={{ opacity: 0 }}
                animate={{ opacity: isVisible ? 1 : 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span>{t("hero.features.feature2")}</span>
              </motion.div>
              <motion.div
                className="flex items-center gap-2 text-gray-500 dark:text-gray-400"
                initial={{ opacity: 0 }}
                animate={{ opacity: isVisible ? 1 : 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
              >
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span>{t("hero.features.feature3")}</span>
              </motion.div>
            </div>

            <motion.div
              className="md:w-1/2"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: isVisible ? 1 : 0, scale: isVisible ? 1 : 0.9 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="relative w-full h-[400px] rounded-2xl overflow-hidden shadow-2xl">
                <Image
                  src={HERO_IMAGE || "/placeholder.svg?height=400&width=600"}
                  alt="Database Management System"
                  fill
                  className="object-cover"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-indigo-600/30 to-transparent"></div>

                {/* Floating elements */}
                <motion.div
                  className="absolute top-10 right-10 bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg"
                  animate={{ y: [0, -10, 0] }}
                  transition={{ repeat: Number.POSITIVE_INFINITY, duration: 3 }}
                >
                  <Database className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
                </motion.div>

                <motion.div
                  className="absolute bottom-10 left-10 bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg"
                  animate={{ y: [0, 10, 0] }}
                  transition={{ repeat: Number.POSITIVE_INFINITY, duration: 4, delay: 1 }}
                >
                  <Code className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                </motion.div>

                <motion.div
                  className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg"
                  animate={{
                    scale: [1, 1.05, 1],
                    boxShadow: [
                      "0 4px 6px rgba(0, 0, 0, 0.1)",
                      "0 10px 15px rgba(99, 102, 241, 0.3)",
                      "0 4px 6px rgba(0, 0, 0, 0.1)",
                    ],
                  }}
                  transition={{ repeat: Number.POSITIVE_INFINITY, duration: 3 }}
                >
                  <Brain className="h-10 w-10 text-indigo-600 dark:text-indigo-400" />
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* DBMS Section */}
      <section className="py-16 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-gray-900 dark:to-indigo-950">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <motion.div
              className="md:w-1/2"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <div className="relative w-full aspect-square max-w-md mx-auto">
                <Image src="/images/dbms-icon.jpg" alt="DBMS Concept" fill className="object-contain" />
              </div>
            </motion.div>
            <div className="md:w-1/2 space-y-6">
              <motion.h2
                className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                Maîtrisez les systèmes de gestion de bases de données
              </motion.h2>
              <motion.p
                className="text-xl text-gray-600 dark:text-gray-300"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                Notre plateforme vous aide à comprendre et à maîtriser les concepts fondamentaux des SGBD, des requêtes
                SQL à la modélisation de données, en passant par l'optimisation des performances.
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <Button
                  variant="outline"
                  className="border-indigo-600 text-indigo-600 hover:bg-indigo-50 dark:border-indigo-400 dark:text-indigo-400 dark:hover:bg-indigo-950"
                >
                  <Link href="/concepts" className="flex items-center">
                    Explorer les concepts
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Workflow Section */}
      <section className="py-16 bg-white dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">Comment ça fonctionne</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Notre plateforme simplifie le processus d'évaluation des exercices de bases de données
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Étape 1 */}
            <motion.div
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">1. Création d'exercices</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Les professeurs créent et déposent des exercices de bases de données
              </p>
            </motion.div>

            {/* Étape 2 */}
            <motion.div
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <Upload className="h-8 w-8 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">2. Soumission des réponses</h3>
              <p className="text-gray-600 dark:text-gray-300">Les étudiants soumettent leurs réponses en format PDF</p>
            </motion.div>

            {/* Étape 3 */}
            <motion.div
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <Brain className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">3. Évaluation par IA</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Notre IA DeepSeek analyse et évalue automatiquement les réponses
              </p>
            </motion.div>

            {/* Étape 4 */}
            <motion.div
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCheck className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">4. Feedback détaillé</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Les étudiants reçoivent une note et des commentaires personnalisés
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <motion.h2
              className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              {t("features.title")}
            </motion.h2>
            <motion.p
              className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              {t("features.subtitle")}
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard
              title={t("features.feature1.title")}
              description={t("features.feature1.description")}
              cta={t("features.feature1.cta")}
              ctaLink="/etudiant/exercices"
              imageSrc={FEATURE_1_IMAGE || "/placeholder.svg?height=192&width=384"}
              icon={Server}
              color="indigo"
              delay={0}
            />

            <FeatureCard
              title={t("features.feature2.title")}
              description={t("features.feature2.description")}
              cta={t("features.feature2.cta")}
              ctaLink="/etudiant/submissions"
              imageSrc={FEATURE_2_IMAGE || "/placeholder.svg?height=192&width=384"}
              icon={Users}
              color="purple"
              delay={0.1}
            />

            <FeatureCard
              title={t("features.feature3.title")}
              description={t("features.feature3.description")}
              cta={t("features.feature3.cta")}
              ctaLink="/etudiant/progress"
              imageSrc={FEATURE_3_IMAGE || "/placeholder.svg?height=192&width=384"}
              icon={BookOpen}
              color="blue"
              delay={0.2}
            />
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-gray-900 dark:to-indigo-950">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <AnimatedCounter value={t("stats.exercises.value")} label={t("stats.exercises.label")} />
            <AnimatedCounter value={t("stats.students.value")} label={t("stats.students.label")} />
            <AnimatedCounter value={t("stats.submissions.value")} label={t("stats.submissions.label")} />
            <AnimatedCounter value={t("stats.accuracy.value")} label={t("stats.accuracy.label")} />
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-white dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              {t("testimonials.title")}
            </h2>
          </motion.div>

          <div className="max-w-4xl mx-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTestimonial}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.5 }}
              >
                <TestimonialCard
                  quote={t("testimonials.items")[activeTestimonial].quote}
                  author={t("testimonials.items")[activeTestimonial].author}
                  role={t("testimonials.items")[activeTestimonial].role}
                  delay={0}
                />
              </motion.div>
            </AnimatePresence>

            <div className="flex justify-center mt-8 gap-2">
              {t("testimonials.items").map((_, index) => (
                <button
                  key={index}
                  onClick={() => setActiveTestimonial(index)}
                  className={`w-3 h-3 rounded-full ${
                    activeTestimonial === index ? "bg-indigo-600 dark:bg-indigo-400" : "bg-gray-300 dark:bg-gray-600"
                  }`}
                  aria-label={`Témoignage ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image src="/images/database-hero.jpg" alt="AI Background" fill className="object-cover opacity-30" />
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/90 to-purple-600/90 dark:from-indigo-800/90 dark:to-purple-800/90"></div>
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <Sparkles className="h-12 w-12 text-white/80 mx-auto mb-6" />
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">{t("cta.title")}</h2>
              <p className="text-xl text-white/80 mb-8">{t("cta.description")}</p>
              <Button size="lg" className="bg-white text-indigo-600 hover:bg-gray-100">
                <Link href="/etudiant" className="flex items-center">
                  {t("cta.button")}
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-50 dark:bg-gray-900 py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-6 md:mb-0">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
                <Database className="h-6 w-6 mr-2 text-indigo-600 dark:text-indigo-400" />
                SGBD
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mt-2">{t("footer.copyright")}</p>
            </div>

            <div className="flex flex-wrap gap-8">
              <div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-4">
                  {t("footer.navigation.title")}
                </h3>
                <ul className="space-y-2">
                  <li>
                    <Link
                      href="/etudiant"
                      className="text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400"
                    >
                      {t("footer.navigation.dashboard")}
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/etudiant/exercices"
                      className="text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400"
                    >
                      {t("footer.navigation.exercises")}
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/etudiant/students"
                      className="text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400"
                    >
                      {t("footer.navigation.students")}
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/etudiant/submissions"
                      className="text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400"
                    >
                      {t("footer.navigation.submissions")}
                    </Link>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-4">
                  {t("footer.resources.title")}
                </h3>
                <ul className="space-y-2">
                  <li>
                    <Link
                      href="#"
                      className="text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400"
                    >
                      {t("footer.resources.documentation")}
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="#"
                      className="text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400"
                    >
                      {t("footer.resources.help")}
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="#"
                      className="text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400"
                    >
                      {t("footer.resources.contact")}
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
