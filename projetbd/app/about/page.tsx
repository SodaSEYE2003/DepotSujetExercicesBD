"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import {
  Database,
  Brain,
  Server,
  Users,
  Mail,
  MapPin,
  Phone,
  Github,
  Linkedin,
  Twitter,
  ChevronDown,
  ChevronUp,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Navbar } from "../../components/navbar"

// Composant FAQ personnalisé
interface FAQItemProps {
  question: string
  answer: string
  isOpen: boolean
  toggleOpen: () => void
}

function FAQItem({ question, answer, isOpen, toggleOpen }: FAQItemProps) {
  return (
    <div className="border rounded-lg bg-white dark:bg-gray-800 shadow-sm overflow-hidden">
      <button
        onClick={toggleOpen}
        className="w-full px-6 py-4 text-left font-medium text-gray-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 flex justify-between items-center"
      >
        <span>{question}</span>
        {isOpen ? (
          <ChevronUp className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
        ) : (
          <ChevronDown className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
        )}
      </button>
      {isOpen && (
        <div className="px-6 pb-4 text-gray-600 dark:text-gray-300">
          <p>{answer}</p>
        </div>
      )}
    </div>
  )
}

export default function AboutPage() {
  const [darkMode, setDarkMode] = useState(false)
  const [openFAQs, setOpenFAQs] = useState<number[]>([])

  // Fonction pour basculer l'état ouvert/fermé d'une FAQ
  const toggleFAQ = (index: number) => {
    setOpenFAQs((prev) => {
      if (prev.includes(index)) {
        return prev.filter((i) => i !== index)
      } else {
        return [...prev, index]
      }
    })
  }

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

  const teamMembers = [
    {
      name: "Dr. Sophie Martin",
      role: "Directrice du projet",
      bio: "Experte en bases de données et intelligence artificielle avec plus de 15 ans d'expérience dans l'enseignement universitaire.",
      image: "/placeholder.svg?height=300&width=300",
      social: {
        linkedin: "#",
        twitter: "#",
        github: "#",
      },
    },
    {
      name: "Alexandre Chen",
      role: "Lead Developer",
      bio: "Ingénieur full-stack spécialisé dans les technologies cloud et l'intégration d'IA dans les applications web.",
      image: "/placeholder.svg?height=300&width=300",
      social: {
        linkedin: "#",
        twitter: "#",
        github: "#",
      },
    },
    {
      name: "Marie Dubois",
      role: "Data Scientist",
      bio: "Spécialiste en NLP et en systèmes d'évaluation automatique, avec une expertise particulière dans les modèles de langage avancés.",
      image: "/placeholder.svg?height=300&width=300",
      social: {
        linkedin: "#",
        twitter: "#",
        github: "#",
      },
    },
    {
      name: "Thomas Lefèvre",
      role: "UX/UI Designer",
      bio: "Designer passionné par la création d'interfaces intuitives et accessibles pour les plateformes éducatives.",
      image: "/placeholder.svg?height=300&width=300",
      social: {
        linkedin: "#",
        twitter: "#",
        github: "#",
      },
    },
  ]

  const faqItems = [
    {
      question: "Comment fonctionne l'évaluation automatique ?",
      answer:
        "Notre système utilise DeepSeek via Ollama, un modèle d'IA avancé, pour analyser les réponses des étudiants. L'IA compare les réponses soumises avec les modèles de correction fournis par les professeurs, identifie les concepts clés, vérifie la syntaxe des requêtes SQL et attribue une note en fonction de la précision et de la complétude de la réponse.",
    },
    {
      question: "Quels formats de fichiers sont acceptés pour les soumissions ?",
      answer:
        "Actuellement, notre plateforme accepte les soumissions au format PDF. Les étudiants peuvent facilement télécharger leurs réponses via notre interface intuitive avec fonctionnalité de glisser-déposer.",
    },
    {
      question: "Comment les professeurs peuvent-ils créer des exercices ?",
      answer:
        "Les professeurs disposent d'un tableau de bord dédié où ils peuvent créer des exercices, télécharger des documents de référence, définir des modèles de correction et spécifier les critères d'évaluation. Notre système guide les professeurs tout au long du processus pour assurer une configuration optimale de l'évaluation automatique.",
    },
    {
      question: "La plateforme peut-elle détecter le plagiat ?",
      answer:
        "Oui, notre plateforme intègre des algorithmes de détection de plagiat basés sur des techniques avancées comme la similarité de Jaccard, TF-IDF et le traitement du langage naturel. Le système peut identifier les similitudes suspectes entre les soumissions et alerter les professeurs.",
    },
    {
      question: "Comment les étudiants reçoivent-ils leurs évaluations ?",
      answer:
        "Après soumission, les étudiants reçoivent une notification lorsque leur travail a été évalué. Ils peuvent accéder à un rapport détaillé comprenant leur note, des commentaires spécifiques sur leurs réponses, des suggestions d'amélioration et des ressources complémentaires pour approfondir leur compréhension.",
    },
    {
      question: "La plateforme est-elle accessible sur mobile ?",
      answer:
        "Absolument ! Notre plateforme est entièrement responsive et optimisée pour tous les appareils, des ordinateurs de bureau aux smartphones. Les étudiants peuvent soumettre leurs travaux et consulter leurs évaluations où qu'ils soient.",
    },
  ]

  return (
    <div
      className={`min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 ${darkMode ? "dark:from-gray-900 dark:via-gray-800 dark:to-indigo-950 dark" : ""}`}
    >
      {/* Navbar */}
      <Navbar darkMode={darkMode} />

      {/* Hero Section */}
      <section className="pt-24 pb-12 md:pt-32 md:pb-16 relative overflow-hidden">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-purple-200 dark:bg-purple-900/20 rounded-full filter blur-3xl opacity-50"></div>
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-indigo-200 dark:bg-indigo-900/20 rounded-full filter blur-3xl opacity-50"></div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
                À propos de notre plateforme
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
                Découvrez notre mission, notre équipe et la technologie qui alimente notre plateforme d'évaluation
                automatisée des exercices de bases de données.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 bg-white dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <motion.div
              className="md:w-1/2"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">Notre mission</h2>
              <div className="space-y-4 text-gray-600 dark:text-gray-300">
                <p>
                  Notre mission est de révolutionner l'apprentissage des bases de données en fournissant une plateforme
                  intelligente qui automatise l'évaluation des exercices tout en offrant un feedback personnalisé et
                  détaillé aux étudiants.
                </p>
                <p>
                  Nous croyons que l'éducation devrait être accessible, interactive et adaptée aux besoins individuels.
                  Notre plateforme permet aux professeurs de se concentrer sur la pédagogie plutôt que sur les tâches
                  répétitives de correction, tout en offrant aux étudiants un retour immédiat et constructif sur leur
                  travail.
                </p>
                <p>
                  En intégrant l'intelligence artificielle dans le processus éducatif, nous visons à créer un
                  environnement d'apprentissage plus efficace, équitable et engageant pour tous.
                </p>
              </div>
            </motion.div>
            <motion.div
              className="md:w-1/2"
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <div className="relative h-[400px] rounded-2xl overflow-hidden shadow-xl">
                <Image src="/images/database-hero.png" alt="Notre mission" fill className="object-cover" />
                <div className="absolute inset-0 bg-gradient-to-tr from-indigo-600/40 to-transparent"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-white/90 dark:bg-gray-800/90 p-6 rounded-xl max-w-md text-center backdrop-blur-sm">
                    <h3 className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 mb-2">Notre vision</h3>
                    <p className="text-gray-700 dark:text-gray-300">
                      Devenir la référence mondiale en matière d'évaluation automatisée pour l'enseignement des bases de
                      données et des technologies de l'information.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Technology Section */}
      <section className="py-16 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-gray-900 dark:to-indigo-950">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <motion.h2
              className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              Notre technologie
            </motion.h2>
            <motion.p
              className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              Une combinaison puissante de technologies modernes pour une expérience d'apprentissage optimale
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Tech Card 1 */}
            <motion.div
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <div className="p-6">
                <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center mb-4">
                  <Brain className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Intelligence Artificielle</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Notre plateforme utilise DeepSeek via Ollama, un modèle d'IA avancé spécialement adapté pour l'analyse
                  et l'évaluation des exercices de bases de données. Cette technologie permet une correction précise et
                  un feedback personnalisé.
                </p>
                <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                  <li className="flex items-start">
                    <span className="text-indigo-600 dark:text-indigo-400 mr-2">•</span>
                    Analyse sémantique des réponses
                  </li>
                  <li className="flex items-start">
                    <span className="text-indigo-600 dark:text-indigo-400 mr-2">•</span>
                    Validation syntaxique des requêtes SQL
                  </li>
                  <li className="flex items-start">
                    <span className="text-indigo-600 dark:text-indigo-400 mr-2">•</span>
                    Apprentissage continu pour améliorer les évaluations
                  </li>
                </ul>
              </div>
            </motion.div>

            {/* Tech Card 2 */}
            <motion.div
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <div className="p-6">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center mb-4">
                  <Server className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Architecture Cloud</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Notre plateforme est construite sur une architecture microservices moderne, déployée dans le cloud
                  pour assurer performance, scalabilité et disponibilité.
                </p>
                <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                  <li className="flex items-start">
                    <span className="text-purple-600 dark:text-purple-400 mr-2">•</span>
                    Microservices pour une maintenance et évolution facilitées
                  </li>
                  <li className="flex items-start">
                    <span className="text-purple-600 dark:text-purple-400 mr-2">•</span>
                    Stockage sécurisé des données et des fichiers
                  </li>
                  <li className="flex items-start">
                    <span className="text-purple-600 dark:text-purple-400 mr-2">•</span>
                    Déploiement automatisé avec Docker et Kubernetes
                  </li>
                  <li className="flex items-start">
                    <span className="text-purple-600 dark:text-purple-400 mr-2">•</span>
                    Haute disponibilité et résilience
                  </li>
                </ul>
              </div>
            </motion.div>

            {/* Tech Card 3 */}
            <motion.div
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="p-6">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Expérience Utilisateur</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Une interface moderne et intuitive développée avec React.js et Tailwind CSS, offrant une expérience
                  fluide sur tous les appareils.
                </p>
                <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                  <li className="flex items-start">
                    <span className="text-blue-600 dark:text-blue-400 mr-2">•</span>
                    Design responsive pour mobile, tablette et desktop
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-600 dark:text-blue-400 mr-2">•</span>
                    Tableaux de bord interactifs avec visualisations
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-600 dark:text-blue-400 mr-2">•</span>
                    Mode sombre et personnalisation de l'interface
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-600 dark:text-blue-400 mr-2">•</span>
                    Accessibilité conforme aux normes WCAG
                  </li>
                </ul>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16 bg-white dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <motion.h2
              className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              Notre équipe
            </motion.h2>
            <motion.p
              className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              Des experts passionnés par l'éducation et la technologie
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {teamMembers.map((member, index) => (
              <motion.div
                key={index}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <div className="relative h-64 w-full">
                  <Image src={member.image || "/placeholder.svg"} alt={member.name} fill className="object-cover" />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">{member.name}</h3>
                  <p className="text-indigo-600 dark:text-indigo-400 mb-3">{member.role}</p>
                  <p className="text-gray-600 dark:text-gray-300 mb-4 text-sm">{member.bio}</p>
                  <div className="flex space-x-3">
                    <a
                      href={member.social.linkedin}
                      className="text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400"
                    >
                      <Linkedin className="h-5 w-5" />
                    </a>
                    <a
                      href={member.social.twitter}
                      className="text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400"
                    >
                      <Twitter className="h-5 w-5" />
                    </a>
                    <a
                      href={member.social.github}
                      className="text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400"
                    >
                      <Github className="h-5 w-5" />
                    </a>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-gray-900 dark:to-indigo-950">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <motion.h2
              className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              Questions fréquentes
            </motion.h2>
            <motion.p
              className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              Tout ce que vous devez savoir sur notre plateforme
            </motion.p>
          </div>

          <div className="max-w-3xl mx-auto space-y-4">
            {faqItems.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <FAQItem
                  question={item.question}
                  answer={item.answer}
                  isOpen={openFAQs.includes(index)}
                  toggleOpen={() => toggleFAQ(index)}
                />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 bg-white dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <motion.h2
              className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              Contactez-nous
            </motion.h2>
            <motion.p
              className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              Vous avez des questions ou souhaitez en savoir plus ? N'hésitez pas à nous contacter.
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <motion.div
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 flex flex-col items-center text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center mb-4">
                <Mail className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Email</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">contact@sgbd-platform.com</p>
              <Button
                variant="outline"
                className="border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400"
              >
                <a href="mailto:contact@sgbd-platform.com">Envoyer un email</a>
              </Button>
            </motion.div>

            <motion.div
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 flex flex-col items-center text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center mb-4">
                <MapPin className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Adresse</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                123 Avenue de l'Innovation
                <br />
                75001 Paris, France
              </p>
              <Button
                variant="outline"
                className="border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400"
              >
                <a href="https://maps.google.com" target="_blank" rel="noopener noreferrer">
                  Voir sur la carte
                </a>
              </Button>
            </motion.div>

            <motion.div
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 flex flex-col items-center text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center mb-4">
                <Phone className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Téléphone</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">+33 (0)1 23 45 67 89</p>
              <Button
                variant="outline"
                className="border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400"
              >
                <a href="tel:+33123456789">Appeler</a>
              </Button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 relative overflow-hidden">
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
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                Prêt à transformer votre expérience d'enseignement ?
              </h2>
              <p className="text-xl text-white/80 mb-8">
                Rejoignez notre communauté d'enseignants et d'étudiants pour une approche moderne de l'apprentissage des
                bases de données.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="bg-white text-indigo-600 hover:bg-gray-100">
                  <Link href="/auth/register">Commencer gratuitement</Link>
                </Button>
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                  <Link href="/etudiant/dashboard">Demander une démo</Link>
                </Button>
              </div>
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
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                © 2024 SGBD - Plateforme d'évaluation automatisée. Tous droits réservés.
              </p>
            </div>

            <div className="flex flex-wrap gap-8">
              <div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-4">
                  Navigation
                </h3>
                <ul className="space-y-2">
                  <li>
                    <Link
                      href="/etudiant/dashboard"
                      className="text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400"
                    >
                      Tableau de bord
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/etudiant/exercises"
                      className="text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400"
                    >
                      Exercices
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/about"
                      className="text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400"
                    >
                      À propos
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/contact"
                      className="text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400"
                    >
                      Contact
                    </Link>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-4">
                  Légal
                </h3>
                <ul className="space-y-2">
                  <li>
                    <Link
                      href="/privacy"
                      className="text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400"
                    >
                      Politique de confidentialité
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/terms"
                      className="text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400"
                    >
                      Conditions d'utilisation
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
