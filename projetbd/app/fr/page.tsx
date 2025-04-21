"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import { Database, Users, CheckCircle, ChevronRight, Code, Server, BookOpen, ArrowRight, Sparkles } from "lucide-react"
import { Button } from "../../src/components/button"

// Images pour la page d'accueil
const HERO_IMAGE = "/images/database-hero.jpg"
const FEATURE_1_IMAGE = "/images/sql-code.jpg"
const FEATURE_2_IMAGE = "/images/students.jpg"
const FEATURE_3_IMAGE = "/images/exercises.jpg"

export default function HomePage() {

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-indigo-950">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Cercles décoratifs */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-purple-200 dark:bg-purple-900/20 rounded-full filter blur-3xl opacity-50"></div>
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-indigo-200 dark:bg-indigo-900/20 rounded-full filter blur-3xl opacity-50"></div>

        <div className="container mx-auto px-4 py-20 md:py-32 relative z-10">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="md:w-1/2 space-y-6">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white leading-tight">
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">
                    SGBD
                  </span>{" "}
                  <br />
                  {("hero.title")}
                </h1>
              </motion.div>

              <motion.p
                className="text-xl text-gray-600 dark:text-gray-300"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                {("hero.subtitle")}
              </motion.p>

              <motion.div
                className="flex flex-wrap gap-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white border-none"
                >
                  <Link href="/dashboard" className="flex items-center">
                    {("hero.cta.primary")}
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="border-indigo-600 text-indigo-600 hover:bg-indigo-50 dark:border-indigo-400 dark:text-indigo-400 dark:hover:bg-indigo-950"
                >
                  <Link href="/exercises">{("hero.cta.secondary")}</Link>
                </Button>
              </motion.div>

              <motion.div
                className="flex items-center gap-2 text-gray-500 dark:text-gray-400"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span>{("hero.features.feature1")}</span>
              </motion.div>
              <motion.div
                className="flex items-center gap-2 text-gray-500 dark:text-gray-400"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span>{("hero.features.feature2")}</span>
              </motion.div>
              <motion.div
                className="flex items-center gap-2 text-gray-500 dark:text-gray-400"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.5 }}
              >
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span>{("hero.features.feature3")}</span>
              </motion.div>
            </div>

            <motion.div
              className="md:w-1/2"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="relative w-full h-[400px] rounded-2xl overflow-hidden shadow-2xl">
                <Image
                  src={HERO_IMAGE || "/placeholder.svg"}
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
              </div>
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
              {("features.title")}
            </motion.h2>
            <motion.p
              className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              {("features.subtitle")}
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <motion.div
              className="bg-gradient-to-br from-indigo-50 to-white dark:from-gray-700 dark:to-gray-800 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <div className="relative h-48">
                <Image src={FEATURE_1_IMAGE || "/placeholder.svg"} alt="SQL Code" fill className="object-cover" />
                <div className="absolute inset-0 bg-indigo-600/20"></div>
              </div>
              <div className="p-6">
                <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center mb-4">
                  <Server className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{("features.feature1.title")}</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">{("features.feature1.description")}</p>
                <Link
                  href="/exercises"
                  className="inline-flex items-center text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 font-medium"
                >
                  {("features.feature1.cta")}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </div>
            </motion.div>

            {/* Feature 2 */}
            <motion.div
              className="bg-gradient-to-br from-purple-50 to-white dark:from-gray-700 dark:to-gray-800 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <div className="relative h-48">
                <Image src={FEATURE_2_IMAGE || "/placeholder.svg"} alt="Students" fill className="object-cover" />
                <div className="absolute inset-0 bg-purple-600/20"></div>
              </div>
              <div className="p-6">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{("features.feature2.title")}</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">{("features.feature2.description")}</p>
                <Link
                  href="/students"
                  className="inline-flex items-center text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 font-medium"
                >
                  {("features.feature2.cta")}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </div>
            </motion.div>

            {/* Feature 3 */}
            <motion.div
              className="bg-gradient-to-br from-blue-50 to-white dark:from-gray-700 dark:to-gray-800 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="relative h-48">
                <Image src={FEATURE_3_IMAGE || "/placeholder.svg"} alt="Exercises" fill className="object-cover" />
                <div className="absolute inset-0 bg-blue-600/20"></div>
              </div>
              <div className="p-6">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mb-4">
                  <BookOpen className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{("features.feature3.title")}</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">{("features.feature3.description")}</p>
                <Link
                  href="/submissions"
                  className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium"
                >
                  {("features.feature3.cta")}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-800 dark:to-purple-800">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <Sparkles className="h-12 w-12 text-white/80 mx-auto mb-6" />
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">{("cta.title")}</h2>
              <p className="text-xl text-white/80 mb-8">{("cta.description")}</p>
              <Button size="lg" className="bg-white text-indigo-600 hover:bg-gray-100">
                <Link href="/dashboard" className="flex items-center">
                  {("cta.button")}
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
              <p className="text-gray-600 dark:text-gray-400 mt-2">{("footer.copyright")}</p>
            </div>

            <div className="flex flex-wrap gap-8">
              <div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-4">
                  {("footer.navigation.title")}
                </h3>
                <ul className="space-y-2">
                  <li>
                    <Link
                      href="/dashboard"
                      className="text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400"
                    >
                      {("footer.navigation.dashboard")}
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/exercises"
                      className="text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400"
                    >
                      {("footer.navigation.exercises")}
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/students"
                      className="text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400"
                    >
                      {("footer.navigation.students")}
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/submissions"
                      className="text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400"
                    >
                      {("footer.navigation.submissions")}
                    </Link>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-4">
                  {("footer.resources.title")}
                </h3>
                <ul className="space-y-2">
                  <li>
                    <Link
                      href="#"
                      className="text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400"
                    >
                      {("footer.resources.documentation")}
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="#"
                      className="text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400"
                    >
                      {("footer.resources.help")}
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="#"
                      className="text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400"
                    >
                      {("footer.resources.contact")}
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
