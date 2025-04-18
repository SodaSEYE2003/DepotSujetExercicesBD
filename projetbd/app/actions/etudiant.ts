'use server'

import { PrismaClient } from '@prisma/client'
import { getCurrentUser } from '@/lib/auth'
import { revalidatePath } from 'next/cache'
import { getSession } from '@/lib/auth'

const prisma = new PrismaClient()

// Get user stats for the dashboard
export async function getUserStats() {
  const user = await getCurrentUser()
  if (!user) {
    throw new Error('Non authentifié')
  }

  const userId = user.id
  
  // Get exercises completed
  const exercicesCompletes = await prisma.soumission.count({
    where: {
      etudiant_id: userId,
    }
  })
  
  // Get exercises in progress (Sujets assigned to user but not yet submitted)
  const exercicesEnCours = await prisma.sujet.count({
    where: {
      status: 'Publié',
      soumissions: {
        none: {
          etudiant_id: userId
        }
      }
    }
  })
  
  // Calculate average grade
  const notesResult = await prisma.note.aggregate({
    where: {
      etudiant_id: userId
    },
    _avg: {
      Note: true
    }
  })
  const noteMoyenne = notesResult._avg.Note || 0
  
  // Get class rank (this is more complex and depends on how you want to calculate it)
  // This is a simplified example
  const allStudentAverages = await prisma.$queryRaw`
    SELECT etudiant_id, AVG(Note) as average 
    FROM Note 
    GROUP BY etudiant_id 
    ORDER BY average DESC
  `
  
  // Find the user's position in the ranking
  const totalStudents = (allStudentAverages as any[]).length
  let rank = 0
  for (let i = 0; i < (allStudentAverages as any[]).length; i++) {
    if ((allStudentAverages as any[])[i].etudiant_id === userId) {
      rank = i + 1
      break
    }
  }
  
  // Revalidate the dashboard path to ensure fresh data
  revalidatePath('/etudiant')
  
  return {
    exercicesCompletes,
    exercicesEnCours,
    noteMoyenne: noteMoyenne.toFixed(1),
    rangClasse: `${rank}/${totalStudents}`
  }
}

// Get recent exercises
export async function getRecentExercises() {
  const user = await getCurrentUser()
  if (!user) {
    throw new Error('Non authentifié')
  }

  const userId = user.id
  const userRole = user.role
  
  let exercises
  
  if (userRole === 'professeur') {
    // If professor, get recent exercises created
    exercises = await prisma.sujet.findMany({
      orderBy: {
        DateDeDepot: 'desc'
      },
      take: 3
    })
    
    return exercises.map(ex => ({
      title: ex.Titre || 'Sans titre',
      status: ex.status,
      date: ex.DateDeDepot.toLocaleDateString('fr-FR'),
      id: ex.id
    }))
  } else {
    // If student, get assigned exercises with submission status
    const sujets = await prisma.sujet.findMany({
      where: {
        status: 'Publié'
      },
      orderBy: {
        DateDeDepot: 'desc'
      },
      include: {
        soumissions: {
          where: {
            etudiant_id: userId
          }
        }
      },
      take: 3
    })
    
    return sujets.map(sujet => {
      let status = 'À faire'
      
      if (sujet.soumissions.length > 0) {
        const now = new Date()
        if (now > sujet.Delai) {
          status = 'Complété'
        } else {
          status = 'En cours'
        }
      }
      
      return {
        title: sujet.Titre || 'Sans titre',
        status: status,
        date: sujet.DateDeDepot.toLocaleDateString('fr-FR'),
        id: sujet.id
      }
    })
  }
}

// Get performance metrics
export async function getPerformanceMetrics() {
  const user = await getCurrentUser()
  if (!user) {
    throw new Error('Non authentifié')
  }

  const userId = user.id
  const userRole = user.role
  
  if (userRole === 'professeur') {
    // Professor metrics - average class grade
    const classAverage = await prisma.note.aggregate({
      _avg: {
        Note: true
      }
    })
    
    // Calculate success rate (e.g., submissions with grade > 10/20)
    const totalSubmissions = await prisma.note.count()
    const passingSubmissions = await prisma.note.count({
      where: {
        Note: {
          gte: 10
        }
      }
    })
    
    const successRate = totalSubmissions > 0 
      ? Math.round((passingSubmissions / totalSubmissions) * 100) 
      : 0
    
    return {
      averageGrade: classAverage._avg.Note?.toFixed(1) || '0',
      successRate: `${successRate}%`
    }
  } else {
    // Student metrics - personal average grade
    const studentAverage = await prisma.note.aggregate({
      where: {
        etudiant_id: userId
      },
      _avg: {
        Note: true
      }
    })
    
    // Calculate personal success rate
    const totalPersonalSubmissions = await prisma.note.count({
      where: {
        etudiant_id: userId
      }
    })
    
    const passingPersonalSubmissions = await prisma.note.count({
      where: {
        etudiant_id: userId,
        Note: {
          gte: 10
        }
      }
    })
    
    const personalSuccessRate = totalPersonalSubmissions > 0 
      ? Math.round((passingPersonalSubmissions / totalPersonalSubmissions) * 100) 
      : 0
    
    return {
      averageGrade: studentAverage._avg.Note?.toFixed(1) || '0',
      successRate: `${personalSuccessRate}%`
    }
  }
}

export async function getUserInfo() {
  try {
    const session = await getSession();
    
    // More detailed logging for debugging
    console.log("[etudiant:getUserInfo] Session found:", !!session);
    console.log("[etudiant:getUserInfo] Session user:", session?.user ? {
      id: session.user.id,
      email: session.user.email,
      role: session.user.role
    } : 'No user in session');
    
    if (!session || !session.user) {
      console.error("[etudiant:getUserInfo] No session found");
      throw new Error("Non authentifié");
    }
    
    // Get the user ID from the session
    const userId = session.user.id;
    
    if (!userId) {
      console.error("[etudiant:getUserInfo] No user ID in session");
      throw new Error("Session incomplète: ID utilisateur manquant");
    }
    
    console.log("[etudiant:getUserInfo] Fetching user details with ID:", userId);
    
    const userDetails = await prisma.utilisateur.findUnique({
      where: {
        id: parseInt(userId, 10) // Convert to number if your DB expects a number ID
      },
      select: {
        prenom: true,
        nom: true,
        roles: {
          include: {
            role: true
          }
        }
      }
    });
    
    if (!userDetails) {
      console.error("[etudiant:getUserInfo] User not found in database with ID:", userId);
      throw new Error("Utilisateur non trouvé");
    }
    
    console.log("[etudiant:getUserInfo] User details retrieved:", {
      prenom: userDetails.prenom,
      nom: userDetails.nom
    });
    
    return {
      prenom: userDetails.prenom,
      nom: userDetails.nom,
      role: session.user.role || userDetails.roles[0]?.role.nom || 'etudiant'
    };
  } catch (error) {
    console.error("[etudiant:getUserInfo] Error:", error);
    throw error;
  }
}