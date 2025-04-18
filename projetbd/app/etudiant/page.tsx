"use client";

import { useState, useEffect, useRef } from "react";
import { Menu, Bell, ChevronDown, Database, BookOpen, TrendingUp, TrendingDown, Users, Award, Calendar } from 'lucide-react';
import Sidebar from "@/components/Sidebar-etudiant";
import ProgressChart from "../../../src/components/ProgressChart";
import { getUserStats, getRecentExercises, getPerformanceMetrics, getUserInfo } from "@/app/actions/etudiant"
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

type UserRole = 'professeur' | 'etudiant' | 'admin';

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  // State
  const [userRole, setUserRole] = useState<UserRole>('etudiant');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const chartContainerRef = useRef<HTMLDivElement>(null);
  
  // Data states
  const [userName, setUserName] = useState<string>('');
  const [stats, setStats] = useState([
    { 
      name: 'Exercices complétés', 
      value: '0', 
      icon: BookOpen, 
      iconBg: 'bg-blue-500', 
      trend: 0 
    },
    { 
      name: 'Exercices en cours', 
      value: '0', 
      icon: Calendar, 
      iconBg: 'bg-green-500', 
      trend: 0 
    },
    { 
      name: 'Note moyenne', 
      value: '0', 
      icon: Award, 
      iconBg: 'bg-purple-500', 
      trend: 0 
    },
    { 
      name: 'Rang dans la classe', 
      value: '0/0', 
      icon: Users, 
      iconBg: 'bg-yellow-500', 
      trend: 0 
    }
  ]);
  
  const [recentExercises, setRecentExercises] = useState<any[]>([]);
  const [performance, setPerformance] = useState({
    averageGrade: '0',
    successRate: '0%'
  });
  
  // Redirect if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login?callbackUrl=/etudiant/dashboard");
    }
    
    // Set user role from session
    if (status === "authenticated" && session?.user?.role) {
      setUserRole(session.user.role as UserRole);
      
      // Redirect if not student but on student dashboard
      if (session.user.role !== 'etudiant') {
        const redirectPath = `/${session.user.role}`;
        router.push(redirectPath);
      }
    }
  }, [status, session, router]);

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

  // Fetch all data when component mounts
  useEffect(() => {
    async function fetchData() {
      if (status !== "authenticated") return;
      
      try {
        // Get user info
        const userInfo = await getUserInfo();
        setUserName(userInfo.prenom);
        
        // Get user stats
        const userStats = await getUserStats();
        
        // Update stats array with real data
        setStats([
          { 
            name: 'Exercices complétés', 
            value: userStats.exercicesCompletes.toString(), 
            icon: BookOpen, 
            iconBg: 'bg-blue-500', 
            trend: 12 // You may calculate this based on historical data
          },
          { 
            name: 'Exercices en cours', 
            value: userStats.exercicesEnCours.toString(), 
            icon: Calendar, 
            iconBg: 'bg-green-500', 
            trend: -2 // You may calculate this based on historical data
          },
          { 
            name: 'Note moyenne', 
            value: userStats.noteMoyenne.toString(), 
            icon: Award, 
            iconBg: 'bg-purple-500', 
            trend: 3 // You may calculate this based on historical data
          },
          { 
            name: 'Rang dans la classe', 
            value: userStats.rangClasse, 
            icon: Users, 
            iconBg: 'bg-yellow-500', 
            trend: 2 // You may calculate this based on historical data
          }
        ]);
        
        // Get recent exercises
        const exercisesData = await getRecentExercises();
        
        // Map the exercises to the format expected by the UI
        const mappedExercises = exercisesData.map(exercise => ({
          title: exercise.title,
          status: exercise.status,
          statusColor: getStatusColor(exercise.status),
          statusBg: getStatusBg(exercise.status, isDarkMode),
          statusText: getStatusText(exercise.status, isDarkMode),
          date: exercise.date,
          icon: Database
        }));
        
        setRecentExercises(mappedExercises);
        
        // Get performance metrics
        const performanceData = await getPerformanceMetrics();
        setPerformance({
          averageGrade: performanceData.averageGrade + '/20',
          successRate: performanceData.successRate
        });
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      }
    }
    
    // Helper functions to get status colors
    function getStatusColor(status: string) {
      switch(status) {
        case 'Complété':
        case 'Publié':
          return 'bg-green-500';
        case 'En cours':
        case 'brouillon':
          return 'bg-yellow-500';
        default:
          return 'bg-blue-500';
      }
    }
    
    function getStatusBg(status: string, isDark: boolean) {
      switch(status) {
        case 'Complété':
        case 'Publié':
          return isDark ? 'bg-green-900/30' : 'bg-green-100';
        case 'En cours':
        case 'brouillon':
          return isDark ? 'bg-yellow-900/30' : 'bg-yellow-100';
        default:
          return isDark ? 'bg-blue-900/30' : 'bg-blue-100';
      }
    }
    
    function getStatusText(status: string, isDark: boolean) {
      switch(status) {
        case 'Complété':
        case 'Publié':
          return isDark ? 'text-green-300' : 'text-green-800';
        case 'En cours':
        case 'brouillon':
          return isDark ? 'text-yellow-300' : 'text-yellow-800';
        default:
          return isDark ? 'text-blue-300' : 'text-blue-800';
      }
    }
    
    fetchData();
    
    // Check system preference for dark mode on mount
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    }
  }, [status, isDarkMode]);

  // Show loading state while session is loading
  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
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
              <h2>Bienvenue, {userName} 👋</h2>
              <p>Vous avez {stats[1].value} exercices à compléter cette semaine...</p>
              
              {/* 3. Statistiques étudiant */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
                {stats.map((stat, index) => (
                  <div key={index} className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 border border-gray-100 dark:border-gray-700 transition-transform hover:scale-105 duration-300">
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
                    {userRole === 'professeur' ? 'Exercices récents' : 'Mes exercices'}
                  </h3>
                  <button className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors">
                    Voir tout
                  </button>
                </div>
                
                <div className="space-y-4">
                  {recentExercises.map((exercise, index) => (
                    <div key={index} className="flex items-center p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/30">
                      <div className={`w-10 h-10 rounded-full ${exercise.statusColor} flex items-center justify-center`}>
                        <exercise.icon className="w-5 h-5 text-white" />
                      </div>
                      <div className="ml-4">
                        <p className="font-medium">{exercise.title}</p>
                        <p className="text-sm text-gray-500">{exercise.date}</p>
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
                      {performance.averageGrade}
                    </p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 border border-gray-100 dark:border-gray-700">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Taux de réussite</p>
                    <p className="text-lg font-semibold text-gray-800 dark:text-white mt-1">
                      {performance.successRate}
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