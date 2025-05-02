// src/actions/etudiant.ts
"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

/**
 * Vérifie que l'ID utilisateur est valide
 */
function validateUserId(userId: number) {
  if (!userId || isNaN(userId)) {
    throw new Error("ID utilisateur invalide");
  }
}

/**
 * Récupère les statistiques de l'étudiant
 */
export async function getEtudiantStats(userId: number) {
  try {
    validateUserId(userId);

    // Récupération en parallèle des données
    const [exercicesCompletes, tousLesSujets, notes, etudiants] = await Promise.all([
      prisma.soumission.count({ where: { etudiant_id: userId } }),
      prisma.sujet.count({ where: { status: "Publié" } }),
      prisma.note.findMany({ 
        where: { etudiant_id: userId },
        select: { Note: true }
      }),
      prisma.utilisateur.findMany({
        where: {
          roles: { some: { role: { nom: "etudiant" } } }
        },
        include: {
          notes: { select: { Note: true } }
        }
      })
    ]);

    const exercicesEnCours = tousLesSujets - exercicesCompletes;
    const noteMoyenne = notes.length > 0 
      ? notes.reduce((acc, curr) => acc + Number(curr.Note), 0) / notes.length
      : 0;

    // Calcul du rang
    const etudiantsAvecMoyenne = etudiants.map(etudiant => ({
      id: etudiant.id,
      moyenne: etudiant.notes.length > 0
        ? etudiant.notes.reduce((acc, curr) => acc + Number(curr.Note), 0) / etudiant.notes.length
        : 0
    })).sort((a, b) => b.moyenne - a.moyenne);

    const rang = etudiantsAvecMoyenne.findIndex(e => e.id === userId) + 1;
    const notesReussies = notes.filter(note => Number(note.Note) >= 10).length;

    return {
      exercicesCompletes,
      exercicesEnCours,
      noteMoyenne,
      rang,
      totalEtudiants: etudiantsAvecMoyenne.length,
      tauxReussite: notes.length > 0 
        ? Math.round((notesReussies / notes.length) * 100)
        : 0,
      tendanceExercicesCompletes: 0, // À implémenter selon vos besoins
      tendanceExercicesEnCours: 0,
      tendanceNoteMoyenne: 0,
      tendanceRang: 0
    };

  } catch (error) {
    console.error("Erreur dans getEtudiantStats:", error);
    throw new Error("Erreur lors de la récupération des statistiques");
  }
}

/**
 * Récupère les exercices de l'étudiant
 */
export async function getEtudiantExercices(userId: number) {
  try {
    validateUserId(userId);

    const [sujets, soumissions] = await Promise.all([
      prisma.sujet.findMany({
        where: { status: "Publié" },
        orderBy: { Delai: 'desc' }
      }),
      prisma.soumission.findMany({
        where: { etudiant_id: userId },
        include: { sujet: true }
      })
    ]);

    return sujets.map(sujet => {
      const soumission = soumissions.find(s => s.sujet_id === sujet.id);
      const maintenant = new Date();
      const delai = new Date(sujet.Delai);
      const dateDepot = new Date(sujet.DateDeDepot);

      let status = "À faire";
      if (soumission) {
        status = "Complété";
      } else if (maintenant > dateDepot && maintenant < delai) {
        status = "En cours";
      }

      return {
        id: sujet.id,
        titre: sujet.Titre || `Exercice ${sujet.id}`,
        sousTitre: sujet.sousTitre || "",
        description: sujet.Description || "",
        status,
        dateLimite: sujet.Delai,
        dateCreation: sujet.DateDeDepot
      };
    });

  } catch (error) {
    console.error("Erreur dans getEtudiantExercices:", error);
    throw new Error("Erreur lors de la récupération des exercices");
  }
}

/**
 * Récupère les détails d'un exercice spécifique
 */
