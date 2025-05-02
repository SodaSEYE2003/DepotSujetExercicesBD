"use client";

import { useState, useEffect, useRef } from "react";
import { Menu, Bell, ChevronDown, Database, BookOpen, TrendingUp, TrendingDown, Users, Award, Calendar } from 'lucide-react';
import Sidebar from "@/components/Sidebar-etudiant";
import { useSession, signOut } from "next-auth/react";
import { redirect, useRouter } from "next/navigation";
import ProgressChart from "../../src/components/ProgressChart";
import { toast, Toaster } from 'react-hot-toast';
import { getEtudiantStats, getEtudiantExercices } from "@/app/actions/etudiant";

type UserRole = 'etudiant' | 'professeur' | 'admin';

type StatType = {
  name: string;
  value: string;
  icon: any;
  iconBg: string;
  trend: number;
};

type ExerciseType = {
  id: number;
  title: string;
  status: string;
  statusColor: string;
  statusBg: string;
  statusText: string;
  date: string;
  icon: any;
};

export default function Dashboard() {
  // State
  const [userRole, setUserRole] = useState<UserRole>('etudiant');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  
  // Stats dynamiques
  const [stats, setStats] = useState<StatType[]>([]);
  const [recentExercises, setRecentExercises] = useState<ExerciseType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [performance, setPerformance] = useState({
    noteMoyenne: '0',
    tauxReussite: '0%'
  });

  const { data: session, status } = useSession();

  // Rediriger si l'utilisateur n'est pas connecté
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    }
  }, [status, router]);

  // Toggle functions
  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    if (!isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Récupérer les données utilisateur au chargement
  useEffect(() => {
    const fetchUserData = async () => {
      if (session?.user) {
        try {
          setIsLoading(true);
          
          // Mettre à jour le rôle depuis la session (si disponible)
          if (session.user.role) {
            setUserRole(session.user.role as UserRole);
          }
          console.log("userRole :",userRole)
          console.log("session :",session)
          // Ensure session.user.id exists and is a number
          const userId = Number(session?.user?.id);
          if (isNaN(userId)) {
            console.error("Invalid user ID in session:", session.user.id);
            toast.error("Invalid user ID. Please try again.");
            setIsLoading(false);
            return;
          }

          // Récupérer les statistiques de l'étudiant
          const statsData = await getEtudiantStats(userId);
          
          // Récupérer les exercices récents
          const exercisesData = await getEtudiantExercices(userId);
          
          // Formater les données des stats
          if (statsData) {
            const formattedStats: StatType[] = [
              { 
                name: 'Exercices complétés', 
                value: statsData.exercicesCompletes.toString() || '0', 
                icon: BookOpen, 
                iconBg: 'bg-blue-500', 
                trend: statsData.tendanceExercicesCompletes || 0
              },
              { 
                name: 'Exercices en cours', 
                value: statsData.exercicesEnCours.toString() || '0', 
                icon: Calendar, 
                iconBg: 'bg-green-500', 
                trend: statsData.tendanceExercicesEnCours || 0
              },
              { 
                name: 'Note moyenne', 
                value: statsData.noteMoyenne?.toFixed(1).toString() || '0', 
                icon: Award, 
                iconBg: 'bg-purple-500', 
                trend: statsData.tendanceNoteMoyenne || 0
              },
              { 
                name: 'Rang dans la classe', 
                value: statsData.rang ? `${statsData.rang}/${statsData.totalEtudiants}` : 'N/A', 
                icon: Users, 
                iconBg: 'bg-yellow-500', 
                trend: statsData.tendanceRang || 0
              }
            ];
            
            setStats(formattedStats);
            
            // Définir les données de performance
            setPerformance({
              noteMoyenne: statsData.noteMoyenne?.toFixed(1) + '/20' || '0/20',
              tauxReussite: statsData.tauxReussite?.toString() + '%' || '0%'
            });
          }
          
          // Formater les données des exercices
          if (exercisesData && Array.isArray(exercisesData)) {
            const formattedExercises: ExerciseType[] = exercisesData.map(ex => {
              // Déterminer le style en fonction du statut
              let statusColor = 'bg-blue-500';
              let statusBg = 'bg-blue-100 dark:bg-blue-900/30';
              let statusText = 'text-blue-800 dark:text-blue-300';
              
              if (ex.status === 'Complété') {
                statusColor = 'bg-green-500';
                statusBg = 'bg-green-100 dark:bg-green-900/30';
                statusText = 'text-green-800 dark:text-green-300';
              } else if (ex.status === 'En cours') {
                statusColor = 'bg-yellow-500';
                statusBg = 'bg-yellow-100 dark:bg-yellow-900/30';
                statusText = 'text-yellow-800 dark:text-yellow-300';
              }
              
              // Convertir la date au format lisible
              const dateLimit = ex.dateLimite ? new Date(ex.dateLimite) : null;
              const formattedDate = dateLimit 
                ? dateLimit.toLocaleDateString('fr-FR', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })
                : 'Pas de date limite';
              
              return {
                id: ex.id,
                title: ex.titre,
                status: ex.status,
                statusColor,
                statusBg,
                statusText,
                date: formattedDate,
                icon: Database
              };
            });
            
            setRecentExercises(formattedExercises);
          }
          
        } catch (error) {
          console.error('Erreur lors du chargement des données:', error);
          toast.error("Impossible de charger vos données");
        } finally {
          setIsLoading(false);
        }
      }
    };

    if (session?.user) {
      fetchUserData();
    }
  }, [session]);

  // Gérer la déconnexion
  const handleLogout = async () => {
    try {
      toast.loading('Déconnexion en cours...', { id: 'logout' });
      
      // Redirection immédiate pour une meilleure UX
      router.push('/auth/login');
      
      // Déconnexion en arrière-plan 
      await signOut({ redirect: false });
      
      toast.success('Vous êtes déconnecté', { id: 'logout' });
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
      toast.error('Un problème est survenu lors de la déconnexion', { id: 'logout' });
    }
  };

  // Initialiser le thème sombre selon les préférences système
  useEffect(() => {
    if (typeof window !== 'undefined' && window.matchMedia && 
        window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    }
  }, []);
  
  // Données de secours au cas où les APIs échouent
  const fallbackStats = [
    { 
      name: 'Exercices complétés', 
      value: '18', 
      icon: BookOpen, 
      iconBg: 'bg-blue-500', 
      trend: 12 
    },
    { 
      name: 'Exercices en cours', 
      value: '3', 
      icon: Calendar, 
      iconBg: 'bg-green-500', 
      trend: -2 
    },
    { 
      name: 'Note moyenne', 
      value: '15.2', 
      icon: Award, 
      iconBg: 'bg-purple-500', 
      trend: 3 
    },
    { 
      name: 'Rang dans la classe', 
      value: '5/120', 
      icon: Users, 
      iconBg: 'bg-yellow-500', 
      trend: 2 
    }
  ];

  const fallbackExercises = [
    { 
      id: 1,
      title: 'Requêtes SQL avancées', 
      status: 'Complété', 
      statusColor: 'bg-green-500',
      statusBg: 'bg-green-100 dark:bg-green-900/30',
      statusText: 'text-green-800 dark:text-green-300',
      date: '15 mars 2025',
      icon: Database
    },
    { 
      id: 2,
      title: 'Modélisation de données', 
      status: 'En cours', 
      statusColor: 'bg-yellow-500',
      statusBg: 'bg-yellow-100 dark:bg-yellow-900/30',
      statusText: 'text-yellow-800 dark:text-yellow-300',
      date: '10 mars 2025',
      icon: Database
    },
    { 
      id: 3,
      title: 'Normalisation et optimisation', 
      status: 'À faire', 
      statusColor: 'bg-blue-500',
      statusBg: 'bg-blue-100 dark:bg-blue-900/30',
      statusText: 'text-blue-800 dark:text-blue-300',
      date: '5 mars 2025',
      icon: Database
    }
  ];

  // Afficher un indicateur de chargement
  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-lg text-gray-700 dark:text-gray-300">Chargement des données...</p>
        </div>
      </div>
    );
  }

  // Rediriger si l'utilisateur n'est pas connecté
  if (status === 'unauthenticated') {
    return null; // Le useEffect s'occupera de la redirection
  }

  // Utiliser les données dynamiques ou les fallbacks
  const currentStats = stats.length > 0 ? stats : fallbackStats;
  const currentExercises = recentExercises.length > 0 ? recentExercises : fallbackExercises;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 transition-colors duration-500">
      <Toaster position="top-right" />
      <div className="flex">
        {/* Sidebar */}
        <Sidebar 
          userRole={userRole}
          isDarkMode={isDarkMode}
          toggleDarkMode={toggleDarkMode}
          isSidebarOpen={isSidebarOpen}
          toggleSidebar={toggleSidebar}
          onLogout={handleLogout}
        />
        
        {/* Main Content */}
        <div className="flex-1 md:ml-64 transition-all duration-300">
          {/* Top Navigation */}
          <header className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-40">
            <div className="flex items-center justify-between h-16 px-4 md:px-6">
              <div className="flex items-center">
                <button 
                  onClick={toggleSidebar} 
                  className="md:hidden text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 mr-4"
                >
                  <Menu className="w-6 h-6" />
                </button>
                <h1 className="text-lg font-semibold text-gray-800 dark:text-white">Tableau de bord</h1>
              </div>
              
              <div className="flex items-center space-x-3">
                <button className="relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                  <Bell className="w-6 h-6 text-gray-500 dark:text-gray-400" />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                </button>
                
                <div className="relative">
                  <button className="flex items-center space-x-1 text-sm text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors">
                    <span>FR</span>
                    <ChevronDown className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </header>
          
          {/* Page Content */}
          <main className="p-4 md:p-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 mb-6">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Bienvenue {session?.user?.name || "Étudiant"} 👋</h2>
              <p className="text-gray-600 dark:text-gray-300 mt-2">
                {currentExercises.filter(ex => ex.status === "En cours" || ex.status === "À faire").length > 0 
                  ? `Vous avez ${currentExercises.filter(ex => ex.status === "En cours" || ex.status === "À faire").length} exercice(s) à compléter...`
                  : "Félicitations ! Vous êtes à jour dans vos exercices."}
              </p>
              
              {/* Statistiques étudiant */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
                {currentStats.map((stat, index) => (
                <div key={index} className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 border border-gray-100 dark:border-gray-700 transition-transform hover:scale-105 duration-300"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{stat.name}</p>
                      <p className="text-2xl font-semibold text-gray-800 dark:text-white mt-1">{stat.value}</p>
                    </div>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${stat.iconBg}`}>
                      <stat.icon className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  <div className="mt-2 flex items-center text-sm">
                    {stat.trend > 0 ? (
                      <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                    ) : stat.trend < 0 ? (
                      <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
                    ) : null}
                    <span className={stat.trend > 0 ? 'text-green-500' : stat.trend < 0 ? 'text-red-500' : 'text-gray-500'}>
                      {Math.abs(stat.trend)}% {stat.trend > 0 ? 'augmentation' : stat.trend < 0 ? 'diminution' : 'stable'}
                    </span>
                    <span className="text-gray-500 dark:text-gray-400 ml-1">depuis la semaine dernière</span>
                  </div>
                </div>
              ))}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                    Mes exercices
                  </h3>
                  <button 
                    onClick={() => router.push('/etudiant/exercices')}
                    className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors"
                  >
                    Voir tout
                  </button>
                </div>
                
                {currentExercises.length > 0 ? (
                  <div className="space-y-4">
                    {currentExercises.map((exercise, index) => (
                      <div 
                        key={index} 
                        className="flex items-center p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/30 cursor-pointer"
                        onClick={() => router.push(`/etudiant/exercice/${exercise.id}`)}
                      >
                        <div className={`w-10 h-10 rounded-full ${exercise.statusColor} flex items-center justify-center`}>
                          <exercise.icon className="w-5 h-5 text-white" />
                        </div>
                        <div className="ml-4 flex-grow">
                          <p className="font-medium text-gray-800 dark:text-white">{exercise.title}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{exercise.date}</p>
                        </div>
                        <div className={`px-3 py-1 rounded-full ${exercise.statusBg}`}>
                          <span className={`text-xs font-medium ${exercise.statusText}`}>{exercise.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-40">
                    <BookOpen className="w-12 h-12 text-gray-300 dark:text-gray-600" />
                    <p className="text-gray-500 dark:text-gray-400 mt-2">Aucun exercice disponible</p>
                  </div>
                )}
              </div>
          
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-6">Performance</h3>
                
                <div className="h-64 flex items-center justify-center">
                  <div className="w-full h-full relative">
                    <ProgressChart />
                  </div>
                </div>
                
                <div className="mt-4 grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 border border-gray-100 dark:border-gray-700">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Note moyenne</p>
                    <p className="text-lg font-semibold text-gray-800 dark:text-white mt-1">
                      {performance.noteMoyenne}
                    </p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 border border-gray-100 dark:border-gray-700">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Taux de réussite</p>
                    <p className="text-lg font-semibold text-gray-800 dark:text-white mt-1">
                      {performance.tauxReussite}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>  
  );
}