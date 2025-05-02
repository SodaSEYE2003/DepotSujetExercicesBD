"use client";

import { useState, useEffect, useRef } from "react";
import { Menu, Bell, ChevronDown, Database, BookOpen, TrendingUp, TrendingDown, Users, Award, Calendar, BarChart4 } from 'lucide-react';
import Sidebar from "../../src/components/Sidebar";

type UserRole = 'professor' | 'student';

// Interface pour les sujets/exercices
interface Exercise {
  id_Sujet: number;
  Titre: string;
  sousTitre: string;
  TypeDeSujet: string;
  DateDeDepot: string;
  Delai: string;
  status: string;
  Description: string;
  file: string;
  correctionUrl: string | null;
}

// Interface pour les statistiques des étudiants
interface StudentStats {
  totalStudents: number;
  percentChange: number;
  lastWeekStudents: number;
}

// Interface pour les statistiques générales
interface Stats {
  totalExercises: number;
  totalActiveStudents: number;
  averageGrade: number;
  exercisesLastWeek: number;
  studentsLastWeek: number;
  gradeLastWeek: number;
}

// URL de base de l'API
const API_BASE_URL = 'http://localhost:5000';

export default function Dashboard() {
  // State
  const [userRole, setUserRole] = useState<UserRole>('professor');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const chartContainerRef = useRef<HTMLDivElement>(null);
  
  // État pour les données de la base de données
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [studentStats, setStudentStats] = useState<StudentStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  // Récupérer les exercices depuis l'API
  const fetchExercises = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/sujets`);
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des exercices');
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Erreur:', error);
      throw error;
    }
  };

  // Récupérer les statistiques des étudiants
  const fetchStudentStats = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/etudiants/stats`);
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des statistiques des étudiants');
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Erreur lors de la récupération des stats étudiants:', error);
      // En cas d'erreur, on retourne null pour indiquer qu'il y a eu un problème
      // plutôt que de fournir des valeurs statiques de fallback
      throw error;
    }
  };

  // Récupérer les statistiques générales
  const fetchStats = async (studentStatsData: StudentStats) => {
    try {
      // Essayer d'abord de récupérer les stats depuis l'API
      const response = await fetch(`${API_BASE_URL}/stats`);
      if (response.ok) {
        const statsData = await response.json();
        // Intégrer les stats étudiants
        return {
          ...statsData,
          totalActiveStudents: studentStatsData.totalStudents,
          studentsLastWeek: studentStatsData.percentChange
        };
      }
      
      // Fallback: calculer les stats à partir des exercices
      const exercises = await fetchExercises();
      
      // Calculer la date d'il y a une semaine
      const lastWeek = new Date();
      lastWeek.setDate(lastWeek.getDate() - 7);
      
      // Compter les exercices de cette semaine et de la semaine dernière
      const currentExercises = exercises.length;
      const lastWeekExercises = exercises.filter((ex: { DateDeDepot: string | number | Date; }) => 
        new Date(ex.DateDeDepot) < lastWeek
      ).length;
      
      // Simuler la note moyenne (idéalement cela devrait venir de la base de données)
      const averageGrade = 14.8;
      const lastWeekAverageGrade = 15.2;
      
      // Calculer les pourcentages de variation
      const exercisePercent = lastWeekExercises > 0 
        ? Math.round(((currentExercises - lastWeekExercises) / lastWeekExercises) * 100) 
        : 0;
      
      const gradePercent = lastWeekAverageGrade > 0 
        ? Math.round(((averageGrade - lastWeekAverageGrade) / lastWeekAverageGrade) * 100) 
        : 0;
      
      return {
        totalExercises: currentExercises,
        totalActiveStudents: studentStatsData.totalStudents,
        averageGrade: averageGrade,
        exercisesLastWeek: exercisePercent, 
        studentsLastWeek: studentStatsData.percentChange,
        gradeLastWeek: gradePercent
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des stats:', error);
      throw error;
    }
  };

  // Charger les données au montage du composant
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        // Récupérer d'abord les stats étudiants
        const studentStatsData = await fetchStudentStats();
        setStudentStats(studentStatsData);
        
        // Récupérer les exercices
        const exercisesData = await fetchExercises();
        setExercises(exercisesData);
        
        // Récupérer les stats générales avec les données étudiants intégrées
        const statsData = await fetchStats(studentStatsData);
        setStats(statsData);
        
        setError(null);
      } catch (err) {
        setError("Erreur lors du chargement des données. Vérifiez que votre serveur API est en cours d'exécution.");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
    
    // Vérifier les préférences système pour le mode sombre
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  // Formater les statistiques pour l'affichage
  const getFormattedStats = () => {
    if (!stats) return [];
    
    return [
      { 
        name: userRole === 'professor' ? 'Exercices créés' : 'Exercices complétés', 
        value: userRole === 'professor' ? `${stats.totalExercises}` : '18', 
        icon: BookOpen, 
        iconBg: 'bg-blue-500', 
        trend: stats.exercisesLastWeek 
      },
      { 
        name: userRole === 'professor' ? 'Étudiants actifs' : 'Exercices en cours', 
        value: userRole === 'professor' ? `${stats.totalActiveStudents}` : '3', 
        icon: userRole === 'professor' ? Users : Calendar, 
        iconBg: 'bg-green-500', 
        trend: stats.studentsLastWeek 
      },
      { 
        name: userRole === 'professor' ? 'Note moyenne' : 'Note moyenne', 
        value: userRole === 'professor' ? `${stats.averageGrade}` : '15.2', 
        icon: Award, 
        iconBg: 'bg-purple-500', 
        trend: stats.gradeLastWeek 
      }
    ];
  };

  // Convertir les exercices en format pour l'affichage
  const getFormattedExercises = () => {
    if (!exercises || exercises.length === 0) return [];
    
    // Prendre les 3 exercices les plus récents
    return exercises.slice(0, 3).map(exercise => {
      // Déterminer le statut et les couleurs correspondantes
      let status, statusColor, statusBg, statusText;
      
      const exerciseStatus = exercise.status ? exercise.status.toLowerCase() : 'autre';
      
      switch (exerciseStatus) {
        case 'publié':
          statusColor = 'bg-green-500';
          statusBg = 'bg-green-100 dark:bg-green-900/30';
          statusText = 'text-green-800 dark:text-green-300';
          status = userRole === 'professor' ? 'Publié' : 'À faire';
          break;
        case 'brouillon':
          statusColor = 'bg-yellow-500';
          statusBg = 'bg-yellow-100 dark:bg-yellow-900/30';
          statusText = 'text-yellow-800 dark:text-yellow-300';
          status = userRole === 'professor' ? 'Brouillon' : 'En cours';
          break;
        default:
          statusColor = 'bg-blue-500';
          statusBg = 'bg-blue-100 dark:bg-blue-900/30';
          statusText = 'text-blue-800 dark:text-blue-300';
          status = userRole === 'professor' ? 'Autre' : 'À faire';
      }
      
      // Formater la date
      const date = new Date(exercise.DateDeDepot);
      const formattedDate = date.toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
      
      return {
        title: exercise.Titre,
        status,
        statusColor,
        statusBg,
        statusText,
        date: formattedDate,
        icon: Database
      };
    });
  };

  // Statistiques formatées pour l'affichage
  const displayStats = getFormattedStats();
  
  // Exercices formatés pour l'affichage
  const recentExercises = getFormattedExercises();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 transition-colors duration-500">
      <div className="flex">
        {/* Sidebar */}
        <Sidebar 
          userRole={userRole}
          isDarkMode={isDarkMode}
          toggleDarkMode={toggleDarkMode}
          isSidebarOpen={isSidebarOpen}
          toggleSidebar={toggleSidebar}
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
            {/* État de chargement */}
            {isLoading && (
              <div className="flex justify-center items-center min-h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
              </div>
            )}
            
            {/* Message d'erreur */}
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
                <p>{error}</p>
                <p className="text-sm mt-1">Vérifiez que votre API est accessible à l'adresse: {API_BASE_URL}</p>
              </div>
            )}
            
            {/* Contenu principal - affiché seulement lorsque les données sont chargées */}
            {!isLoading && !error && (
              <div className="animate-fade-in">
                {/* Welcome Section */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-6 border border-gray-100 dark:border-gray-700">
                  <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
                    Bienvenue, {userRole === 'professor' ? 'Prof. Sarah' : 'Thomas'} 👋
                  </h2>
                  <p className="text-gray-600 dark:text-gray-300">
                    {userRole === 'professor' 
                      ? `Vous avez ${exercises.filter(ex => ex.status && ex.status.toLowerCase() === 'publié').length} exercices publiés à évaluer et ${studentStats?.totalStudents || 0} étudiants actifs.` 
                      : `Vous avez ${exercises.filter(ex => ex.status && ex.status.toLowerCase() === 'publié').length} exercices à compléter.`
                    }
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                    {displayStats.map((stat, index) => (
                      <div 
                        key={index} 
                        className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 border border-gray-100 dark:border-gray-700 transition-transform hover:scale-105 duration-300"
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
                          ) : (
                            <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
                          )}
                          <span className={stat.trend > 0 ? 'text-green-500' : 'text-red-500'}>
                            {Math.abs(stat.trend)}% {stat.trend > 0 ? 'augmentation' : 'diminution'}
                          </span>
                          <span className="text-gray-500 dark:text-gray-400 ml-1">depuis la semaine dernière</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Recent Activity and Stats */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                        {userRole === 'professor' ? 'Exercices récents' : 'Mes exercices'}
                      </h3>
                      <button className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors">
                        Voir tout
                      </button>
                    </div>
                    
                    {recentExercises.length > 0 ? (
                      <div className="space-y-4">
                        {recentExercises.map((exercise, index) => (
                          <div 
                            key={index}
                            className="flex items-center p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors cursor-pointer"
                          >
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${exercise.statusColor}`}>
                              <exercise.icon className="w-5 h-5 text-white" />
                            </div>
                            <div className="ml-4 flex-1">
                              <div className="flex items-center justify-between">
                                <p className="text-sm font-medium text-gray-800 dark:text-white">{exercise.title}</p>
                                <span className={`text-xs px-2 py-1 rounded-full ${exercise.statusBg} ${exercise.statusText}`}>
                                  {exercise.status}
                                </span>
                              </div>
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{exercise.date}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-40">
                        <p className="text-gray-500 dark:text-gray-400">Aucun exercice trouvé</p>
                      </div>
                    )}
                  </div>
                  
                  {/* Students Stats Panel */}
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-6">Statistiques Étudiants</h3>
                    
                    <div className="h-40 mb-4 flex items-center justify-center">
                      <div className="w-full h-full relative">
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <BarChart4 className="w-12 h-12 text-indigo-500 mb-2" />
                          <p className="text-xl font-bold text-gray-800 dark:text-white">
                            {studentStats?.totalStudents || 0}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            étudiants actifs
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-4 grid grid-cols-2 gap-4">
                      <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 border border-gray-100 dark:border-gray-700">
                        <p className="text-xs text-gray-500 dark:text-gray-400">Nouveaux étudiants</p>
                        <p className="text-lg font-semibold text-gray-800 dark:text-white mt-1">
                          {studentStats ? studentStats.totalStudents - studentStats.lastWeekStudents : 0}
                        </p>
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 border border-gray-100 dark:border-gray-700">
                        <p className="text-xs text-gray-500 dark:text-gray-400">Évolution</p>
                        <p className={`text-lg font-semibold mt-1 ${(studentStats?.percentChange || 0) >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                          {studentStats ? `${studentStats.percentChange >= 0 ? '+' : ''}${studentStats.percentChange}%` : '0%'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                        Répartition hebdomadaire
                      </p>
                      <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-indigo-500 rounded-full"
                          style={{ width: `${studentStats ? (studentStats.totalStudents / (studentStats.totalStudents + 10)) * 100 : 0}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between mt-1 text-xs text-gray-500 dark:text-gray-400">
                        <span>Semaine dernière: {studentStats?.lastWeekStudents || 0}</span>
                        <span>Cette semaine: {studentStats?.totalStudents || 0}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Additional Performance Stats */}
                <div className="mt-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Performance Générale</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 border border-gray-100 dark:border-gray-700">
                      <p className="text-sm text-gray-500 dark:text-gray-400">Total Étudiants</p>
                      <p className="text-2xl font-semibold text-gray-800 dark:text-white mt-1">
                        {studentStats?.totalStudents || 0}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                        {studentStats?.percentChange || 0}% depuis la semaine dernière
                      </p>
                    </div>
                    
                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 border border-gray-100 dark:border-gray-700">
                      <p className="text-sm text-gray-500 dark:text-gray-400">Taux de Participation</p>
                      <p className="text-2xl font-semibold text-gray-800 dark:text-white mt-1">
                        {studentStats ? Math.round((studentStats.totalStudents / (studentStats.totalStudents + 20)) * 100) : 0}%
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                        Basé sur les activités récentes
                      </p>
                    </div>
                    
                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 border border-gray-100 dark:border-gray-700">
                      <p className="text-sm text-gray-500 dark:text-gray-400">Progression Moyenne</p>
                      <p className="text-2xl font-semibold text-gray-800 dark:text-white mt-1">
                        68%
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                        Sur l'ensemble des exercices
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}