export async function getExerciceDetails(userId: number, exerciceId: number) {
  try {
    validateUserId(userId);

    const [sujet, soumission, note] = await Promise.all([
      prisma.sujet.findUnique({ where: { id: exerciceId } }),
      prisma.soumission.findFirst({
        where: { etudiant_id: userId, sujet_id: exerciceId }
      }),
      prisma.note.findFirst({
        where: { etudiant_id: userId, sujet_id: exerciceId }
      })
    ]);

    if (!sujet) {
      throw new Error("Exercice non trouvé");
    }

    return {
      id: sujet.id,
      titre: sujet.Titre || `Exercice ${sujet.id}`,
      sousTitre: sujet.sousTitre || "",
      description: sujet.Description || "",
      fichier: sujet.file?.toString('base64') || null,
      dateLimite: sujet.Delai,
      dateCreation: sujet.DateDeDepot,
      status: soumission ? "Complété" : "À faire",
      soumission: soumission ? {
        id: soumission.id,
        fichier: soumission.fichier?.toString('base64') || null,
        commentaire: soumission.commentaire || "",
        dateSoumission: soumission.dateSoumission
      } : null,
      note: note ? Number(note.Note) : null
    };

  } catch (error) {
    console.error("Erreur dans getExerciceDetails:", error);
    throw new Error("Erreur lors de la récupération des détails");
  }
}

/**
 * Soumet un exercice
 */
export async function soumettreExercice(
  userId: number,
  exerciceId: number,
  formData: FormData
) {
  try {
    validateUserId(userId);

    const fichier = formData.get('fichier') as File;
    const commentaire = formData.get('commentaire') as string;
    
    if (!fichier) {
      throw new Error("Aucun fichier fourni");
    }

    const buffer = Buffer.from(await fichier.arrayBuffer());
    const existingSoumission = await prisma.soumission.findFirst({
      where: { etudiant_id: userId, sujet_id: exerciceId }
    });

    const soumission = existingSoumission
      ? await prisma.soumission.update({
          where: { id: existingSoumission.id },
          data: { fichier: buffer, commentaire, dateSoumission: new Date() }
        })
      : await prisma.soumission.create({
          data: {
            fichier: buffer,
            commentaire: commentaire || null,
            etudiant_id: userId,
            sujet_id: exerciceId,
            dateSoumission: new Date()
          }
        });

    revalidatePaths(exerciceId);

    return {
      success: true,
      message: "Exercice soumis avec succès",
      soumissionId: soumission.id
    };

  } catch (error) {
    console.error("Erreur dans soumettreExercice:", error);
    throw new Error("Erreur lors de la soumission");
  }
}

/**
 * Télécharge un fichier (sujet ou soumission)
 */
export async function telechargerFichier(
  userId: number,
  type: 'sujet' | 'soumission', 
  id: number
) {
  try {
    validateUserId(userId);

    if (type === 'sujet') {
      const sujet = await prisma.sujet.findUnique({ where: { id } });
      if (!sujet?.file) throw new Error("Fichier du sujet non trouvé");
      
      return {
        fichier: sujet.file.toString('base64'),
        nom: `sujet_${id}.pdf`
      };
    } else {
      const soumission = await prisma.soumission.findUnique({ where: { id } });
      if (!soumission?.fichier) throw new Error("Fichier de soumission non trouvé");
      if (soumission.etudiant_id !== userId) throw new Error("Non autorisé");

      return {
        fichier: soumission.fichier.toString('base64'),
        nom: `soumission_${id}.pdf`
      };
    }
  } catch (error) {
    console.error("Erreur dans telechargerFichier:", error);
    throw new Error("Erreur lors du téléchargement");
  }
}

// Fonction utilitaire pour revalider les chemins
function revalidatePaths(exerciceId: number) {
  revalidatePath(`/etudiant/exercice/${exerciceId}`);
  revalidatePath('/etudiant/exercices');
  revalidatePath('/etudiant/dashboard');
}