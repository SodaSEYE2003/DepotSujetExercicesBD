"use client";

import { useState, useEffect, useRef } from "react";
import { Menu, Bell, ChevronDown, Database, BookOpen, TrendingUp, TrendingDown, Users, Award, Calendar } from 'lucide-react';
import Sidebar from "../../src/components/Sidebar";
// app/dashboard/page.tsx
import { useSession } from "next-auth/react";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";


type UserRole = 'professor' | 'student';

export default  function Dashboard() {
  // State

 // Utilise useSession pour accéder à la session

 
  const { data: session, status } = useSession();
  if (status === 'unauthenticated') {
    redirect('/login');
  }
  if (!session) {
    return <div>Loading...</div>; // Affiche quelque chose pendant le chargement de la session
  }
  const [userRole, setUserRole] = useState<UserRole>('professor');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const chartContainerRef = useRef<HTMLDivElement>(null);
 
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

  // Stats data
  const stats = [
    { 
      name: userRole === 'professor' ? 'Exercices créés' : 'Exercices complétés', 
      value: userRole === 'professor' ? '24' : '18', 
      icon: BookOpen, 
      iconBg: 'bg-blue-500', 
      trend: 12 
    },
    { 
      name: userRole === 'professor' ? 'Étudiants actifs' : 'Exercices en cours', 
      value: userRole === 'professor' ? '156' : '3', 
      icon: userRole === 'professor' ? Users : Calendar, 
      iconBg: 'bg-green-500', 
      trend: 8 
    },
    { 
      name: userRole === 'professor' ? 'Note moyenne' : 'Note moyenne', 
      value: userRole === 'professor' ? '14.8' : '15.2', 
      icon: Award, 
      iconBg: 'bg-purple-500', 
      trend: -3 
    }
  ];

  // Recent exercises data
  const recentExercises = [
    { 
      title: 'Requêtes SQL avancées', 
      status: userRole === 'professor' ? 'Publié' : 'Complété', 
      statusColor: 'bg-green-500',
      statusBg: 'bg-green-100 dark:bg-green-900/30',
      statusText: 'text-green-800 dark:text-green-300',
      date: '15 mars 2025',
      icon: Database
    },
    { 
      title: 'Modélisation de données', 
      status: userRole === 'professor' ? 'Brouillon' : 'En cours', 
      statusColor: 'bg-yellow-500',
      statusBg: 'bg-yellow-100 dark:bg-yellow-900/30',
      statusText: 'text-yellow-800 dark:text-yellow-300',
      date: '10 mars 2025',
      icon: Database
    },
    { 
      title: 'Normalisation et optimisation', 
      status: userRole === 'professor' ? 'Publié' : 'À faire', 
      statusColor: 'bg-blue-500',
      statusBg: 'bg-blue-100 dark:bg-blue-900/30',
      statusText: 'text-blue-800 dark:text-blue-300',
      date: '5 mars 2025',
      icon: Database
    }
  ];

  // Check system preference for dark mode on mount
  useEffect(() => {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    }
    
    // Initialize charts (placeholder for actual chart implementation)
    // In a real application, you would use a charting library like Chart.js or ApexCharts
  }, []);

  if (!session?.user) {  // Vérification plus stricte
    redirect("/login");
  }
  
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
                <p>Connecté en tant que: {session.user?.email}</p>
                <p>Rôle: {session.user?.role}</p>
 
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
            {/* Welcome Section */}
            <div className="animate-fade-in">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-6 border border-gray-100 dark:border-gray-700">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
                  Bienvenue, {userRole === 'professor' ? 'Prof. Sarah' : 'Thomas'} 👋
                </h2>
                <p className="text-gray-600 dark:text-gray-300">
                  {userRole === 'professor' 
                    ? 'Vous avez 5 nouveaux exercices soumis à évaluer aujourd\'hui.' 
                    : 'Vous avez 2 nouveaux exercices à compléter cette semaine.'
                  }
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                  {stats.map((stat, index) => (
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
              
              {/* Recent Activity */}
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
                </div>
                
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-6">Performance</h3>
                  
                  <div className="h-64 flex items-center justify-center">
                    <div className="w-full h-full relative">
                      {/* Placeholder for chart */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-full h-full" ref={chartContainerRef}></div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 border border-gray-100 dark:border-gray-700">
                      <p className="text-xs text-gray-500 dark:text-gray-400">Note moyenne</p>
                      <p className="text-lg font-semibold text-gray-800 dark:text-white mt-1">
                        {userRole === 'professor' ? '14.8/20' : '15.2/20'}
                      </p>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 border border-gray-100 dark:border-gray-700">
                      <p className="text-xs text-gray-500 dark:text-gray-400">Taux de réussite</p>
                      <p className="text-lg font-semibold text-gray-800 dark:text-white mt-1">
                        {userRole === 'professor' ? '78%' : '85%'}
                      </p>
                    </div>
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
